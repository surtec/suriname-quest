// src/game/data/locations.js
// Alle locaties, collectibles en quizvragen voor SuriQuest 2060

export const LOCATIONS = [
  {
    id:          'fort_zeelandia',
    naam:        'Fort Zeelandia',
    jaar:        '1667',
    beschrijving:'Dit fort werd gebouwd door de Nederlanders in 1667. Vroeger bewaakten soldaten hier de rivier. Nu is het een museum!',
    kleur:       0x8B5E3C,
    wereldPositie: { x: 805, y: 267 },
    collectibles: [
      { id: 'kaart_001',    naam: 'Oude Zeekaart',     emoji: '🗺️', beschrijving: 'Een kaart van Suriname uit 1680. Kijk, de rivier staat erop!' },
      { id: 'brief_001',   naam: 'Koloniale Brief',    emoji: '📜', beschrijving: 'Een brief geschreven door een Nederlandse soldaat aan zijn familie.' },
      { id: 'kanon_001',   naam: 'Oud Kanonkogel',     emoji: '💣', beschrijving: 'Gevonden bij het fort. Werd vroeger gebruikt om de stad te beschermen.' },
    ],
    quiz: [
      {
        vraag:   'In welk jaar werd Fort Zeelandia gebouwd?',
        emoji:   '🏰',
        opties:  ['1492', '1667', '1975', '2000'],
        juist:   1,
        uitleg:  'Goed zo! Fort Zeelandia werd gebouwd in 1667 door de Nederlanders!',
      },
      {
        vraag:   'Waarvoor werd het fort gebruikt?',
        emoji:   '⚓',
        opties:  ['Een school', 'Een ziekenhuis', 'Bewaking van de rivier', 'Een markt'],
        juist:   2,
        uitleg:  'Precies! Soldaten bewaakten vanuit het fort de Surinamerivier.',
      },
      {
        vraag:   'Wat staat er nu in Fort Zeelandia?',
        emoji:   '🎨',
        opties:  ['Een bioscoop', 'Een museum', 'Een supermarkt', 'Een school'],
        juist:   1,
        uitleg:  'Heel goed! Fort Zeelandia is nu een museum over de geschiedenis van Suriname!',
      },
    ],
  },
  {
    id:          'waterkant',
    naam:        'De Waterkant',
    jaar:        '1700s',
    beschrijving:'Hier kwamen vroeger grote schepen aan uit Europa en Afrika. Een plek met een moeilijke maar heel belangrijke geschiedenis.',
    kleur:       0x2a5c8a,
    wereldPositie: { x: 266, y: 296 },
    collectibles: [
      { id: 'steen_001',   naam: 'Riviersteen',         emoji: '🪨', beschrijving: 'Gevonden langs de Surinamerivier. Heel oud!' },
      { id: 'schip_001',   naam: 'Scheepstekening',     emoji: '🚢', beschrijving: 'Een tekening van een oud schip dat de rivier opvoer.' },
      { id: 'hibiscus_001',naam: 'Rode Hibiscus',        emoji: '🌺', beschrijving: 'De nationale bloem van Suriname. Groeit wild langs de waterkant!' },
    ],
    quiz: [
      {
        vraag:   'Welke rivier loopt langs de Waterkant?',
        emoji:   '🌊',
        opties:  ['De Amazone', 'De Nijl', 'De Surinamerivier', 'De Thames'],
        juist:   2,
        uitleg:  'Fantastisch! De Surinamerivier loopt langs de Waterkant in Paramaribo!',
      },
      {
        vraag:   'Wat is de nationale bloem van Suriname?',
        emoji:   '🌸',
        opties:  ['Een roos', 'Een tulp', 'Een hibiscus', 'Een zonnebloem'],
        juist:   2,
        uitleg:  'Super! De hibiscus is de nationale bloem van Suriname!',
      },
      {
        vraag:   'Wat kwamen er vroeger aan op de Waterkant?',
        emoji:   '⛵',
        opties:  ['Vliegtuigen', 'Schepen', 'Treinen', 'Bussen'],
        juist:   1,
        uitleg:  'Goed gedaan! Vroeger kwamen schepen uit Europa en Afrika aan op de Waterkant.',
      },
    ],
  },
  {
    id:          'onafhankelijkheidsplein',
    naam:        'Onafh. Plein',
    jaar:        '1975',
    beschrijving:'Op 25 november 1975 werd Suriname een zelfstandig land! Dit plein herdenkt die speciale dag. Vroeger heette het Oranjeplein.',
    kleur:       0x1a7a3a,
    wereldPositie: { x: 534, y: 413 },
    collectibles: [
      { id: 'vlag_001',    naam: 'Surinaamse Vlag',     emoji: '🇸🇷', beschrijving: 'De vlag van Suriname met de grote gele ster. De ster staat voor eenheid!' },
      { id: 'foto_001',    naam: 'Foto 25 november',    emoji: '📸',  beschrijving: 'Een foto van de onafhankelijkheidsviering op 25 november 1975.' },
      { id: 'munt_001',   naam: 'Onafhankelijkheidsmunt', emoji: '🏅', beschrijving: 'Een speciale munt gemaakt om de onafhankelijkheid te vieren.' },
    ],
    quiz: [
      {
        vraag:   'Op welke datum werd Suriname onafhankelijk?',
        emoji:   '🎆',
        opties:  ['1 januari', '4 juli', '25 november', '31 december'],
        juist:   2,
        uitleg:  'Geweldig! Op 25 november 1975 werd Suriname een vrij, zelfstandig land!',
      },
      {
        vraag:   'Wat staat op de vlag van Suriname?',
        emoji:   '⭐',
        opties:  ['Een zon', 'Een gele ster', 'Een palm', 'Een rivier'],
        juist:   1,
        uitleg:  'Top! De vlag van Suriname heeft een grote gele ster in het midden!',
      },
      {
        vraag:   'Hoe heette het Onafhankelijkheidsplein vroeger?',
        emoji:   '🏛️',
        opties:  ['Vrijheidsplein', 'Oranjeplein', 'Koningsplein', 'Centrumplein'],
        juist:   1,
        uitleg:  'Briljant! Het heette vroeger het Oranjeplein, naar het Nederlandse koningshuis.',
      },
    ],
  },
]

export function getLocation(id) {
  return LOCATIONS.find(l => l.id === id)
}
