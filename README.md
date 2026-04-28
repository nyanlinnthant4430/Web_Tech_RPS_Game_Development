🎮 RPS Battle – Rock Paper Scissors Game

A modern browser-based Rock Paper Scissors game built using HTML, CSS, and JavaScript. The game includes multiple modes, difficulty levels, animations, sound effects, and a local leaderboard system.

📋 Table of Contents
Overview
How to Run
Game Modes
Difficulty
How to Play
Features
Leaderboard System
Dark Mode and Light Mode
File Structure
Technologies Used
Overview

RPS Battle is an interactive Rock Paper Scissors game where players compete against the computer. The game includes different difficulty levels and match modes to create a more engaging experience.

The design uses neon effects and glass style UI to create a modern game interface. The game also saves player scores using localStorage so users can view rankings and play again.

How to Run
Download or clone this project
Open index.html in any web browser
Start playing the game
git clone https://github.com/yourusername/Web_Tech_RPS_Game_Development
cd Web_Tech_RPS_Game_Development
open index.html

The game runs fully in the browser and does not need installation or server.

Game Modes
Mode	Description
Best of 3	First to win 2 rounds wins the game
Best of 5	First to win 3 rounds wins the game
Best of 7	First to win 4 rounds wins the game

These modes give players more choice and flexibility.

Difficulty
Mode
Easy
Medium
Hard 

How to Play
Select Rock or Paper or Scissors
The computer will make a choice
The result will be win or lose or draw
The score updates after each round
The game ends when the selected mode is completed
Features
Multiple game modes
Easy and medium and hard difficulty levels
Animated effects and smooth transitions
Sound effects and background music
Score tracking system
Popup result display
Responsive design
Leaderboard System

The game includes a local leaderboard system using localStorage.

How it works:

Player name is saved when the game starts and user can enter their names.
Scores are saved after each match
Rankings are displayed based on performance
Data stays saved in the browser

This feature increases replay value and user engagement.

Dark Mode and Light Mode

The game includes both dark mode and light mode. Users can switch between two themes based on their preference.

Dark mode uses a neon style and it is good for low light use. Light mode uses a bright layout and it is easy to read. The system saves the selected mode using localStorage and then the website remembers the user choice.

This feature improves usability and accessibility.

File Structure
STONE PAPER SCISSOR GAME FINAL DEVELOPMENT/
├── index.html        — Home page  
├── game.html         — Main game  
├── about.html        — About page  
├── contact.html      — Contact page  
├── rules.html        — Game rules  
├── script.js         — Game logic  
├── README.md         — Project documentation  
├── LICENSE           — License file  
│
├── img/              — Images  
│   ├── background.jpg  
│   ├── rock.png  
│   ├── paper.png  
│   ├── scissors.png  
│   ├── animations (rotate images)  
│
├── sounds/           — Audio files  
    ├── click.mp3  
    ├── draw.mp3  
    ├── lose.wav  
    ├── win.wav  
    ├── music.mp3  

Technologies Used
HTML5 — structure
CSS3 — design and animation
JavaScript — game logic and interaction
localStorage — saving scores and settings
Author

Created as a university assignment project.
Built using basic web technologies without frameworks.