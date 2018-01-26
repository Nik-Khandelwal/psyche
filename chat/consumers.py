import json
from channels import Channel
from channels.auth import channel_session_user_from_http, channel_session_user

from .settings import MSG_TYPE_LEAVE, MSG_TYPE_ENTER, NOTIFY_USERS_ON_ENTER_OR_LEAVE_ROOMS
from .models import Room, Playa, Question
from .utils import get_room_or_error, catch_client_error
from .exceptions import ClientError
from django.contrib.auth.models import User


### WebSocket handling ###


# This decorator copies the user from the HTTP session (only available in
# websocket.connect or http.request messages) to the channel session (available
# in all consumers with the same reply_channel, so all three here)
@channel_session_user_from_http
def ws_connect(message):
    message.reply_channel.send({'accept': True})
    # Initialise their session
    message.channel_session['rooms'] = []
    print("nikhil1")
    

# Unpacks the JSON in the received WebSocket frame and puts it onto a channel
# of its own with a few attributes extra so we can route it
# This doesn't need @channel_session_user as the next consumer will have that,
# and we preserve message.reply_channel (which that's based on)
def ws_receive(message):
    # All WebSocket frames have either a text or binary payload; we decode the
    # text part here assuming it's JSON.
    # You could easily build up a basic framework that did this encoding/decoding
    # for you as well as handling common errors.

    payload = json.loads(message['text'])
    payload['reply_channel'] = message.content['reply_channel']
    Channel("chat.receive").send(payload)
    print("nikhil2")


@channel_session_user
def ws_disconnect(message):
    # Unsubscribe from any connected rooms
    for room_id in message.channel_session.get("rooms", set()):
        try:
            room = Room.objects.get(pk=room_id)
            # Removes us from the room's send group. If this doesn't get run,
            # we'll get removed once our first reply message expires.
            room.websocket_group.discard(message.reply_channel)
        except Room.DoesNotExist:
            pass
    print("nikhil3")


@channel_session_user
@catch_client_error
def ws_message(message):
    print(message.content['text'])
    payload = json.loads(message['text'])
    user = User.objects.get(username=payload['userName'])
    player = Playa.objects.get(name=user)
    room = Room.objects.get(title=payload['group_code'])
    room.websocket_group.add(message.reply_channel)
    message.channel_session['rooms'] = list(set(message.channel_session['rooms']).union([room.id]))
    print(payload['message'])
    if payload['message'] == "Start_Closed_Match" or payload['message'] == "Start_Open_Match" :
        room.size += 1
        room.save()
        room = Room.objects.get(title=payload['group_code'])
        player = Playa.objects.get(name=User.objects.get(username=payload['userName']))
        player.room = room.title
        player.save()
        if room.size == 5:
            room.status =0
            room.save()
        if room.size >= 2:
            room.websocket_group.send(
                    {"text": json.dumps({"message":"Start_Match","group_code":payload['group_code']})}
                )
        else:
            room.websocket_group.send(
                    {"text": json.dumps({"message":"Error_Closed_Group","group_code":payload['group_code']})}
                )
    elif payload['message'] == "Send_Question":
        question = Question.objects.get(question_no=room.question_no)
        room = Room.objects.get(title=payload['group_code'])
        player = Playa.objects.get(name=User.objects.get(username=payload['userName']))
        player.room = room.title
        player.save()
        room.ans_size = 0
        room.ans_chosen_size = 0
        room.save()
        room.websocket_group.send(
                {"text":json.dumps({"message":"Question-Text","question":question.text,"group_code":payload['group_code']})
        })
    elif payload['message'] == "Submitting_Answer":
        room = Room.objects.get(title=payload['group_code'])
        player = Playa.objects.get(name=User.objects.get(username=payload['userName']))
        player.room = room.title
        player.save()
        player.ans_given = payload['answer']
        player.save()
        room.ans_size +=1
        room.save()
        if room.ans_size == room.size:
            arr = []
            pls = Playa.objects.filter(room=room.title)
            for i in pls:
                arr.append({"name":i.name.username,"ans":i.ans_given})
            room.websocket_group.send(
                    {
                    "text":json.dumps({"message":"Answers", "group_code":payload['group_code'], "answers":arr})
                    }
                )
    elif payload['message'] == "Selected_Answer":
        room = Room.objects.get(title=payload['group_code'])
        player = Playa.objects.get(name=User.objects.get(username=payload['userName']))
        player.room = room.title
        player.save()
        player.ans_chosen = payload['selected_ans']
        player.save()
        room.ans_chosen_size += 1
        room.question_no+=1
        room.save()
        pl = Playa.objects.filter(room=room.title).get(ans_given=payload['selected_ans'])
        pl.score+=100
        pl.save()
        if room.ans_chosen_size == room.size:
            data = []
            lis = Playa.objects.filter(room=room.title)
            for pt in lis:
                psy = Playa.objects.filter(room=room.title).get(ans_given=pt.ans_chosen)
                pls = Playa.objects.filter(room=room.title).filter(ans_chosen=pt.ans_given)
                arr=[]
                for i in pls:
                    arr.append(i.name.username)
                data.append({"name":pt.name.username,"psyched_by":psy.name.username,"psyched":arr,"message":"Psyched"})
            room.websocket_group.send(
                    {
                    "text":json.dumps(data)
                    }
                )
    elif payload['message'] == "Send_Leaderboard":
        room = Room.objects.get(title=payload['group_code'])
        player = Playa.objects.get(name=User.objects.get(username=payload['userName']))
        player.room = room.title
        player.save()
        pls = Playa.objects.filter(room=room.title).order_by('-score')
        arr=[]
        for i in pls:
            arr.append(i.name.username)
        message.reply_channel.send(
                    {
                    "text":json.dumps({"message":"Leaderboard", "users":arr})
                    }
                )
        
