# routing.py in your_app

from django.urls import path
from myapp.consumers import GameConsumer

websocket_urlpatterns = [
    path('ws/some_endpoint/', GameConsumer.as_asgi()), 
]
