# 🌴 SuriQuest 2060 — Setup Instructies

## Vereisten

- Node.js 18+
- MySQL 8.0 (lokaal geïnstalleerd)

---

## Stap 1 — Project installeren

```bash
npm install
```

---

## Stap 2 — MySQL database instellen

**Zorg dat MySQL draait** (via Services of MySQL Workbench).

Maak de database en tabel aan:

```bash
Get-Content backend/setup.sql | mysql -u root -P 2004 -p
```

> Vervang `2004` door jouw MySQL poort als die anders is. Druk Enter als je geen wachtwoord hebt.

---

## Stap 3 — Omgevingsvariabelen instellen

Maak een `.env` bestand in de projectmap (of pas de bestaande aan):

```env
DB_HOST=localhost
DB_PORT=2004
DB_USER=root
DB_PASSWORD=jouw_wachtwoord
DB_NAME=suriname_quest

JWT_SECRET=verander_dit_naar_iets_unieks

PORT=3001
```

---

## Stap 4 — Project starten

Je hebt **twee terminals** nodig:

**Terminal 1 — backend server:**

```bash
npm run server
```

**Terminal 2 — frontend:**

```bash
npm run dev
```

Open daarna [http://localhost:5173](http://localhost:5173) in de browser.

---

## Project Structuur

```text
suriname-quest/
├── server/
│   ├── index.js            ← Express server (poort 3001)
│   ├── db.js               ← MySQL verbinding
│   ├── setup.sql           ← SQL om database aan te maken
│   ├── middleware/
│   │   └── auth.js         ← JWT token verificatie
│   └── routes/
│       ├── auth.js         ← POST /api/auth/register & /login
│       └── speler.js       ← GET/PUT /api/speler/:uid
├── src/
│   ├── api/
│   │   ├── config.js       ← API basis URL
│   │   ├── auth.js         ← Login/register functies
│   │   └── database.js     ← Voortgang opslaan
│   ├── game/
│   │   ├── scenes/
│   │   │   ├── BootScene.js      ← Laadscherm
│   │   │   ├── WorldScene.js     ← De spelwereld
│   │   │   ├── LocationScene.js  ← Locatie bezoeken
│   │   │   └── QuizScene.js      ← Quiz spelen
│   │   ├── objects/
│   │   │   └── Player.js         ← Speler karakter
│   │   ├── data/
│   │   │   └── locations.js      ← Content: locaties, vragen
│   │   └── PhaserGame.jsx        ← Phaser ↔ React brug
│   ├── ui/
│   │   ├── Login.jsx       ← Inlogscherm
│   │   └── HUD.jsx         ← In-game overlay
│   ├── App.jsx             ← Hoofd app
│   └── main.jsx            ← Entry point
└── .env                    ← Database & JWT instellingen (niet in git!)
```

---

## API Endpoints

| Methode | Route | Beschrijving |
| ------- | ----- | ------------ |
| POST | `/api/auth/register` | Nieuw account aanmaken |
| POST | `/api/auth/login` | Inloggen, geeft JWT terug |
| GET | `/api/speler/:uid` | Spelerdata ophalen |
| PUT | `/api/speler/:uid` | Spelerdata opslaan |

---

## Nieuwe locaties toevoegen

Open `src/game/data/locations.js` en voeg een nieuw object toe:

```javascript
{
  id:          'maroon_dorp',
  naam:        'Maroon Dorp',
  jaar:        '1700s',
  beschrijving: 'De Marrons waren vroeger tot slaaf gemaakte mensen die vluchtten...',
  kleur:       0x8B4513,
  wereldPositie: { x: 550, y: 280 },
  collectibles: [
    { id: 'djembe_001', naam: 'Traditionele Djembe', emoji: '🥁', beschrijving: '...' },
  ],
  quiz: [
    {
      vraag:  'Wie zijn de Marrons?',
      emoji:  '🌿',
      opties: ['Visser', 'Vrijgevochten mensen', 'Handelaars', 'Soldaten'],
      juist:  1,
      uitleg: 'Goed! De Marrons vluchtten uit de slavernij en leefden vrij in het oerwoud.',
    },
  ],
}
```

---

Gemaakt met ❤️ voor Surinaams erfgoed
