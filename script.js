


/* ============================================================
   Declared at the top level so every function can access them.
   ============================================================ */

let userScore     = 0;          // Player's round wins this match
let computerScore = 0;          // Computer's round wins this match
let soundEnabled  = true;       // Global mute flag (true = sound on)
let difficulty    = "medium";   // AI difficulty: "easy" | "medium" | "hard"
let maxWins       = 3;          // Rounds needed to win (default Best of 5 → first to 3)
let volume        = 0.3;        // Master volume level (0.0 – 1.0)
let gameOver      = false;      // Blocks extra clicks after a match is decided

// Audio element references — set inside DOMContentLoaded once the DOM exists
let bgMusic, clickSound, winSound, loseSound, drawSound, musicIcon;

// Load saved leaderboard from localStorage, or start with an empty array
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];


/* ============================================================
    DOM INITIALISATION
   Waits for the full HTML to load before touching any elements.
   BUG FIX: Original code had two separate DOMContentLoaded
   listeners — bgMusic was assigned in both, creating a duplicate.
   Merged into a single listener here.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    // --- Assign all audio element references ---
    bgMusic    = document.getElementById("bgMusic");
    clickSound = document.getElementById("clickSound");
    winSound   = document.getElementById("winSound");
    loseSound  = document.getElementById("loseSound");
    drawSound  = document.getElementById("drawSound");
    musicIcon  = document.getElementById("musicIcon");

    // --- Pre-fill player name from last session ---
    let savedName = localStorage.getItem("playerName");
    let nameInput = document.getElementById("playerName");
    if (savedName && nameInput) nameInput.value = savedName;

    // --- Start background music on very first user interaction ---
    // Browsers block autoplay; we must wait for a user gesture.
    let hint = document.getElementById("musicHint");
    document.body.addEventListener("click", function () {
        if (soundEnabled && bgMusic && bgMusic.paused) {
            bgMusic.volume = volume;
            bgMusic.play().catch(() => {}); // Silently ignore if browser still blocks
        }
        if (hint) hint.style.display = "none"; // Hide the "click to play music" hint
    }, { once: true }); // { once: true } removes this listener automatically after first fire

    // --- Render leaderboard on page load ---
    displayLeaderboard();

    // --- Restore saved light/dark theme preference ---
    let savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        let btn = document.querySelector(".theme-btn");
        if (btn) btn.textContent = "☀️";
    }
});


/* ============================================================
   MUSIC / SOUND CONTROL
   ============================================================ */

/* Toggles the global mute state and updates the speaker icon.
   Called by the music button in the HTML. */
function toggleMusic() {
    soundEnabled = !soundEnabled;

    if (soundEnabled) {
        // Unmute: swap icon and resume background track
        musicIcon.classList.remove("fa-volume-xmark");
        musicIcon.classList.add("fa-volume-high");
        if (bgMusic.paused) {
            bgMusic.volume = volume;
            bgMusic.play().catch(() => {});
        }
    } else {
        // Mute: pause music and show muted icon
        bgMusic.pause();
        musicIcon.classList.remove("fa-volume-high");
        musicIcon.classList.add("fa-volume-xmark");
    }
}

/* Convenience wrapper: resets and plays any audio element.
   Resetting currentTime allows the same sound to overlap if clicked quickly. */
function playSound(audioEl) {
    if (!soundEnabled || !audioEl) return;
    audioEl.currentTime = 0;
    audioEl.play().catch(() => {}); // Ignore AbortError on rapid clicks
}


/* ============================================================
   CORE GAME LOGIC
   ============================================================ */

/* Main entry point — called by the rock / paper / scissors image buttons. */
function playGame(userChoice) {

    // Block all input once a match has ended (until reset)
    if (gameOver) return;

    // Resume background music on first move if it hasn't started yet
    if (soundEnabled && bgMusic && bgMusic.paused) {
        bgMusic.volume = volume;
        bgMusic.play().catch(() => {});
    }

    playSound(clickSound); // Tactile click feedback on every move

    let computerChoice = getComputerChoice(userChoice); // AI picks its move
    updateBattleImages(userChoice, computerChoice);      // Animate battle display
    let result = determineWinner(userChoice, computerChoice); // Evaluate round
    handleRoundResult(result);                           // Update scores & check match end
}

/* --- AI Difficulty ---
   easy   → purely random (fair 33/33/33 split)
   medium → 50% random, 50% optimal counter  (mixed strategy)
   hard   → always picks the move that beats the player          */
