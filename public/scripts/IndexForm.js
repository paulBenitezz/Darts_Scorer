// JavaScript for button group functionality
import { showBanner } from "./GameLooks.js";
const gameButtons = document.getElementById('gameButtons');
const buttons = gameButtons.querySelectorAll('button');
let selectedGame = null;

gameButtons.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        // Remove active class from all buttons
        buttons.forEach(button => button.classList.remove('active'));
        // Add active class to clicked button
        event.target.classList.add('active');
        // Store the selected game
        selectedGame = event.target.dataset.value;
        console.log(`Selected Game: ${selectedGame}`);
    }
});

// JavaScript for adding/removing player inputs dynamically
const playerInputs = document.getElementById('playerInputs');
const addPlayerButton = document.getElementById('addPlayer');


addPlayerButton.addEventListener('click', () => {
    if (playerInputs.children.length < 8) { // Limit to 8 players
        const div = document.createElement('div');
        div.classList.add('player-input-group');

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Player ${playerInputs.children.length + 1} Name`;
        input.required = true;
        setTimeout(() => {
            input.focus();
        }, 0);

        const button = document.createElement('Button');
        button.type = 'button';
        button.classList.add('removePlayer');
        button.textContent = '-';

        button.addEventListener('click', () => {
            div.remove();
        });

        div.appendChild(input);
        div.appendChild(button);
        playerInputs.appendChild(div);

    } else {
        showBanner('Maximum of 8 players allowed.', 1500, '#dc3545');
    }
});



const gameSetupForm = document.getElementById('gameSetupForm');

gameSetupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const playerNames = Array.from(playerInputs.querySelectorAll('input')).map(input => input.value).filter(name => name.trim());
    //const selectedGame = document.querySelector('input[name="gameType"]:checked')?.value;

    if (playerNames.length < 1) {
        showBanner('At least 1 player is required!', 1500, '#dc3545');
        return;
    }

    if (!selectedGame) {
        showBanner('Please select a game type!', 1500, '#dc3545');
        return;
    }

    try {
        console.log('entering try block');
        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerNames, selectedGame }),
        });

        const result = await response.text();
        console.log('Response:', result); // Debugging log
        
        if (response.ok) {
            console.log('Redirecting to play.html'); // Debugging log
            window.location.href = "play.html";
        }
    } catch (err) {
        console.error('Error submitting form:', err);
        showBanner('Error submitting form. Please try again.', 1500, '#dc3545');
    }
});

