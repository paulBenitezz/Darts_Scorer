// filepath: /d:/User Files/Document/GitHub/Darts_Scorer/server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Client } = require('pg');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'dartsdb',
    password: 'ginger',
    port: 5432,
});

client.connect();

app.post('/submit', async (req, res) => {
    const { playerNames, selectedGame } = req.body;

    if (playerNames.length < 1) {
        return res.status(400).send('At least 1 player is required!');
    }

    if (!selectedGame) {
        return res.status(400).send('Please select a game type!');
    }

    let initialScore;
    switch (selectedGame) {
        case '101':
            initialScore = 101;
            break;
        case '301':
            initialScore = 301;
            break;
        case '501':
            initialScore = 501;
            break;
        case '601':     // cricket
            initialScore = 601;
            break;
        case '701':     // around the world
            initialScore = 701;
            break;

        default:
            return res.status(400).send('Invalid game type!');
    }

    try {
        await client.query('BEGIN');

        const gameResult = await client.query('INSERT INTO game (gameType) VALUES ($1) RETURNING game_id', [initialScore]);
        const gameId = gameResult.rows[0].game_id;

        const playerIds = [];


        for (const name of playerNames) {
            const result = await client.query('INSERT INTO players (name, score, game_id) VALUES ($1,$2, $3) RETURNING player_id', [name, initialScore, gameId]);
            playerIds.push(result.rows[0].player_id);
        }

        await client.query('COMMIT');
        res.status(204).send();
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error saving game data:', err);
        res.status(500).send('Error saving game data. Please try again.');
    }
});

app.post('/reset-game', async (req, res) => {
    try {
        await client.query('BEGIN');
        // Reset the player scores to the initial score based on the game type
        await client.query(`
            UPDATE players
            SET score = (
                SELECT gameType
                FROM game
                WHERE game.game_id = players.game_id
            )
            WHERE game_id IN (SELECT game_id FROM game ORDER BY game_id DESC LIMIT 1)

        `);

        await client.query('UPDATE players SET dart_count = 0');


        await client.query('COMMIT');

        res.status(200).json({ message: 'Game reset successfully' });
    } catch (err) {
        console.error('Error resetting game:', err);
        res.status(500).json({ error: 'Failed to reset game' });
    }
});

// new endpoint to fetch player and game data

app.get('/game-data', async (req, res) => {
    console.log('Fetching game data');
    try {
        console.log('Before executing query');

        const gameResult = await client.query('SELECT game_id FROM game ORDER BY game_id DESC LIMIT 1');
        if (gameResult.rows.length === 0) {
            return res.json([]);
        }
        const gameId = gameResult.rows[0].game_id;

        const playerResult = await client.query(`
            SELECT 
                players.player_id, 
                players.name, 
                players.score, 
                players.dart_count, 
                game.gameType AS gameType
            FROM players
            INNER JOIN game ON players.game_id = game.game_id
            WHERE players.game_id = $1
        `, [gameId]);
        console.log('After executing query');
        console.log('Fetched game data:', playerResult.rows);
        res.json(playerResult.rows);
    } catch (err) {
        console.error('Error fetching game data:', err);
        res.status(500).send('Error fetching game data.');
    }
});

app.post('/update-score', async (req, res) => {
    const { playerId, score } = req.body;
    try {
        await client.query('UPDATE players SET score = $1 WHERE player_id= $2', [score, playerId]);
        console.log(`player ${playerId} score: ${score}`);
        res.send('Score updated successfully');
    } catch (err) {
        console.error('Error updating score: ', err);
        res.status(500).send('Error updating score.');
    }
});

app.post('/reverse-update-score', async (req, res) => {
    const { playerId, score } = req.body;
    try {
        const result = await client.query('UPDATE players SET score = score + $1 WHERE player_id = $2 RETURNING score', [score, playerId]);
        console.log(`Reversed score for player ${playerId}:`, result.rows[0].score); // Debugging log
        res.json({ score: result.rows[0].score });
    } catch (err) {
        console.error('Error reversing score:', err);
        res.status(500).send('Error reversing score. Please try again.');
    }
});

app.post('/save-to-leaderboard', async (req, res) => {
    const { gametype, playerId, dartCount } = req.body;
    console.log('Received request body:', req.body); // Debugging log
    console.log('Parsed values:', { gametype, playerId, dartCount }); // Debugging log


    try {
        // Retrieve player information
        const playerResult = await client.query('SELECT name FROM players WHERE player_id = $1', [playerId]);
        const playerInfo = playerResult.rows[0];
        console.log(`Retrieved player information:`, playerInfo); // Debugging log
        console.log(`SERVER: Game type: ${gametype}, Player ID: ${playerId}`); // Debugging log
        // Insert into winner table
        const insertResult = await client.query(
            'INSERT INTO winner (gameType, player_id, player_name, dart_count) VALUES ($1, $2, $3, $4) RETURNING *',
            [gametype, playerId, playerInfo.name, dartCount]
        );
        console.log(`Saved to winner table:`, insertResult.rows[0]); // Debugging log

        res.json({ winner: insertResult.rows[0], player: playerInfo });
    } catch (err) {
        console.error('Error saving to leaderboard:', err);
        res.status(500).send('Error saving to leaderboard. Please try again.');
    }
});

app.get('/get-leaderboard', async (req, res) => {
    try {
        const result = await client.query('SELECT player_name, gameType, dart_count, date FROM winner ORDER BY dart_count ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        res.status(500).json({ error: 'Error fetching leaderboard data. Please try again.' });
    }
});


// Update dart count endpoint
app.post('/update-dart-count', async (req, res) => {
    const { playerId, dartCount } = req.body;
    try {
        const result = await client.query('UPDATE players SET dart_count = $1 WHERE player_id = $2 RETURNING dart_count', [dartCount, playerId]);
        console.log(`Updated dart count for player ${playerId}:`, result.rows[0].dart_count); // Debugging log
        res.json({ dartCount: result.rows[0].dart_count });
    } catch (err) {
        console.error('Error updating dart count:', err);
        res.status(500).json({ error: 'Error updating dart count. Please try again.' });
    }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html on the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});