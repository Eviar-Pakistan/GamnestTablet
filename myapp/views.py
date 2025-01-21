from django.http import JsonResponse
from django.shortcuts import render
import json
from django.contrib.auth.decorators import login_required
import requests
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.utils import timezone
import requests
from myapp.models import TicketNotification
from django.core.paginator import Paginator

def login(request):
    if request.method == "POST":
        try:
            # Extract serial number and password from request
            body = json.loads(request.body.decode('utf-8'))
            serial_no = body.get('serialNo')
            password = body.get('password')

            if not serial_no or not password:
                return JsonResponse({"success": False, "message": "Serial No and Password are required"})

            # Call the external API
            api_url = "https://dashboard.gamenest.se/api/Tablets"
            response = requests.get(api_url)
            if response.status_code != 200:
                return JsonResponse({"success": False, "message": "Failed to fetch tablet data"})

            tablets = response.json()
            
            for tablet in tablets:
                if tablet.get('serialNo') == serial_no and tablet.get('password') == password:
                    # Store the serial number in the session on successful login
                    request.session['tablet_serial_no'] = serial_no
                    venue = tablet.get('venue')
                    room = tablet.get('room')
                    # Login success
                    return JsonResponse({"success": True, "message": "Login successful", "venue": venue,"room": room})

            # If no match is found
            return JsonResponse({"success": False, "message": "Invalid Serial No or Password"})

        except Exception as e:
            print(f"Error: {e}")
            return JsonResponse({"success": False, "message": "An error occurred"})
    
    # Render login page for GET request
    return render(request, 'login.html')

from django.db.models import Q
from django.http import JsonResponse
import json

def mark_notifications_seen(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)  # Parse JSON data
            notification_ids = data.get("notification_ids", [])  # Get IDs from request

            # If no notification IDs are provided, mark all unseen notifications for the specific `tabletserialNo`
            if not notification_ids:
                tablet_serial_no = request.user.tabletserialNo  # Assuming `tabletserialNo` is used for identification
                unseen_notifications = TicketNotification.objects.filter(
                    Q(tabletserialNo=tablet_serial_no) & Q(is_seen=False)
                )

                notification_ids = [notification.id for notification in unseen_notifications]

            print("Notification IDs to mark as seen:", notification_ids)  # Debugging

            # Update notifications to `is_seen=True`
            TicketNotification.objects.filter(id__in=notification_ids).update(is_seen=True)
            return JsonResponse({"status": "success"})
        except Exception as e:
            print("Error:", e)  # Debugging
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
    return JsonResponse({"status": "error"}, status=400)




def index(request):

    url = "https://gamenest.se/api/tickets/"
 
    tabletserialNo = request.session['tablet_serial_no'] 
    try:
        response = requests.get(url)
        if response.status_code == 200:
            support_ticket_data = response.json()
            for ticket in support_ticket_data:
                # Check if the ticket already exists for the tablet
                if not TicketNotification.objects.filter(ticket_id=ticket['id'],tabletserialNo=tabletserialNo).exists():
                    # Create or update notification
                    TicketNotification.objects.update_or_create(
                        tabletserialNo=tabletserialNo,
                        ticket_id=ticket['id'],
                        defaults={'created_at': ticket.get('created_at')}
                    )
                
            unseen_notifications = TicketNotification.objects.filter(tabletserialNo=tabletserialNo, is_seen=False).count()
            notifications = TicketNotification.objects.filter(tabletserialNo=tabletserialNo, is_seen=False)

        else:
            print(f"Failed to fetch tickets data. Status code: {response.status_code}")
            unseen_notifications = 0

    except requests.RequestException as e:
        print(f"Error connecting to the support tickets API: {e}")

    tablet_serial_no = request.session.get('tablet_serial_no')
    tablet_api_url = "https://dashboard.gamenest.se/api/Tablets"
    tablet_response = requests.get(tablet_api_url)
    tablets = tablet_response.json()
    tablet = next((t for t in tablets if t['serialNo'] == tablet_serial_no), None)

    headset_api_url = "https://dashboard.gamenest.se/api/Headsets"
    headsets_response = requests.get(headset_api_url)
    headsets = headsets_response.json()

    response = requests.get('https://dashboard.gamenest.se/api/Games')
    if response.status_code == 200:
        games_data = response.json()
    else:
        games_data = []

    # Filter rooms based on the tablet's room
    filtered_headsets = [headset for headset in headsets if headset['room'] == tablet['room']]
   
    return render(request, 'index.html',{'headsets':filtered_headsets,'games':games_data , 'unseen_notifications':unseen_notifications,"notifications":notifications})

