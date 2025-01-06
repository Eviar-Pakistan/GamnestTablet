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


const addMore = document.getElementById("addmore");
const addMoreData = document.getElementById("addmoredata");
const playerContinue = document.getElementById("playercontinue");
const teamsForm = document.getElementById("teamsform");
const playerForm = document.getElementById("playerform");
const teamContinue = document.getElementById("teamcontinue");
const gameForm = document.getElementById("gameform");
const finalSummary = document.getElementById("finalsummary");

let players = [];
let selectedHeadsets = []; // Array to store selected headsets
let teams = []; // Array to store teams
var playerCount;

// Add more player fields
addMore && addMore.addEventListener("click", () => {
  playerCount = document.querySelectorAll(".player-name").length + 1; // Dynamic count
  const playerField = `
    <div class="d-flex justify-content-center gap-5 align-center player-row" id="player-row-${playerCount}">
      <div class="mt-3">
        <label class="allLbl">Player ${playerCount}</label>
        <input type="text" placeholder="Enter player name" class="allinput player-name" data-player-id="${playerCount}">
      </div>
      <div class="mt-3" style="width: 45%;">
        <label class="allLbl">Headsets</label>
        <select id="headset-${playerCount}" class="allinput headset-select" data-player-id="${playerCount}">
          <option value="default" disabled selected>Select Headset</option>
          ${getHeadsetOptions()}
        </select>
      </div>
    </div>`;
  addMoreData.insertAdjacentHTML("beforeend", playerField);

  // Add event listener for newly added headset dropdown
  const newHeadsetSelect = document.querySelector(`#headset-${playerCount}`);
  newHeadsetSelect.addEventListener("change", (event) => handleHeadsetSelection(event));
});

// Generate headset dropdown options
function getHeadsetOptions() {
  return headsets
    .map(
      (headset) =>
        `<option value="${headset.serialNo}" data-headset-name="${headset.name}">${headset.name}</option>`
    )
    .join("");
}

// Handle headset selection
function handleHeadsetSelection(event) {
  const headsetValue = event.target.value;
  const playerId = event.target.dataset.playerId;

  // Remove previous selection for this player (if any)
  const previousSelectionIndex = selectedHeadsets.findIndex(
    (entry) => entry.playerId === playerId
  );
  if (previousSelectionIndex !== -1) {
    selectedHeadsets.splice(previousSelectionIndex, 1);
  }

  // Add the new selection
  if (headsetValue !== "default") {
    selectedHeadsets.push({ playerId, headsetValue });
  }

  console.log("Selected Headsets:", selectedHeadsets);
}

// Player Continue Button
playerContinue && playerContinue.addEventListener("click", () => {
  const playerNames = document.querySelectorAll(".player-name");
  const headsetSelections = document.querySelectorAll(".headset-select");

  players = [];
  let valid = true;
  let errorMessage = "";

  // Validate each player
  playerNames.forEach((input) => {
    const playerId = input.dataset.playerId;
    const playerName = input.value.trim();
    const headsetSelect = document.querySelector(`#headset-${playerId}`);
    const headsetValue = headsetSelect.value;
    const headsetName = headsetSelect.options[headsetSelect.selectedIndex]?.text;

    // Validate the player's name and headset selection
    if (!playerName) {
      valid = false;
      errorMessage = "Please enter a name for each player.";
    } else if (headsetValue === "default") {
      valid = false;
      errorMessage = "Please select a headset for each player.";
    } else if (
      selectedHeadsets.some(
        (entry) =>
          entry.headsetValue === headsetValue && entry.playerId !== playerId
      )
    ) {
      valid = false;
      errorMessage = "Ensure each player has a unique headset selected.";
    }

    // If the validation fails, exit the loop
    if (!valid) {
      return; // Early exit
    }

    // Add the player to the list
    players.push({
      id: playerId,
      name: playerName,
      headset: { serialNo: headsetValue, name: headsetName },
    });
  });

  // Ensure there are at least 2 players
  if (playerCount < 2) {
    valid = false;
    errorMessage = "You must add at least 2 players.";
  }

  // Show the error message if validation failed
  if (!valid) {
    alert(errorMessage);
  } else {
    // Add players to team selection dropdown
    const teamPlayerSelect = document.querySelector("#teamplayerselect");
    teamPlayerSelect.innerHTML = players
      .map(
        (player) =>
          `<option value="${player.id}" data-headset="${player.headset.name}">${player.name}</option>`
      )
      .join("");

    // Validation passed, proceed to the next form
    playerForm.style.display = "none";
    teamsForm.style.display = "block";
  }
});

// Team Continue Button
teamContinue && teamContinue.addEventListener("click", () => {
  const teamInputs = document.querySelectorAll(".team-name");
  const teamPlayerSelects = document.querySelectorAll(".team-player-select");

  teams = [];
  let valid = true;

  teamInputs.forEach((input, index) => {
    const teamName = input.value.trim();
    const playerSelect = teamPlayerSelects[index];
    const selectedPlayers = Array.from(playerSelect.selectedOptions).map((opt) => opt.value);

    if (!teamName || selectedPlayers.length < 2) {
      valid = false;
      alert("Each team must have a name and at least 2 players.");
      return;
    }

    teams.push({ name: teamName, players: selectedPlayers });
  });

  if (valid) {
    teamsForm.style.display = "none";
    gameForm.style.display = "block";
  }
});

// Game Continue Button
document.getElementById("gamecontinue")?.addEventListener("click", () => {
  const gameSelect = document.getElementById("selectedgames");
  const selectedGame = gameSelect.value;

  if (selectedGame === "default") {
    alert("Select a game to continue.");
    return;
  }

  // Prepare final summary
  let summaryHTML = `<h3>Game Summary</h3>`;
  summaryHTML += `<p>Selected Game: ${selectedGame}</p>`;
  teams.forEach((team) => {
    summaryHTML += `<h4>Team: ${team.name}</h4>`;
    summaryHTML += `<ul>`;
    team.players.forEach((playerId) => {
      const player = players.find((p) => p.id === playerId);
      summaryHTML += `<li>${player.name} (Headset: ${player.headset.name})</li>`;
    });
    summaryHTML += `</ul>`;
  });

  finalSummary.innerHTML = summaryHTML;
  gameForm.style.display = "none";
  finalSummary.style.display = "block";
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