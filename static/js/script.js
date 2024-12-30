// ==============================Password Toggle===========================================//

function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.getElementById('toggleIcon');
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleIcon.classList.remove('fa-eye-slash');
    toggleIcon.classList.add('fa-eye');
  } else {
    passwordInput.type = 'password';
    toggleIcon.classList.remove('fa-eye');
    toggleIcon.classList.add('fa-eye-slash');
  }
}

// ==============================Password Toggle===========================================//


// =======================================Login functionality==================================//
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
const csrftoken = getCookie('csrftoken');



const loginbtn = document.getElementById("loginbtn");
const error = document.getElementById("error");

loginbtn && loginbtn.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    error.textContent = "Username or Password Required";
    return;
  }

  const data = { username: username, password: password };

  fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // If login is successful and user has the right permission
        localStorage.setItem('role', data.role);
        localStorage.setItem('permissions', JSON.stringify(data.permissions));

        const successModalElement = document.getElementById('ticketsuccessModal');
        const successmodal = new bootstrap.Modal(successModalElement);
        successmodal.show();
        document.getElementById("ticketsuccess").textContent = data.message;
        
        setTimeout(() => {
          successmodal.hide();
          window.location.href = "index";  // Redirect to index page after success
        }, 500);

      } else {
        // Show error modal if login fails
        const erromodal = new bootstrap.Modal(document.getElementById('ticketerrorModal'));
        erromodal.show();
        document.getElementById('ticketerror').textContent = data.message || "Invalid credentials";
      }
    })
    .catch(error => {
      console.error('Error', error);
      const erromodal = new bootstrap.Modal(document.getElementById('ticketerrorModal'));
      erromodal.show();
      document.getElementById('ticketerror').textContent = "An error occurred. Please try again.";
    });
});


// =======================================Login functionality==================================//

const uncollapseli = document.getElementById("uncollapseli")
const collapseli = document.getElementById("collapseli")
const sidebar = document.getElementById("sidebar")
const sidenavtext = document.querySelector("sidenavtext")
const collapsemenu = document.getElementById("collapse-menu") 
const uncollapsemenu = document.getElementById("uncollapse-menu")
var click = false

uncollapseli && uncollapseli.addEventListener("click",()=>{
   sidebar.style.gridTemplateColumns="180px 1fr"
   collapsemenu.classList.remove("d-flex")
   uncollapsemenu.classList.add("d-flex")
})
collapseli && collapseli.addEventListener("click",()=>{
  sidebar.style.gridTemplateColumns="80px 1fr"
  collapsemenu.classList.add("d-flex")
  uncollapsemenu.classList.remove("d-flex")
})

  const addmore = document.getElementById("addmore")
const addmoredata = document.getElementById("addmoredata") 
  addmore && addmore.addEventListener("click",function(){
number = 1

addmoredata.innerHTML += (
    `
     <div class="d-flex justify-content-center gap-5 align-center  ">
                        <div class="mt-3">
                            <label for="" class="allLbl">Player 1</label>
                            <input type="text" value="" placeholder="Enter player name" class="allinput ">
                        </div>
                        <div class="mt-3" style="width: 45%;">
                            <label for="selectedheadsets" class="allLbl">Headsets</label>
                            <select id="selectedHeadsets"class="allinput">
                              <option value="default" disabled selected>2 Selected</option>
                              <option value="Meta Quest 3">Meta Quest 3</option>
                              <option value="Meta Quest 3">Meta Quest 3</option>
                              <option value="Meta Quest 3">Meta Quest 3</option>
                            </select>
                          </div>
                    </div>
    `
)

  })

  const playercontinue = document.getElementById("playercontinue")
  const teamsform = document.getElementById("teamsform")
  const playerform = document.getElementById("playerform")
playercontinue && playercontinue.addEventListener("click",()=>{
    playerform.style.display="none"
    teamsform.style.display="block"
})
const teamcontinue = document.getElementById("teamcontinue")
const gameform = document.getElementById("gameform")
teamcontinue && teamcontinue.addEventListener("click",()=>{
  playerform.style.display="none"
  teamsform.style.display="none"
  gameform.style.display="block"
})

const playbtn = document.getElementById("playbtn")
const gamesection = document.getElementById("gamesection")
playbtn && playbtn.addEventListener("click",()=>{
gamesection.style.display="none"
 playerform.style.display="block"
})
document.addEventListener("DOMContentLoaded", function() {
  // Get all the card images
  const cardImages = document.querySelectorAll('.card .card-img-top');


  // Loop through each card image and add click event
  cardImages.forEach((img) => {
      img.addEventListener('click', function() {
          // Get the card content of the corresponding card
          const cardContent = this.nextElementSibling;
          
          // Toggle visibility of card content
          if (cardContent.style.display === 'none' || cardContent.style.display === '') {
              cardContent.style.display = 'block'; 
           

          } else {
              cardContent.style.display = 'none';  
          }
      });
  });
});

const games = document.getElementById("games")

function handleformpage(){
  games.style.display="none"
  playerform.style.display="block"


}

const addroom = document.getElementById("addroom")
const roomform = document.getElementById("roomform")
const roomcancel = document.getElementById("roomcancel")
addroom && addroom.addEventListener("click",()=>{
roomform.style.display="block"
})
roomcancel && roomcancel.addEventListener("click",()=>{
  roomform.style.display="none"
})

const openCamera = document.getElementById('openCamera');
const video = document.getElementById('cameraStream');

// Event listener for when the roompic div is clicked
openCamera && openCamera.addEventListener('click', () => {
  // Check if the browser supports the getUserMedia API
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        // Set the video element's source to the camera stream
        video.srcObject = stream;
        // Add the fullscreen class to make the video full screen
        video.classList.add('fullscreen');
        video.style.display = 'block'; // Show the video
      })
      .catch((error) => {
        console.error("Camera access denied or an error occurred: ", error);
      });
  } else {
    alert("Your browser doesn't support accessing the camera.");
  }
});

const addticket = document.getElementById("addticket");
const supportform = document.getElementById("supportform")
const ticketcancel = document.getElementById("ticketcancel")

addticket && addticket.addEventListener("click",()=>{
  supportform.style.display="block";
})
ticketcancel && ticketcancel.addEventListener("click",()=>{
  supportform.style.display="none";
})