def games(request):
    url = "https://gamenest.se/api/tickets/"
 
    tabletserialNo = request.session['tablet_serial_no'] 
    try:
        response = requests.get(url)
        if response.status_code == 200:
            support_ticket_data = response.json()
            print(support_ticket_data)
            for ticket in support_ticket_data:
                # Check if the ticket already exists for the tablet
                if not TicketNotification.objects.filter(ticket_id=ticket['id'],tabletserialNo=tabletserialNo).exists():
                    # Create or update notification
                    TicketNotification.objects.update_or_create(
                        tabletserialNo=tabletserialNo,
                        ticket_id=ticket['id'],
                        defaults={'created_at': ticket.get('created_at')}
                    )
                
            unseen_notifications = TicketNotification.objects.filter(tabletserialNo=tabletserialNo, is_seen=False).count()
            notifications = TicketNotification.objects.filter(tabletserialNo=tabletserialNo, is_seen=False)

        else:
            print(f"Failed to fetch tickets data. Status code: {response.status_code}")
            unseen_notifications = 0

    except requests.RequestException as e:
        print(f"Error connecting to the support tickets API: {e}")
    try:
        # Fetch data from the API
        response = requests.get('https://dashboard.gamenest.se/api/Games')
        print(response.json())
        if response.status_code == 200:
            games_data = response.json()
        else:
            games_data = []
    except Exception as e:
        print(f"Error fetching games data: {e}")
        games_data = []

    # Pass data to the template
    return render(request, 'games.html', {'games': games_data,'unseen_notifications':unseen_notifications,'notifications':notifications})

def room(request):

    url = "https://gamenest.se/api/tickets/"
 
    tabletserialNo = request.session['tablet_serial_no'] 
    try:
        response = requests.get(url)
        if response.status_code == 200:
            support_ticket_data = response.json()
            print(support_ticket_data)
            for ticket in support_ticket_data:
                # Check if the ticket already exists for the tablet
                if not TicketNotification.objects.filter(ticket_id=ticket['id'],tabletserialNo=tabletserialNo).exists():
                    # Create or update notification
                    TicketNotification.objects.update_or_create(
                        tabletserialNo=tabletserialNo,
                        ticket_id=ticket['id'],
                        defaults={'created_at': ticket.get('created_at')}
                    )
                
            unseen_notifications = TicketNotification.objects.filter(tabletserialNo=tabletserialNo, is_seen=False).count()
            notifications = TicketNotification.objects.filter(tabletserialNo=tabletserialNo, is_seen=False)

        else:
            print(f"Failed to fetch tickets data. Status code: {response.status_code}")
            unseen_notifications = 0

    except requests.RequestException as e:
        print(f"Error connecting to the support tickets API: {e}")

    tablet_serial_no = request.session.get('tablet_serial_no')



    # if not tablet_serial_no:
    #     return render(request, 'error.html', {"message": "Tablet serial number not found. Please log in again."})
    tablet_api_url = "https://dashboard.gamenest.se/api/Tablets"
    tablet_response = requests.get(tablet_api_url)
    
    # if tablet_response.status_code != 200:
    #     return render(request, 'error.html', {"message": "Unable to fetch tablet data."})
    
    tablets = tablet_response.json()
    tablet = next((t for t in tablets if t['serialNo'] == tablet_serial_no), None)

    # if not tablet:
    #     return render(request, 'error.html', {"message": "Tablet not found in the system."})
    rooms_api_url = "https://dashboard.gamenest.se/api/Rooms"
    rooms_response = requests.get(rooms_api_url)
    rooms = rooms_response.json()
    print(rooms)
    # Filter rooms based on the tablet's room
    filtered_rooms = [room for room in rooms if room['id'] == tablet['room']]

    # Render the template with filtered rooms
    return render(request, 'room.html', {"rooms": filtered_rooms, "tablet_serial_no": tablet_serial_no,'unseen_notifications':unseen_notifications,'notifications':notifications})

def headset(request):
    url = "https://gamenest.se/api/tickets/"
    # wsurl = "ws://3.92.227.226:3000"
 
    tabletserialNo = request.session['tablet_serial_no'] 
    try:
        response = requests.get(url)
        # wsresponse = request.get(wsurl)
        if response.status_code == 200:
            support_ticket_data = response.json()
            print(support_ticket_data)
            for ticket in support_ticket_data:
                # Check if the ticket already exists for the tablet
                if not TicketNotification.objects.filter(ticket_id=ticket['id'],tabletserialNo=tabletserialNo).exists():
                    # Create or update notification
                    TicketNotification.objects.update_or_create(
                        tabletserialNo=tabletserialNo,
                        ticket_id=ticket['id'],
                        defaults={'created_at': ticket.get('created_at')}
                    )
                
            unseen_notifications = TicketNotification.objects.filter(tabletserialNo=tabletserialNo, is_seen=False).count()
            notifications = TicketNotification.objects.filter(tabletserialNo=tabletserialNo, is_seen=False)

        else:
            print(f"Failed to fetch tickets data. Status code: {response.status_code}")
            unseen_notifications = 0

    except requests.RequestException as e:
        print(f"Error connecting to the support tickets API: {e}")    
    tablet_serial_no = request.session.get('tablet_serial_no')
    tablet_api_url = "https://dashboard.gamenest.se/api/Tablets"
    tablet_response = requests.get(tablet_api_url)
    tablets = tablet_response.json()
    tablet = next((t for t in tablets if t['serialNo'] == tablet_serial_no), None)

    headset_api_url = "https://dashboard.gamenest.se/api/Headsets"
    headsets_response = requests.get(headset_api_url)
    headsets = headsets_response.json()

    # Filter rooms based on the tablet's room
    filtered_headsets = [headset for headset in headsets if headset['room'] == tablet['room']]
    print(filtered_headsets)


    return render(request,'headset.html',{'headsets':filtered_headsets,'unseen_notifications':unseen_notifications,'notifications':notifications})

