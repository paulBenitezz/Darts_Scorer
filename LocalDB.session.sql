CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    score INT DEFAULT 0
);
CREATE TABLE game (
    game_id SERIAL PRIMARY KEY,
    gameType INT NOT NULL,
    player_id INT REFERENCES players(player_id)
);
CREATE TABLE winner (
    winner_id SERIAL PRIMARY KEY,
    game_id INT REFERENCES game(game_id),
    player_id INT REFERENCES players(player_id)
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
);
