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

document.addEventListener("DOMContentLoaded", () => {
  const savedSerialNo = localStorage.getItem("serialNo");
  if (savedSerialNo) {
    // document.getElementById("serialno").value = savedSerialNo;
  }
});

const LoginForm = document.getElementById("LoginForm");
const error = document.getElementById("error");

LoginForm && LoginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const serialNo = document.getElementById("serialno").value;
  const password = document.getElementById("password").value;

  if (!serialNo || !password) {
    error.textContent = "Serial No or Password Required";
    return;
  }

  const data = { serialNo: serialNo, password: password };

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
        localStorage.setItem("serialNo", serialNo);
        const successModalElement = document.getElementById('ticketsuccessModal');
        const successmodal = new bootstrap.Modal(successModalElement);
        successmodal.show();
        document.getElementById("ticketsuccess").textContent = data.message;
        
        setTimeout(() => {
          successmodal.hide();
          window.location.href = "index";
        }, 500);

      } else {
       
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



// =====================================Notification===============================================//
const selected_seen = document.getElementById('mark-selected-seen')
const all_seen = document.getElementById('mark-all-seen')

// Mark selected notifications as seen
selected_seen && selected_seen.addEventListener('click', function () {
  const selectedNotifications = Array.from(document.querySelectorAll('.notification-checkbox:checked'))
      .map(checkbox => checkbox.value); // Collect IDs of checked notifications

  if (selectedNotifications.length > 0) {
      fetch('/mark-selected-notifications-seen/', {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrftoken
          },
          body: JSON.stringify({ notification_ids: selectedNotifications })
      })
      .then(response => response.json())
      .then(data => {
          if (data.status === "success") {
              selectedNotifications.forEach(id => {
                  const notificationElement = document.querySelector(`[data-id="${id}"]`);
                  if (notificationElement) {
                      notificationElement.remove(); // Remove or visually update the notification
                  }
              });

              updateNotificationBadge(selectedNotifications.length);
          }
      })
      .catch(error => console.error("Error:", error));
  } else {
      showError("Please select at least one notification.");
  }
});

// Mark all notifications as seen
all_seen && all_seen.addEventListener('click', function () {
  const allNotifications = Array.from(document.querySelectorAll('.notification-checkbox'))
      .map(checkbox => checkbox.value); // Collect IDs of all notifications

  if (allNotifications.length > 0) {
      fetch('/mark-selected-notifications-seen/', {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrftoken
          },
          body: JSON.stringify({ notification_ids: allNotifications })
      })
      .then(response => response.json())
      .then(data => {
          if (data.status === "success") {
              allNotifications.forEach(id => {
                  const notificationElement = document.querySelector(`[data-id="${id}"]`);
                  if (notificationElement) {
                      notificationElement.remove(); // Remove or visually update the notification
                  }
              });

              updateNotificationBadge(allNotifications.length);
          }
      })
      .catch(error => console.error("Error:", error));
  } else {
      showError("No notifications to mark as seen.");
  }
});

// Helper function to update the notification badge count
function updateNotificationBadge(count) {
  const badge = document.querySelector('.notiBadge');
  if (badge) {
      let currentCount = parseInt(badge.textContent, 10) || 0;
      badge.textContent = Math.max(0, currentCount - count);
      if (currentCount - count <= 0) {
          badge.style.display = 'none';
      }
  }
}

// Helper function to show error message
function showError(message) {
  const notierror = document.getElementById("notierror");
  notierror.textContent = message;
}

// =====================================Notification===============================================//


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



const addMoreButton = document.getElementById("addmore");
const playerList = document.getElementById("playerlist");
const playerContinue = document.getElementById("playercontinue");
const playerForm = document.getElementById("playerform")
const teamsForm = document.getElementById("teamsform")
const gameform = document.getElementById("gameform")

let playerCount = 1; 
let selectedHeadsets = new Set(); 

// Function to populate headset options
function createHeadsetOptions() {
    return headsets.map((headset) => {
        return `<option value="${headset.serialNo}">${headset.name}</option>`;
    }).join("");
}

