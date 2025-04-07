async function resetGame() {
    try {
        const response = await fetch('/reset-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Game reset:', data);
        window.location.reload(); // Reload the page to reflect the reset state
    } catch (error) {
        console.error('Error resetting game:', error);
    }
}

function restartGame() {
    // Logic to restart the game
    console.log('Game restarted');
    resetGame();
}

// Add event listener to the restart button
document.addEventListener('DOMContentLoaded', () => {
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.addEventListener('click', restartGame);
    }
});

export { restartGame };