def support(request):

    url = "https://gamenest.se/api/tickets/"
 
    tabletserialNo = request.session['tablet_serial_no'] 
    try:
        response = requests.get(url)
        if response.status_code == 200:
            support_ticket_data = response.json()
            print(support_ticket_data)
            for ticket in support_ticket_data:
                # Check if the ticket already exists for the tablet
                if not TicketNotification.objects.filter(ticket_id=ticket['id'],tabletserialNo=tabletserialNo).exists():
                    # Create or update notification
                    TicketNotification.objects.update_or_create(
                        tabletserialNo=tabletserialNo,
                        ticket_id=ticket['id'],
                        defaults={'created_at': ticket.get('created_at')}
                    )
                
            unseen_notifications = TicketNotification.objects.filter(tabletserialNo=tabletserialNo, is_seen=False).count()
            notifications = TicketNotification.objects.filter(tabletserialNo=tabletserialNo, is_seen=False)

        else:
            print(f"Failed to fetch tickets data. Status code: {response.status_code}")
            unseen_notifications = 0

    except requests.RequestException as e:
        print(f"Error connecting to the support tickets API: {e}")

    url = "https://gamenest.se/api/tickets/"

    today_tickets = []
    ongoing_tickets = []
    resolved_tickets = []
    filtered_tickets = []

    try:
        response = requests.get(url)
        if response.status_code == 200:
            support_ticket_data = response.json()

            # Sort tickets by created_at in descending order
            support_ticket_data.sort(
                key=lambda ticket: ticket.get('created_at', ''),
                reverse=True
            )

            # Apply status filter
            status_filter = request.GET.get('status', 'all').lower()

            if status_filter == 'ongoing':
                filtered_tickets = [
                    ticket for ticket in support_ticket_data if ticket.get('ticketstatus') == 'on-going'
                ]
            elif status_filter == 'resolved':
                filtered_tickets = [
                    ticket for ticket in support_ticket_data if ticket.get('ticketstatus') == 'resolved'
                ]
            else:  # 'all' or no filter
                filtered_tickets = support_ticket_data

            # Process tickets for categorization
            today_date = timezone.now().date()
            for ticket in support_ticket_data:
                created_at = ticket.get('created_at', '')[:10]
                status = ticket.get('ticketstatus')

                if created_at == str(today_date) and status != 'resolved':
                    today_tickets.append(ticket)
                if status == 'on-going':
                    ongoing_tickets.append(ticket)
                if status == 'resolved':
                    resolved_tickets.append(ticket)

    except requests.RequestException as e:
        print(f"Error connecting to the support tickets API: {e}")

    # Paginate filtered tickets
    def paginate(queryset, page_key, per_page=10):
        page_number = request.GET.get(page_key, 1)
        paginator = Paginator(queryset, per_page)
        return paginator.get_page(page_number)

    paginated_tickets = paginate(filtered_tickets, 'page')

    return render(request, 'support.html', {
        'paginated_tickets': paginated_tickets,
        'status_filter': status_filter,
        'unseen_notifications':unseen_notifications,
        'notifications':notifications
    })


def setting(request):

    url = "https://gamenest.se/api/tickets/"
 
    tabletserialNo = request.session['tablet_serial_no'] 
    try:
        response = requests.get(url)
        if response.status_code == 200:
            support_ticket_data = response.json()
            print(support_ticket_data)
            for ticket in support_ticket_data:
                # Check if the ticket already exists for the tablet
                if not TicketNotification.objects.filter(ticket_id=ticket['id'],tabletserialNo=tabletserialNo).exists():
                    # Create or update notification
                    TicketNotification.objects.update_or_create(
                        tabletserialNo=tabletserialNo,
                        ticket_id=ticket['id'],
                        defaults={'created_at': ticket.get('created_at')}
                    )
                
            unseen_notifications = TicketNotification.objects.filter(tabletserialNo=tabletserialNo, is_seen=False).count()
            notifications = TicketNotification.objects.filter(tabletserialNo=tabletserialNo, is_seen=False)

        else:
            print(f"Failed to fetch tickets data. Status code: {response.status_code}")
            unseen_notifications = 0

    except requests.RequestException as e:
        print(f"Error connecting to the support tickets API: {e}")

    return render(request,"setting.html",{'unseen_notifications':unseen_notifications,'notifications':notifications})