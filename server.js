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

        await client.query('DELETE FROM game');
        await client.query('DELETE FROM players');

        const playerIds = [];


        for (const name of playerNames) {
            const result = await client.query('INSERT INTO players (name, score) VALUES ($1,$2) RETURNING player_id', [name, initialScore]);
            playerIds.push(result.rows[0].player_id);
        }

        for (const playerId of playerIds) {
            await client.query('INSERT INTO game (gameType, player_id) VALUES ($1, $2)', [selectedGame, playerId]);
        }

        await client.query('COMMIT');
        res.send('Game data saved successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error saving game data:', err);
        res.status(500).send('Error saving game data. Please try again.');
    }
});

// new endpoint to fetch player and game data

app.get('/game-data', async (req, res) => {
    console.log('Fetching game data'); // Debugging log
    try {
        console.log('Before executing query'); // Debugging log
        const result = await client.query(`
            SELECT players.name, players.score, game.gameType
            FROM players
            JOIN game ON players.player_id = game.player_id
        `);
        console.log('After executing query'); // Debugging log
        console.log('Fetched game data:', result.rows); // Debugging log
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching game data:', err);
        res.status(500).send('Error fetching game data.');
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