// Add new player field
addMoreButton && addMoreButton.addEventListener("click", () => {
    playerCount++;
    const playerRow = `
        <div class="d-flex justify-content-center gap-5 align-center player-row" id="player-row-${playerCount}">
            <div class="mt-3">
                <label class="allLbl">Player ${playerCount}</label>
                <input type="text" placeholder="Enter player name" class="allinput player-name" data-player-id="${playerCount}">
            </div>
            <div class="mt-3" style="width: 45%;">
                <label class="allLbl">Headsets</label>
                <select id="headset-${playerCount}" class="allinput headset-select" data-player-id="${playerCount}">
                    <option value="default" disabled selected>Select Headset</option>
                    ${createHeadsetOptions()}
                </select>
            </div>
        </div>`;
    playerList.insertAdjacentHTML("beforeend", playerRow);

    // Add event listener for the new headset dropdown
    const newHeadsetSelect = document.getElementById(`headset-${playerCount}`);
    newHeadsetSelect.addEventListener("change", handleHeadsetSelection);
});

function handleHeadsetSelection(event) {
  const headsetValue = event.target.value; // The newly selected headset's serialNo
  const playerId = event.target.dataset.playerId; // The ID of the player making the selection
  const playerSelect = document.querySelector(`select[data-player-id="${playerId}"]`);

  if (selectedHeadsets.has(headsetValue)) {
      alert("This headset is already assigned to another player. Please choose a unique headset.");
      event.target.value = "default"; 
      return;
  }

  const previousSelection = playerSelect.dataset.selectedHeadset;
  if (previousSelection && selectedHeadsets.has(previousSelection)) {
      selectedHeadsets.delete(previousSelection);
  }

  if (headsetValue !== "default") {
      selectedHeadsets.add(headsetValue);
      playerSelect.dataset.selectedHeadset = headsetValue;
  } else {
      playerSelect.dataset.selectedHeadset = "";
  }

  console.log("Updated selectedHeadsets:", selectedHeadsets);
}

let players = [];


playerContinue && playerContinue.addEventListener("click", () => {
    const playerNames = document.querySelectorAll(".player-name");
    const headsetSelects = document.querySelectorAll(".headset-select");

    let valid = true;
    let errorMessage = "";

    playerNames.forEach((input, index) => {
        const playerId = input.dataset.playerId;
        const playerName = input.value.trim();
        const headsetSelect = document.querySelector(`#headset-${playerId}`);
        const headsetValue = headsetSelect.value;
        const headsetName = headsetSelect.options[headsetSelect.selectedIndex]?.text;

        if (!playerName) {
            valid = false;
            errorMessage = `Player ${index + 1} name is missing.`;
            return;
        }

        if (headsetValue === "default") {
            valid = false;
            errorMessage = `Player ${index + 1} has not selected a headset.`;
            return;
        }

        players.push({
            id: playerId,
            name: playerName,
            headset: { serialNo: headsetValue, name: headsetName },
        });
        
    });

    if (!valid) {
        alert(errorMessage);
    }
    else if(players.length < 2){
      alert("Atleast two players are required")
    }
    else {
        console.log("Players with unique headsets:", players);
        alert("Players added successfully.");
        playerForm.style.display = "none";
    teamsForm.style.display = "block";
    }
});

const teamData = document.getElementById("teamdata");
const teamsContinue = document.getElementById("teamscontinue");
let teamCount = 2;
let selectedPlayers = new Set(); 

function createPlayerOptions(players) {
    return players.map(player => {
        // Disable players that are already selected
        const disabled = selectedPlayers.has(player.name) ? 'disabled' : '';
        return `<option value="${player.name}" ${disabled}>${player.name}</option>`;
    }).join("");
}

function populateTeamsForm(players) {
    teamData.innerHTML = ""; 

    for (let i = 1; i <= teamCount; i++) {
        const teamRow = `
            <div class="d-flex justify-content-center gap-5 align-center team-row" id="team-row-${i}">
                <div class="mt-3">
                    <label class="allLbl">Team ${i}</label>
                    <input type="text" placeholder="Enter team name" class="allinput team-name" data-team-id="${i}">
                </div>
                <div class="mt-3" style="width: 45%;">
                    <label class="allLbl">Players</label>
                    <select class="allinput team-player-select" data-team-id="${i}" multiple  onchange="handlePlayerSelection(event)">
                        <option value="" disabled>Select players</option>
                        ${createPlayerOptions(players)}
                    </select>
                </div>
            </div>`;
        teamData.insertAdjacentHTML("beforeend", teamRow);
    }
}

