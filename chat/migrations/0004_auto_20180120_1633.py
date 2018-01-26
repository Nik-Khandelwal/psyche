# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2018-01-20 16:33
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_auto_20180117_1957'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='ans_chosen_size',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='room',
            name='ans_size',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='room',
            name='question_no',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='room',
            name='types',
            field=models.CharField(default=b'Closed', max_length=100),
        ),
    ]