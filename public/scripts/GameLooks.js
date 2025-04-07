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

async function showWinModal(winningPlayer, message) {
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

export { showBanner, handlePlayerBanner, showWinModal };

