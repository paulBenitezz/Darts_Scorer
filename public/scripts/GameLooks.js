function applyStyles() {
    const container = document.getElementById('playerScoresContainer');
    container.classList.add('container');

    const playerGroups = document.querySelectorAll('.player-score-group');
    playerGroups.forEach(group => {
        group.classList.add('player-score-group');
    });
}

// Call the function to apply styles when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', applyStyles);