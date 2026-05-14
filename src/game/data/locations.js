// src/game/data/locations.js
// Gebaseerd op "Wij en ons Verleden" — officieel Surinaams geschiedenisleerboek (MinOWC 2022)
// Leerjaar 5 (286583), Leerjaar 7 (289128), Leerjaar 8 (289131 / leerj-8)

export const LOCATIONS = [
  // ─────────────────────────────────────────────────────────────────
  //  1. FORT ZEELANDIA
  //  Leerjaar 7 thema 4-6 (plantages, slavernij) +
  //  Leerjaar 8 thema 1 (Anton de Kom gevangen gezet hier in 1933)
  // ─────────────────────────────────────────────────────────────────
  {
    id:          'fort_zeelandia',
    naam:        'Fort Zeelandia',
    jaar:        '1667',
    beschrijving:'Dit fort werd in 1667 door de Nederlanders gebouwd aan de Surinamerivier. Het bewaakte de kolonie en werd later een gevangenis. In 1933 werd Anton de Kom hier opgesloten. Nu is het een museum.',
    kleur:       0x8B5E3C,
    wereldPositie: { x: 805, y: 267 },
    collectibles: [
      { id: 'kaart_001',    naam: 'Oude Zeekaart',       emoji: '🗺️', beschrijving: 'Een kaart van Suriname uit 1680. De Surinamerivier en de eerste plantages staan erop.' },
      { id: 'brief_001',   naam: 'Brief van de Kom',     emoji: '📜', beschrijving: 'Een kopie van een brief van Anton de Kom, geschreven terwijl hij gevangen zat in Fort Zeelandia in 1933.' },
      { id: 'kanon_001',   naam: 'Oud Kanonkogel',       emoji: '💣', beschrijving: 'Gevonden bij het fort. In 1712 vielen de Fransen onder Cassard ons land binnen via de Surinamerivier.' },
    ],
    quiz: [
      {
        vraag:   'In welk jaar werd Fort Zeelandia gebouwd door de Nederlanders?',
        emoji:   '🏰',
        opties:  ['1492', '1667', '1863', '1975'],
        juist:   1,
        uitleg:  'Goed zo! Fort Zeelandia werd gebouwd in 1667 — het jaar dat Suriname een Nederlandse kolonie werd.',
      },
      {
        vraag:   'Welke bekende Surinamer werd in 1933 gevangen gezet in Fort Zeelandia?',
        emoji:   '✊',
        opties:  ['Louis Doedel', 'Anton de Kom', 'Johan Ferrier', 'Herman Benjamins'],
        juist:   1,
        uitleg:  'Precies! Anton de Kom opende een adviesbureau voor arbeiders en werd op 31 januari 1933 gearresteerd en in Fort Zeelandia opgesloten.',
      },
      {
        vraag:   'Welk land viel in 1712 ons land binnen via de Surinamerivier?',
        emoji:   '⚔️',
        opties:  ['Engeland', 'Spanje', 'Portugal', 'Frankrijk'],
        juist:   3,
        uitleg:  'Top! In 1712 vielen Fransen onder leiding van Jacques Cassard ons land binnen. Ze bezetten plantage Meerzorg als legerkamp.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  //  2. DE WATERKANT
  //  Leerjaar 7 thema 5 (handel in slaafgemaakten) +
  //  Leerjaar 7 thema 4 (plantages)
  // ─────────────────────────────────────────────────────────────────
  {
    id:          'waterkant',
    naam:        'De Waterkant',
    jaar:        '1700s',
    beschrijving:'Hier kwamen vroeger grote schepen aan uit Europa en Afrika. Met deze schepen werden duizenden slaafgemaakten naar Suriname gebracht om op de plantages te werken. Een plek met een moeilijke maar heel belangrijke geschiedenis.',
    kleur:       0x2a5c8a,
    wereldPositie: { x: 266, y: 296 },
    collectibles: [
      { id: 'steen_001',   naam: 'Riviersteen',           emoji: '🪨', beschrijving: 'Gevonden langs de Surinamerivier. Langs deze oever liepen slaafgemaakten bij aankomst in Suriname.' },
      { id: 'schip_001',   naam: 'Scheepstekening',       emoji: '🚢', beschrijving: 'Een tekening van een slavenschip. Mensen werden gevangen in Afrika en over zee naar Suriname gebracht.' },
      { id: 'hibiscus_001',naam: 'Rode Hibiscus',          emoji: '🌺', beschrijving: 'De nationale bloem van Suriname. Groeit wild langs de waterkant. Symbool van de schoonheid van ons land.' },
    ],
    quiz: [
      {
        vraag:   'Waarvoor werden slaafgemaakten op de plantages in Suriname gebruikt?',
        emoji:   '🌾',
        opties:  ['Voor handel in de stad', 'Al het zware werk op de velden', 'Als soldaten voor het fort', 'Voor de visserij'],
        juist:   1,
        uitleg:  'Goed! Slaafgemaakten moesten al het zware werk doen: ontbossen, inpolderen, planten, onderhouden en oogsten. Ze verdienden niets terwijl de eigenaren rijk werden.',
      },
      {
        vraag:   'Welke rivier loopt langs de Waterkant in Paramaribo?',
        emoji:   '🌊',
        opties:  ['De Amazone', 'De Commewijne', 'De Surinamerivier', 'De Saramacca'],
        juist:   2,
        uitleg:  'Fantastisch! De Surinamerivier loopt langs de Waterkant. Over deze rivier kwamen de schepen met slaafgemaakten aan.',
      },
      {
        vraag:   'Wat was een "basya" op een plantage?',
        emoji:   '👁️',
        opties:  ['De eigenaar van de plantage', 'Een slaafgemaakte die toezicht hield op anderen', 'Een dokter voor de slaafgemaakten', 'De stuurman van het schip'],
        juist:   1,
        uitleg:  'Precies! De basya (ook wel zwartofficier) was zelf een slaafgemaakte die door de eigenaar was aangewezen om toezicht te houden op het werk van andere slaafgemaakten.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  //  3. ONAFHANKELIJKHEIDSPLEIN
  //  Leerjaar 8 thema 6 (van kolonie tot republiek, onafhankelijkheid 1975)
  // ─────────────────────────────────────────────────────────────────
  {
    id:          'onafhankelijkheidsplein',
    naam:        'Onafh. Plein',
    jaar:        '1975',
    beschrijving:'Op 25 november 1975 werd Suriname een zelfstandig land! Dit plein herdenkt die speciale dag. Vroeger heette het Oranjeplein, naar het Nederlandse koningshuis. Nu staat hier een monument voor de vrijheid.',
    kleur:       0x1a7a3a,
    wereldPositie: { x: 534, y: 413 },
    collectibles: [
      { id: 'vlag_001',    naam: 'Surinaamse Vlag',       emoji: '🇸🇷', beschrijving: 'De vlag van Suriname met de gele ster. De ster staat voor de eenheid van alle bevolkingsgroepen in ons land.' },
      { id: 'foto_001',    naam: 'Foto 25 november',      emoji: '📸',  beschrijving: 'Een foto van de onafhankelijkheidsviering op 25 november 1975. Duizenden mensen vierden op dit plein.' },
      { id: 'munt_001',   naam: 'Onafhankelijkheidsmunt', emoji: '🏅', beschrijving: 'Een speciale munt gemaakt om de onafhankelijkheid te vieren. "Baas in eigen huis!" stond op dit moment centraal.' },
    ],
    quiz: [
      {
        vraag:   'Op welke datum werd Suriname een zelfstandig land?',
        emoji:   '🎆',
        opties:  ['1 juli 1863', '25 november 1975', '15 augustus 1980', '31 december 2000'],
        juist:   1,
        uitleg:  'Geweldig! Op 25 november 1975 werd Suriname onafhankelijk van Nederland. Dit wordt elk jaar gevierd als Onafhankelijkheidsdag.',
      },
      {
        vraag:   'Waarvoor staat de gele ster op de Surinaamse vlag?',
        emoji:   '⭐',
        opties:  ['Voor het goud in het binnenland', 'De eenheid van alle bevolkingsgroepen', 'De zon boven het regenwoud', 'De vijf districten van Suriname'],
        juist:   1,
        uitleg:  'Top! De gele ster staat voor de eenheid van alle bevolkingsgroepen in ons land — Inheemsen, Afro-Surinamers, Hindostanen, Javanen, Chinezen en meer.',
      },
      {
        vraag:   'Hoe heette het Onafhankelijkheidsplein vroeger?',
        emoji:   '🏛️',
        opties:  ['Vrijheidsplein', 'Oranjeplein', 'Koningsplein', 'Centrumplein'],
        juist:   1,
        uitleg:  'Briljant! Het heette vroeger het Oranjeplein, naar het Nederlandse koningshuis Oranje. Na de onafhankelijkheid kreeg het zijn huidige naam.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  //  4. ANTON DE KOM STRAAT
  //  Leerjaar 8 thema 1 (arbeiders, crisis 1929, Louis Doedel,
  //  Anton de Kom, vakbonden, SAWO, RAVAKSUR)
  // ─────────────────────────────────────────────────────────────────
  {
    id:          'anton_de_kom',
    naam:        'Anton de Kom Straat',
    jaar:        '1931',
    beschrijving:'Deze straat heet naar Anton de Kom, een grote Surinaamse verzetsheld. In zijn ouderlijk huis hier opende hij in 1933 een adviesbureau voor arme arbeiders. Het gouvernement arresteerde hem en verbande hem naar Nederland.',
    kleur:       0x8B2020,
    wereldPositie: { x: 394, y: 340 },
    collectibles: [
      { id: 'boek_001',    naam: '"Wij slaven van Suriname"', emoji: '📚', beschrijving: 'Het beroemde boek van Anton de Kom. Daarin beschreef hij de onrechtvaardige behandeling van Surinamers en eiste hij vrijheid.' },
      { id: 'vaandel_001', naam: 'Demonstratievaandel',       emoji: '✊', beschrijving: 'Een vaandel zoals gedragen tijdens de protesten van 1931, toen werkloze arbeiders de straat opgingen voor brood en werk.' },
      { id: 'krant_001',   naam: 'Krantenartikel 1931',       emoji: '📰', beschrijving: 'Een krantenbericht over het Comité van Actie van Louis Doedel, opgericht om op te komen voor de werklozen.' },
    ],
    quiz: [
      {
        vraag:   'In welk jaar begon de economische wereldcrisis die ook Suriname trof?',
        emoji:   '📉',
        opties:  ['1914', '1929', '1945', '1963'],
        juist:   1,
        uitleg:  'Goed! In 1929 begon een grote economische wereldcrisis. Bedrijven gingen failliet, mensen raakten werkloos en in Suriname nam de armoede sterk toe.',
      },
      {
        vraag:   'Wie leidde het Comité van Actie dat in 1931 werd opgericht voor de werklozen?',
        emoji:   '👤',
        opties:  ['Anton de Kom', 'Herman Benjamins', 'Louis Doedel', 'Robin Ravales'],
        juist:   2,
        uitleg:  'Precies! Louis Doedel leidde het Comité van Actie. Hij eiste werk, land en eten voor de hongerige arbeiders. Zijn borstbeeld staat voor het gebouw van de RAVAKSUR.',
      },
      {
        vraag:   'Wat wilde Anton de Kom voor Suriname?',
        emoji:   '🕊️',
        opties:  ['Meer plantages bouwen', 'Onafhankelijkheid van Suriname', 'Een nieuwe koning', 'Meer schepen op de rivier'],
        juist:   1,
        uitleg:  'Super! Anton de Kom wilde onafhankelijkheid voor Suriname, een 8-urige werkdag, afschaffing van kinderarbeid én vrijheid voor alle arbeiders. Hij is een verzetsheld.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  //  5. CULTUREEL CENTRUM SURINAME (CCS)
  //  Leerjaar 8 thema 3 (multiculturele samenleving, smeltkroes,
  //  Johanna Schouten-Elsenhout, Robin Ravales/Dobru, Winti)
  // ─────────────────────────────────────────────────────────────────
  {
    id:          'cultuurhuis',
    naam:        'Cultuurhuis CCS',
    jaar:        '1950s',
    beschrijving:'Het Cultureel Centrum Suriname (CCS) aan de Henck Arronstraat is het hart van de Surinaamse cultuur. Hier staat het borstbeeld van Johanna Schouten-Elsenhout. Suriname is een prachtige smeltkroes van culturen!',
    kleur:       0x6B238E,
    wereldPositie: { x: 160, y: 425 },
    collectibles: [
      { id: 'gedicht_001', naam: 'Gedicht "Wan bon"',     emoji: '📝', beschrijving: '"Wan bon, someni wiwiri, wan bon. Wan Sranan, someni wiwiri, someni skin, someni tongo, wan pipel." — Dobru (Robin Ravales), 1973.' },
      { id: 'sranan_001',  naam: 'Sranan Tongo Boek',     emoji: '🗣️', beschrijving: 'Het Sranan (Surinaams) ontstond uit Afrikaanse en Europese talen. Het werd de taal waarmee alle bevolkingsgroepen met elkaar konden praten.' },
      { id: 'kledij_001',  naam: 'Koto Misi',             emoji: '👗', beschrijving: 'De traditionele koto-jurk, gedragen door Creoolse vrouwen. Elk culturele groep heeft zijn eigen klederdracht die deel uitmaakt van het cultureel erfgoed.' },
    ],
    quiz: [
      {
        vraag:   'Wat bedoelen we als we zeggen dat Suriname een "smeltkroes van culturen" is?',
        emoji:   '🌍',
        opties:  ['Er is maar één cultuur in Suriname', 'Verschillende culturen leven samen en leren van elkaar', 'Suriname heeft geen eigen cultuur', 'Alleen de Europese cultuur telt'],
        juist:   1,
        uitleg:  'Geweldig! Suriname is een smeltkroes: mensen uit Afrika, Azië, Europa en de Amerika\'s wonen hier samen. Ze nemen elkaars gewoonten over — dat noemen we culturele uitwisseling.',
      },
      {
        vraag:   'Johanna Schouten-Elsenhout was een van de eerste vrouwen die gedichten schreef in het...',
        emoji:   '✍️',
        opties:  ['Nederlands', 'Engels', 'Sranan', 'Javaans'],
        juist:   2,
        uitleg:  'Top! Johanna Schouten-Elsenhout (geboren 1910) schreef haar gedichten in het Sranan. Ze gebruikte ook odo\'s (spreekwoorden). Haar borstbeeld staat bij het CCS in Paramaribo.',
      },
      {
        vraag:   'Wie schreef het gedicht "Wan bon" over de eenheid van Suriname?',
        emoji:   '🎭',
        opties:  ['Anton de Kom', 'Maria Vlier', 'Robin Ravales (Dobru)', 'Louis Doedel'],
        juist:   2,
        uitleg:  'Bravo! Robin Ravales, bekend onder zijn pseudoniem Dobru, schreef "Wan bon" in 1973. "Wan bon" betekent "één boom" — een beeld voor de eenheid van alle Surinamers.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  //  6. HENDRIKSCHOOL (oudste MULO in Paramaribo)
  //  Leerjaar 8 thema 2 (onderwijs: leerplicht 1876, Johannes Vrolijk,
  //  Maria Vlier, Herman Benjamins, Hendrikschool 1887)
  // ─────────────────────────────────────────────────────────────────
  {
    id:          'hendrikschool',
    naam:        'Hendrikschool',
    jaar:        '1887',
    beschrijving:'De Hendrikschool is de oudste MULO-school van Paramaribo, opgericht in 1887. Onderwijs in Suriname veranderde veel na de afschaffing van de slavernij in 1863 en de invoering van de leerplicht in 1876.',
    kleur:       0x1a5a8a,
    wereldPositie: { x: 700, y: 425 },
    collectibles: [
      { id: 'geschboek_001', naam: 'Eerste Geschiedenisboek', emoji: '📖', beschrijving: 'Maria Vlier schreef in 1863 het eerste schoolboek over de geschiedenis van Suriname, zodat kinderen meer over hun eigen land zouden leren.' },
      { id: 'leerplicht_001',naam: 'Leerplicht 1876',         emoji: '🎓', beschrijving: 'In 1876 werd de leerplicht ingevoerd: kinderen van 7 tot 12 jaar moesten naar school. Lager onderwijs werd gratis.' },
      { id: 'schoolbord_001',naam: 'Oud Schoolbord',          emoji: '✏️', beschrijving: 'Een schoolbord uit de vroege Surinaamse school. Vroeger mochten kinderen van slaafgemaakten niet naar school — dat was verboden door de plantage-eigenaren.' },
    ],
    quiz: [
      {
        vraag:   'In welk jaar werd de leerplicht ingevoerd in Suriname?',
        emoji:   '📚',
        opties:  ['1844', '1863', '1876', '1887'],
        juist:   2,
        uitleg:  'Precies! In 1876 werd de leerplicht ingevoerd. Kinderen van 7 tot 12 jaar moesten verplicht naar school. Ook werd het lager onderwijs gratis gemaakt.',
      },
      {
        vraag:   'Wie was de eerste kleurlingonderwijzer in Suriname?',
        emoji:   '🧑‍🏫',
        opties:  ['Herman Benjamins', 'Maria Vlier', 'Johannes Vrolijk', 'Anton de Kom'],
        juist:   2,
        uitleg:  'Goed! Johannes Vrolijk studeerde in Nederland en opende in 1809 een school in Suriname. In het district Wanica is een Muloschool naar hem vernoemd.',
      },
      {
        vraag:   'Waarom mochten kinderen van slaafgemaakten vroeger niet naar school?',
        emoji:   '🚫',
        opties:  ['Er waren te weinig scholen', 'Plantage-eigenaren wilden dat ze onwetend bleven', 'Het was te ver lopen naar school', 'Ze hadden geen interesse in leren'],
        juist:   1,
        uitleg:  'Heel goed! De plantage-eigenaren wilden dat slaafgemaakten onwetend bleven. Ze dachten zo beter over hen te kunnen heersen. In 1876, na de afschaffing van de slavernij, veranderde dat eindelijk.',
      },
    ],
  },
]

export function getLocation(id) {
  return LOCATIONS.find(l => l.id === id)
}
