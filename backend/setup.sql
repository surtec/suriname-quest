-- ============================================================
--  SuriQuest 2060 — Genormaliseerde database
-- ============================================================
--  Dit is een ALTERNATIEVE versie van backend/setup.sql met
--  aparte tabellen voor locaties, quiz-resultaten, badges en
--  collectibles in plaats van JSON-kolommen.
--
--  LET OP: deze opzet is NIET compatibel met de huidige
--  backend-code. De Express-routes in backend/routes/speler.js
--  zouden moeten worden aangepast om met de nieuwe tabellen
--  te werken. Gebruik dit script vooral als leer- en
--  experimenteer-materiaal.
--
--  Draaien:
--    Get-Content backend/setup_genormaliseerd.sql | mysql -u root -P 3306 -p
-- ============================================================

-- 1) Database aanmaken
CREATE DATABASE IF NOT EXISTS suriname_quest
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE suriname_quest;

-- 2) Bestaande tabellen weghalen (in juiste volgorde i.v.m. FK's)
DROP TABLE IF EXISTS collectibles;
DROP TABLE IF EXISTS speler_badges;
DROP TABLE IF EXISTS quiz_resultaten;
DROP TABLE IF EXISTS badges;
DROP TABLE IF EXISTS locaties;
DROP TABLE IF EXISTS spelers;

-- ============================================================
--  TABEL: spelers
--  Alleen nog accountgegevens en algemene stats.
-- ============================================================
CREATE TABLE spelers (
  id              INT           AUTO_INCREMENT PRIMARY KEY,
  uid             VARCHAR(36)   UNIQUE NOT NULL,
  naam            VARCHAR(100)  NOT NULL,
  email           VARCHAR(255)  UNIQUE NOT NULL,
  wachtwoord_hash VARCHAR(255)  NOT NULL,
  punten          INT           DEFAULT 0,
  level           INT           DEFAULT 1,
  avatar          VARCHAR(50)   DEFAULT 'karakter_1',
  aangemeld_op    DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  TABEL: locaties
--  Referentietabel met alle historische plekken.
-- ============================================================
CREATE TABLE locaties (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(50)   UNIQUE NOT NULL,
  naam          VARCHAR(100)  NOT NULL,
  level_nummer  INT           NOT NULL,
  max_sterren   INT           DEFAULT 4,
  emoji         VARCHAR(10),
  beschrijving  TEXT
);

-- Seed: de 5 SuriQuest-locaties
INSERT INTO locaties (code, naam, level_nummer, max_sterren, emoji, beschrijving) VALUES
  ('inheemsen_dorp',          'Inheemsen Dorp',          1, 4, '🏹',
   'Ontmoet de eerste bewoners van Suriname: de Arowakken en Caraïben.'),
  ('fort_zeelandia',          'Fort Zeelandia',          2, 4, '🏰',
   'Het oudste fort van Suriname. Abraham Crijnssen veroverde het in 1667.'),
  ('waterkant',               'De Waterkant',            3, 4, '⚓',
   'De drukke haven van Paramaribo. Memory-spel met scheepsnamen.'),
  ('onafhankelijkheidsplein', 'Onafhankelijkheidsplein', 4, 4, '🇸🇷',
   '25 november 1975 — Suriname werd onafhankelijk.'),
  ('plantage',                'De Plantage',             5, 5, '🌾',
   'Het zware leven op de plantages en de strijd voor vrijheid.');

-- ============================================================
--  TABEL: quiz_resultaten
--  Eén rij per speler-per-locatie. Vervangt completedLocations
--  en quizResultaten uit het oude schema.
-- ============================================================
CREATE TABLE quiz_resultaten (
  id           INT       AUTO_INCREMENT PRIMARY KEY,
  speler_id    INT       NOT NULL,
  locatie_id   INT       NOT NULL,
  score        INT       DEFAULT 0,
  sterren      INT       DEFAULT 0,
  voltooid     BOOLEAN   DEFAULT FALSE,
  voltooid_op  DATETIME  NULL,
  bijgewerkt   DATETIME  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (speler_id)  REFERENCES spelers(id)   ON DELETE CASCADE,
  FOREIGN KEY (locatie_id) REFERENCES locaties(id),
  UNIQUE KEY uniek_speler_locatie (speler_id, locatie_id)
);

-- Voor snelle leaderboards per locatie
CREATE INDEX idx_qr_locatie_score ON quiz_resultaten (locatie_id, score DESC);

-- ============================================================
--  TABEL: badges
--  Alle beschikbare badges. Voeg gerust eigen badges toe.
-- ============================================================
CREATE TABLE badges (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  code         VARCHAR(50)  UNIQUE NOT NULL,
  naam         VARCHAR(100) NOT NULL,
  icoon        VARCHAR(20),
  beschrijving TEXT
);

-- Seed: een paar startbadges
INSERT INTO badges (code, naam, icoon, beschrijving) VALUES
  ('eerste_stap',  'Eerste Stap',     '👣', 'Je hebt je eerste locatie voltooid!'),
  ('historicus',   'Historicus',      '📜', 'Je hebt alle 5 locaties voltooid.'),
  ('perfectie',    'Perfectionist',   '🏆', 'Maximale sterren op alle locaties.'),
  ('tijdmachine',  'Tijdreiziger',    '🕰️', 'Tijdmachine-quiz volledig goed beantwoord.'),
  ('snelle_start', 'Snelle Starter',  '⚡', 'Drie locaties op één dag voltooid.');

-- ============================================================
--  TABEL: speler_badges
--  Veel-op-veel: welke speler heeft welke badge verdiend?
-- ============================================================
CREATE TABLE speler_badges (
  id          INT       AUTO_INCREMENT PRIMARY KEY,
  speler_id   INT       NOT NULL,
  badge_id    INT       NOT NULL,
  verdiend_op DATETIME  DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (speler_id) REFERENCES spelers(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id)  REFERENCES badges(id),
  UNIQUE KEY uniek_speler_badge (speler_id, badge_id)
);

-- ============================================================
--  TABEL: collectibles
--  Per speler één rij per verzameld item op een locatie.
-- ============================================================
CREATE TABLE collectibles (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  speler_id    INT          NOT NULL,
  locatie_id   INT          NOT NULL,
  type         VARCHAR(50)  NOT NULL,
  gevonden_op  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (speler_id)  REFERENCES spelers(id)   ON DELETE CASCADE,
  FOREIGN KEY (locatie_id) REFERENCES locaties(id)
);

-- ============================================================
--  HANDIGE VOORBEELDQUERIES
-- ============================================================
--
--  Top 10 spelers per locatie (voor leaderboard):
--    SELECT s.naam, qr.score, qr.sterren
--    FROM quiz_resultaten qr
--    JOIN spelers s    ON s.id  = qr.speler_id
--    JOIN locaties l   ON l.id  = qr.locatie_id
--    WHERE l.code = 'fort_zeelandia'
--    ORDER BY qr.score DESC
--    LIMIT 10;
--
--  Voortgang van één speler:
--    SELECT l.naam, qr.sterren, qr.voltooid, qr.voltooid_op
--    FROM locaties l
--    LEFT JOIN quiz_resultaten qr
--      ON qr.locatie_id = l.id
--      AND qr.speler_id = ?
--    ORDER BY l.level_nummer;
--
--  Aantal spelers per locatie dat al voltooid heeft:
--    SELECT l.naam, COUNT(qr.id) AS aantal_voltooid
--    FROM locaties l
--    LEFT JOIN quiz_resultaten qr
--      ON qr.locatie_id = l.id AND qr.voltooid = TRUE
--    GROUP BY l.id
--    ORDER BY l.level_nummer;
--
-- ============================================================
