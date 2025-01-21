import { updateScore, didPlayerReachZero, nextPlayer, isValidScore, handleRedemption } from './GameRules.js';

let currentPlayerIndex = 0;
let previousPlayerIndex = -1;
let playersData = [];
let gameType = '';
let redemptionMode = false;
let redemptionTurns = 0;
let originalWinnerIndex = -1;
let winnersList = [];
let scoreStack = [];

async function fetchGameData() {
    console.log('fetchGameData function called'); // Debugging log
    try {
        const response = await fetch('/game-data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        playersData = data;
        console.log('Fetched data:', data); // Debugging log

        const container = document.getElementById('playerScoresContainer');
        container.innerHTML = ''; // Clear existing content

        data.forEach((player, index) => {
            console.log('Creating player div for:', player); // Debugging log
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-score-group';
            playerDiv.id = `player-${index}`;

            const scoreLabel = document.createElement('label');
            scoreLabel.textContent = player.score;
            playerDiv.appendChild(scoreLabel);

            const nameLabel = document.createElement('label');
            nameLabel.textContent = player.name;
            playerDiv.appendChild(nameLabel);

            if (index === currentPlayerIndex) {
                createScoreInput(player, playerDiv, index, scoreLabel);
            }
            container.appendChild(playerDiv);
            scoreStack[index] = [];

        });

        highlightCurrentPlayer();

    } catch (err) {
        console.error('Error fetching game data.', err);
    }
}

function createScoreInput(player, playerDiv, index, scoreLabel) {
    const scoreInput = document.createElement('input');
    scoreInput.type = 'number';
    scoreInput.placeholder = '0';
    scoreInput.readOnly = false;
    scoreInput.autofocus = true;
    scoreInput.focus();
    scoreInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            console.log(`player-${index} score: ${scoreInput.value}`);
            // update score
            let newScore = parseInt(scoreInput.value, 10);
            if (Number.isNaN(newScore)) {
                newScore = 0;
            }
            console.log(`new score: ${newScore}`);
            if (!isValidScore(newScore)) {
                alert('Invalid score! Please enter a score between 0 and 180.');
                return;
            }
            scoreLabel.textContent -= scoreInput.value;
            scoreInput.value = "";
            console.log(`updating player ${player.player_id}`);
            scoreStack[index].push(newScore);
            await updatePlayerScore(player.player_id, newScore);
            updateScore(player, newScore);
            if (didPlayerReachZero(player) || redemptionMode) {
                if (!redemptionMode) {
                    const { redemptionTurns: turns, originalWinnerIndex: winnerIndex } = handleRedemption(playersData, currentPlayerIndex);
                    redemptionMode = true;
                    redemptionTurns = turns;
                    originalWinnerIndex = winnerIndex;
                    winnersList.push(player.name);
                    alert(`${player.name} wins! Redemption mode activated.`);
                } else {
                    redemptionTurns--;
                    if (player.score === 0) {
                        alert(`${player.name} reached 0!`);
                        winnersList.push(player.name);
                    }
                    if (redemptionTurns === 0) {
                        if (winnersList.length > 1) {
                            let nameList = winnersList.join(', ');
                            alert(`${nameList} win! Game Over!`);
                            // handle sudden death
                        } else {
                            alert(`${playersData[originalWinnerIndex].name} wins! Game Over!`);
                            redemptionMode = false;
                            window.location.href = '../index.html';
                        }
                    }

                }
            }
            previousPlayerIndex = currentPlayerIndex;
            currentPlayerIndex = nextPlayer(currentPlayerIndex, playersData);
            highlightCurrentPlayer();
            showReverseButton(previousPlayerIndex);

        }
    });

    playerDiv.appendChild(scoreInput);
}

function createReverseButton(playerDiv, playerIndex, scoreLabel) {
    const reverseButton = document.createElement('button');
    reverseButton.id = 'reverse-button';
    console.log('Creating reverse button');
    reverseButton.textContent = 'Reverse';
    reverseButton.addEventListener('click', async () => {
        if (scoreStack[playerIndex].length > 0) {
            const lastScore = scoreStack[playerIndex].pop();
            scoreLabel.textContent = parseInt(scoreLabel.textContent, 10) + lastScore;
            const playerId = playerDiv.dataset.playerId;
            console.log(`Reversing score for player ${playerId}`);
            await updatePlayerScore(playerId, -lastScore);
            currentPlayerIndex = playerIndex;
            highlightCurrentPlayer();
            reverseButton.remove();
            createScoreInput(playerDiv, playerIndex, scoreLabel);
        } else {
            console.log('No score to reverse');
        }
    });
    playerDiv.appendChild(reverseButton);
}

function showReverseButton(playerIndex) {

    const existingReverseButton = document.getElementById('reverse-button');

    if (existingReverseButton) {
        existingReverseButton.remove();
    }

    const playerDiv = document.getElementById(`player-${playerIndex}`);
    const scoreInput = playerDiv.querySelector('input');
    const scoreLabel = playerDiv.querySelector('label:nth-of-type(2)');
    if (scoreInput) {
        scoreInput.remove();
    }

    createReverseButton(playerDiv, playerIndex, scoreLabel);
}

function highlightCurrentPlayer() {
    playersData.forEach((_, index) => {
        const playerDiv = document.getElementById(`player-${index}`);
        const scoreInput = playerDiv.querySelector('input');
        if (index === currentPlayerIndex) {
            playerDiv.classList.add('current-player');
            if (scoreInput) {
                scoreInput.readOnly = false;
                scoreInput.focus();
            } else {

                createScoreInput(playersData[index], playerDiv, index, playerDiv.querySelector('label'));
            }
        } else {
            playerDiv.classList.remove('current-player');
            if (scoreInput) {
                scoreInput.readOnly = true;
                scoreInput.blur();
            }
        }
    });
}


async function updatePlayerScore(playerId, score) {
    try {
        const response = await fetch('/update-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerId, score }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response}`);
        }
        console.log('Score updated successfully');
    } catch (err) {
        console.error('Error updating scores: ', err);
    }
}



window.onload = fetchGameData;