function getComputerChoice(userChoice) {
    let choices = ["rock", "paper", "scissors"];

    if (difficulty === "easy") {
        return choices[Math.floor(Math.random() * 3)]; // Completely random
    }

    if (difficulty === "medium") {
        // Coin flip: random OR optimal counter
        return Math.random() < 0.5
            ? choices[Math.floor(Math.random() * 3)]
            : getWinningMove(userChoice);
    }

    // Hard: always counter the player's move
    return getWinningMove(userChoice);
}

/* Returns the move that beats the given choice (used by medium & hard AI). */
function getWinningMove(userChoice) {
    const counter = {
        rock:     "paper",    // paper beats rock
        paper:    "scissors", // scissors beats paper
        scissors: "rock"      // rock beats scissors
    };
    return counter[userChoice];
}

/* Pure comparison function — no side effects.
   Returns "win" | "lose" | "draw" from the player's perspective. */
function determineWinner(userChoice, computerChoice) {
    if (userChoice === computerChoice) return "draw";

    // Maps each choice to what it beats
    const winsAgainst = {
        rock:     "scissors",
        paper:    "rock",
        scissors: "paper"
    };

    return winsAgainst[userChoice] === computerChoice ? "win" : "lose";
}


/* ============================================================
   ANIMATION HELPERS
   ============================================================ */

/* Swaps both battle images and re-triggers the CSS shake animation.
   The void offsetWidth lines force a reflow so the browser actually
   restarts the animation even if the same class was already applied. */
function updateBattleImages(userChoice, computerChoice) {
    let userImg     = document.getElementById("userImg");
    let computerImg = document.getElementById("computerImg");

    // Point each image at the chosen move's sprite
    userImg.src     = "img/" + userChoice     + "-rotate-right.png";
    computerImg.src = "img/" + computerChoice + "-rotate.png";

    // Remove animation class, force reflow, re-add to restart animation
    userImg.classList.remove("shake");
    computerImg.classList.remove("shake");
    void userImg.offsetWidth;       // Trigger reflow
    void computerImg.offsetWidth;
    userImg.classList.add("shake");
    computerImg.classList.add("shake");
}


/* ============================================================
   ROUND RESULT HANDLING & MATCH END
   Updates scores and checks if someone has won the full match.
   ============================================================ */

function handleRoundResult(result) {
    let resultText = document.getElementById("resultText");

    if (result === "draw") {
        resultText.textContent = "It's a Draw! 🤝";
        playSound(drawSound);

    } else if (result === "win") {
        userScore++;
        resultText.textContent = "You Win This Round! 🎉";
        playSound(winSound);

    } else { // "lose"
        computerScore++;
        resultText.textContent = "Computer Wins This Round! 💀";
        playSound(loseSound);
    }

    // Refresh scoreboard display
    document.getElementById("userScore").textContent     = userScore;
    document.getElementById("computerScore").textContent = computerScore;

    // --- Check for match winner ---
    if (userScore === maxWins) {
        gameOver = true;
        setTimeout(() => {
            showPopup("🎉 You Won The Match!", "img/man.png");
            saveScore(); // Save to leaderboard ONLY when player wins
        }, 1500);

    } else if (computerScore === maxWins) {
        gameOver = true;
        setTimeout(() => {
            showPopup("💀 Computer Won The Match!", "img/robot.png");
            // Do NOT save score when the player loses
        }, 1500);
    }
}


/* ============================================================
   POPUP — End-of-match overlay
   ============================================================ */

function showPopup(message, icon) {
    document.getElementById("popupText").innerHTML = `
        <img src="${icon}" class="popup-icon" alt="Result icon"><br>
        ${message}
    `;
    document.getElementById("popup").style.display = "block";
}

/* Closes the popup and starts a fresh match */
function closePopup() {
    document.getElementById("popup").style.display = "none";
    resetGame();
}


/* ============================================================
  GAME RESET
   Clears all scores and state — called after a match ends
   or when the player clicks "Reset Game".
   ============================================================ */

function resetGame() {
    userScore     = 0;
    computerScore = 0;
    gameOver      = false; // Re-enable player input

    // Update displayed scores
    document.getElementById("userScore").textContent     = "0";
    document.getElementById("computerScore").textContent = "0";
    document.getElementById("resultText").textContent    = "Choose your move";

    // Reset battle images back to the default rock pose
    document.getElementById("userImg").src     = "img/rock-rotate-right.png";
    document.getElementById("computerImg").src = "img/rock-rotate.png";
}