### Chat channel handling ###


# Channel_session_user loads the user out from the channel session and presents
# it as message.user. There's also a http_session_user if you want to do this on
# a low-level HTTP handler, or just channel_session if all you want is the
# message.channel_session object without the auth fetching overhead.
@channel_session_user
@catch_client_error
def chat_join(message):
    # Find the room they requested (by ID) and add ourselves to the send group
    # Note that, because of channel_session_user, we have a message.user
    # object that works just like request.user would. Security!
    room = get_room_or_error(message["room"], message.user)
    print("nikhil4")

    # Send a "enter message" to the room if available
    if NOTIFY_USERS_ON_ENTER_OR_LEAVE_ROOMS:
        room.send_message(None, message.user, MSG_TYPE_ENTER)

    # OK, add them in. The websocket_group is what we'll send messages
    # to so that everyone in the chat room gets them.
    room.websocket_group.add(message.reply_channel)
    message.channel_session['rooms'] = list(set(message.channel_session['rooms']).union([room.id]))
    # Send a message back that will prompt them to open the room
    # Done server-side so that we could, for example, make people
    # join rooms automatically.
    room.size += 1
    room.save()
    if room.size == 2:
        room.websocket_group.send(
                {"text": json.dumps({"start":"yes","title":room.title,"join":str(room.id)})}
            )
    else:
        room.websocket_group.send(
                {"text": json.dumps({"start":"no","title":room.title,"join":str(room.id)})}
            )




@channel_session_user
@catch_client_error
def chat_leave(message):
    # Reverse of join - remove them from everything.
    room = get_room_or_error(message["room"], message.user)

    # Send a "leave message" to the room if available
    if NOTIFY_USERS_ON_ENTER_OR_LEAVE_ROOMS:
        room.send_message(None, message.user, MSG_TYPE_LEAVE)

    room.websocket_group.discard(message.reply_channel)
    message.channel_session['rooms'] = list(set(message.channel_session['rooms']).difference([room.id]))
    # Send a message back that will prompt them to close the room
    message.reply_channel.send({
        "text": json.dumps({
            "leave": str(room.id),
        }),
    })


@channel_session_user
@catch_client_error
def chat_send(message):
    # Check that the user in the room
    if int(message['room']) not in message.channel_session['rooms']:
        raise ClientError("ROOM_ACCESS_DENIED")
        print("nikhil5")
    # Find the room they're sending to, check perms
    room = get_room_or_error(message["room"], message.user)
    
    # Send the message along
    room.send_message(message["message"], message.user, 0)
    
