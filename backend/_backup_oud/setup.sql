-- Maak database aan
CREATE DATABASE IF NOT EXISTS suriname_quest
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE suriname_quest;

-- Spelers tabel
CREATE TABLE IF NOT EXISTS spelers (
  id                  INT           AUTO_INCREMENT PRIMARY KEY,
  uid                 VARCHAR(36)   UNIQUE NOT NULL,
  naam                VARCHAR(100)  NOT NULL,
  email               VARCHAR(255)  UNIQUE NOT NULL,
  wachtwoord_hash     VARCHAR(255)  NOT NULL,
  punten              INT           DEFAULT 0,
  level               INT           DEFAULT 1,
  avatar              VARCHAR(50)   DEFAULT 'karakter_1',
  locaties_bezoekt    JSON,
  collectibles        JSON,
  quiz_resultaten     JSON,
  badges              JSON,
  completed_locations JSON,
  aangemeld_op        DATETIME      DEFAULT CURRENT_TIMESTAMP
);
