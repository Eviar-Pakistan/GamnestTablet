"""
URL configuration for GamnestTablet project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from myapp.views import login,index,games,room,headset,support

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',login,name='login'),
    path('index',index,name="index"),
    path('games',games,name='games'),
    path('room',room,name="room"),
    path('headset',headset,name="headset"),
    path('support',support,name='support')
]
