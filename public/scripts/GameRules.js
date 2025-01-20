// game rules for main dart games {101, 301, 501}:

function updateScore(player, score) {
    player.score -= score;
    if (player.score < 0) {
        return;
    } if (didPlayerReachZero(player)) {
        handleRedemption(player);
        // handle win
    }
    return player.score;
}

function didPlayerReachZero(player) {
    return player.score === 0;
}

function nextPlayer(currentPlayerIndex, players) {
    return (currentPlayerIndex + 1) % players.length;
}

function isValidScore(score) {
    return (score >= 0 && score <= 180) || Number.isNaN(score)
}

function handleRedemption(players, currentPlayerIndex) {
    let redemptionTurns = players.length - 1;
    let originalWinnerIndex = currentPlayerIndex;
    return { redemptionTurns, originalWinnerIndex };
}

export { updateScore, didPlayerReachZero, nextPlayer, isValidScore, handleRedemption };