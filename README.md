# 🌴 SuriQuest 2060 — Setup Instructies

## Vereisten
- Node.js 18+ geïnstalleerd
- VSCode met Claude extensie
- Firebase account (gratis)

---

## Stap 1 — Project installeren

Open de projectmap in VSCode en run in de terminal:

```bash
npm install
```

---

## Stap 2 — Firebase instellen

1. Ga naar [firebase.google.com](https://firebase.google.com)
2. Maak een nieuw project aan: **"suriname-quest"**
3. Voeg een **web app** toe (</> icoon)
4. Kopieer de `firebaseConfig` gegevens
5. Open `src/firebase/config.js` en plak jouw gegevens

**Schakel in:**
- Authentication → Sign-in method → **Email/Password** ✓
- Firestore Database → Start in **test mode** (voor nu)

---

## Stap 3 — Game starten

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in je browser.

---

## Project Structuur

```
src/
├── firebase/
│   ├── config.js      ← Jouw Firebase sleutels
│   ├── auth.js        ← Login/register functies
│   └── database.js    ← Voortgang opslaan
├── game/
│   ├── scenes/
│   │   ├── BootScene.js      ← Laadscherm
│   │   ├── WorldScene.js     ← De spelwereld
│   │   ├── LocationScene.js  ← Locatie bezoeken
│   │   └── QuizScene.js      ← Quiz spelen
│   ├── objects/
│   │   └── Player.js         ← Speler karakter
│   ├── data/
│   │   └── locations.js      ← Content: locaties, vragen
│   └── PhaserGame.jsx        ← Phaser ↔ React brug
├── ui/
│   ├── Login.jsx      ← Inlogscherm
│   └── HUD.jsx        ← In-game overlay
├── App.jsx            ← Hoofd app
└── main.jsx           ← Entry point
```

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

## Sprites toevoegen (optioneel)

Vervang de Graphics-gebaseerde tekeningen door echte sprites:

1. Zet je sprites in `public/assets/sprites/`
2. Laad ze in `BootScene.js`:
   ```javascript
   this.load.spritesheet('speler', 'assets/sprites/speler.png', { frameWidth: 32, frameHeight: 48 })
   ```
3. Vervang in `Player.js` de `graphics` door `this.sprite = scene.add.sprite(...)`

---

## Bouwen voor productie

```bash
npm run build
```

De `dist/` map kan je uploaden naar elke web host (Netlify, Vercel, Firebase Hosting).

---

*Gemaakt met ❤️ voor Surinaams erfgoed*
