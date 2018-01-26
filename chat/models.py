import json
from django.db import models
from django.utils.six import python_2_unicode_compatible
from channels import Group
from django.contrib.auth.models import User
from .settings import MSG_TYPE_MESSAGE



@python_2_unicode_compatible
class Room(models.Model):
    """
    A room for people to chat in.
    """
    types = models.CharField(max_length=100, default="Closed")
    title = models.CharField(max_length=255)
    size = models.IntegerField(default=0)
    ans_size = models.IntegerField(default=0)
    ans_chosen_size = models.IntegerField(default=0)
    status = models.BooleanField(default = 1)
    question_no = models.IntegerField(default=1)
    # If only "staff" users are allowed (is_staff on django's User)
    staff_only = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    @property
    def websocket_group(self):
        """
        Returns the Channels Group that sockets should subscribe to to get sent
        messages as they are generated.
        """
        return Group("room-%s" % self.id)
    def send_message(self, message, user, msg_type):
        """
        Called to send a message to the room on behalf of a user.
        """
        final_msg = {'room': str(self.id), 'message': message, 'username': user.username, 'msg_type': msg_type}

        # Send out the message to everyone in the room
        self.websocket_group.send(
            {"text": json.dumps(final_msg)}
        )


class Playa(models.Model):
    name = models.OneToOneField(User,on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    room = models.CharField(max_length=10000)
    ans_given = models.CharField(max_length=100000)
    ans_chosen = models.CharField(max_length=100000)

    def __str__(self):
        return self.name.username


class Question(models.Model):
    question_no = models.IntegerField()
    text = models.CharField(max_length=100000)

    def __str__(self):
        return str(self.question_no)
