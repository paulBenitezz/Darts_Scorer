function showBanner(message) {
    const banner = document.getElementById('banner');
    banner.textContent = message;
    banner.classList.remove('hidden');
    setTimeout(() => {
        banner.classList.add('hidden');
    }, 5000); // Hide the banner after 3 seconds
    console.log("Banner shown with message:", message);
}

// Example usage of showBanner function
function handlePlayerBanner(player) {
    showBanner(`${player.name} reached 0! Redemption mode activated.`);
    // Additional logic for handling player reaching zero
}

function handleGameOver() {
    showBanner('Game Over!'); // Show game over banner
    // Additional logic for handling game over
}

export { showBanner, handlePlayerBanner };