/* ============================================================
   SETTINGS — open / close / save
   ============================================================ */

/* Blurs the game section and shows the settings overlay */
function openSettings() {
    document.getElementById("settingsPopup").style.display = "block";
    document.querySelector(".game-section").style.filter   = "blur(5px)";
}

/* Closes the settings overlay and removes the blur */
function closeSettings() {
    document.getElementById("settingsPopup").style.display = "none";
    document.querySelector(".game-section").style.filter   = "none";
}

/* Reads values from the settings form and applies them */
function saveSettings() {
    // Update AI difficulty
    difficulty = document.getElementById("difficulty").value;

    // Convert "Best of N" total rounds → wins needed
    // e.g. Best of 5 → Math.ceil(5/2) = 3 wins required
    let totalRounds = parseInt(document.getElementById("gameMode").value);
    maxWins = Math.ceil(totalRounds / 2);

    // Apply new volume to every audio element
    volume = parseFloat(document.getElementById("volumeSlider").value);
    [bgMusic, clickSound, winSound, loseSound, drawSound].forEach(el => {
        if (el) el.volume = volume;
    });

    closeSettings();
    resetGame();       // Reset so new settings take effect cleanly
    showSaveMessage(); // Brief "Settings Saved ✅" toast notification
}

/* Shows a short fade-in/out toast confirming settings were saved */
function showSaveMessage() {
    let msg = document.getElementById("saveMessage");
    if (!msg) return;
    msg.classList.add("show");
    setTimeout(() => msg.classList.remove("show"), 2000);
}


/* ============================================================
  LEADERBOARD
   Saves player win counts to localStorage and renders the list.
   Only the top 5 are kept, but ties at position 5 are all retained.
   ============================================================ */

/* Called only when the player wins a match */
function saveScore() {
    let nameInput = document.getElementById("playerName");
    let name      = nameInput ? nameInput.value.trim() : "";

    if (!name) return; // Don't save anonymous/blank entries

    // Persist the name so it reappears on next visit
    localStorage.setItem("playerName", name);

    // Find existing entry or create a new one
    let existing = leaderboard.find(p => p.name === name);
    if (existing) {
        existing.score++;               // Increment existing player's win count
    } else {
        leaderboard.push({ name, score: 1 }); // New player entry
    }

    // Sort highest score first
    leaderboard.sort((a, b) => b.score - a.score);

    // Keep top 5, but retain all entries tied with the 5th score
    if (leaderboard.length > 5) {
        let cutoffScore = leaderboard[4].score;
        leaderboard = leaderboard.filter(p => p.score >= cutoffScore);
    }

    // Persist updated leaderboard
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    displayLeaderboard();
}

/* Renders the leaderboard list from the in-memory array */
function displayLeaderboard() {
    let list = document.getElementById("leaderboardList");
    if (!list) return; // Element may not exist on non-game pages

    list.innerHTML = "";

    // Show a placeholder when no scores exist yet
    if (leaderboard.length === 0) {
        list.innerHTML = "<li style='opacity:0.6'>No scores yet — be the first!</li>";
        return;
    }

    let medals = ["🥇", "🥈", "🥉"]; // Top 3 get medals; others get the game controller emoji

    leaderboard.forEach((player, index) => {
        let li    = document.createElement("li");
        let medal = medals[index] || "🎮";
        // Pluralise "win" / "wins" correctly
        li.innerHTML = `${medal} <strong>${player.name}</strong> — ${player.score} win${player.score !== 1 ? "s" : ""}`;
        list.appendChild(li);
    });
}


/* ============================================================
  THEME TOGGLE — Dark / Light mode
   Adds or removes the "light-mode" class on <body> and saves
   the preference so it persists across page loads.
   ============================================================ */

function toggleTheme() {
    document.body.classList.toggle("light-mode");

    let btn        = document.querySelector(".theme-btn");
    let isLightNow = document.body.classList.contains("light-mode");

    // Update button emoji and save new preference
    if (btn) btn.textContent = isLightNow ? "☀️" : "🌙";
    localStorage.setItem("theme", isLightNow ? "light" : "dark");
}

/* ============================================================
   HAMBURGER NAV TOGGLE — mobile responsive
   ============================================================ */
function toggleNav() {
  const nav = document.getElementById('mainNav');
  if (nav) nav.classList.toggle('open');
}

// Close nav when a link is clicked (single-page nav feel)
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
});
