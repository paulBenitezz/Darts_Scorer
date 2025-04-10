DROP TABLE IF EXISTS game;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS winner;

CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    score INT DEFAULT 0,
    dart_count INT DEFAULT 0 
);
CREATE TABLE game (
    game_id SERIAL PRIMARY KEY,
    gameType INT NOT NULL,
    player_id INT REFERENCES players(player_id)
);
CREATE TABLE winner (
    winner_id SERIAL PRIMARY KEY,
    gameType INT NOT NULL,
    player_id INT REFERENCES players(player_id),
    player_name VARCHAR(100) NOT NULL,
    dart_count INT DEFAULT 0,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    games_won INT DEFAULT 1
);


ALTER TABLE players ADD COLUMN game_id INT REFERENCES game(game_id);
ALTER TABLE game ADD COLUMN initScore INT;