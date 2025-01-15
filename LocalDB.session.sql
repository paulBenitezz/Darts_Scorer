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