function handlePlayerSelection(event) {
    const selectedOptions = Array.from(event.target.selectedOptions).map(option => option.value);
    const teamId = event.target.dataset.teamId;

    selectedOptions.forEach(player => selectedPlayers.add(player));

    updatePlayerOptions();

    console.log("Selected Players for this Team:", selectedOptions);
    console.log("All Selected Players:", selectedPlayers);
}

function updatePlayerOptions() {
    const playerSelects = document.querySelectorAll(".team-player-select");

    playerSelects.forEach(select => {
        const options = select.querySelectorAll("option");
        
        options.forEach(option => {
            if (selectedPlayers.has(option.value)) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
    });
}

let teams = [];

teamsContinue && teamsContinue.addEventListener("click", () => {
  const teamNames = document.querySelectorAll(".team-name");
  const teamPlayerSelects = document.querySelectorAll(".team-player-select");

  let valid = true;
  let errorMessage = "";


  teamNames.forEach((input, index) => {
      const teamId = input.dataset.teamId;
      const teamName = input.value.trim();
      const selectedPlayersForTeam = Array.from(teamPlayerSelects[index].selectedOptions).map(option => option.value);

      if (!teamName) {
          valid = false;
          errorMessage = `Team ${index + 1} name is missing.`;
          return;
      }

      if (selectedPlayersForTeam.length === 0) {
          valid = false;
          errorMessage = `Team ${index + 1} must have at least one player selected.`;
          return;
      }

      const teamPlayersWithHeadsets = selectedPlayersForTeam.map(playerName => {
          const player = players.find(p => p.name === playerName);
          return {
              playerName: player.name,
              headsetSerialNo: player.headset.serialNo,
          };
      });

      teams.push({
          id: teamId,
          name: teamName,
          players: teamPlayersWithHeadsets,
      });
  });

  if (!valid) {
      alert(errorMessage);
  } else {
      console.log("Teams created with selected players and headsets:", teams);
      alert("Teams added successfully.");
      teamsForm.style.display = "none";
      gameform.style.display = "block";
  }
});


playerContinue.addEventListener("click", () => {
    if (players.length >= 2) {
        playerForm.style.display = "none";
        teamsForm.style.display = "block";
        populateTeamsForm(players);
    }
});

const gameContinue = document.getElementById("gamecontinue")

gameContinue && gameContinue.addEventListener("click", () => {
  const selectedGameElement = document.getElementById("selectedgames");
  selectedGame = selectedGameElement.value;

  if (selectedGame === "default") {
      alert("Please select a game.");
      return;
  }

  // Combine teams and selected game data into the final object
  const finalData = {
      game: selectedGame,
      teams: teams.map(team => ({
          teamName: team.name,
          players: team.players.map(player => ({
              playerName: player.playerName,
              headsetSerialNo: player.headsetSerialNo,
          })),
      })),
  };

  console.log("Final Data:", finalData);
  alert("Game Started!");

  // You can now send `finalData` to your server or process it further
});


document.addEventListener("DOMContentLoaded", function () {
  const cardImages = document.querySelectorAll('.card .card-img-top');

  cardImages.forEach((img) => {
    img.addEventListener('click', function () {
      const allCardContents = document.querySelectorAll('.card-content');
      allCardContents.forEach((content) => {
        content.style.display = 'none';
      });

      const cardContent = this.nextElementSibling;

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
  playerForm.style.display="block"


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

const logoutbtn = document.getElementById("logoutbtn");

logoutbtn && logoutbtn.addEventListener("click", () => {
  localStorage.clear();

  window.location.replace("/");

  setTimeout(() => {
    window.history.pushState(null, "", window.location.href);
    
    window.onpopstate = function() {
      window.history.go(1); 
    };
  }, 100);
});

