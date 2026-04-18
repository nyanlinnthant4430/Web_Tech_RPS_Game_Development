let userScore = 0;
let computerScore = 0;

let soundEnabled = true;

let bgMusic, clickSound, winSound, loseSound, drawSound, musicIcon;

let difficulty = "medium";
let maxWins = 3;
let volume = 0.3;

let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

/* ========================
   INIT
======================== */
document.addEventListener("DOMContentLoaded", function () {
    bgMusic = document.getElementById("bgMusic");
    clickSound = document.getElementById("clickSound");
    winSound = document.getElementById("winSound");
    loseSound = document.getElementById("loseSound");
    drawSound = document.getElementById("drawSound");
    musicIcon = document.getElementById("musicIcon");

    displayLeaderboard();
});

/* ========================
   MUSIC TOGGLE
======================== */
function toggleMusic() {
    soundEnabled = !soundEnabled;

    if (soundEnabled) {
        musicIcon.classList.remove("fa-volume-xmark");
        musicIcon.classList.add("fa-volume-high");
    } else {
        bgMusic.pause();
        musicIcon.classList.remove("fa-volume-high");
        musicIcon.classList.add("fa-volume-xmark");
    }
}

/* ========================
   GAME FUNCTION
======================== */
function playGame(userChoice) {

    if (soundEnabled && bgMusic.paused) {
        bgMusic.volume = volume;
        bgMusic.play();
    }

    if (soundEnabled) {
        clickSound.currentTime = 0;
        clickSound.play();
    }

    if (userScore === maxWins || computerScore === maxWins) return;

    let choices = ["rock", "paper", "scissors"];
    let computerChoice;

    if (difficulty === "easy") {
        computerChoice = choices[Math.floor(Math.random() * 3)];
    }
    else if (difficulty === "medium") {
        computerChoice = Math.random() < 0.5
            ? choices[Math.floor(Math.random() * 3)]
            : getWinningMove(userChoice);
    }
    else {
        computerChoice = getWinningMove(userChoice);
    }

    let userImg = document.getElementById("userImg");
    let computerImg = document.getElementById("computerImg");

    userImg.src = "img/" + userChoice + "-rotate-right.png";
    computerImg.src = "img/" + computerChoice + "-rotate.png";

    userImg.classList.remove("shake");
    computerImg.classList.remove("shake");

    void userImg.offsetWidth;
    void computerImg.offsetWidth;

    userImg.classList.add("shake");
    computerImg.classList.add("shake");

    let resultText = document.getElementById("resultText");

    if (userChoice === computerChoice) {
        resultText.textContent = "Draw!";
        if (soundEnabled) {
            drawSound.currentTime = 0;
            drawSound.play();
        }
    }
    else if (
        (userChoice === "rock" && computerChoice === "scissors") ||
        (userChoice === "paper" && computerChoice === "rock") ||
        (userChoice === "scissors" && computerChoice === "paper")
    ) {
        userScore++;
        resultText.textContent = "You Win This Round!";
        if (soundEnabled) {
            winSound.currentTime = 0;
            winSound.play();
        }
    }
    else {
        computerScore++;
        resultText.textContent = "Computer Wins This Round!";
        if (soundEnabled) {
            loseSound.currentTime = 0;
            loseSound.play();
        }
    }

    document.getElementById("userScore").textContent = userScore;
    document.getElementById("computerScore").textContent = computerScore;

    /* ========================
       MATCH RESULT CHECK
    ======================== */
if (userScore === maxWins) {
    setTimeout(() => {
        showPopup("🎉 You Won The Game!", "img/man.png");
        saveScore();   // ✅ ONLY here
    }, 2000);
}

    if (computerScore === maxWins) {
        setTimeout(() => {
            showPopup("💀 Computer Won The Game!", "img/robot.png");
            // ❌ DO NOT SAVE
        }, 2000);
    }
}

/* ========================
   POPUP
======================== */
function showPopup(message, icon) {
    let popupText = document.getElementById("popupText");

    popupText.innerHTML = `
        <img src="${icon}" class="popup-icon"><br>
        ${message}
    `;

    document.getElementById("popup").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
    resetGame();
}

/* ========================
   RESET GAME
======================== */
function resetGame() {
    userScore = 0;
    computerScore = 0;

    document.getElementById("userScore").textContent = 0;
    document.getElementById("computerScore").textContent = 0;

    document.getElementById("resultText").textContent = "Choose your move";
}

/* ========================
   SETTINGS
======================== */
function openSettings() {
    document.getElementById("settingsPopup").style.display = "block";
    document.querySelector(".game-section").style.filter = "blur(5px)";
}

function closeSettings() {
    document.getElementById("settingsPopup").style.display = "none";
    document.querySelector(".game-section").style.filter = "none";
}

function saveSettings() {
    difficulty = document.getElementById("difficulty").value;

    let mode = parseInt(document.getElementById("gameMode").value);
    maxWins = Math.ceil(mode / 2);

    volume = document.getElementById("volumeSlider").value;

    bgMusic.volume = volume;
    clickSound.volume = volume;
    winSound.volume = volume;
    loseSound.volume = volume;
    drawSound.volume = volume;

    closeSettings();
    resetGame();
    showSaveMessage();
}

/* ========================
   WINNING LOGIC HELP
======================== */
function getWinningMove(userChoice) {
    if (userChoice === "rock") return "paper";
    if (userChoice === "paper") return "scissors";
    return "rock";
}

/* ========================
   SAVE MESSAGE
======================== */
function showSaveMessage() {
    let msg = document.getElementById("saveMessage");
    if (!msg) return;

    msg.classList.add("show");

    setTimeout(() => {
        msg.classList.remove("show");
    }, 2000);
}

/* ========================
   LEADERBOARD
======================== */
/* ================= LEADERBOARD ================= */
function saveScore() {
    let name = document.getElementById("playerName").value.trim();
    if (!name) return;

    localStorage.setItem("playerName", name);

    let existing = leaderboard.find(p => p.name === name);

    if (existing) {
        existing.score++;
    } else {
        leaderboard.push({ name, score: 1 });
    }

leaderboard.sort((a, b) => b.score - a.score);

// keep top 5 but allow equal scores
if (leaderboard.length > 5) {
    let minScore = leaderboard[4].score;
    leaderboard = leaderboard.filter(p => p.score >= minScore);
}

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    displayLeaderboard();
}

function displayLeaderboard() {
    let list = document.getElementById("leaderboardList");
    list.innerHTML = "";

    let medals = ["🥇", "🥈", "🥉"];

    leaderboard.forEach((p, i) => {
        let li = document.createElement("li");
        li.innerHTML = `${medals[i] || "🎮"} ${p.name} - ${p.score}`;
        list.appendChild(li);
    });
}