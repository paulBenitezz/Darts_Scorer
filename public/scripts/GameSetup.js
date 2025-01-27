function restartGame() {
    // Logic to restart the game
    console.log('Game restarted');
    // You can add more logic here to reset the game state, scores, etc.
    window.location.reload(); // Reload the page to restart the game
}

// Add event listener to the restart button
document.addEventListener('DOMContentLoaded', () => {
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.addEventListener('click', restartGame);
    }
});

export { restartGame };