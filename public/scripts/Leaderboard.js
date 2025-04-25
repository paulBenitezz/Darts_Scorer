document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/get-leaderboard');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const leaderboardData = await response.json();
        const leaderboardTable = document.getElementById('leaderboardTable').getElementsByTagName('tbody')[0];

        leaderboardData.forEach((entry, index) => {
            console.log('Entry:', entry);
            const row = leaderboardTable.insertRow();
            const rankCell = row.insertCell(0);
            const playerNameCell = row.insertCell(1);
            const gameTypeCell = row.insertCell(2);
            const dartCountCell = row.insertCell(3);
            const dateCell = row.insertCell(4);

            rankCell.textContent = index + 1;
            playerNameCell.textContent = entry.player_name;
            gameTypeCell.textContent = entry.gametype;
            dartCountCell.textContent = entry.dart_count;
           
            console.log('Date value:', entry.date);

            
            const date = new Date(entry.date);
            if (!isNaN(date)) {
                dateCell.textContent = date.toLocaleDateString('en-US', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            } else {
                dateCell.textContent = 'Invalid Date';
            }
        });
    } catch (err) {
        console.error('Error fetching leaderboard data:', err);
    }
});