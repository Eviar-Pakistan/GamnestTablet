from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.shortcuts import render

def login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Authenticate using the custom backend
        user = authenticate(request, username=username, password=password)

        if user is not None:
            # Login the user
            login(request, user)

            return JsonResponse({
                'success': True,
                'message': 'Login successful!',
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Invalid username or password.',
            })

    return render(request, 'login.html')





def index(request):

    return render(request,'index.html')


def games(request):

    return render(request,'games.html')

def room(request):
    return render(request,'room.html')

def headset(request):

    return render(request,'headset.html')

def support(request):

    return render(request,'support.html')