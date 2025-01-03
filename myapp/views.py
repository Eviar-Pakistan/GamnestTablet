from django.http import JsonResponse
from django.shortcuts import render
import json
from django.contrib.auth.decorators import login_required
import requests
from django.views.decorators.csrf import csrf_exempt

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

    return render(request,'support.html')