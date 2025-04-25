import { restartGame } from "./GameSetup.js";
import { handleDartCountUpdate, saveToLeaderboard } from "./GameFunctionality.js"

function showBanner(message, time, color) {
    const banner = document.getElementById('banner');
    banner.textContent = message;
    banner.style.backgroundColor = color; // dynamic background color
    console.log("Banner color:", banner.style.backgroundColor);
    banner.classList.remove('hidden');
    setTimeout(() => {
        banner.classList.add('hidden');
    }, time); // Hide the banner after 3 seconds
    console.log("Banner shown with message:", message);
}

// Example usage of showBanner function
function handlePlayerBanner(player) {
    showBanner(`${player.name} reached 0! Redemption mode activated.`, '#dc3545');
    // Additional logic for handling player reaching zero
}

async function showWinModal(winningPlayer, message, isRedemptionMode) {
    if (!isRedemptionMode) {
        const modal = document.getElementById('winModal');
        const winMessage = document.getElementById('winMessage');
        winMessage.textContent = message;
        modal.classList.remove('hidden');
        modal.style.display = 'block';
        const dartCountButtons = document.querySelectorAll('.dart-count-button'); // Ensure this is a NodeList
        console.log(`${winningPlayer.name} total darts pre button: ${winningPlayer.dart_count}`);


        dartCountButtons.forEach(button => {
            button.onclick = async () => {
                const darts = button.getAttribute('data-darts');
                console.log(`${winningPlayer.name} checked out in ${darts} darts`);
                // You can add logic here to save the dart count to the database if needed
                winningPlayer.dart_count += parseInt(darts, 10);
                console.log(`${winningPlayer.name} total darts test: ${winningPlayer.dart_count}`);

                await handleDartCountUpdate(winningPlayer.player_id, winningPlayer.dart_count);
                console.log(`${winningPlayer.name} total darts post button: ${winningPlayer.dart_count}`);
                dartCountButtons.forEach(btn => btn.classList.add('hidden'));
                modal.style.display = 'none';

                await saveToLeaderboard(winningPlayer.gametype, winningPlayer.player_id, winningPlayer.dart_count);

                //console.log
                restartGame();
                // leg won
            };
        });


        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }
}

async function showSuddenDeathModal(winnersList) {
    console.log("sudden death modal");
    const modal = document.getElementById('suddenDeathModal');
    const message = document.getElementById('suddenDeathMessage');
    const buttons = document.getElementById('playerButtons')
    modal.classList.remove('hidden');
    const winnerNames = formatNames(winnersList)
    message.textContent = `\n${winnerNames} are in sudden death!`;
    buttons.innerHTML = ''; // Clear previous buttons
    modal.style.display = 'block';

    return new Promise((resolve) => {
        winnersList.forEach(player => {
            console.log(`Printing player ${player}`);
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = player;
            button.classList = 'player-name-button';
            buttons.appendChild(button);

            // Add click event to resolve the promise with the selected player
            button.onclick = () => {
                console.log(`${player} selected`);
                modal.style.display = 'none';
                resolve(player); // Resolve the promise with the selected player's name
            };
        });
    });
}

async function handleSuddenDeath(winnersList) {
    try {
        const winner = await showSuddenDeathModal(winnersList);
        console.log(`Selected winner for sudden death: ${winner}`);
        return winner;
    } catch (err) {
        console.error('Error handling sudden death:', err);
    }
  
}

function formatNames(names) {
    if (!names || names.length === 0) {
        return "";
    }
    if (names.length === 1) {
        return names[0];
    }

    if (names.length === 2) {
        return names.join(" and ");
    }

    const allButLast = names.slice(0, -1).join(", ");
    const last = names.slice(-1);

    return `${allButLast}, and ${last}`;
}

export { showBanner, handlePlayerBanner, showWinModal, showSuddenDeathModal, handleSuddenDeath };

