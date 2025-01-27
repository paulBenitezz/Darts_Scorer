import { updateScore, didPlayerReachZero, nextPlayer, isValidScore, handleRedemption } from './GameRules.js';
import { showBanner, handlePlayerBanner } from './GameLooks.js';

let currentPlayerIndex = 0;
let previousPlayerIndex = -1;
let playersData = [];
let redemptionMode = false;
let redemptionTurns = 0;
let originalWinnerIndex = -1;
let winnersList = [];
let scoreStack = [];
let isPlayingAlone = false;

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

        if (playersData.length === 1) {
            console.log("Solo Dolo");
            isPlayingAlone = true;
        }

        const container = document.getElementById('playerScoresContainer');
        container.innerHTML = ''; // Clear existing content

        data.forEach((player, index) => {
            console.log('Creating player div for:', player); // Debugging log
            let playerDiv = document.createElement('div');
            playerDiv.className = 'player-score-group';
            playerDiv.id = `player-${index}`;
            console.log('playerDiv:', playerDiv); // Debugging log
            playerDiv.dataset.playerId = player.player_id;


            const scoreLabel = document.createElement('label');
            scoreLabel.textContent = player.score;
            scoreLabel.className = 'score-label';
            playerDiv.appendChild(scoreLabel);

            const nameLabel = document.createElement('label');
            nameLabel.textContent = player.name;
            nameLabel.className = 'name-label';
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
    const existingScoreInput = document.getElementById('floating-input');

    if (existingScoreInput) {
        existingScoreInput.autofocus = false;
        existingScoreInput.remove();
    }

    const scoreInput = document.createElement('input');
    scoreInput.id = 'floating-input';
    scoreInput.type = 'number';
    scoreInput.placeholder = '0';
    scoreInput.readOnly = false;

    setTimeout(() => {
        scoreInput.focus();
    }, 0);

    scoreInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            console.log(`player-${index} round score: ${scoreInput.value}`);
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
            let currentScore = parseInt(scoreLabel.textContent, 10);
            scoreLabel.textContent -= scoreInput.value;
            currentScore -= newScore;

            playerDiv.dataset.score = currentScore;
            //player.score = currentScore;
            playersData[index].score = currentScore;
            scoreInput.value = "";
            console.log(`updating player ${player.player_id} with score: ${currentScore}`);
            scoreStack[index].push(newScore);

            await updatePlayerScore(playersData[index].player_id, currentScore);
            console.log(`player ${playersData[index].player_id} score: ${currentScore}`);
            if (didPlayerReachZero(playersData[index]) || redemptionMode) {
                if (isPlayingAlone) {
                    showBanner(`${player.name} wins! Game Over!`);
                    window.location.href = '../index.html';
                    return;
                }

                if (!redemptionMode) {
                    const { redemptionTurns: turns, originalWinnerIndex: winnerIndex } = handleRedemption(playersData, currentPlayerIndex);
                    redemptionMode = true;
                    redemptionTurns = turns;
                    originalWinnerIndex = winnerIndex;
                    winnersList.push(player.name);
                    handlePlayerBanner(player);
                } else {
                    redemptionTurns--;
                    if (player.score === 0) {
                        showBanner(`${player.name} reached 0!`);
                        winnersList.push(player.name);
                    }
                    if (redemptionTurns === 0) {
                        if (winnersList.length > 1) {
                            let nameList = winnersList.join(', ');
                            showBanner(`${nameList} win! Game Over!`);
                            setTimeout(() => {
                                window.location.href = '../index.html';
                            }, 2500);
                            // handle sudden death
                        } else {
                            showBanner(`${playersData[originalWinnerIndex].name} wins! Game Over!`);
                            redemptionMode = false;
                            setTimeout(() => {
                                window.location.href = '../index.html';
                            }, 2500);                        }
                    }

                }
            }
            previousPlayerIndex = currentPlayerIndex;
            currentPlayerIndex = nextPlayer(currentPlayerIndex, playersData);
            highlightCurrentPlayer();
            showReverseButton(player, previousPlayerIndex);

        }
    });

    playerDiv.appendChild(scoreInput);

}

function createReverseButton(player, playerDiv, playerIndex, scoreLabel) {
    const reverseButton = document.createElement('i');
    reverseButton.id = 'reverse-button';
    reverseButton.className = "fa-solid fa-rotate-left";
    reverseButton.title = 'Reverse';
   // reverseButton.title = 'Reverse';
    console.log('Creating reverse button');
    reverseButton.addEventListener('click', async () => {
        if (scoreStack[playerIndex].length > 0) {

            const lastScore = scoreStack[playerIndex].pop();
            console.log(`last score: ${lastScore}`);
            console.log(`score pre update: ${player.score}`);
            player.score = parseInt(scoreLabel.textContent, 10) + lastScore;
            console.log(`score post reverse: ${player.score}`);
            await reverseUpdatePlayerScore(player.player_id, lastScore);
            scoreLabel.textContent = player.score;
            currentPlayerIndex = playerIndex;
            highlightCurrentPlayer();
            reverseButton.remove();

            if (!isPlayingAlone) {
                createScoreInput(player, playerDiv, playerIndex, scoreLabel);
            }

            if (redemptionMode) {
                redemptionTurns++;
                if (player.score !== 0) {
                    redemptionMode = false;
                    redemptionTurns = 0;
                    originalWinnerIndex = -1;
                    winnersList = [];
                    console.log('Redemption mode deactivated');
                }
            }

        } else {
            console.log('No score to reverse');
        }
    });
    playerDiv.appendChild(reverseButton);
}

function showReverseButton(player, playerIndex) {

    const existingReverseButton = document.getElementById('reverse-button');

    if (existingReverseButton) {
        existingReverseButton.remove();
    }

    const playerDiv = document.getElementById(`player-${playerIndex}`);
    console.log('showReverseButton playerIndex:', playerIndex); // Debugging log
    console.log('showReverseButton playerDiv:', playerDiv); // Debugging log
    const scoreInput = playerDiv.querySelector('input');
    const scoreLabel = playerDiv.querySelector('.score-label');
    if (scoreInput && !isPlayingAlone) {
        scoreInput.remove();
    }

    createReverseButton(player, playerDiv, playerIndex, scoreLabel);
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
        console.log(`Score updated successfully ${score}`);
    } catch (err) {
        console.error('Error updating scores: ', err);
    }
}

async function reverseUpdatePlayerScore(playerId, score) {
    try {
        const response = await fetch('/reverse-update-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerId, score }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`Reversed score for player ${playerId}: ${data.score}`);
    } catch (err) {
        console.error('Error reversing score:', err);
    }
}



window.onload = fetchGameData;

