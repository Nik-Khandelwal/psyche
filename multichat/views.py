from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
import json
import string
import random


def loge(request):
	return HttpResponseRedirect('/home/')