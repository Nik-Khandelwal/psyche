Psyche
=========

Adapted from the multi-chat room implementation [here](https://github.com/andrewgodwin/channels-examples/tree/master/multichat).

Installation
------------

Manual installation
~~~~~~~~~~~~~~~~~~~~~~

Make a new virtualenv for the project, and run::

    pip install -r requirements.txt

Then, you'll need Redis running locally; the settings are configured to
point to ``localhost``, port ``6379``, but you can change this in the
``CHANNEL_LAYERS`` setting in ``settings.py``.

Finally, run::

    python manage.py migrate
    python manage.py runserver

Docker installation
~~~~~~~~~~~~~~~~~~~~~~

Run the app::
  
    docker-compose up -d

The app will now be running on: {your-docker-ip}:8000

**Note:** You will need to prefix ``python manage.py`` commands with: ``docker-compose run --rm web``. e.g.: ``docker-compose run --rm web python manage.py createsuperuser``

Finally, run::

    docker-compose run --rm web python manage.py migrate


Usage
-----

Make yourself a superuser account::

    python manage.py createsuperuser

Then, log into http://localhost:8000/admin/ and make a couple of Room objects.
Be sure to make one that is set to "staff-only",

Finally, make a second user account in the admin that doesn't have staff
privileges. You'll use this to log into the chat in a second window, and to test
the authentication on that staff-only room.

Now, open a second window in another browser or in "incognito" mode - you'll be
logging in to the same site with two user accounts. Navigate to
http://localhost:8000 in both browsers and open the same chatroom.

Now, you can type messages and see them appear on both screens at once. You can
join other rooms and try there, and see how you receive messages from all rooms
you've currently joined.

If you try and make the non-staff user join your staff-only chatroom, you should
see an error as the server-side authentication code kicks in.



Further Reading
---------------

You can find the Channels documentation at http://channels.readthedocs.org
