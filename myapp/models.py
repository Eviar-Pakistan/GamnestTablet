from django.db import models
from django.contrib.auth.models import User
import json
from django.utils.timezone import now




class Tickets(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=255)
    type = models.CharField(max_length=254)
    duration = models.CharField(max_length=10, null=True, blank=True) 
    credits = models.IntegerField(null=True, blank=True)
    price = models.CharField(max_length=255)
    venues = models.ManyToManyField('Venues', related_name='ticket_venues')

    def __str__(self):
        return self.name
    
class Games(models.Model):
    name = models.CharField(max_length=255)
    Genre = models.TextField(max_length=255)
    availability = models.TextField(max_length=255, null=True)
    rating = models.TextField(max_length=255, null=True)
    plays = models.IntegerField(null=True, blank=True)
    def __str__(self):
        return self.name      
  
class Venues(models.Model):
    name = models.CharField(max_length=255)
    phone = models.IntegerField()
    email = models.EmailField(max_length=254)
    location = models.TextField(max_length=255)
    hours = models.TextField(max_length=255)
    specialevent = models.TextField(max_length=255, null=True)
    status = models.TextField(max_length=255, null=True)
    locationdefine = models.TextField(max_length=255, null=True)
    tickets = models.ManyToManyField('Tickets', blank=True, related_name='venue_tickets')
    games = models.ManyToManyField(Games, related_name='venues') 
    created_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

     
class Headset(models.Model):
    name = models.CharField(max_length=245)
    modelNo = models.CharField(max_length=245, unique=True) 
    serialNo = models.CharField(max_length=245, unique=True) 
    barcodeNo = models.IntegerField(unique=True)  
    venue = models.ForeignKey('Venues', on_delete=models.CASCADE)

    def __str__(self):
        return self.name
       
class Tablet(models.Model):
    name = models.CharField(max_length=245)
    modelNo = models.CharField(max_length=245,unique=True)
    serialNo = models.CharField(max_length=245,unique=True)
    barcodeNo = models.IntegerField(unique=True)
    assignedVenue = models.CharField(max_length=20)
    venue = models.ForeignKey('Venues', on_delete=models.CASCADE)

    def __str__(self):
        return self.name       
    
class Role(models.Model):
    name = models.CharField(max_length=255)  
    description = models.TextField()  
    permissions = models.JSONField(default=dict) 
    venues = models.ManyToManyField(Venues, related_name='roles', blank=True)  
    games = models.ManyToManyField(Games, related_name='roles', blank=True)  
    # headsets = models.ManyToManyField(Headset,related_name='role',blank=True)
    # tablets = models.ManyToManyField(Tablet,related_name='role',blank=True)
    access_all_venues = models.BooleanField(default=False)
    access_all_games = models.BooleanField(default=False)
    # access_all_headsets = models.BooleanField(default=False)
    # access_all_tablets = models.BooleanField(default=False)
    user = models.ManyToManyField(User, through='Profile')

    def __str__(self):
        return self.name


    # Method to set permissions as a JSON string
    def set_permissions(self, permissions_dict):
        self.permissions = json.dumps(permissions_dict)

    # Method to get permissions as a dictionary
    def get_permissions(self):
        return self.permissions
    
    def has_access_to_venue(self, venue):
        if self.access_all_venues:
            return True
        return venue in self.venues.all()
    
    def has_access_to_game(self, game):
        if self.access_all_games:
            return True
        return game in self.games.all()
    
    # def has_access_to_headset(self, headset):
    #     if self.access_all_headsets:
    #         return True
    #     return headset in self.headsets.all()
    
    # def has_access_to_tablet(self, tablet):
    #     if self.access_all_tablets:
    #         return True
    #     return tablet in self.tablets.all()
    
    

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)
    status = models.TextField(max_length=255, blank=True, null=True)
    venues = models.ManyToManyField('Venues', related_name='profiles', blank=True)  # Add this line

    def __str__(self):
        return f'{self.user.username} Profile'

class TicketNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ticket_id = models.IntegerField()  # Assuming ticket IDs are unique integers
    is_seen = models.BooleanField(default=False)
    created_at = models.CharField(max_length=255)    
    
class CarouselBanner(models.Model):
    banner = models.ImageField(upload_to='carousel_banners/')
    link = models.URLField(max_length=500)  
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)  # Active status field

    def __str__(self):
        return f"Banner {self.id} - {self.link}"
