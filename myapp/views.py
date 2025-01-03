from django.http import JsonResponse
from django.shortcuts import render
import json
from django.contrib.auth.decorators import login_required
import requests
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.utils import timezone
import requests
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
            api_url = "http://127.0.0.1:8000/api/Tablets"
            response = requests.get(api_url)
            if response.status_code != 200:
                return JsonResponse({"success": False, "message": "Failed to fetch tablet data"})

            tablets = response.json()
            for tablet in tablets:
                if tablet.get('serialNo') == serial_no and tablet.get('password') == password:
                    # Store the serial number in the session on successful login
                    request.session['tablet_serial_no'] = serial_no

                    # Login success
                    return JsonResponse({"success": True, "message": "Login successful"})

            # If no match is found
            return JsonResponse({"success": False, "message": "Invalid Serial No or Password"})

        except Exception as e:
            print(f"Error: {e}")
            return JsonResponse({"success": False, "message": "An error occurred"})
    
    # Render login page for GET request
    return render(request, 'login.html')



def index(request):
    tablet_serial_no = request.session.get('tablet_serial_no')
    tablet_api_url = "http://127.0.0.1:8000/api/Tablets"
    tablet_response = requests.get(tablet_api_url)
    tablets = tablet_response.json()
    tablet = next((t for t in tablets if t['serialNo'] == tablet_serial_no), None)

    headset_api_url = "http://127.0.0.1:8000/api/Headsets"
    headsets_response = requests.get(headset_api_url)
    headsets = headsets_response.json()

    response = requests.get('http://127.0.0.1:8000/api/Games')
    if response.status_code == 200:
        games_data = response.json()
    else:
        games_data = []

    # Filter rooms based on the tablet's room
    filtered_headsets = [headset for headset in headsets if headset['room'] == tablet['room']]
   
    return render(request, 'index.html',{'headsets':filtered_headsets,'games':games_data})

def games(request):
    try:
        # Fetch data from the API
        response = requests.get('http://127.0.0.1:8000/api/Games')
        if response.status_code == 200:
            games_data = response.json()
        else:
            games_data = []
    except Exception as e:
        print(f"Error fetching games data: {e}")
        games_data = []

    # Pass data to the template
    return render(request, 'games.html', {'games': games_data})

def room(request):
    tablet_serial_no = request.session.get('tablet_serial_no')

    # if not tablet_serial_no:
    #     return render(request, 'error.html', {"message": "Tablet serial number not found. Please log in again."})
    tablet_api_url = "http://127.0.0.1:8000/api/Tablets"
    tablet_response = requests.get(tablet_api_url)
    
    # if tablet_response.status_code != 200:
    #     return render(request, 'error.html', {"message": "Unable to fetch tablet data."})
    
    tablets = tablet_response.json()
    tablet = next((t for t in tablets if t['serialNo'] == tablet_serial_no), None)

    # if not tablet:
    #     return render(request, 'error.html', {"message": "Tablet not found in the system."})
    rooms_api_url = "http://127.0.0.1:8000/api/Rooms"
    rooms_response = requests.get(rooms_api_url)
    rooms = rooms_response.json()

    # Filter rooms based on the tablet's room
    filtered_rooms = [room for room in rooms if room['id'] == tablet['room']]

    # Render the template with filtered rooms
    return render(request, 'room.html', {"rooms": filtered_rooms, "tablet_serial_no": tablet_serial_no})

def headset(request):
    tablet_serial_no = request.session.get('tablet_serial_no')
    tablet_api_url = "http://127.0.0.1:8000/api/Tablets"
    tablet_response = requests.get(tablet_api_url)
    tablets = tablet_response.json()
    tablet = next((t for t in tablets if t['serialNo'] == tablet_serial_no), None)

    headset_api_url = "http://127.0.0.1:8000/api/Headsets"
    headsets_response = requests.get(headset_api_url)
    headsets = headsets_response.json()

    # Filter rooms based on the tablet's room
    filtered_headsets = [headset for headset in headsets if headset['room'] == tablet['room']]
    print(filtered_headsets)


    return render(request,'headset.html',{'headsets':filtered_headsets})

def support(request):
    url = "http://gamenest.se/api/tickets/"

    today_tickets = []
    ongoing_tickets = []
    resolved_tickets = []

    try:
        response = requests.get(url)
        if response.status_code == 200:
            support_ticket_data = response.json()

            # Sort tickets by created_at in descending order
            support_ticket_data.sort(
                key=lambda ticket: ticket.get('created_at', ''),
                reverse=True
            )

            # Filter by search term and priority
            search_query = request.GET.get('search', '').lower()
            priority_filter = request.GET.get('priority', '').lower()

            filtered_tickets = []

            for ticket in support_ticket_data:
                ticket_id = str(ticket.get('id', ''))
                ticket_title = (ticket.get('title') or '').lower()
                ticket_username = (ticket.get('user_name') or '').lower()  
                ticket_email = (ticket.get('useremail') or '').lower()
                ticket_priority = (ticket.get('priority') or '').lower()

                # Check if the ticket matches search criteria (id or title)
                if search_query in ticket_id or search_query in ticket_title or search_query in ticket_username or search_query in ticket_email:
                    # If a priority filter is selected, check if it matches
                    if not priority_filter or priority_filter == ticket_priority:
                        filtered_tickets.append(ticket)

            # Process tickets
            today_date = timezone.now().date()
            for ticket in filtered_tickets:
                created_at = ticket.get('created_at', '')[:10]
                status = ticket.get('ticketstatus')

    
                # Categorize tickets
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
    paginated_resolved_tickets = paginate(resolved_tickets, 'resolved_page')
    paginated_ongoing_tickets = paginate(ongoing_tickets, 'ongoing_page')
    paginated_new_tickets = paginate(today_tickets, 'new_page')

    return render(request,'support.html',
                  {   
        'paginated_tickets': paginated_tickets,
        'paginated_resolved_tickets': paginated_resolved_tickets,
        'paginated_ongoing_tickets': paginated_ongoing_tickets,
        'paginated_new_tickets': paginated_new_tickets,
        })