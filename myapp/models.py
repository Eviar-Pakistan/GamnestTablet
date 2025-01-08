from django.db import models

class TicketNotification(models.Model):
    tabletserialNo = models.CharField(max_length=255) 
    ticket_id = models.IntegerField()  
    is_seen = models.BooleanField(default=False)
    created_at = models.CharField(max_length=255)  
    
    def __str__(self):
        return f"Notification - Ticket {self.ticket_id}"
