from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Room, Playa, Question
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
import json
import string
import random
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.contrib import auth


def group_code_generator(size=5, chars=string.ascii_uppercase + string.digits):
    str = ''.join(random.choice(chars) for _ in range(size))
    for grp in Room.objects.all():
        if grp.title == str:
            str = group_code_generator()
    return str


@login_required
def index(request):
    """
    Root page view. This is essentially a single-page app, if you ignore the
    login and admin parts.
    """
    # Get a list of rooms, ordered alphabetically
    rooms = Room.objects.order_by("title")

    # Render that in the index template
    return render(request, "index.html", {
        "rooms": rooms,
    })


def login_page(request):
    return render(request,"psych/login.html")


def home(request):
    if (request.user.is_authenticated()):
        user = request.user
        try:
            player = Playa()
            player.name = user
            player.save()
        except:
            player = Playa.objects.get(name=user)
        try:
            room = Room()
            room.types = "Open"
            room.title = group_code_generator()
            room.save()
        except:
            Room.objects.filter(types="Open").get(status=1)
            room = Room.objects.filter(types="Open").get(status=1)
        return render(request, "psych/index.html" , {"room":room})
    else:
        return HttpResponseRedirect('/')


@login_required
def create_room(request):
    room = Room()
    room.title = "bdcbd"
    room.save()
    return HttpResponseRedirect('/')

@login_required
def create_group(request):
    room = Room()
    room.types = "Closed"
    room.title = group_code_generator()
    room.save()
    resp = {"groupCode":room.title}
    return JsonResponse(resp)

@login_required
def create_open_group(request):
    try:
        room = Room()
        room.types = "Open"
        room.title = group_code_generator()
        room.save()
    except:
        Room.objects.filter(types="Open").get(status=1)
        room = Room.objects.filter(types="Open").get(status=1)
    resp = {"groupCode":room.title}
    return JsonResponse(resp)


@login_required
def submitGroupCode(request):
    data = json.loads( request.body.decode('utf-8') )
    if Room.objects.get(title=str(data["group_code"])):
        room = Room.objects.get(title=str(data["group_code"]))
        if room.size <= 4:
            player = Playa.objects.get(name=request.user)
            player.room = room.title
            player.save()
            resp = {"success":1}
        else:
            resp={"success":0}
    else:
        resp = {"success":0}
    return JsonResponse(resp)
