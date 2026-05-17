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

Maak een `.env` bestand in de projectmap:

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
├── backend/
│   ├── index.js              ← Express server (poort 3001)
│   ├── db.js                 ← MySQL verbinding
│   ├── setup.sql             ← SQL om database aan te maken
│   ├── middleware/
│   │   └── auth.js           ← JWT token verificatie
│   └── routes/
│       ├── auth.js           ← /api/auth/register & /login
│       └── speler.js         ← /api/speler/:uid
├── public/
│   ├── index.html            ← Login / registratie pagina
│   ├── map.html              ← Kaart met alle locaties
│   ├── inheemsen-dorp.html   ← Level 1 — Inheemsen Dorp
│   ├── fort-zeelandia.html   ← Level 2 — Fort Zeelandia
│   ├── de-waterkant.html     ← Level 3 — De Waterkant
│   ├── onafhankelijkheidsplein.html  ← Level 4 — Onafhankelijkheidsplein
│   ├── plantage.html         ← Level 5 — De Plantage
│   └── js/
│       └── api.js            ← Gedeelde auth/API functies
├── package.json
└── .env                      ← Database & JWT instellingen (niet in git!)
```

---

## API Endpoints

| Methode | Route | Beschermd | Beschrijving |
| ------- | ----- | --------- | ------------ |
| POST | `/api/auth/register` | Nee | Nieuw account aanmaken |
| POST | `/api/auth/login` | Nee | Inloggen, geeft JWT terug |
| GET | `/api/speler/:uid` | Ja | Spelerdata ophalen |
| PUT | `/api/speler/:uid` | Ja | Spelerdata opslaan |

Beveiligde routes vereisen de header:

```http
Authorization: Bearer <token>
```

---

## Nieuwe locatie toevoegen

1. Maak een nieuw HTML-bestand aan in `public/`, bijv. `public/nieuwe-locatie.html`.
2. Kopieer de structuur van een bestaande locatiepagina (bijv. `fort-zeelandia.html`).
3. Pas aan:
   - `:root { --accent: #kleurcode; --bg: #achtergrondkleur; }` — kies een eigen kleur
   - De `<title>`, `<h1>`, `.description` en `.level-chip` tekst
   - De informatie-kaarten, feiten en quiz-vragen in de HTML
   - Het mini-game canvas en de spellogica in het `<script>` blok
4. Voeg de locatie toe aan `public/map.html` in de `.locaties-grid`:

```html
<a href="nieuwe-locatie.html" class="locatie-kaart lv6" id="kaart-nieuw">
  <div class="kaart-scene">
    <div class="level-badge">LEVEL 6</div>
    <span class="kaart-emoji">🏛️</span>
  </div>
  <div class="kaart-body">
    <div class="locatie-naam">Nieuwe Locatie</div>
    <div class="locatie-moeilijk">⭐⭐⭐⭐⭐⭐ Legendarisch</div>
    <div class="kaart-sterren" id="sterren-nieuw">☆☆☆☆</div>
    <div class="locatie-beschrijving">Beschrijving van de locatie.</div>
    <span class="kaart-pijl">Spelen! →</span>
  </div>
</a>
```

1. Registreer de locatie in de `locatieMap` in `map.html`:

```javascript
nieuwe_locatie: { kaartId: 'kaart-nieuw', sterrenId: 'sterren-nieuw', maxSterren: 4 },
```

---

Gemaakt met ❤️ voor Surinaams erfgoed
