# Deutschwelt

Digital tyskunivers-plattform for norske ungdomsskoleelever (8. trinn, A1).
Statisk nettsted — ren HTML/CSS/JavaScript, ingen server eller database nødvendig.

## Mappestruktur

```
deutschwelt-site/
├── index.html                        → forsiden ("Was möchtest du heute machen?")
├── assets/
│   └── style.css                     → delt navigasjonsstil (brukes av alle sider)
├── grammatikk/
│   ├── index.html                    → hub-side: velg kategori (hub-av-huber, se eget avsnitt under)
│   ├── artikler/
│   │   ├── index.html                → kategori-hub: Substantiv-ABC, Nominativ, Akkusativ, Dativ, Genitiv
│   │   ├── substantiv-abc/
│   │   │   └── index.html            → "Das Substantiv-ABC": kjønn, artikkel i alle kasus (Nominativ/Akkusativ/Dativ) og pluralformer — referanse + blandet øvingsspill
│   │   ├── nominativ/
│   │   │   └── index.html            → "Der Artikel-Detektiv" (der/die/das)
│   │   ├── akkusativ/
│   │   │   └── index.html            → "Die Akkusativ-Jagd" (den/die/das)
│   │   ├── dativ/
│   │   │   └── index.html            → "Der Dativ-Kompass" (dem/der) — 🎓 9.–10. trinn (A2/B1)
│   │   └── genitiv/
│   │       └── index.html            → "Genitiv — wessen?": des/der + -s/-es-regel, 4 regelseksjoner + 10-spørsmålsquiz (dynamiske svaralternativer) — 🎓 9.–10. trinn (A2/B1)
│   ├── analyse/
│   │   ├── index.html                → kategori-hub: Satzanalyse, Ordstilling
│   │   ├── satzanalyse/
│   │   │   └── index.html            → "Der Satz-Detektiv": finn Subjekt/Verb/Objekt/Adverbial
│   │   └── ordstilling/
│   │       └── index.html            → "Ordstilling: V2-regelen": eleven BYGGER setningen selv ved å klikke ord-brikker i riktig rekkefølge (ny spillmekanikk, inspirert av H5P "Drag the Words"/setnings-reordering) — 14 setninger i en pool, 8 trukket per runde, positiv-transfer-vinkling mot norsk V2-ordstilling — 🎓 9.–10. trinn (A2/B1)
│   ├── verb/
│   │   ├── index.html                → kategori-hub, delt inn i verbtider: Presens, Perfekt, Präteritum og Futur I er bygget; Plusquamperfekt/Futur II er planlagt
│   │   ├── praesens-regelmaessig/
│   │   │   └── index.html            → "Verb-Werkstatt": presens av regelrette verb
│   │   ├── praesens-unregelmaessig/
│   │   │   └── index.html            → "Verb-Werkstatt": presens av sein, haben m.fl.
│   │   ├── perfekt/
│   │   │   └── index.html            → "Perfekt — haben oder sein?" — 6 regelseksjoner (svake/sterke verb,
│   │   │                                hjelpeverb+presensbøying, ordstilling vs. norsk, unntak fra ge-) +
│   │   │                                20-spørsmålsquiz i tre bolker — 🎓 9.–10. trinn (A2/B1)
│   │   ├── praeteritum/
│   │   │   └── index.html            → "Präteritum": fortellingens tid (skriftlig) vs. Perfekt (muntlig) — 4 regelseksjoner + 18-spørsmålsquiz i tre bolker (svake/sterke verb, sein/haben/modalverb) — 🎓 9.–10. trinn (A2/B1)
│   │   └── futur-1/
│   │       └── index.html            → "Futur I": werden + Infinitiv — 3 regelseksjoner (formel, werden-bøying, Präsens vs. Futur I i praksis) + 10-spørsmålsquiz (fast 5-knapps werden-bøying) — 🎓 9.–10. trinn (A2/B1)
│   ├── preposisjoner/
│   │   ├── index.html                → kategori-hub: Akkusativ-, Dativ- og Wechselpräpositionen (alle tre bygget)
│   │   ├── akkusativ/
│   │   │   └── index.html            → "Akkusativpräpositionen" — durch/für/gegen/ohne/um (fast kasus) + 16-spørsmålsquiz i to bolker
│   │   ├── dativ/
│   │   │   └── index.html            → "Dativpräpositionen" — aus/bei/mit/nach/seit/von/zu (fast kasus, inkl. flertall+n og sammentrekninger) + 16-spørsmålsquiz i to bolker
│   │   └── wechsel/
│   │       └── index.html            → "Wechselpräpositionen" — an/auf/hinter/in/neben/über/unter/vor/zwischen (Wo?→Dativ / Wohin?→Akkusativ), med 9 egne inline-SVG-illustrasjoner + 18-spørsmålsquiz i to bolker — 🎓 9.–10. trinn (A2/B1)
│   ├── adverbial/
│   │   └── index.html                → kategori-hub (alt planlagt): TeKaMoLo, stedsadverbial
│   ├── adjektiv/
│   │   ├── index.html                → "Adjektiv": forklaring (ordklasse, bruk, komparativ/superlativ, bøyning), søk i ca. 200 adjektiv med bøyningstabeller, "Skriv selv" og endelsestrener
│   │   └── adjektiv_data.js          → dataene: `var dwAdj=[…]` (generert av regler + håndplukket liste A1–B1)
│   ├── eiendomsord/
│   │   └── index.html                → kategori-hub (alt planlagt): possessivpronomen
│   ├── konjunksjoner/
│   │   └── index.html                → kategori-hub (alt planlagt): und/aber/oder/denn, Nebensätze (weil/dass)
│   ├── personlig-pronomen/
│   │   ├── index.html                → kategori-hub: Nominativ, Akkusativ, Dativ (tre separate sider, ikke slått sammen)
│   │   ├── nominativ/
│   │   │   └── index.html            → "Personlige pronomen: Nominativ" — ich/du/er/sie/es, med full norsk forklaring av HVORFOR tysk bøyer pronomen etter kasus
│   │   ├── akkusativ/
│   │   │   └── index.html            → "Personlige pronomen: Akkusativ" — mich/dich/ihn/sie/es
│   │   └── dativ/
│   │       └── index.html            → "Personlige pronomen: Dativ" — mir/dir/ihm/ihr … — 🎓 9.–10. trinn
│   ├── sporreord/
│   │   └── index.html                → kategori-hub (alt planlagt): W-Fragen
│   ├── tidsuttrykk/
│   │   └── index.html                → kategori-hub (alt planlagt): klokka, ukedager, måneder, årstider
│   ├── zahlen/
│   │   └── index.html                → "Zahlen": tall 0–100, store tall, ordenstall, årstall, klokka + Tall-søker og øvelser (alt generert av regler i JS, ingen datafil)
│   └── wortschatz-woche/
│       └── index.html                → "Wortschatz der Woche": 498 høyfrekvente ord fordelt på 50 uker (10/uke), ordliste + dynamisk quiz — samme ukesdata som forsidens rulletekst — ligger for seg selv, utenfor de 11 kategoriene
├── staedte/
│   ├── index.html                    → hub-side: velg by (11 kort, gruppert visuelt i tre seksjoner:
│   │                                    🇩🇪 Deutschland / 🇦🇹 Österreich / 🇨🇭 Schweiz — se
│   │                                    endringsloggen for "Fire nye byportretter" lenger ned)
│   ├── berlin/
│   │   └── index.html                → byportrett: Berlin
│   ├── hamburg/
│   │   └── index.html                → byportrett: Hamburg
│   ├── muenchen/
│   │   └── index.html                → byportrett: München
│   ├── koeln/
│   │   └── index.html                → byportrett: Köln
│   ├── frankfurt/
│   │   └── index.html                → byportrett: Frankfurt am Main
│   ├── wien/
│   │   └── index.html                → byportrett: Wien
│   ├── salzburg/
│   │   └── index.html                → byportrett: Salzburg
│   ├── innsbruck/
│   │   └── index.html                → byportrett: Innsbruck
│   ├── zuerich/
│   │   └── index.html                → byportrett: Zürich (budsjett i sveitserfranc, CHF)
│   ├── bern/
│   │   └── index.html                → byportrett: Bern (budsjett i CHF)
│   └── genf/
│       └── index.html                → byportrett: Genf (budsjett i CHF; fransktalende by — egen merknad på siden)
├── geschichte/
│   ├── index.html                    → hub-side: velg historietema
│   ├── kleinstaaterei/
│   │   └── index.html                → "Kleinstaaterei" (Tyskland før 1871 + hvorfor det fortsatt finnes adelsnavn i dag)
│   ├── kaiserreich/
│   │   └── index.html                → "Deutsches Kaiserreich" (1871–1918, tidslinje + lese/skrive/muntlig-opplegg)
│   ├── zweiter-weltkrieg/
│   │   └── index.html                → "Zweiter Weltkrieg" (1939–1945, med norsk vinkling — 9. april 1940)
│   ├── berliner-mauer/
│   │   └── index.html                → "Die Berliner Mauer" (tidslinje + lese/skrive/muntlig-opplegg)
│   └── kalter-krieg/
│       └── index.html                → "Kalter Krieg: Ost- und Westdeutschland" (BRD vs. DDR, systemsammenligning) — 🎓 9.–10. trinn (A2/B1)
├── lesen/
│   ├── index.html                    → hub-side: velg lesetekst (tre grupper: detektiv, flash fiction, ekte litteratur)
│   ├── ein-wochenende-in-berlin/
│   │   └── index.html                → leseforståelse: Lukas' helg i Berlin
│   ├── wer-hat-den-kuchen-gegessen/
│   │   └── index.html                → leseforståelse: mysterium i klasse 8b
│   ├── der-verlorene-rucksack/
│   │   └── index.html                → leseforståelse: mysterium i garderoben (klasse 8a)
│   ├── der-regenschirm/
│   │   └── index.html                → original flash fiction, selvskrevet — med twist-refleksjon
│   ├── die-sms/
│   │   └── index.html                → original flash fiction, selvskrevet — med twist-refleksjon
│   ├── kafka-parabeln/
│   │   └── index.html                → bonus: to ekte, gemeinfrie tekster av Franz Kafka + norsk oversettelse
│   └── klassikere/
│       ├── index.html                → hub-av-huber: veldig avansert lesedel, fire gemeinfrie verker
│       ├── verwandlung/
│       │   ├── index.html            → verk-hub: Die Verwandlung (Kafka)
│       │   ├── teil-1/index.html     → Erster Teil — full, ordrett tekst
│       │   ├── teil-2/index.html     → Zweiter Teil — full, ordrett tekst
│       │   └── teil-3/index.html     → Dritter Teil — ordrett utdrag + tydelig merket sammendrag (se "Kjente begrensninger")
│       ├── sandmann/
│       │   ├── index.html            → verk-hub: Der Sandmann (E.T.A. Hoffmann)
│       │   └── abschnitt-1/ … abschnitt-5/  → full, ordrett tekst, ett kapittel per side
│       ├── silbersee/
│       │   ├── index.html            → verk-hub: Der Schatz im Silbersee (Karl May) + kontekstboks om tidstypiske stereotypier
│       │   └── utdrag-1/ … utdrag-5/  → fem ordrette utdrag fra ulike kapitler (romanen er for lang til å ta med i sin helhet)
│       └── max-und-moritz/
│           ├── index.html            → verk-hub: Max und Moritz (Wilhelm Busch)
│           └── streich-1/ … streich-7/  → full, ordrett verse-tekst; streich-1 inkl. Vorwort, streich-7 inkl. Ende
│   └── wikisource/
│       ├── index.html                → kategori-hub: nivådelt 8./9./10. trinn (8 av 11 tekster bygget, 3 gjenstår som dw-soon)
│       ├── der-suesse-brei/index.html        → "Der süße Brei" (KHM 103, Grimm) — hover/trykk-glosser + gloseliste + quiz — 8. trinn
│       ├── die-sterntaler/index.html         → "Die Sterntaler" (KHM 153, Grimm) — hover/trykk-glosser + gloseliste + quiz — 8. trinn
│       ├── laeuschen-und-floehchen/index.html → "Läuschen und Flöhchen" (KHM 30, Grimm) — hover/trykk-glosser + gloseliste + quiz — 8. trinn
│       ├── der-fuchs-und-die-gaense/index.html → "Der Fuchs und die Gänse" (KHM 86, Grimm) — hover/trykk-glosser + gloseliste + quiz — 8. trinn
│       ├── der-zahnarzt/index.html           → "Der Zahnarzt" (Hebel, 1811) — hover/trykk-glosser + gloseliste + quiz — 9. trinn
│       ├── brot-zu-stein-geworden/index.html → "Brot zu Stein geworden" (folkesagn) — hover/trykk-glosser + gloseliste + quiz — 9. trinn
│       ├── john-maynard/index.html           → "John Maynard" (Fontane, ballade) — hover/trykk-glosser + gloseliste + quiz — 10. trinn
│       └── die-lorelei/index.html            → "Die Lorelei" (Proehle-sagn + Brentano-gjenfortelling + Heine-dikt) — hover/trykk-glosser + gloseliste + quiz — 10. trinn
├── hoeren/
│   ├── index.html                    → hub-side: velg lyttevideo
│   ├── nicos-weg-hallo/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 1 (Hallo!)
│   ├── nicos-weg-kein-problem/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 2 (Kein Problem!)
│   ├── nicos-weg-tschuess/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 3 (Tschüss!)
│   ├── nicos-weg-von-a-bis-z/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 4 (Von A bis Z)
│   ├── nicos-weg-ich-heisse-emma/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 5 (Ich heiße Emma)
│   ├── nicos-weg-das-ist-nico/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 6 (Das ist Nico)
│   ├── nicos-weg-woher-kommst-du/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 7 (Woher kommst du?)
│   ├── nicos-weg-nico-hat-ein-problem/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 8 (Nico hat ein Problem)
│   ├── nicos-weg-zahlen-1-bis-100/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 9 (Zahlen von 1 bis 100)
│   ├── nicos-weg-wichtige-nummern/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 10 (Wichtige Nummern)
│   ├── nicos-weg-adressen/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 11 (Adressen)
│   ├── nicos-weg-auf-dem-amt/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 12 (Auf dem Amt)
│   ├── nicos-weg-was-machst-du-hier/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 13 (Was machst du hier?)
│   ├── nicos-weg-was-trinkst-du/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 14 (Was trinkst du?)
│   └── nicos-weg-eine-pizza-bitte/
│       └── index.html                → video + oppgaver: Nicos Weg, Folge 15 (Eine Pizza, bitte!)
├── schreiben/
│   ├── index.html                    → hub-side: velg skriveoppgave (8 kort, 1 «kommer snart»)
│   ├── sms-chat/
│   │   └── index.html                → "SMS-Chat" — eleven skriver begge sider av en chat
│   ├── wortkiste/
│   │   └── index.html                → "Die Wortkiste" — skriv med tilfeldig trukne ord
│   ├── personenbeschreibung/
│   │   └── index.html                → skriveramme: beskriv en person (utseende + personlighet)
│   ├── praesentation/
│   │   └── index.html                → skriveramme: bygg en presentasjon (Einleitung/Hauptteil/Schluss)
│   ├── ort-beschreiben/
│   │   └── index.html                → skriveramme: beskriv en by/et sted
│   ├── mein-tag/
│   │   └── index.html                → skriveramme: beskriv en vanlig dag (fokus: trennbare Verben)
│   └── wo-ist-was/
│       └── index.html                → skriveramme: forklar hvor ting er (fokus: stedspreposisjoner + Dativ)
├── reise/
│   ├── index.html                    → hub-side: velg reiseoppgave
│   ├── reiseplanlegger/
│   │   └── index.html                → "Der Reiseplaner" — velg by, transport og aktiviteter
│   ├── koffer/
│   │   └── index.html                → "Packe deinen Koffer" — pakkespill basert på vær/årstid
│   └── reisetagebuch/
│       └── index.html                → "Reisetagebuch" — skriv dagbok fra en tenkt reise
├── challenges/
│   ├── index.html                    → hub-side: velg challenge
│   ├── taegliche-herausforderung/
│   │   └── index.html                → tilfeldig trukket mini-oppgave (sprechen/schreiben/hören/wortschatz)
│   ├── wortschatz-jagd/
│   │   └── index.html                → memory-spill: match tysk/norske ordpar mot klokken
│   └── escape-room/
│       └── index.html                → "Der verschlossene Klassenraum" — fire gåter gir en kode
├── filme-serien/
│   └── index.html                    → "Filme & Serien" — 17 filmer + 10 serier med trailerlenker
├── musik/
│   └── index.html                    → "Musik" — 27 tyske sanger med innebygd YouTube-spiller
├── deutschland/
│   └── index.html                    → "Deutschland" — kultur/tradisjon/fakta + interaktivt dra-og-slipp-kart (10 største byer)
├── laender/
│   └── index.html                    → hub-side: "Länder" — velg landsprofil (Deutschland/Österreich/Schweiz)
├── oesterreich/
│   └── index.html                    → "Österreich" — kultur/tradisjon/fakta + interaktivt dra-og-slipp-kart (10 største byer)
├── schweiz/
│   └── index.html                    → "Schweiz" — kultur/tradisjon/fakta + interaktivt dra-og-slipp-kart (10 største byer)
├── normen/
│   └── hoeflichkeit/
│       └── index.html                → "Höflichkeit in Deutschland" — du/Sie, illustrasjoner, grammatikkspill
├── leben/
│   ├── index.html                    → hub-side: "Deutsch im echten Leben" (autentisk tysk-seksjonen)
│   ├── alltagssprache/
│   │   └── index.html                → fraseliste + Schulbuch-vs-Alltag + "Was bedeutet das?"-quiz
│   ├── chat/
│   │   └── index.html                → "Chat & Social Media" — forkortelser, innkommende chat, skriv et svar
│   ├── jugendwoerter/
│   │   └── index.html                → liten ordbok med tyske ungdomsuttrykk + testquiz
│   ├── sprichwoerter/
│   │   └── index.html                → "Sprichwörter und Redewendungen" — 37 ordtak/faste uttrykk
│   │                                    (ordliste i to grupper) + 14-spørsmål betydningsquiz
│   └── schule/
│       └── index.html                → "Jugend & Schule" — skolehverdag i Tyskland vs. Norge
└── sprechen/
    ├── index.html                    → hub-side: velg samtalesituasjon
    ├── cafe/
    │   └── index.html                → "Du bist dran!" — Im Café
    ├── restaurant/
    │   └── index.html                → "Du bist dran!" — Im Restaurant
    ├── butikken/
    │   └── index.html                → "Du bist dran!" — Im Kleidungsgeschäft
    ├── hotell/
    │   └── index.html                → "Du bist dran!" — An der Rezeption
    └── taxi/
        └── index.html                → "Du bist dran!" — Im Taxi
fortgeschritten/
└── index.html                        → hub av huber: samlingspunkt for alt innhold på
                                         9.–10. trinn-nivå (A2/B1) — selve sidene bor i
                                         sin naturlige seksjon (f.eks. grammatikk/artikler/dativ/),
                                         og lenkes hit med .dw-level-tag-merket
wichtige-themen/
├── index.html                        → hub: 3 kort (8./9./10. klasse)
├── 8-klasse/
│   ├── index.html                    → hub: alle 8 temaer bygget
│   ├── die-einfache-unterhaltung/
│   │   ├── index.html                → Mia/Tom-dialogen: lydspiller med
│   │   │                                omtrentlig tekstsynkronisering,
│   │   │                                gloser, ord/uttrykk, quiz, skriveoppgave
│   │   └── audio.mp3                 → ElevenLabs-innspilling, 57,47 sek
│   ├── meine-familie/
│   │   ├── index.html                → to monologer (Lena/Finn), «les-med»-avsnitt
│   │   │                                i stedet for chatteboble (ikke dialog),
│   │   │                                én lydspiller + tekstblokk per versjon
│   │   ├── audio-lena.mp3            → ElevenLabs-innspilling, 45,17 sek
│   │   └── audio-finn.mp3            → ElevenLabs-innspilling, 52,61 sek
│   ├── hobbys-und-freizeit/
│   │   ├── index.html                → Sara/Jonas snakker om hobbyer — samme mønster
│   │   └── audio.mp3                 → ElevenLabs-innspilling, 33,72 sek
│   ├── eine-verabredung/
│   │   ├── index.html                → Jonas/Sara avtaler kino — samme mønster +
│   │   │                                egen «Klokka på tysk»-note (24-timersformat)
│   │   └── audio.mp3                 → ElevenLabs-innspilling, 30,93 sek
│   ├── im-restaurant/
│   │   ├── index.html                → Lisa/David/Kellner på restaurant — TRE talere
│   │   │                                (ny, sentrert .c-chatteboble-stil for Kellner)
│   │   └── audio.mp3                 → ElevenLabs-innspilling, 77,09 sek
│   ├── zu-weihnachten/
│   │   ├── index.html                → Leons monolog om tysk julefeiring — «les-med»,
│   │   │                                egen seksjon om tyske juletradisjoner
│   │   └── audio.mp3                 → ElevenLabs-innspilling, 78,92 sek
│   ├── einkaufen/
│   │   ├── index.html                → Emma/Verkäuferin kjøper jakke — samme
│   │   │                                to-taler-mønster som Hobbys und Freizeit
│   │   └── audio.mp3                 → ElevenLabs-innspilling, 50,76 sek
│   └── mein-aussehen/
│       ├── index.html                → to monologer (Sophie/Ben), «les-med»-mønster,
│       │                                én lydspiller + tekstblokk per versjon
│       ├── audio-sophie.mp3          → ElevenLabs-innspilling, 29,57 sek
│       └── audio-ben.mp3             → ElevenLabs-innspilling, 28,45 sek
├── 9-klasse/
│   └── index.html                    → venteside, ingen temaer bestemt ennå
└── 10-klasse/
    └── index.html                    → venteside, ingen temaer bestemt ennå
ordbok/
├── index.html                        → søkbar norsk ⇄ tysk ordbok (live-filter, ingen backend)
└── ordbok.json                       → hele Heinzelnisse-ordlisten, komprimert JSON (45 141 oppføringer, 2,6 MB), hentes med fetch()
aehnliche-woerter/
├── index.html                        → "Snakker du nysk?" — 225 tysk-norske ordpar,
│                                        eleven skriver inn oversettelsen og får en
│                                        grønn hake ✓ ved riktig svar
└── nysk_data.js                      → ordlisten (13 kategorier, fasit med godkjente
                                         alternative stavemåter), lastes som eget script
verben/
├── index.html                        → Verben-Konjugator: søk, tabeller for Präsens/Präteritum/Perfekt/Futur I/Imperativ,
│                                        «Skriv selv»-modus med grønn hake ✓
└── verben_data.js                    → bøyningsdata for 338 verb (A1–B1), ferdig generert; lastes som eget script
```

`grammatikk/artikler/dativ/` (🧭 Der Dativ-Kompass) er det første ferdigbygde
temaet på 9.–10. trinn-nivået — se «Om 9.–10. trinn-nivået» lenger ned.

Hver seksjon ligger i sin egen mappe med en `index.html`, slik at adressen
blir ren og kort (f.eks. `.../staedte/berlin/` i stedet for
`.../staedte/berlin/index.html`).

**Mønster for hub-sider:** så snart en seksjon har to eller flere
undersider (som `staedte/`, `geschichte/`, `grammatikk/`, `lesen/`,
`hoeren/`, `schreiben/`, `reise/`, `challenges/`, `leben/` og nå `sprechen/`
har), får den en egen `index.html` som viser et lite kortgalleri med lenker
videre — akkurat som forsiden, bare smalere.

**Grammatikk er nå en hub-av-huber (fra runden «Grammatikk-restrukturering»):**
`grammatikk/index.html` er selv en hub-side, men i stedet for å lenke rett
til hvert spilltema lenker den til 11 kategori-hub-sider (`artikler/`,
`analyse/`, `adverbial/`, `adjektiv/`, `eiendomsord/`, `konjunksjoner/`,
`personlig-pronomen/`, `preposisjoner/`, `sporreord/`, `tidsuttrykk/`,
`verb/`) + `wortschatz-woche/` som ligger for seg selv utenfor kategoriene.
Hver kategori-hub bruker akkurat samme kort-mønster som `grammatikk/index.html`
selv, bare ett nivå dypere (`.../assets/style.css` blir `../../assets/style.css`
i stedet for `../assets/style.css`). De ferdigbygde spilltemaene ligger nå ett
nivå dypere enn før (f.eks. `grammatikk/dativ/` → `grammatikk/artikler/dativ/`),
så **hver leaf-side trenger tre `../` til rota** (`../../../assets/style.css`,
`../../../staedte/` osv. i navigasjonen), mens Grammatikk-lenken i navigasjonen
og brødsmule-lenken til Grammatikk kun går to nivåer opp (`../../`). Brødsmulen
(`.dw-crumb`) på en leaf-side er nå tre ledd: `Grammatik → Kategori → Temanavn`
(f.eks. `Grammatik → Artikler → Der Dativ-Kompass`), mot to ledd før
restruktureringen. Preposisjoner er delt i Akkusativ-/Dativ-/Wechselpräpositionen
og Verb er delt tydelig i verbtider (Presens er bygget, resten er planlagt
`dw-soon`-kort), akkurat som etterspurt. Se «Slik legger du til et nytt
grammatikktema» lenger ned for konkret oppskrift på nye kort i riktig kategori.

**Om toppnavigasjonen:** den har nå 17 punkter (🏠 Forside ·
🧩 Grammatik · 🏙️ Städte · 🕰️ Geschichte · 📖 Lesen · 🎧 Hören · ✍️ Schreiben ·
🗺️ Reise · 🏆 Challenges · 🎬 Filme & Serien · 🎵 Musik · 🌍 Länder ·
🎩 Normen & Regler · 📱 Deutsch im echten Leben · 🗣️ Sprechen ·
⭐ Wichtige Themen · 🎓 9.–10. trinn — sistnevnte fikk følgeskap av
⭐ Wichtige Themen rett foran seg i runden «Wichtige Themen (ny seksjon)»
(se lenger ned), satt inn med et Python-script som gjenbrukte relativ
sti-prefiks fra hver fils eksisterende 🎓-lenke for å garantere riktig
dybde i alle 148 HTML-filer —
punktet som pekte rett til `deutschland/` (🇩🇪 Deutschland) peker nå i stedet til
`laender/` (🌍 Länder), se «Om Länder-seksjonen» lenger ned) og bruker `flex-wrap` i
`assets/style.css`, så den bryter fint til to-tre linjer på smale skjermer.
Punktet som pekte rett til `sprechen/cafe/` (☕ Café) peker nå til
`sprechen/` (🗣️ Sprechen) i stedet, siden `sprechen/` gikk fra én side til
en hub denne runden — se "Om Sprechen-seksjonen" under. `filme-serien/` og
`normen/hoeflichkeit/` er fortsatt unntak fra hub-mønsteret — de har bare
én side hver, så navigasjonen peker rett dit i stedet for til en hub-side.
Hvis `normen/` får en side til (f.eks. punktlighet eller resirkulering),
lag `normen/index.html` som hub og pek menyen dit i stedet — akkurat som
`sprechen/` nettopp fikk.

**Om Hören-seksjonen:** videoene er bygget inn fra YouTube
(`youtube-nocookie.com/embed/<video-ID>`) og hentet fra **Nicos Weg**, en
gratis A1-serie laget av Deutsche Welle (DW) spesielt for nybegynnere.
Hver side har en "Se videoen direkte på YouTube"-lenke som fallback i
tilfelle skolens nettverk blokkerer innebygde videoer. Under videoen er
det en enkel, ikke-poengsatt avkrysningsliste (`dwListenWords`) der
elevene krysser av ord de hører — en lett måte å holde dem aktive under
selve avspillingen, siden vi ikke har tilgang til eksakt transkripsjon å
poengsette mot. Den faktiske poengsatte forståelsesquizen (`dwQuiz`)
kommer etter videoen og er basert på handlingen i episoden, ikke eksakte
sitater. Seksjonen har nå 15 episoder (Folge 1–15, «Nicos Weg fortsettes»-
runden la til Folge 6–15 etter nøyaktig samme mal som Folge 1–5).

**Om video-ID-verifisering (viktig prinsipp, gjelder alle 15 episoder):**
vi gjetter **aldri** en YouTube-video-ID — hver ID er alltid sjekket mot
YouTubes oEmbed-endepunkt (`https://www.youtube.com/oembed?url=...&format=json`,
som returnerer video-tittel og kanalnavn hvis IDen finnes) før den
publiseres på siden, og vi sjekker samtidig at kanalen er den offisielle
DW-kanalen («Deutsch lernen mit der DW», @dwlearngerman) — ikke en
uoffisiell opplasting eller en annen video med lignende navn. Direkte
`curl` mot oEmbed-endepunktet er blokkert av miljøets nettverksproxy i
byggeøkten (403 på CONNECT-tunnelen); løsningen som ble funnet og brukt i
Folge 6–15-runden er å bruke `WebFetch`-verktøyet i stedet, som *kan* nå
oEmbed-endepunktet og lese ut tittel/kanalnavn — noter dette som
fremgangsmåte for fremtidige nye episoder også. Selve handlingsreferatet
i "Vor dem Hören"-teksten for hver episode er grunngitt i eksterne,
uavhengige kilder (DWs egne videobeskrivelser og Yabla Germans
episodesammendrag, kryssjekket for indre sammenheng på tvers av
episodene) — det er *ikke* en eksakt transkripsjon, siden vi ikke har
tilgang til det. Ett avvik ble oppdaget og rettet før publisering: Yabla
kalte Folge 15 «Die Bestellung», men den offisielle YouTube/DW-tittelen
(verifisert via oEmbed) er «Eine Pizza, bitte!» — den offisielle tittelen
er brukt, med en kommentar i sidens kildehenvisning som forklarer avviket
(samme prinsipp som Sportfreunde Stiller-årstallrettelsen i Musik-runden).
Søkeindeksen fikk 10 nye nøkkel-oppføringer (én per ny episode, med
flerords-nøkler for å holde dem særegne). Full kollisjonsskann etter
publisering fant de samme 7 permanente, tidligere aksepterte kollisjonene
pluss én ny av samme aksepterte type: nøkkelen «nico» i Hören-hubens egen
generiske oppføring blir nå fanget opp av Folge 8s nøkkel «polizist hilft
nico» først — akkurat samme mønster som «emma» allerede gjorde for Folge 5
(en bred, generisk enkeltord-nøkkel som en mer spesifikk episodeside — som
med rette inneholder ordet — skygger for). Dette regnes som forventet
vekst i søkeindeksen, ikke en feil å rette, i tråd med praksisen fra
tidligere runder.

**Om verbspillene:** `verben-regelmaessig/` og `verben-unregelmaessig/` bruker
samme spillmotor som Nominativ/Akkusativ (`dwWords`, poeng, hint), men med
en variant der svaralternativene bygges dynamisk for hver runde
(`dwLoad()` lager knappene fra `w.choices` i stedet for faste der/die/das-
knapper), siden hvert verb har egne bøyningsformer som alternativer. Begge
sider bruker flervalg (ikke fritekst-skriving) med vilje — det unngår
friksjonen med å skrive tyske spesialtegn (ä/ö/ü) på et norsk tastatur.
Disse to sidene erstattet den opprinnelige "Verben im Präsens"
plassholderen i grammatikk-huben, etter ønske om separate opplegg for
regelrette og uregelrette verb (i stedet for ett kombinert spill).

**Om Schreiben-seksjonen:** skriveoppgavene er bevisst designet som noe
mer enn en tom tekstboks. **SMS-Chat** gjenbruker chat-boble-designet fra
`sprechen/cafe/`, men her forfatter eleven selv begge sider av samtalen —
en avsender-bryter (`dwCurrentSender`) styrer om neste melding legges inn
som "deg" eller "vennen", og hele samtalen (`dwMessages`) kan kopieres som
formatert tekst til slutt. **Die Wortkiste** trekker 8 tilfeldige ord fra
en større ordpool (`dwWordPool`, fargekodet etter ordklasse: substantiv/
verb/adjektiv) som eleven skal veve inn i en egen tekst — en "Neue
Wörter!"-knapp gir nytt trekk når som helst. Begge sider avsluttes med en
enkel, ikke-poengsatt egenvurderings-sjekkliste (`dwCheckItems`) eleven
går gjennom selv før de kopierer teksten videre til læreren — dette
mønsteret bør gjenbrukes på fremtidige skriveoppgaver også.

**Om Reise-seksjonen:** **Der Reiseplaner** lar eleven velge by (Berlin
eller Wien — de to byene som hadde et byportrett under `staedte/` da denne
siden ble bygget; nå er det 5 til — Zürich, Hamburg, München, Köln og
Frankfurt — som Reiseplaneren kunne utvides med i en fremtidig runde,
men det er ikke gjort ennå),
transportmiddel og én aktivitet per dag i tre dager, med et budsjett
(`dwBudget`) og en live oppsummeringstekst som oppdateres for hvert valg
(`dwUpdateAll()`), pluss et kort refleksjonsfelt og egenvurderings-
sjekkliste. **Packe deinen Koffer** trekker et tilfeldig reisemål/årstid
(`dwScenarios`) og lar eleven klikke ting inn i kofferten fra en ordpool
(`dwItemPool`) der hver ting er merket med hvilke årstider den passer til
(`item.seasons`); "Fertig gepackt!" sjekker valgene og viser farget
tilbakemelding (riktig pakket / passer ikke / glemt). **Reisetagebuch** er
en skriveoppgave med tre dagbokinnlegg (Ankunft/Stadt/Abschied) og
klikkbare setningsstartere (`dwStarters`) som setter inn tekst i riktig
felt — samme egenvurderings- og kopier-mønster som Schreiben-oppgavene.

**Om Challenges-seksjonen:** **Tägliche Herausforderung** gjenbruker
reroll-mønsteret fra Wortkiste på en pool av 18 varierte mini-oppgaver
(`dwChallengePool`, merket med type og vanskelighetsgrad) pluss en enkel
selvrapportert "ferdig"-teller (kun in-memory). **Wortschatz-Jagd** er et
memory-spill — 8 tysk/norske ordpar (`dwPairs`) blir til 16 kort som
shuffles og rendres på nytt (`dwInitGame()`); en `setInterval`-basert
klokke og en trekkteller gir en enkel konkurransefaktor, med "Neustart"
for nytt brett. **Der verschlossene Klassenraum** er en liten
escape-room: fire gåter (`dwClues`, hver hentet fra en annen del av
nettstedet — grammatikk/ordforråd/lesing/verb) gir hvert sitt siffer ved
riktig svar; når alle fire er funnet, skriver eleven inn firesifferkoden
i riktig rekkefølge for å "åpne døren". Ingen straff for feil svar
underveis — eleven kan prøve på nytt til hun finner riktig løsning.

**Om Filme & Serien-siden:** en ren informasjonsside uten spill eller
`<script>` — 10 filmkort og 5 seriekort, hver med tittel, år/sjanger/regi,
en FSK-aldersmerking (fargekodet chip), en kort norsk beskrivelse, og en
knapp som lenker ut til en offisiell trailer på YouTube (`target="_blank"`,
åpnes i ny fane — ingen video er bygget inn på selve siden). Alle 15
video-ID-ene ble verifisert ekte (sjekket tittel/kanal mot YouTubes
oEmbed-endepunkt) før publisering, slik at ingen lenker er gjettet. To av
seriene (Druck, Die Pfefferkörner) har ingen formell FSK-klassifisering
siden FSK kun klassifiserer kino-/videoutgivelser, ikke kringkastings-
eller nettserier — det er markert tydelig med en alternativ
aldersanbefaling i stedet for å dikte opp et FSK-tall. Noen titler
(Baader Meinhof Komplex, Dark) har en ekstra merknad om at innholdet
oppleves tyngre enn den offisielle aldersgrensen skulle tilsi — dette er
ment som informasjon til lærer/foresatte, ikke en advarsel mot å vise
listen til elevene.

**Om Musik-siden:** Teach ba om en egen musikkdel etter samme mal som
Filme & Serien, men med musikkvideoen bygget INN på siden (ikke bare en
utgående lenke) og litt info om hver sang (utgivelsesår, sjanger, kort om
hva den handler om). Teach ga en liste på 20 sanger med år/sjanger, og 7
til uten. Claude avklarte tre valg med AskUserQuestion før bygging: (1) én
delt "nå spilles"-spiller øverst + en klikkbar sangliste under (i stedet
for 27 separate innebygde spillere samtidig, av hensyn til sidevekt) —
Teach valgte den delte spilleren; (2) eget nytt toppnavigasjonspunkt
🎵 Musik — Teach valgte det; (3) om Claude skulle undersøke hver sang og
legge på en merknad ved behov — Teach valgte research + merknad.

Alle 27 video-ID-ene ble verifisert (nettsøk mot YouTube, samme prinsipp
som Filme & Serien — aldri gjett en video-ID). Ett årstall ble rettet:
Sportfreunde Stiller-sangen Teach oppga med tittelen «'54, '74, '90, 2010»
og året 2006 er faktisk to forskjellige innspillinger — en fra 2006 (til
VM det året) og en nyinnspilling fra 2010 (til VM 2010) med akkurat den
tittelen. Siden viser derfor 2010 med en synlig, ikke-alarmerende merknad
om at 2006 ofte oppgis, samme mønster som brukes for «Crazy»-året på
Filme & Serien-siden.

Musikkteksten på flere av de nyere hiphop-/rap-sangene inneholder tyngre
innhold (rusreferanser, kriminalitet/våpen, seksuelt ladet språk, og for
én sang — Samy Deluxe, «Weck mich auf» — et tema om seksuelle overgrep mot
barn). Da Claudes egen research fant dette var mer alvorlig enn en generell
"legg på merknad ved behov"-instruks dekket, ble Teach spurt en ekstra gang
med AskUserQuestion, med de konkrete sangene og bekymringene navngitt
direkte. Teach valgte å bygge dem inn med et tydelig varselmerke, samme
prinsipp som FSK-fargekodingen på Filme & Serien. Løsningen: hver sang har
et `tier`-felt (`none`/`note`/`warning`) som styrer en liten merkelapp på
sangkortet OG en større, tydelig boks i "nå spilles"-panelet når sangen er
valgt — amber for mildere merknader (4 sanger), rødt for de mest eksplisitte
(3 sanger: Bonez MC & RAF Camora «Ohne mein Team», Bushido «Alles verloren»,
Samy Deluxe «Weck mich auf»). Merkelappene er Claudes egen redaksjonelle
vurdering, ikke en offisiell klassifisering (musikk har ingen FSK-ekvivalent),
og er ment som informasjon til lærer, ikke en skjult sensur — alle 27 sanger
er spillbare for alle elever.

Teknisk: én delt `<iframe id="dw-player">` bytter `src` via `dwPlay(i)` når
en elev klikker et sangkort (`<button>`, ikke `<a>`, siden det ikke er en
navigasjon), i stedet for 27 samtidige embeds. Søkeindeksen fikk 28 nye
oppføringer (27 sanger + én generisk «musik»-oppføring, 96 elementer
totalt). Én kollisjon ble oppdaget og fikset før publisering: nøkkelen
«chöre forster» (for Mark Forster – Chöre) inneholder bokstavrekken «höre»
(c-**h-ö-r-e**), som er en eksisterende nøkkel for `hoeren/`-siden — samme
type feil som «beschreiben» (inneholder «schreib») og «wortschatz»
(inneholder «chat») tidligere i prosjektet. Løst ved å bruke «forster 2018»
som nøkkel i stedet. Full kollisjonsskann etter publisering fant nøyaktig
de samme 7 permanente, tidligere aksepterte kollisjonene — ingen nye.

**Om Deutschland-siden:** Teach ba om en generell del om Tyskland, tysk
kultur og tradisjon, med et interaktivt kart der de 10 største byene må
plasseres riktig. Claude avklarte tre valg med AskUserQuestion før bygging:
(1) plassering — helt ny toppnav-pilar (16. punkt) i stedet for en
underside av Städte eller Geschichte — Teach valgte ny pilar; (2) hvilke
kulturtemaer — Teach valgte alle fire foreslåtte (høytider/tradisjoner,
nasjonalsymboler/fakta, mat/skikker, geografi/natur); (3) kartspillets
interaksjonsform — dra-og-slipp på kartet, i stedet for klikk-og-velg —
Teach valgte dra-og-slipp.

Alle fakta er sjekket med websøk før publisering: de 10 største byene og
innbyggertallene (WirtschaftsWoche/wiwo.de sin 2026-rangering — Berlin,
Hamburg, München, Köln, Frankfurt am Main, Düsseldorf, Leipzig, Dortmund,
Stuttgart, Essen), Bundesländer/naboland/areal/Zugspitze (tysk Wikipedia +
destatis.de), nasjonalsangen (bundesregierung.de — kun tredje vers av
Deutschlandlied er offisielt, siden nazistene misbrukte særlig første vers;
besluttet 1952, bekreftet 1991), Oktoberfest-historien (engelsk Wikipedia —
startet som et kongelig bryllup i 1810), Karneval/Fasching/Fastnacht sine
regionale navn og datoer (zdfheute.de), Currywurst-oppfinnelsen (Tagesspiegel/
DPMA — Herta Heuwer, Berlin, 1949) og den tyske Brotkultur-statusen som
UNESCO immateriell kulturarv siden 2014 med over 3 200 registrerte
brødsorter (brotinstitut.de/unesco.de).

**Kartet** er en forenklet Tyskland-silhuett (fastland + Rügen), generert
programmatisk fra åpne geografiske grensekoordinater (forenklet med
Douglas-Peucker-algoritmen for et ryddig, men gjenkjennelig omriss) og
projisert til et SVG-koordinatsystem — IKKE tegnet for hånd. Byenes
posisjoner på kartet er regnet ut fra deres faktiske lengde-/breddegrad med
akkurat samme projeksjon som selve landomrisset, slik at plasseringen deres
relativt til hverandre og til kartformen er geografisk korrekt.
**Røde prikker** (`#dw-targets`, tegnet FØR `#dw-pins` i SVG-en) viser alle
10 byenes faktiske posisjon fra start — lagt til etter tilbakemelding fra
Teach om at et helt tomt kart gjorde det for vanskelig å vite hvor
bynavnene skulle dras, og at riktig plasserte bynavn burde bli stående på
kartet for bedre læring. Retting av kartspillet bruker en
**«nærmeste by»-logikk** i stedet for en fast treffradius: et slipp regnes
som riktig hvis punktet ligger nærmere byens faktiske posisjon enn noen av
de 9 andre byenes posisjoner (en slags Voronoi-inndeling). Dette gir
rettferdig retting uansett hvor tett byene ligger — viktig her siden fire
av de ti byene (Köln, Düsseldorf, Dortmund, Essen) ligger tett sammen i
Ruhrgebiet/Rheinland, for tett til at én fast radius ville fungert godt for
alle ti byene samtidig. Ved riktig slipp legges en grønn nål med bynavnet
til i `#dw-pins` PÅ SAMME koordinat som den røde prikken — siden pin-gruppen
tegnes etter target-gruppen i SVG-en, dekker den grønne nålen automatisk
den røde prikken, og bynavnet blir stående synlig på kartet resten av
økten (eller til «Start på nytt» trykkes, som tømmer `#dw-pins` men lar de
røde prikkene i `#dw-targets` stå urørt). Ved feil slipp får eleven i
tillegg et hint om hvilken by punktet faktisk lå nærmest, uten å avsløre
selve fasiten. Dra-og-slipp er implementert med Pointer Events
(`pointerdown`/`pointermove`/`pointerup` + `setPointerCapture`) i stedet
for HTML5 sin native drag-and-drop-API, siden Pointer Events fungerer likt
for mus, touch og penn — viktig for at spillet skal fungere på
nettbrett/Chromebook, ikke bare med mus.

Teksten om nasjonalsangens historie (kun tredje vers, på grunn av nazistenes
misbruk av første vers) er bevisst holdt kort og faktabasert, med lenke
videre til `geschichte/zweiter-weltkrieg/` for elever som vil lære mer — i
tråd med nettstedets etablerte, forsiktige linje for alvorlige historiske
tema. Navigasjonsmenyen ble oppdatert i alle 68 daværende HTML-filer med et
Python-script (samme mønster som tidligere navigasjonsendrende runder),
pluss et nytt Deutschland-kort på forsiden. Søkeindeksen fikk 11 nye
oppføringer (nå 107 elementer). Én bevisst avveining ble gjort: ordene
«oktoberfest» og «karneval» alene er allerede søkenøkler for
`staedte/muenchen/` og `staedte/koeln/` fra tidligere runder, og disse ble
IKKE gjenbrukt for den nye Deutschland-siden (som dekker begge temaene i
mer dybde) — i stedet ble mer spesifikke nøkler valgt («fasching fastnacht
rosenmontag» osv.), slik at de opprinnelige søkeordene fortsatt går til
byportrettene som før. Full kollisjonsskann fant kun de samme 7 permanente,
tidligere aksepterte kollisjonene — ingen nye.

**Om «Deutsch im echten Leben»-seksjonen:** dette er nettstedets
"autentiske tysk"-seksjon — mens de andre delene lærer eleven tysk, viser
denne hvordan tysk faktisk brukes av folk (særlig ungdom) utenfor
læreboka. `leben/index.html` er en hub med 8 kort: 5 er bygget ut
(`alltagssprache/`, `chat/`, `jugendwoerter/`, `sprichwoerter/`, `schule/`)
og 3 er `dw-soon`-plassholdere (Gaming & Internet, Alltagssituationen, Gleiches
Wort andere Welt) som venter på fremtidige runder. **Alltagssprache**
kombinerer to av de opprinnelige idétemaene (hverdagsuttrykk +
"Was bedeutet das?") til én side, med en egen `.dw-pair`-sammenligning av
Schulbuch-Deutsch mot Alltags-Deutsch og en gjett-betydningen-quiz
(samme spillmotor som resten av nettstedet). **Chat & Social Media**
gjenbruker chat-boble-designet fra `schreiben/sms-chat/`, men her er
meldingene fra "Mia" faste (ikke redigerbare) og eleven skriver bare SIN
EGEN respons — motsatt av SMS-Chat, der eleven skriver begge sider selv.
**Jugendwörter** er en håndplukket ordliste (ikke bundet til et bestemt
års offisielle "Jugendwort des Jahres", siden den listen endrer seg hvert
år) med en liten testquiz til slutt. **Jugend & Schule** sammenligner
skolehverdagen i Tyskland (særlig det motsatte karaktersystemet — 1 er
best i Tyskland, 6 er best i Norge og i tysktalende Sveits!) med Norge.
Dypere Tyskland/Østerrike/Sveits-sammenligninger er bevisst spart til den
fremtidige "Gleiches Wort, andere Welt"-siden i stedet for å blandes inn
her.

**Om Sprechen-seksjonen:** `sprechen/` gikk denne runden fra én
enkeltside (`cafe/`) til en hub med fem samtalesituasjoner — `cafe/`,
`restaurant/`, `butikken/`, `hotell/` og `taxi/` — alle bygget med samme
forgrenede dialog-motor (`dwNodes`) som den opprinnelige Café-siden: en
NPC (kellner/servitør/selger/resepsjonist/sjåfør) stiller spørsmål,
eleven velger blant 2–3 svaralternativer, og valgene (drikke/mat/
størrelse/rom/reisemål) bygges opp i `dwState` og oppsummeres i en
poengsum/pris til slutt, med et avsluttende muntlig opptaksoppdrag.
**Im Restaurant** legger til et ekstra forgreningssteg (valgfri dessert)
sammenlignet med Café. **Im Kleidungsgeschäft** har en egen "jeg bare
ser meg om"-gren som leder til en kort, annerledes avslutning i stedet
for kjøp. **An der Rezeption** lar eleven velge romtype og eventuelt
frokost, med pris som legges sammen. **Im Taxi** bruker reisemål til å
sette både pris og reisetid. Fordi `sprechen/` nå er en hub, måtte
navigasjonsmenyen oppdateres i alle øvrige HTML-filer (bytte lenke/
etikett fra `sprechen/cafe/`/☕ Café til `sprechen/`/🗣️ Sprechen), og
`sprechen/cafe/index.html` selv fikk brødsmulesti og "aktiv hub"-lenke
lagt til, akkurat som andre hub-barn (se `grammatikk/artikler/nominativ/` for
samme mønster). Søkeindeksen ble også ryddet opp i: nøklene "restaurant"
og "essen bestellen" pekte tidligere feilaktig til Café-siden (fra før
Restaurant fantes som egen side) og er nå flyttet til den nye
Restaurant-siden.

**Om Geschichte-utvidelsen:** `geschichte/` fikk to nye historietema ved
siden av Berlinmuren, begge bygget etter samme mal (`dwTimeline` med
klikkbare årstall, en lesetekst, "Denk nach"-spørsmål, en muntlig
diskusjonsoppgave, en skriveoppgave med tekstfelt, og en poengsatt quiz).
**Deutsches Kaiserreich** (1871–1918) dekker rikssamlingen under Wilhelm I.
og Bismarck, "Dreikaiserjahr" 1888, Bismarcks avskjed 1890, og slutten i
1918 — med en muntlig oppgave som knytter det historiske keiserdømmet til
dagens Norge (også et monarki, men et demokratisk et). **Zweiter
Weltkrieg** (1939–1945) er bevisst skrevet med et norsk perspektiv:
lesetekst-dagboken er fra 9. april 1940 (den tyske invasjonen av Norge,
ikke et tysk ståsted), og tidslinjen har en egen norsk vinkling
(okkupasjonen, kong Haakon VIIs flukt og retur). Holocaust er nevnt i en
egen, kort faktaboks («🕯️ Wichtig zu wissen») — faktabasert og uten
grafiske detaljer, slik det gjøres i norske lærebøker for ungdomsskolen,
med en tydelig NB-merknad i timeline-seksjonen om at temaet er alvorlig.
Begge sidene er hub-barn av `geschichte/` (ingen endring i toppnavigasjonen
var nødvendig, siden Geschichte allerede lå der) — kun `geschichte/
index.html` og forsidens kort/søkeindeks måtte oppdateres.

**Om Städte-utvidelsen (Zürich, Hamburg, München, Köln, Frankfurt + Berühmte
Personen):** `staedte/` gikk fra 2 byer til 7, alle bygget etter nøyaktig
samme mal som Berlin/Wien (posisjon, folketall, «Was ist typisch?»,
severdigheter, aktiviteter, mat, historie, ordforråd, budsjett-oppdrag,
skriveoppgave og quiz). Samtidig fikk ALLE 7 byer (også Berlin og Wien, med
tilbakevirkende kraft, som Teach ba om) en ny seksjon: **🌟 Berühmte
Personen**, et lite kortgalleri (`.dw-people-grid`/`.dw-person-card`, samme
CSS/emoji-mønster som resten av nettstedet — ingen eksterne bilder) med
2–3 personer per by. Alle fakta (fødeby/-år, eller en tydelig «bodde/
arbeidet der»-tilknytning for de som ikke er født i byen, som Carl Gustav
Jung i Zürich eller David Bowie i Berlin) ble verifisert med websøk før
publisering, i tråd med samme prinsipp som video-ID-verifiseringen i
Filme & Serien-runden — ingen navn eller årstall er gjettet. To bevisste
valg ble tatt for å holde innholdet aldersriktig: (1) ingen alkoholholdige
drikker (Kölsch i Köln, Apfelwein i Frankfurt) ble lagt inn som
budsjett-oppdragets kjøpbare/spiselige valg, selv om de nevnes som
kulturfakta i løpende tekst; (2) **Zürich** har et eget avvik i
budsjett-skriptet: siden Sveits ikke bruker euro, har `dwItems`/
`dwUpdateBudget()` en `dwCurrency`-variabel (satt til `"CHF"`) som settes
inn i stedet for det hardkodede €-tegnet de andre byene bruker — med en
egen merknad i oppdragsteksten om at Sveits har sin egen valuta. Søkeindeksen
fikk 6 nye oppføringer (5 byer + en generisk «städte»-fangst), og en
utdatert kollisjon ble samtidig ryddet opp: nøklene «zürich» og «schweiz» lå
fra før i Reise-seksjonens generiske oppføring (fra før Zürich hadde egen
side) og pekte dermed feil — de er nå fjernet derfra siden Zürich har sin
egen dedikerte side.

**Om Lesen-utvidelsen (flash fiction + ekte litteratur):** Teach ba om at
`lesen/` skulle utvides, og åpnet selv for to muligheter: ekte, autentiske
flash fiction-tekster hvis mulig, ellers selvskrevne. Løsningen ble begge
deler. `lesen/` gikk fra 2 til 6 tekster og fikk en ny hub-inndeling i tre
grupper: **🔍 Lies wie ein Detektiv** (nå tre mysterier — den planlagte
«Der verlorene Rucksack»-plassholderen ble bygget ut, med samme
Wer/Wo/Wann/Was passiert-mal som «Wer hat den Kuchen gegessen?», denne
gangen om en forbyttet ryggsekk i garderoben — ingen tyveri, bare en
uskyldig forveksling, bevisst valgt for å holde tonen aldersriktig),
**⚡ Flash Fiction** (to helt nye, selvskrevne A1-tekster, «Der
Regenschirm» og «Die SMS», begge med en liten overraskelse på slutten og
en egen refleksjonsboks «🎭 Was ist der Twist?» der eleven velger hvilken
forklaring som stemmer) og **📜 Echte deutsche Literatur** (en
bonusside med to ekte, ordrette tekster av Franz Kafka — «Kleine Fabel»
og «Gibs auf!»). Ekte litteratur på ekte A1-nivå finnes strengt tatt ikke
(selv Kafkas aller korteste tekster bruker mer avansert grammatikk og
ordforråd enn 8. trinn har lært), så disse to ble valgt fordi de er
ekstremt korte, svært kjente og trygt gemeinfrie: Kafka døde 1924, og
etter 70-års-regelen i Tyskland/EU falt verkene hans i det fri 1. januar
1995. Siden er derfor bevisst bygget som en frivillig «smak på ekte
tekst»-opplevelse, ikke en vanlig øvingsside: en tydelig innledningsboks
sier rett ut at eleven ikke vil forstå hvert ord, og at målet er
hovedideen, ikke ordrett oversettelse. Hver tekst har en skjult norsk
oversettelse (`.dw-translation`/`dwToggle()`, vis/skjul-knapp) som er
tydelig merket som en uoffisiell oversettelse laget for nettstedet, ikke
en offisiell utgivelse. Søkeindeksen fikk 4 nye spesifikke oppføringer
(én per ny side, plassert før den generiske «lesen»-fangsten, samme
rekkefølgesprinsipp som i Städte/Geschichte-rundene) — nøkkelordet «sms»
alene ble bevisst UNNGÅTT for den nye siden (siden det allerede peker til
`schreiben/`), til fordel for mer spesifikke ord som «zahlendreher» og
«geheimnisvolle nachricht».

**Om Schreiben-utvidelsen (fem nye skriverammer):** Teach ba om å utvide
Schreiben med fem konkrete, navngitte skrivetemaer (Personbeskrivelse,
Presentasjon, By/plass, Mein Tag, Wo ist was?), og ønsket eksplisitt
skriverammer med setningsstartere OG grammatikk-tips — «hva en må passe
på i forhold til grammatiske ting». Claude stilte to avklaringsspørsmål
først (AskUserQuestion): (1) om «presentasjon» betydde å presentere seg
selv, eller å bygge opp en presentasjon om et valgfritt tema — Teach
valgte det siste; (2) om alle fem skulle bygges nå, eller færre av
gangen — Teach valgte alle fem. `schreiben/` gikk fra 2 til 7 bygde sider
(pluss den uendrede «Postkarte aus Berlin»-plassholderen). Alle fem
gjenbruker samme skriveramme-motor som `reise/reisetagebuch/`
(`dwStarters`-klikkbare chips per tekstfelt, ordtelling, kopier-knapp,
`dwCheckItems`-egenvurdering), men fikk i tillegg et helt nytt,
gjenbrukbart element denne runden: en **alltid synlig**
`.dw-grammar`-boks (til forskjell fra den skjulte/valgfrie
`.dw-phrases`-boksen) med konkrete, elevrettede advarsler om typiske
feil for akkurat det temaet:
   - **Personenbeschreibung** — adjektiv uten endelse etter «sein», men
     MED endelse foran substantiv (attributivt), og «hat blaue Augen»-
     mønsteret.
   - **Eine Präsentation halten** — verb-på-plass-2-regelen når setningen
     starter med «Zuerst/Dann/Zum Schluss», og modalverb+infinitiv til
     slutt.
   - **Einen Ort beschreiben** — «es gibt» + Akkusativ, «man kann» +
     infinitiv til slutt, og weil-setninger med verbet helt til slutt.
   - **Mein Tag** — trennbare Verben (aufstehen → «Ich stehe … auf»), en
     kjent fallgruve for nybegynnere, pluss «um … Uhr» / «am …».
   - **Wo ist was?** — stedspreposisjoner (Wechselpräpositionen) med
     Dativ for Wo?-spørsmål, støttet av en egen kompakt referansetabell
     (`.dw-table`, ny CSS-klasse denne runden) siden en fullverdig
     Dativ-grammatikkside ikke er bygget ennå (den nevnte tabellen dekker
     kun det eleven trenger for akkurat denne oppgaven, ikke hele
     kasuset). Søkeindeksen fikk 5 nye spesifikke oppføringer (plassert
     før den generiske «schreiben»-fangsten), uten kollisjoner med
     eksisterende nøkler (dobbeltsjekket bl.a. at «mein tag» ikke krysser
     «tagebuch»-nøkkelet fra Reisetagebuch).

**Om 9.–10. trinn-nivået (`fortgeschritten/`):** Teach spurte hvordan
nettstedet mest sømløst kunne differensiere for høyere nivå (9./10. trinn,
A2/B1) uten å bygge et helt parallelt nettsted. Claude la fram en hybrid-
løsning og avklarte to arkitekturvalg med AskUserQuestion før bygging: (1)
samlingspunktet skulle være et eget punkt i toppmenyen (🎓 9.–10. trinn),
ikke bare en seksjon på forsiden eller noe som utsettes — Teach valgte
toppmeny; (2) merket på kortene skulle si «9.–10. trinn» (trinnbasert),
ikke CEFR-nivå «A2/B1» eller begge deler — Teach valgte trinnbasert.
Prinsippet: **selve innholdet bor i sin naturlige hjemme-hub** (pedagogisk
sømløst — eleven ser progresjonen i sammenheng, f.eks. Dativ rett etter
Akkusativ i `grammatikk/artikler/`), **men lenkes i tillegg samlet** i
`fortgeschritten/index.html`, en «hub av huber» merket med den nye
`.dw-level-tag`-CSS-klassen (definert i `assets/style.css`, blå kapsel —
brukes både som en liten merkelapp på kort og inline i brødsmulestien).
Piloten for hele mønsteret er **Der Dativ-Kompass**
(`grammatikk/artikler/dativ/`), bygget med nøyaktig samme spillmotor som
Nominativ/Akkusativ, men med tre svaralternativer i stedet for to — «den»
er tatt med som en bevisst distraktor, siden Akkusativ/Dativ-forveksling
(den vs. dem) er en kjent fallgruve når elever lærer Dativ rett etter
Akkusativ. `fortgeschritten/index.html` har foreløpig ett bygget kort
(Dativ) og tre `dw-soon`-plassholdere som viser veien videre
(Wechselpräpositionen, Perfekt — haben oder sein?, Nebensätze: weil &
dass) — samme «kommer snart»-mønster som resten av nettstedet bruker for
planlagt, ikke-bygget innhold. Søkeindeksen i `index.html` fikk to nye
oppføringer: én spesifikk for Dativ (plassert før den generiske
«grammatikk»-fangsten) og én generisk for selve 9.–10. trinn-huben
(nøkler som «fortgeschritten», «avansert», «a2 b1») — begge uten
kollisjoner med eksisterende nøkler ved full gjennomgang.

**Om Das Substantiv-ABC (kjønn, artikkel i alle kasus, plural):** Teach ba
om en side som forklarer substantiv-kjønn, bestemt/ubestemt artikkel i
Nominativ/Akkusativ/Dativ og pluralformer, gjerne med huskeregler og
eksempler. Claude stilte to avklaringsspørsmål (AskUserQuestion) før
bygging: (1) én samlet side eller to separate — Teach valgte én samlet
side, siden temaene henger tett sammen; (2) ren oppslagsside eller med
øvingsdel — Teach valgte forklaring + øvingsspill. Siden ligger derfor
bevisst FØRST i Grammatik-huben (før Nominativ), siden dette er grunnlaget
de andre grammatikkspillene bygger videre på — ikke merket 9.–10. trinn,
selv om artikkel-tabellen også viser Dativ, fordi hoveddelen (kjønn,
Nominativ/Akkusativ, plural) er kjernestoff for alle trinn. Siden har fire
referanseseksjoner øverst (`.dw-rule`/`.dw-section`): en kort «hvorfor
kjønn»-intro, en tre-kolonners huskeregel-oversikt for der/die/das (endelser
som -ung/-heit/-keit → die, -chen/-lein → das ALLTID uansett betydning,
-er for yrker → der, osv.), en tabell for bestemt artikkel i alle tre
kasus, en tilsvarende for ubestemt artikkel, og en tabell over de fem
vanligste pluralmønstrene (-e, -er, -(e)n, -s, ingen endelse — alle med
notat om når Umlaut er vanlig). Selve øvingsspillet (`dwQuiz`, 18
oppgaver) er en generalisert versjon av spillmotoren fra
Nominativ/Akkusativ/Dativ: hvert element har en `type`
(`genus`/`kasus`/`plural`) som styrer hvordan `dwLoad()` bygger setningen
og svaralternativene, i stedet for én fast setningsmal. En liten gul
`.dw-qtype`-etikett øverst i hver oppgave viser eleven hva som testes
(Kjønn / Nominativ / Akkusativ / Dativ / Ubestemt · Nominativ / Pluralis).
Dette generaliserte mønsteret (`dwQuiz` med `type`-felt) bør gjenbrukes
hvis en fremtidig side trenger å blande flere spørsmålstyper i ett spill.
Søkeindeksen fikk én ny oppføring (plassert før den generiske
«nominativ»-fangsten, siden dette temaet logisk kommer aller først), uten
kollisjoner ved full gjennomgang.

**Om Wortschatz der Woche (500 høyfrekvente ord, ukentlig rulletekst):**
Teach lastet opp en docx med 500 høyfrekvente tyske ord og spurte om ordene
kunne deles opp i f.eks. 10 i uken, blandet i forhold til bokstavrekkefølge
(ikke slik dokumentet selv var ordnet), og om ordene kunne vises som en
rulletekst på forsiden og/eller som en egen del i huben. Claude stilte tre
avklaringsspørsmål (AskUserQuestion) før bygging: (1) plassering — kun
rulletekst, kun egen side, eller begge deler — Teach valgte begge deler; (2)
hvordan uken skal styres — automatisk etter dagens dato, eller et manuelt
valg — Teach valgte automatisk; (3) hva den egne siden skal inneholde — ren
ordliste, eller ordliste + øvingsspill — Teach valgte begge deler.
Docx-filen viste seg å inneholde noen få duplikater og uklarheter ved
nærmere uttrekking (bl.a. et par ord som "Leben"/"leben" og "Weg"/"weg" som
kun skiller seg på store/små bokstaver og betyr helt forskjellige ting —
substantiv vs. verb/adverb), så ordene ble hentet ut ord-for-ord fra
docx-ens 50 «10 ord per side»-tabeller (ikke fra dokumentets egen
oppsummeringstabell til slutt, som viste seg å mangle noen få ord) og
kvalitetssjekket for duplikater med store/små bokstaver bevart. Resultatet
er **498 unike ord** (ærlig oppgitt som 498, ikke avrundet til 500) —
Uke 50 har derfor 9 ord i stedet for 10. Ordene ble deretter sortert
alfabetisk (med riktig tysk sortering: ä/ö/ü/ß behandlet som a/o/u/ss) og
fordelt på 50 uker med et «hvert 50.-ord»-mønster (ord nr. 0, 50, 100, …
havner alle i uke 1, ord nr. 1, 51, 101, … i uke 2, osv.) — dette sprer
hver ukes 10 ord jevnt utover HELE alfabetet i stedet for å klumpe dem
sammen etter forbokstav, akkurat slik Teach ba om. Fordelingen er bevisst
deterministisk (ikke tilfeldig hver gang) slik at «Uke 12» alltid viser de
samme ordene, uansett når eller på hvilken enhet man besøker siden.
**Hvilken uke som vises bestemmes automatisk av dagens dato**
(`dwCurrentWeek()`): mandag 21. september 2026 er satt som Uke 1, og
telleren går videre én uke for hver mandag som passerer — etter Uke 50
starter den automatisk på Uke 1 igjen, slik at funksjonen aldri "går tom".
**Forsidens rulletekst** (`.dw-ticker`, ren CSS-animasjon med
`@keyframes`, pause on hover) viser ukens 10 ord i en løkke rett under
søkefeltet på `index.html`, med en lenke videre til hele oversikten.
**Den egne siden** (`grammatikk/wortschatz-woche/`) har en fargekodet
ordklasse-forklaring (substantiv/verb/adjektiv/adverb/preposisjon/
konjunksjon/pronomen/artikkel/tall/interjeksjon), en ukevelger (50 valg,
med antall ord per uke) og en "Gå til denne uken"-knapp, en ordliste for
valgt uke, og et øvingsspill som bygges dynamisk for akkurat den uken som
er valgt. Dette er et nytt spillmønster: i stedet for hånd-skrevne
svaralternativer per spørsmål (som alle tidligere spill på nettstedet
bruker), trekkes de to feilalternativene tilfeldig fra HELE 498-ords-poolen
for hvert spørsmål (`dwBuildQuiz()`), siden en fast alternativ-liste ikke
gir mening når hvilke 10 ord som spørres om endrer seg med uken/datoen.
Fordi det ikke finnes noen delt/ekstern JS-fil på nettstedet (se prinsippet
under «Design»), er hele 498-ords-datasettet (`dwWeeks`) bevisst lagt inn
BÅDE i `index.html` (for rulleteksten) og i
`grammatikk/wortschatz-woche/index.html` (for hele siden) — samme
duplisering som resten av nettstedet allerede gjør konsekvent for hver
enkelt sides egne data. Søkeindeksen fikk én ny oppføring — nøkkelordet
"wortschatz" (og "wortschatz-woche") ble bevisst UNNGÅTT, siden det tysk
sammensatte ordet skjuler substrengen "chat" (i "wort**schat**z"), som
allerede er en søkenøkkel for `schreiben/sms-chat/`. Nøklene ble i stedet
satt til «500 ord», «høyfrekvente ord», «ukens ord», «ordforråd» og «ord i
uken» — samme type substreng-kollisjon som ble oppdaget og rettet i
Schreiben-runden (der «beschreiben» skjulte «schreib»), nå bekreftet som et
gjentakende mønster å være obs på for sammensatte tyske ord generelt.

**Om Kleinstaaterei og Kalter Krieg (to nye historietema, ett av dem 9.–10. trinn):**
Teach ba om et nytt historietema om hvordan det var før Tyskland ble et samlet
land, gjerne med en forklaring på hvorfor det fortsatt finnes tyske adelsnavn
i dag, og et eget, litt mer avansert (10. klasse-nivå) tema om forskjellen
mellom Øst- og Vest-Tyskland under den kalde krigen. Claude avklarte tre valg
med AskUserQuestion før bygging: (1) to separate sider eller én kombinert —
Teach valgte to separate sider; (2) om Kalde krigen-siden skulle merkes og
lenkes fra `fortgeschritten/` som Dativ-siden — Teach valgte ja; (3) om
Kleinstaaterei-siden også skulle være avansert — Teach valgte vanlig
8. trinn-nivå. Begge sider bygger på samme grunnmønster som
`geschichte/kaiserreich/` (tidslinje, lesetekst, «Denk nach», muntlig
oppgave, skriveoppgave, quiz), plassert kronologisk FØRST i Geschichte-huben
(før Kaiserreich, siden temaet er «forhistorien» til 1871).

**Kleinstaaterei** (`geschichte/kleinstaaterei/`) dekker perioden fra Karl den
store (år 800) via Trettiårskrigen (1648, starten på selve
«Kleinstaaterei»-begrepet), Napoleons oppløsning av Det tysk-romerske riket
(1806) og Wienerkongressen (1815, «Deutscher Bund» med 39 stater), fram til
1871-lenken videre til Kaiserreich-siden. Lesedelen er en oppdiktet, men
realistisk reisedagbok fra en kjøpmann rundt år 1800 som møter tollgrenser og
ulike valutaer på en kort reise — konkretiserer hvorfor «Kleinstaaterei» var
upraktisk. En egen, ikke-quiz-basert faktaboks («👑 Warum gibt es heute noch
Adelstitel?») forklarer at adel mistet sine juridiske særretter i 1919 med
Weimar-grunnloven (Artikel 109), men at ord som «von», «zu», «Graf» og
«Freiherr» siden da bare er en helt vanlig del av etternavnet — med Bismarck
og den moderne politikeren Karl-Theodor Freiherr von und zu Guttenberg som
eksempler. Alle fakta (Weimar-grunnlovens artikkel 109, Guttenbergs fulle
navn) ble verifisert med websøk før publisering, i tråd med nettstedets
etablerte prinsipp om aldri å gjette fakta. En liten norsk kobling er lagt
inn i faktaboksen: Norge avskaffet sin adel enda tidligere, i 1821
(Grunnloven § 108).

**Kalter Krieg: Ost- und Westdeutschland** (`geschichte/kalter-krieg/`) er
det andre nye, mer avanserte 9.–10. trinn-temaet i `fortgeschritten/`
(sammen med Dativ). I stedet for bare tidslinje+lesetekst introduserer siden
et nytt element: en fargekodet **systemsammenligningstabell** (BRD i blått
vs. DDR i rødt — politikk, økonomi, reisefrihet, overvåking/Stasi,
forbruksvarer, alliansetilhørighet) og en **to-perspektiv-lesing** — to
korte, oppdiktede brev side om side fra en ungdom i Vest-Tyskland og en i
Øst-Tyskland i 1985, som konkretiserer forskjellene fra tabellen. Diskusjons-
oppgaven («Sprich») trekker inn en sammenligning med dagens Nord-/Sør-Korea
for å knytte temaet til verden i dag — en type dypere, analytisk kobling som
passer godt for 10. klasse-nivå. Siden dekker HELE delingsperioden
(1949–1990: BRD/DDR-grunnleggelsen, Mauerbau, Mauerfall, Wiedervereinigung)
uten å gjenta selve mur-historien i detalj, siden `geschichte/berliner-mauer/`
allerede dekker den spesifikt — de to sidene utfyller hverandre i stedet for
å overlappe. Merket med `.dw-level-tag` på kortet og i brødsmulestien, og
lenket inn i en ny «🕰️ Geschichte»-seksjon i `fortgeschritten/index.html`
(samme mønster som «🧩 Grammatik»-seksjonen der).

Søkeindeksen fikk to nye oppføringer (68 elementer totalt). Én ting å merke
seg: nøklene «ddr» og «wiedervereinigung» var allerede tatt av den eldre
Berliner Mauer-oppføringen (fra før Kalter Krieg-siden fantes), så de ble
bevisst IKKE brukt som nøkler for den nye, bredere Kalter Krieg-siden — i
stedet ble mer spesifikke nøkler valgt («kalter krieg», «geteiltes
deutschland», «ostdeutschland», «westdeutschland», «bundesrepublik», «brd»).
Full kollisjonsskann etter publisering fant nøyaktig de samme 7 permanente,
tidligere aksepterte kollisjonene — ingen nye.

**Om Grammatikk-restruktureringen (11 kategorier + Wortschatz for seg selv):**
Teach ba om at grammatikkdelen skulle deles inn i egne kategorier —
Artikler, Analyse, Adverbial, Adjektiv, Eiendomsord, Konjunksjoner,
Personlig pronomen, Preposisjoner, Spørreord, Tidsuttrykk og Verb — med de
7 ferdigbygde temaene plassert i riktig kategori, Wortschatz der Woche for
seg selv, Preposisjoner forhåndsdelt i Akkusativ-/Dativ-/Wechselpräpositionen
og Verb tydelig delt inn i verbtider. Claude avklarte ett valg med
AskUserQuestion før bygging: om de 7 eksisterende sidene skulle flyttes til
nye, nestede URL-er (litt arbeid, men riktig struktur videre) eller bli
liggende på sine gamle, flate adresser mens bare hub-siden ble omorganisert
visuelt — Teach valgte å flytte dem. `grammatikk/index.html` er nå selv en
hub-av-huber: 11 kategori-kort + ett eget Wortschatz-kort, der hver
kategori er sin egen hub-side med samme kortmønster, ett nivå dypere. De 7
ferdigbygde temaene flyttet slik: Substantiv-ABC, Nominativ, Akkusativ og
Dativ → `artikler/`; Der Satz-Detektiv → `analyse/`; Verben:
regelrette/uregelrette → `verb/` (omdøpt til `praesens-regelmaessig/` og
`praesens-unregelmaessig/`, siden Verb-kategorien nå rommer flere
verbtider — Perfekt, Präteritum, Plusquamperfekt, Futur I og Futur II som
`dw-soon`-plassholderkort, samme titler som allerede var lovet på
`fortgeschritten/` for Perfekt og Wechselpräpositionen). De 7 andre
kategoriene (Adverbial, Adjektiv, Eiendomsord, Konjunksjoner, Personlig
pronomen, Spørreord, Tidsuttrykk) har foreløpig bare `dw-soon`-kort med
konkrete, spesifikke temanavn (ikke generiske «kommer snart»-bokser) — klare
til å bli ekte sider etter samme oppskrift som før. Alle interne lenker ble
oppdatert: `fortgeschritten/index.html`s Dativ-kort, alle 7 flyttede sidenes
sti-dybde (`../../` → `../../../` i navigasjon og assets-lenke) og
brødsmulesti (nå tre ledd: Grammatik → Kategori → Tema), samt 7
søkeindeks-mål i `index.html`. 8 nye søkeindeks-oppføringer ble lagt til for
de nye kategoriene (nå 115 oppføringer totalt) — bevisst UTEN nøkkelordet
«adverbial» (inneholder substrengen «verb», som allerede var tatt) og uten
«mein dein sein» (inneholder «sein», allerede tatt av Verben-uregelrette-
siden), og uten «akkusativpräpositionen»/«dativpräpositionen»/
«präpositionen» (kolliderer med eksisterende «akkusativ»/«dativ»-nøkler og
med «wechselpräpositionen»/«ortspräpositionen» fra `schreiben/wo-ist-was/`)
— full kollisjonsskann etter publisering bekreftet at ingen av de 8 nye
oppføringene skygger for eller blir skygget av noen eksisterende oppføring.
Verifisert med Playwright: alle 12 kort på hovedhuben, brødsmulesti og
navigasjons-lenker på alle flyttede sider, at Dativ-spillet fortsatt
fungerer på sin nye adresse, og at søk på de nye kategoriene treffer riktig.

**Om Personlig pronomen (Nominativ, Akkusativ, Dativ som tre separate sider):**
Teach ba om å bygge ut Personlig pronomen-kategorien (Nominativ og
Akkusativ+Dativ), og spurte samtidig om det hadde vært lurt å dele
Akkusativ og Dativ i to separate deler i stedet for én kombinert side.
Claude avklarte dette med AskUserQuestion og anbefalte tre separate sider
— samme mønster som Artikler-kategorien allerede bruker (Nominativ/
Akkusativ/Dativ hver for seg, Dativ merket 9.–10. trinn) — og Teach valgte
det. Teach ba også uttrykkelig om en tydelig norsk forklaring på hva
personlige pronomen ER og HVORFOR de bøyes som de gjør på tysk, ikke bare
selve øvingsspillet.

Løsningen: `grammatikk/personlig-pronomen/nominativ/` har den fulle
forklaringen — at pronomen erstatter et substantiv/navn, og at FORMEN
bøyes etter kasus i tysk akkurat slik artiklene der/die/das gjør (der →
den/dem), bare med sine egne, ikke-avledede former — pluss en full
Nominativ-tabell (ich/du/er/sie/es/wir/ihr/sie/Sie). Akkusativ- og
Dativ-sidene viser tilbake til Nominativ-siden for helhetsforklaringen, og
har hver sin egen tabell og regelboks for akkurat sitt kasus (Akkusativ:
direkte objekt; Dativ: indirekte objekt, samme preposisjoner som allerede
er kjent fra `grammatikk/artikler/dativ/`, lenket derfra).

Spillmotoren er en variant av det vanlige Artikler-mønsteret, men med ETT
nytt element: **dynamiske svaralternativer per oppgave** (`w.choices`) i
stedet for faste HTML-knapper. Dette var nødvendig fordi flere
tysk-pronomen skrives helt likt uavhengig av kasus eller person — «sie»
er både «hun» OG «de» (Nominativ og Akkusativ), «ihr» er både «dere»
(Nominativ) OG «til henne» (Dativ), og «ihnen»/«Ihnen» skiller seg kun på
stor/liten forbokstav. Med faste knapper ville to identiske knappetekster
("sie" og "sie") havnet i samme oppgave uten at eleven kunne skille dem.
Løsningen: hvert ord-objekt har sitt eget, kuraterte `choices`-array (2–3
alternativer valgt for å unngå denne kollisjonen i akkurat den oppgaven),
og en egen setning med kontekst (f.eks. «___ ist meine Freundin.») som
gjør riktig svar utledbart fra sammenhengen — akkurat slik ekte tysk
fungerer. Automatisert Playwright-test sjekket eksplisitt at ingen
oppgave noensinne viser to knapper med identisk tekst.

Personlig pronomen-huben gikk fra to `dw-soon`-plassholdere til tre ekte
kort. `fortgeschritten/index.html` fikk et nytt, ekte kort for Dativ-siden
(ved siden av Der Dativ-Kompass). Søkeindeksen (nå 118 elementer) fikk tre
nye, spesifikke oppføringer («ich du er sie es» → Nominativ, «mich dich
ihn» → Akkusativ, «mir dir ihm» → Dativ), mens den generiske «personlig
pronomen»/«personlige pronomen» fortsatt peker til kategori-huben. Full
kollisjonsskann fant kun de samme 9 permanente, tidligere aksepterte
kollisjonene — ingen nye.

**Om Klassikere-runden (veldig avansert lesedel, fire gemeinfrie verker):**
Teach ba om en ny, veldig avansert del i Lesen med fire navngitte, lovlig
tilgjengelige klassiske verker — Die Verwandlung (Kafka), Der Sandmann
(E.T.A. Hoffmann), Der Schatz im Silbersee (Karl May) og Max und Moritz
(Wilhelm Busch) — pluss kapitteloppgaver. Claude avklarte to spørsmål med
AskUserQuestion: full tekst der det er praktisk mulig (fremfor bevisst
forkortede utdrag for alle fire — Teach ville ha mest mulig ekte tekst),
og om Karl May-teksten skulle ha en kort kontekstboks om tidstypiske
stereotypier (Teach svarte ja).

Alle fire forfattere har vært døde i over 70 år (Busch 1908, Hoffmann
1822, May 1912, Kafka 1924), så verkene er trygt gemeinfrie i hele EU/EØS.
Tekstene ble hentet **ordrett** — ikke omskrevet eller forenklet — fra
Project Gutenberg og projekt-gutenberg.org, kapittel for kapittel, med et
strengt prinsipp om at ingenting skulle dikte opp eller "fylle inn" tekst
som ikke faktisk var bekreftet original. Max und Moritz (alle 7 Streiche +
Vorwort + Ende) og Der Sandmann (alle 5 Abschnitte) ble hentet 100 %
komplett. Der Schatz im Silbersee er en roman på over 100 000 ord — for
lang til å ta med i sin helhet — så Teach sitt eget svar om "full tekst
der praktisk mulig" ble tolket dithen at nettopp denne romanen får fem
utvalgte, ordrette utdrag (kapittel 1, 9, 11 og 16) i stedet, tydelig
merket som utdrag med kildehenvisning per side.

**Die Verwandlung — delvis kildebegrensning (Dritter Teil):** Erster og
Zweiter Teil ble hentet 100 % ordrett og komplett. For Dritter Teil klarte
ikke uthentingen (via automatisert sidehenting) å få tak i mer enn de
første tre avsnittene før kilden brøt av midt i en setning — en teknisk
begrensning i verktøyet som ble brukt til uthenting, ikke en bevisst
forkorting. Fremfor å dikte opp resten (i strid med nettstedets
grunnprinsipp om aldri å fabrikere tekst som fremstilles som ekte), viser
`verwandlung/teil-3/index.html` de bekreftede, ordrette avsnittene, en
tydelig merket sammenbruddsboks (`.dw-gap-note`) som forklarer akkurat
hvor kilden tar slutt, et kort **sammendrag skrevet av Claude** (ikke
sitert som Kafka-tekst, og tydelig merket som sammendrag) av resten av
handlingen fram til Gregors død, og en lenke til en gratis, lovlig
kilde for elever som vil lese hele originalteksten selv.

**Karl May — kontekstboks om stereotypier:** `silbersee/index.html` har en
egen boks («💭 Til læreren og eleven: et viktig forbehold») som forklarer
at fremstillingen av urfolk i Nord-Amerika er preget av sin tid
(1890-tallet) og bygger på datidens klisjeer, ikke ekte kunnskap om
konkrete folkegrupper — skrevet som et nøytralt utgangspunkt for
klasseromsdiskusjon, ikke en advarsel som skremmer bort fra teksten. Noen
av kapittelsidene (særlig utdrag 3, bakholdsscenen) har i tillegg én kort,
nøytral setning i introduksjonen som minner om dette samme poenget.

**Sidestruktur:** hver av de fire verkene fikk sin egen verk-hub (kapittel-
oversikt) under en ny hub-av-huber, `lesen/klassikere/`, linket fra et nytt
kort i Lesen-huben («🏛️ Klassikere — for viderekomne»). Hver kapittel-/
delside følger samme mønster som Kafka-parabeln-siden (original tekst,
gloseliste, flervalgsquiz om innholdet, en refleksjons-/skriveoppgave), men
med norsk **kontekst i stedet for full oversettelse** — teksten er lengre
og mer avansert enn parablene, så målet er å orientere leseren i
handlingen, ikke oversette linje for linje. Max und Moritz-versene beholder
linjeskiftene sine (rim/vers-format med `<br>` i stedet for flytende
prosa-avsnitt) i stedet for å bli lagt om til prosa. Kapitlene er lenket
sammen med forrige/neste-navigasjon nederst på hver side. Søkeindeksen
fikk 5 nye oppføringer (huben + én per verk-hub) — ingen kollisjoner mot de
133 eksisterende nøklene.

Full verifisering: alle 20 kapittelsiders JavaScript sjekket med `node
--check` (0 feil), ingen `{{`/`}}`-rester fra malmotoren, stikkprøver
bekreftet at original-teksten i de ferdige HTML-sidene er tegn-for-tegn
identisk med kildefilene (bortsett fra nødvendig HTML-escaping av
&/</>), alle forrige/neste-kjeder verifisert programmatisk, og en
Playwright-gjennomgang av alle 25 nye sider fant 0 JavaScript-feil.

**Sprichwörter und Redewendungen (ny side under Deutsch im echten Leben):**
Teach sendte en egen liste på 30 tyske ordtak og faste uttrykk (med norsk
betydning + "når brukes det?"-forklaring for hvert) og ba om en ny del
under Deutsch im echten Leben, med en kort norsk forklaring på hva
Sprichwörter/Redewendungen er, og ba Claude komme med forslag til flere
hvis noe manglet. Tre valg ble avklart med AskUserQuestion før bygging:
(1) plassering som nytt søsterkort til `leben/jugendwoerter/` (ikke egen
toppnivå-seksjon), (2) et lite knippe nye tillegg fra Claude, tydelig
merket, (3) samme "referanseliste + quiz"-format som Jugendwörter (ikke
et matche-spill eller en ren referanseside uten quiz).

**Innhold:** Teachs 30 rader ble delt i 10 Sprichwörter og 20
Redewendungen; ett tydelig duplikat i den innsendte listen («Die Daumen
drücken» og «Jemandem die Daumen drücken», rad 16 og 29) ble slått sammen
til én oppføring siden det er nøyaktig samme uttrykk. Claude la til 8 nye
uttrykk (4 Sprichwörter, 4 Redewendungen) — velkjente, ikke duplikater av
noe annet på nettstedet — for å utfylle temaene, tydelig merket med en
«✨ nytt tillegg»-chip i gloselisten slik at Teach lett ser hva som var
hans egen liste og hva som er lagt til. Totalt 37 uttrykk (14 Sprichwörter
+ 23 Redewendungen).

**Sidestruktur:** `leben/sprichwoerter/index.html` følger nøyaktig samme
mønster som `leben/jugendwoerter/index.html` — en kort norsk forklaring
øverst på forskjellen mellom et Sprichwort (helt ordtak/leveregel) og en
Redewendung (idiomatisk uttrykk som ikke skal forstås bokstavelig), to
`.dw-word-grid`-gloselister (Sprichwörter og Redewendungen hver for seg,
med egen `<h3>`-undergruppe), og en interaktiv quiz nederst. Quizformatet
er tilpasset innholdet: siden uttrykkene er hele fraser (ikke enkeltord
som i Jugendwörter), viser quizen det tyske uttrykket og lar eleven velge
riktig norsk betydning blant tre alternativer — samme `dwQuiz`/`dwShuffle`/
`dwAnswer`-spillmotor som resten av nettstedet, bare med betydninger i
stedet for enkeltord som svaralternativer. 14 av de 37 uttrykkene inngår i
quizen (representativt utvalg fra begge grupper); feilsvarte alternativer
er alltid ekte betydninger hentet fra andre uttrykk på listen, ikke
oppdiktede distraktorer. `leben/index.html` fikk et nytt kort mellom
Jugendwörter og Jugend & Schule (leben-huben har nå 8 kort, 5 bygget ut),
og søkeindeksen fikk én ny oppføring — ingen kollisjoner mot de 134
eksisterende nøklene.

Full verifisering: siden sitt JavaScript sjekket med `node --check` (0
feil), programmatisk kontroll av at alle 14 quiz-fraser finnes ordrett i
gloselisten, 0 ødelagte lenker (22 lenker på selve siden, 2451 sjekket
nettstedbredt), og en Playwright-gjennomgang (åpne siden, svare på 3
quiz-spørsmål, sjekke at telleren går riktig fram) fant 0 JavaScript-feil.

**Fire nye byportretter: Salzburg, Innsbruck, Bern, Genf + landegruppering
i Städte-huben.** Teach ba om å bygge ut Städte-seksjonen med Salzburg,
Innsbruck, Bern, Genf og Zürich. Zürich fantes allerede fra før (bygget i
en tidligere runde) — Claude flagget dette via AskUserQuestion, og Teach
valgte å beholde den eksisterende Zürich-siden uendret og bare bygge de 4
nye byene. Teach ba i samme runde om å gruppere alle byene i egne
underkort for Deutschland/Österreich/Schweiz; Claude avklarte med
AskUserQuestion om dette skulle være ren visuell gruppering på samme side
(ingen URL-endringer) eller en full hub-av-huber-restrukturering (som
Grammatikk-runden, der de 7 eksisterende byene ville flyttet til nye,
dypere adresser og gamle lenker brutt) — Teach valgte ren visuell
gruppering, altså ingen brutte lenker.

**Innhold i de fire nye byportrettene:** hver side følger nøyaktig samme
mal som de 7 eksisterende (samme seksjoner: Wo liegt/Wie viele
Menschen/Was ist typisch/Was kann man sehen/machen/essen/Geschichte/
Berühmte Personen/Wortschatz/budsjettoppdrag/quiz). Salzburg og Innsbruck
er kopiert fra Wien-malen (Østerrike, € som budsjettvaluta); Bern og Genf
er kopiert fra Zürich-malen (Sveits, CHF som budsjettvaluta, med samme
tydelige CHF-merknad øverst i filen som Zürich har). Hver by har 3
berømte personer med ekte, verifiserbare fakta (fødested/år eller en klar
bodde/arbeidet-der-tilknytning) — Salzburg: Mozart, Herbert von Karajan,
Christian Doppler; Innsbruck: Kaiser Maximilian I., Andreas Hofer,
Erzherzog Ferdinand II.; Bern: Albert Einstein (utviklet relativitets-
teorien mens han jobbet på patentkontoret i Bern), Paul Klee, Adrian von
Bubenberg; Genf: Jean-Jacques Rousseau, Johannes Calvin, Henry Dunant
(grunnla Røde Kors). **Genf-siden har en egen tydelig merknad** om at
byen er fransktalende, ikke tysktalende — et bevisst pedagogisk poeng om
at Sveits har fire landsspråk, ikke bare tysk (samme idé som CHF-
merknaden på Zürich/Bern-sidene, bare for språk i stedet for valuta).

**Landegruppering i Städte-huben:** `staedte/index.html` er delt i tre
visuelle seksjoner med landeoverskrifter (🇩🇪 Deutschland: Berlin,
Hamburg, München, Köln, Frankfurt · 🇦🇹 Österreich: Wien, Salzburg,
Innsbruck · 🇨🇭 Schweiz: Zürich, Bern, Genf) — samme `.dw-grid`-kort-
mønster som før, bare gruppert under en ny `.dw-country-h2`-overskrift
per land. Ingen filer er flyttet, så alle 7 eksisterende byadresser
(`staedte/berlin/` osv.) fortsetter å virke akkurat som før. Søkeindeksen
fikk 4 nye oppføringer (én per ny by) — ingen kollisjoner mot de 138
eksisterende nøklene; Salzburg fikk bevisst IKKE nøkkelen «mozart» (den
er allerede brukt av Wien-oppføringen), men mer spesifikke nøkler som
«mozarts geburtshaus» og «salzburger festspiele» i stedet.

Full verifisering: alle 4 nye sider sitt JavaScript sjekket med `node
--check` (0 feil), 0 ødelagte lenker (2527 sjekket nettstedbredt), en
Playwright-gjennomgang av alle 4 nye byportretter + den restrukturerte
Städte-huben fant 0 JavaScript-feil, og en funksjonstest bekreftet at
budsjettoppdraget regner riktig i både € (Salzburg) og CHF (Bern). Én
feil ble oppdaget og rettet under egenverifisering før levering: Genf-
sidens ordforrådskort for «französischsprachig» hadde tysk og norsk i
feil rekkefølge (norsk fett, tysk i stedet for omvendt) — rettet til
samme mønster som resten av ordforrådskortene på nettstedet.

**Perfekt — haben oder sein? (nytt verbtema, 9.–10. trinn).** Teach ba om
å bygge ut Verb-kategorien med Perfekt, og ga en detaljert liste over
hvilke regler siden måtte dekke: (1) ge+stamme+t for svake verb, (2)
ge+stamme (mulig Umlaut)+en for sterke verb, (3) når/hvorfor haben eller
sein brukes som hjelpeverb, med forklaring om at disse selv bøyes i
presens, (4) ordstilling sammenlignet med norsk, og (5) verb som er unntak
fra å få ge- foran seg. I tillegg ba Teach om egne øvingsoppgaver for
svake verb, sterke verb (særlig høyfrekvente) og hjelpeverb-bruk hver for
seg. Dette var allerede planlagt i nettstedets egen veikart — både
`grammatikk/verb/index.html` og `fortgeschritten/index.html` hadde en
`dw-soon`-plassholder med nøyaktig tittelen «Perfekt — haben oder sein?»,
begge nå erstattet med ekte lenker til den nye siden.

**Sidestruktur:** `grammatikk/verb/perfekt/index.html` følger samme
`.dw-rule`/`.dw-section`-referansemønster som `grammatikk/artikler/
substantiv-abc/` og `grammatikk/artikler/dativ/` — seks regelseksjoner
øverst (Perfekt generelt, svake verb med tabell og -et-unntaket for
stammer på -t/-d, sterke verb med tabell + en utvidet referanseliste over
10 høyfrekvente sterke verb, haben/sein med full presens-bøyingstabell for
begge pluss en tre-kolonners oversikt over når sein brukes — bevegelse A
til B, tilstandsendring, faste unntak som *sein* og *bleiben* — ordstilling
med tysk/norsk-sammenligning + en kort bonusmerknad om Nebensatz-
rekkefølge, og til slutt en tre-kolonners oversikt over verb uten ge-:
uatskillelige forstavelser be-/ge-/er-/ver-/zer-/ent-/emp-/miss-, verb på
-ieren, og en tydeliggjøring om at atskillelige verb som *aufstehen* IKKE
er et unntak — de får fortsatt ge-, bare midt i ordet).

**Øvingsdelen** er ett kombinert `dwQuiz`-array (samme spillmotor som
Substantiv-ABC, med et `label`-felt som viser hvilken øvelse man er i),
men bygget som tre faste blokker etter hverandre — 6 svake verb, 7 sterke
verb, 7 haben/sein-oppgaver (20 totalt) — der hver blokk shuffles internt
med `dwShuffle()`, men blokk-rekkefølgen i seg selv aldri endres, slik at
det oppleves som tre atskilte øvelser slik Teach ba om, ikke ett tilfeldig
blandet spill. Svake/sterke-oppgavene viser en setning med luke + verbets
infinitiv, og distraktorene er bevisst valgt pedagogisk (f.eks. presens-
formen som feil svar — «isst» i stedet for «gegessen» — for å synliggjøre
forskjellen mellom presens og Partizip II). haben/sein-oppgavene bruker
konsekvent «ich» som subjekt og lar eleven velge «habe» eller «bin».
Søkeindeksen fikk én ny oppføring — ingen kollisjoner mot de 138
eksisterende nøklene (bevisst unngått «haben»/«sein» som nøkler siden de
allerede peker til Presens-siden for uregelrette verb).

**Feil oppdaget og rettet under egenverifisering:** i alle 20
spørsmålene lå det riktige svaret alltid som FØRSTE valg i `choices`-
arrayet — det ville gjort quizen løsbar ved bare å klikke første knapp
hver gang, uten å faktisk kunne stoffet. Rettet ved å shuffle
`it.choices` i selve rendring-funksjonen (`dwLoad()`), verifisert
programmatisk med en headless kjøring av spillmotoren (alle 20 `correct`-
verdier bekreftet å faktisk finnes i sitt eget `choices`-array, ingen
duplikater) og med en Playwright-gjennomgang som klikket «første knapp»
gjennom alle 20 oppgavene og bekreftet at resultatet ikke lenger ble
20/20 automatisk.

Full verifisering: `node --check` (0 feil), 0 ødelagte lenker (2549
sjekket nettstedbredt), og en Playwright-funksjonstest som fullførte alle
20 oppgavene og bekreftet riktig blokk-rekkefølge (svak → sterk →
hjelpeverb) fant 0 JavaScript-feil.

**Akkusativ-, Dativ- og Wechselpräpositionen (tre nye preposisjonssider).**
Teach ba om å bygge ut alle tre kasus-preposisjon-temaene på én gang, med
«veldig gode og tydelige forklaringer» av bruk og kasus-effekt, variert
øving, og — spesifikt for Wechselpräpositionen — egne illustrasjoner per
preposisjon (eksempel gitt: «über = bilde av en lampe over et bord»). Alle
tre var allerede planlagt som `dw-soon`-plassholdere i
`grammatikk/preposisjoner/index.html`; kun Wechselpräpositionen var merket
🎓 9.–10. trinn (Akkusativ-/Dativpräpositionen er grunnleggende A1-stoff).

**Akkusativpräpositionen** (`grammatikk/preposisjoner/akkusativ/`): durch/
für/gegen/ohne/um — fast akkusativ uansett sammenheng. Referanseseksjoner:
hva en akkusativpreposisjon er, de fem + et huskerim, effekt på artikkelen
(krysslenket til `grammatikk/artikler/akkusativ/`), og en eksempeltabell
inkl. bonusbetydninger (um = klokkeslett, gegen = omtrentlig tid). 16
spørsmål i to bolker: artikkelbøying etter fast preposisjon, og valg av
riktig preposisjon ut fra betydning.

**Dativpräpositionen** (`grammatikk/preposisjoner/dativ/`): aus/bei/mit/
nach/seit/von/zu — fast dativ uansett sammenheng. Samme mønster, pluss to
ekstra referanseseksjoner: sammentrekninger (beim/vom/zum/zur) og en egen
fella-forklaring nach vs. zu (by/land uten artikkel vs. person/sted med
artikkel). Artikkeltabellen fremhever flertall+n-fella spesifikt (die
Kinder → den Kindern), krysslenket til `grammatikk/artikler/dativ/`. 16
spørsmål i samme to-bolk-struktur som Akkusativpräpositionen.

**Wechselpräpositionen** (`grammatikk/preposisjoner/wechsel/`, 🎓 9.–10.
trinn): an/auf/hinter/in/neben/über/unter/vor/zwischen — kan styre både
dativ og akkusativ avhengig av Wo? (plassering → Dativ) vs. Wohin?
(bevegelse til nytt sted → Akkusativ). Regelseksjoner: konseptet Wo?/
Wohin? med minimalpar (nøyaktig Teachs eget über-eksempel: lampe over
bord, statisk vs. bevegelse), de ni + betydninger, en illustrert
9-korts galleri (se eget avsnitt under), liggen/legen-type verbpar som
avslører Wo? vs. Wohin?, og en konsolidert artikkeltabell med
sammentrekninger (am/ans/im/ins). 18 spørsmål i to bolker: fem Wo?/
Wohin?-minimalpar (10 oppgaver) og valg av riktig preposisjon ut fra
betydning (8 oppgaver).

**Illustrasjonene** — Teachs eksplisitte ønske — er egne inline-SVG-
diagrammer, ikke bilder eller emoji: ni konsistente scener i samme
husholdnings-/gate-tema (bord, vegg, stol, boks, hus, bil, tre), bygget
programmatisk med `scratchpad/wechsel/build_illustrations.py` (gjenbrukbare
form-funksjoner: `table_shape`, `wall_shape`, `chair_shape`, `cat_shape`,
`box_shape`, `lamp_shape`, `house_shape`, `car_shape`, `tree_shape`, osv.)
og limt inn i siden av `scratchpad/wechsel/build_page.py`. Fargespråket
bruker sidens egne CSS-variabler direkte i SVG-en (`fill="var(--dw-accent)"`
osv.), slik at illustrasjonene automatisk følger designsystemet. Under
egenverifisering ble «hinter»-illustrasjonen (katt bak stol) oppdaget å se
ut som «neben» — katten sto bare ved siden av stolen i stedet for skjult
bak den; rettet ved å tegne katten FØR stolen og overlappe dem, slik at
stolen delvis dekker katten (bare ørene/litt av hodet stikker synlig opp),
verifisert på nytt med en ny skjermdump.

**Søkeindeksen** fikk tre nye oppføringer. Én reell feil ble oppdaget og
rettet her: siden søkefunksjonen matcher på delstreng begge veier
(`q.indexOf(k)!==-1 || k.indexOf(q)!==-1`), ville søk på det fulle
sidenavnet «akkusativpräpositionen» eller «dativpräpositionen» havne på de
ELDRE `grammatikk/artikler/akkusativ/`- og `.../dativ/`-sidene i stedet,
fordi «akkusativ»/«dativ» alene er en delstreng av de nye nøklene og disse
eldre oppføringene står tidligere i `dwIndex`-arrayet (`.find()` returnerer
første treff). Rettet ved å endre `dwSearch()` til å foretrekke et EKSAKT
nøkkeltreff før den faller tilbake til delstreng-søk — en generell
forbedring som ikke endrer oppførselen for noen eksisterende søk (verifisert
med en full regresjonstest av søk på «berlin», «perfekt», «café»,
«akkusativ», «dativ» osv., alle uendret).

Koblet opp: alle tre `dw-soon`-kort i `grammatikk/preposisjoner/index.html`
erstattet med ekte lenker, Wechselpräpositionen lagt til i
`fortgeschritten/index.html` (`.dw-from`-mønster), og
`schreiben/wo-ist-was/index.html` (en eksisterende, enklere Wo?+Dativ-
skriveramme) fikk en kryssenke til den nye, fullverdige
Wechselpräpositionen-siden i sin referansetabell.

Full verifisering: `node --check` på alle tre nye sider (0 feil), en
programmatisk kontroll av all quiz-data (ingen manglende `correct`-verdier,
ingen duplikate `choices`, 16+16+18 = 50 spørsmål totalt), 0 ødelagte
lenker, og en Playwright-funksjonstest kjørt via en lokal HTTP-server (ikke
`file://`, som ikke løser mappe-URL-er til `index.html` slik GitHub Pages
gjør): full klikk-gjennom-navigasjon mellom alle tre nye sider, kryss-
lenkene til Akkusativ-Jagd/Dativ-Kompass, fortgeschritten-huben og søket —
samt to fulle quiz-kjøringer per side, én som klikket «alltid første knapp»
(bekreftet at ingen quiz kunne løses 100 % blindt) og én som klikket
«alltid riktig svar» (bekreftet 16/16, 16/16 og 18/18 — ingen data-
mismatch).

**Landsprofiler for Österreich og Schweiz + ny «Länder»-hub.** Teach ba om
landsprofiler for Østerrike og Sveits «slik vi laget om Deutschland» — samme
mønster: statistikk-rad, kultur-/faktaseksjoner, et interaktivt
dra-og-slipp-kart der eleven plasserer de 10 største byene, og en quiz.
Siden toppnavigasjonen allerede hadde 16 punkter og var full, avklarte
Claude arkitekturen med AskUserQuestion: fortsette å gi hvert land sin egen
faste plass (ville krevd 2 nye punkter, 18 totalt), eller samle alle tre
landene bak ett nytt punkt som peker til en ny hub-side. Teach valgte hub-
løsningen. `deutschland/index.html` beholder sin gamle adresse uendret (så
ingen gamle lenker/bokmerker brytes) — kun toppnavigasjonens lenkemål
endret seg, fra `deutschland/` til den nye `laender/`-huben.

`laender/index.html` er en enkel hub med tre kort (🇩🇪/🇦🇹/🇨🇭), og
`oesterreich/index.html`/`schweiz/index.html` er bygget som strukturelt
identiske søsken til `deutschland/index.html` — samme stat-grid, samme
`.dw-fact-box`/`.dw-food-table`-mønstre, samme kartspill-motor og samme
quiz-motor, kun med land-spesifikt innhold. Alle tre landssider fikk en ny
brødsmulelinje (`.dw-crumb`: `🌍 Länder → <land>`), inkludert
`deutschland/index.html` som ikke hadde `.dw-crumb`-stilen fra før (lagt
til denne runden for at settet skal føles helhetlig).

**Fakta** ble hentet av to parallelle recherche-agenter (én per land) og
verifisert mot offisielle/anerkjente kilder før publisering — bl.a.
Nationalfeiertag (26. oktober 1955, nøytralitetsloven) og Krampus (5.
desember, historisk forbudt to ganger) for Østerrike; Bundesfeier (1.
august, Bundesbrief 1291, offisiell helligdag først fra 1994) og de fire
offisielle språkene for Sveits; samt Sachertorte-rettstvisten
(Hotel Sacher vs. Demel, avgjort 1963) og at Bern er hovedstad de facto
(Sveits har ingen grunnlovfestet hovedstad).

**Kartene** er generert med samme metode som Deutschland-kartet: ekte
GeoJSON-grensekoordinater (denne gangen hentet fra et annet offentlig
GeoJSON-depot, siden det opprinnelige ikke hadde nok detaljer for Østerrike/
Sveits), forenklet med Douglas-Peucker (`shapely.simplify()`) til et
sammenlignbart detaljnivå som Deutschland-silhuetten (178/217 punkter), og
projisert med samme cos(breddegrad)-korrigerte projeksjon slik at formen er
proporsjonalt riktig. Byenes posisjoner er regnet ut fra ekte lengde-/
breddegrad med akkurat samme projeksjon som selve landomrisset. Samme
«nærmeste by»-rettelogikk (ikke fast treffradius) som Deutschland-kartet.

**Søkeindeksen** fikk 15 nye oppføringer. Én reell kollisjon ble funnet og
rettet før publisering: nøkkelordet «österreich» var allerede i bruk på
Wien-byportrettets oppføring (`staedte/wien/`) — fjernet derfra og gitt til
den nye Østerrike-landssiden i stedet, siden et søk på selve landsnavnet nå
mer naturlig hører hjemme på landsprofilen enn på én enkelt by. Wien-siden
er fortsatt fullt søkbar via «wien»/«mozart»/«kaffeehaus». Ingen andre
kollisjoner funnet ved full skann.

Homepage-kortet som tidligere lenket til `deutschland/` («Deutschland») ble
oppdatert til å lenke til `laender/` med tittel «Länder» og en beskrivelse
som nevner alle tre landene. Navigasjonsmenyen ble oppdatert i alle 126
daværende HTML-filer (samme automatiserte mønster som tidligere
navigasjonsendrende runder) — bortsett fra `deutschland/index.html` selv,
som hadde et litt avvikende, selv-lenkende nav-mønster og derfor ble rettet
manuelt.

Full verifisering: `node --check` på alle tre berørte/nye script-blokker (0
feil), en full lenke-integritetssjekk av alle 130 HTML-filer (0 ekte
brutte lenker), og en Playwright-gjennomgang: klikk-kjede forside → Länder-
hub → hvert land → brødsmule tilbake til hub, nav-lenken «🌍 Länder» testet
fra en dyp underside, og søk på «österreich», «schweiz», «krampus»,
«fondue» og «landsprofiler» — alle traff riktig side. Kartspillet (10/10
byer) og quizen (6/6 spørsmål) på begge nye landssider var allerede
grundig funksjonstestet med simulerte pointer-drag-hendelser tidligere i
runden, og ble ikke endret av navigasjons-/søkeindeks-arbeidet etterpå.

**Genitiv, Ordstilling, Präteritum og Futur I — fire nye `dw-soon`-kort
fylt ut.** Teach ba om å bruke research-notatet om eksterne kilder
(`claude/ressurskartlegging-eksterne-kilder.md`, se forrige runde) som base
for å fylle ut de gjenstående `dw-soon`-plassholderne — spesielt Genitiv,
ordstilling og Präteritum/Futur — og om å se på H5P-øvelsesformatene som
mal for nye spilltyper. Claude avklarte omfang med AskUserQuestion først:
(1) hvilke verbtider som skulle bygges nå — Teach valgte Präteritum + Futur
I, og lot Plusquamperfekt/Futur II forbli `dw-soon` til en senere runde; (2)
nivåmerking — Teach valgte å merke alle tre nye temaene (Genitiv,
Ordstilling, Präteritum/Futur I) som 🎓 9.–10. trinn.

**Om kilde-basen:** `deutsch-lernen.zum.de` sine faktiske sider for disse
temaene viste seg å være for tynne til å brukes direkte — Genitiv-siden var
én enkelt setning, Wortstellung og Futur I ga 404, og Präteritum-siden
hadde kun en kort muntlig/skriftlig-kommentar uten bøyingstabeller. Claude
skrev derfor originalt, faglig fundert innhold direkte (samme praksis som
alle tidligere grammatikk-sider på nettstedet), og brukte research-notatets
temavalg og den ene bekreftede ZUM-observasjonen (Präteritum = skriftlig
fortellerstil vs. Perfekt = muntlig register) som utgangspunkt fremfor å
kopiere tekst.

**Genitiv** (`grammatikk/artikler/genitiv/`) følger Perfekt-sidens
referanse+quiz-mønster: 4 regelseksjoner (der/das→des+(-e)s med
tommelfingerregelen kort/langt substantiv, die→der uten substantivendring,
von+Dativ som muntlig alternativ, og en kort bonus-nevning av
wegen/trotz/während/statt) + en 10-spørsmåls dynamisk-svaralternativ-quiz,
inkludert en bevisst luring (das Mädchen → des Mädchens, intetkjønn til
tross for betydningen «jente»).

**Präteritum** (`grammatikk/verb/praeteritum/`) er bygget som Perfekt-siden,
men med tre quiz-bolker (svake verb, sterke verb/Ablaut, sein-haben-
modalverb) — 18 spørsmål totalt. Regeldelen inkluderer en eksplisitt
positiv-transfer-sammenligning med norsk («han så» vs. «han har sett» ≈
tysk Präteritum vs. Perfekt) og en advarsel mot å forveksle modalverbenes
Präteritum-stammer (konnte, musste, durfte) med Konjunktiv II (könnte,
müsste, dürfte).

**Futur I** (`grammatikk/verb/futur-1/`) bruker Dativ-Kompass-sidens enklere
faste-5-knapps-motor (werde/wirst/wird/werden/werdet) — 10 spørsmål, samt 3
regelseksjoner (formel, full werden-bøying, og en praktisk note om at tysk,
akkurat som norsk, ofte foretrekker presens+tidsuttrykk fremfor Futur I for
nære planer). Siste quiz-spørsmål er en bevisst luring som viser werdens
doble rolle («Meine Schwester wird Ärztin werden» — hjelpeverb og
hovedverb i samme setning).

**Ordstilling** (`grammatikk/analyse/ordstilling/`) er den nye spilltypen —
direkte inspirert av H5P-formatet «Drag the Words»/setnings-reordering,
implementert som klikk i stedet for dra-og-slipp for bedre robusthet
(samme designvalg som tidligere er gjort for landkartene, der drag faktisk
er pedagogisk nødvendig, i motsetning til her). Eleven bygger setningen ved
å klikke ordledd i riktig rekkefølge fra en stokket pool; motoren er en
tilpasning av Satz-Detektiv-sidens klikk-og-fasit-mønster
(`dwActivePart`/`dwAnswer`), men her er «riktig svar» neste ledd i
rekkefølgen (sjekket via opprinnelig indeks, ikke tekst — robust mot
duplikatord) i stedet for en grammatisk rolle. 14 ferdig-designede
setninger (4 subjekt-først, 10 med adverbial-inversjon), 8 trukket
tilfeldig per runde. Regeldelen legger vekt på V2-regelen (det bøyde
verbet er alltid det ANDRE SETNINGSLEDDET) og fremhever eksplisitt at
norsk bokmål OGSÅ er et V2-språk — i motsetning til engelsk — så dette er
et «venn, ikke fiende»-tema for norske elever.

Alle fire nye sidene ble lenket inn i sine kategori-huber
(`grammatikk/artikler/`, `grammatikk/analyse/`, `grammatikk/verb/` —
`dw-soon`-kortene erstattet med ekte lenker) og i
`fortgeschritten/index.html` (fire nye kort i 🧩 Grammatik-seksjonen).
Søkeindeksen fikk 7 nye oppføringer (Genitiv, Präteritum, Futur I,
Ordstilling, pluss synonym-nøkkelord som «wessen», «wortstellung» og
«imperfekt») — ingen kollisjoner funnet ved full skann.

Full verifisering: `node --check` på alle fire nye script-blokker og alle
berørte hub-/indeks-filer (0 feil), en programmatisk kontroll av all
quiz-data (ingen manglende `correct`-verdier, ingen duplikate `choices`,
ingen ugyldige `verbIndex`-referanser — 10+18+10+27 spørsmål/ledd
totalt), en full lenke-integritetssjekk av alle 134 HTML-filer (0 ekte
brutte lenker), og en Playwright-gjennomgang kjørt via en lokal
HTTP-server: klikk-kjede fra alle fire huber til de nye sidene, brødsmule
tilbake, samt fulle spill-gjennomganger av alle fire quiz-/spillmotorene —
inkludert en «alltid riktig svar»-kjøring av det nye Ordstilling-
setningsbygger-spillet som bekreftet 27/27 riktig og et tomt
øve-mer-på-listen ved perfekt spill.

**Wikisource — nivådelt lesegruppe under Lesen, med hover/trykk-glosser i teksten.** Teach ba Claude søke gjennom de.wikisource.org etter ekte, gemeinfrie tekster passende for 8., 9. og 10. trinn, med korte norske bakgrunnsintroer. Tre parallelle recherche-agenter researchet hvert sitt nivå og fant og vurderte til sammen 15 kandidater (4 for 8. trinn, 5 for 9. trinn, 6 for 10. trinn), med ærlig vurdering av faktisk språklig vanskelighetsgrad — ikke bare sjanger — inkludert flagging av arkaisk rettskrivning og for lange/tette tekster. Teach valgte deretter de tryggeste 11 tekstene (4+3+4) for bygging.

Teach ba samtidig om en ordforråd-løsning: enten en egen gloseliste, eller understrekede ord i selve teksten som viser norsk oversettelse ved hover/trykk. Claude bekreftet at begge er mulig med ren HTML/CSS (ingen JavaScript-bibliotek nødvendig), og Teach valgte begge deler. Løsningen er en ny `.dw-gloss`/`.dw-gloss-tip`-CSS-komponent: vanskelige ord er stiplet understreket i selve `.dw-original`-teksten, med en tooltip som vises både ved musehover OG ved fokus (`tabindex="0"` gjør at trykk/tab på nettbrett og mobil også fungerer, ikke bare mus) — samme mønster som resten av nettstedets bevisste unngåelse av dra-og-slipp der klikk/trykk er mer robust. Alle glossene finnes i tillegg samlet i en `.dw-vocab`-liste under teksten (samme mønster som den eksisterende Kafka-parabeln-siden), for oversikt og utskrift.

**Et reelt teknisk hinder underveis, løst med brukerens hjelp:** de.wikisource.org selv var blokkert av miljøets nettverkspolicy (`connect_rejected` i agent-proxyen) denne runden, så Claude kunne ikke hente sidene direkte. For 8. trinns fire Grimm-eventyr ble ordrett tekst i stedet hentet fra sagen.at (et anerkjent folkeminnearkiv som gjengir samme offentlige-domene-utgave), verifisert linje for linje. For de resterende 7 tekstene (9./10. trinn: Kannitverstan, Der Zahnarzt, Brot zu Stein geworden, Der Handschuh, John Maynard, Die Lorelei, Vor dem Gesetz) nektet nettleseverktøyet konsekvent å gjengi fullstendig dikt-/novelletekst ordrett, uansett hvordan forespørselen ble formulert — selv om samtlige er bekreftet offentlig eiendom (forfatterne døde alle for over 100 år siden, bortsett fra Kafka i 1924). Claude flagget dette ærlig i stedet for å dikte tekst fra hukommelsen og fremstille den som verifisert, og avklarte løsningen med Teach via AskUserQuestion: bygg 8. trinn nå, og Teach limer selv inn teksten for de 7 gjenstående (siden blokkeringen kun gjelder Claudes verktøy, ikke Teachs egen nettleser) — Teach valgte dette. `lesen/wikisource/index.html` har derfor 9./10. trinn liggende som `dw-soon`-kort inntil videre.

Hver av de fire ferdige 8.-trinns-sidene har: en norsk bakgrunnsintro, ordrett tysk originaltekst med inline-glosser, en «Vis norsk oversettelse»-knapp (uoffisiell oversettelse laget av Claude, tydelig merket som sådan — samme praksis som Kafka-parabeln-siden), en samlet gloseliste, en 4-spørsmuls forståelsesquiz, og et kort norsk refleksjonsspørsmål med tekstfelt og kopier-knapp. `lesen/index.html` fikk en ny gruppe («📜 Wikisource — nivådelt fra 8. til 10. trinn») med ett kort som lenker til den nye hub-siden. Søkeindeksen fikk 6 nye oppføringer, ingen kollisjoner funnet.

Full verifisering: `node --check` på alle 4 nye script-blokker og de 2 berørte filene (0 feil), 0 ekte brutte lenker (139 HTML-filer sjekket), og en Playwright-gjennomgang: klikk-kjede lesen-hub → Wikisource-hub → hver av de fire nye sidene, brødsmulenavigasjon, en programmatisk sjekk av at tooltip faktisk blir synlig ved hover (`visibility`/`opacity` på `.dw-gloss-tip` verifisert via beregnet CSS-stil, ikke bare tilstedeværelse i DOM-en), oversettelses-toggle, og en «alltid riktig svar»-kjøring av alle fire quizene (4/4 riktig på hver).

**Wikisource, runde 2 — Teach limte selv inn de 4 gjenstående tekstene.** Som avtalt i forrige runde (siden `de.wikisource.org` er blokkert for Claudes egne nettleserverktøy, men ikke for Teachs egen nettleser) limte Teach inn skjermbilder/tekst for fire av de sju gjenstående kandidatene direkte i chatten: «Der Zahnarzt» (Johann Peter Hebel, 1811) og «Brot zu Stein geworden» (et gammelt tysk folkesagn, nr. 240 i en eldre sagnsamling) for 9. trinn, samt «John Maynard» (Theodor Fontane, ballade) og «Die Lorelei» for 10. trinn. Alle fire ble bygget etter samme mal som 8.-trinns-sidene (hover/trykk-glosser i `.dw-original`-teksten, samlet gloseliste, «Vis norsk oversettelse»-knapp med uoffisiell Claude-oversettelse, 4-spørsmuls quiz, refleksjonsfelt med ordteller og kopier-knapp).

«Die Lorelei» er spesiell: siden kilden Teach limte inn faktisk inneholdt tre tekster i ett (Wilhelm Proehles sagnbeskrivelse av klippen og stedet St. Goar/St. Goarshausen, Proehles egen prosagjenfortelling av Clemens Brentanos Lorelei-ballade, og Heinrich Heines berømte dikt «Ich weiß nicht, was soll es bedeuten» fra 1824, sitert ordrett i kilden), ble siden bygget med tre separate tekstblokker — hver med egen oversettelses-knapp — og én felles gloseliste og quiz til slutt. Alle tre er utvetydig offentlig eiendom (Brentano d. 1842, Heine d. 1856, Proehles samling fra 1800-tallet).

`lesen/wikisource/index.html` har nå 8 av 11 tekster bygget (opp fra 4): Brot zu Stein geworden og Der Zahnarzt er flyttet fra `dw-soon` til ekte kort under 9. trinn, John Maynard og Die Lorelei det samme under 10. trinn. Kannitverstan, Der Handschuh og Vor dem Gesetz venter fortsatt som `dw-soon` — samme praksis som før: bygges når/hvis Teach limer inn teksten. Søkeindeksen (`index.html` i rot) fikk 4 nye oppføringer, ingen nøkkelkollisjoner funnet.

Full verifisering: alle 4 nye script-blokker sjekket med `node --check` (0 feil), balansert `<div>`/`</div>`-telling per fil (0 avvik), og en full lenke-integritetssjekk av alle 143 HTML-filer i hele nettstedet (0 ekte brutte lenker — treffet på `'+hit.target+'` i rotens `index.html` er en JS-malstreng, ikke en ekte lenke).

**Wichtige Themen (ny seksjon) — første innspilte dialog med lydsynkronisert tekst.** Teach hadde fått Mia/Tom-dialogen «Die einfache Unterhaltung» (fra TTS-manus-runden, se over) lest inn i ElevenLabs (stemmene «Ava» og «Odeon», Text to Dialogue) og lastet opp den ferdige lydfilen (57,47 sekunder). Hun ba om en helt ny toppnivå-seksjon «Wichtige Themen» med undersider for 8./9./10. klasse, og at den første dialogen skulle bygges inn med introtekst, ord/uttrykk, lydavspilling, tekst som «markeres samstemt med lydfilen», hover-glosser, og noen småoppgaver — med en eksplisitt åpning for at synkroniseringen kunne vise seg for vanskelig.

Ærlig svar om synkroniseringen: ekte, ord-for-ord-nøyaktig synkronisering krever talegjenkjenning (ASR) som kan tidsstemple hver replikk mot lydbølgen. Dette miljøet har ikke tilgang til det — både OpenAI Whisper sine modellvekter (`openaipublic.azureedge.net`) og Hugging Face (`huggingface.co`) er blokkert av sandkassens nettverkspolicy, bekreftet med direkte `curl`-testing (403/`connect_rejected`). Et forsøk på ren stillhets-deteksjon (`ffmpeg silencedetect`) ga heller ikke pålitelige linjegrenser — den fant ~46 pauser mot ~26 forventede replikkoverganger, uten tydelig skille mellom "pause mellom replikker" og "komma midt i en setning". Løsningen ble derfor en **proporsjonal tidsestimering**: hver replikks starttidspunkt er beregnet ut fra tekstlengden (med et lite fast tillegg per replikk så korte ord som «Hallo!» ikke får null varighet), skalert slik at summen alltid treffer lydfilens faktiske lengde nøyaktig (57,469375 sek, bekreftet med `ffprobe`), med en anslått pause på 0,22 sek mellom hver replikk. Dette gir en rimelig, men **omtrentlig** synkronisering — ikke bildeperfekt — og det står tydelig forklart i en note-boks direkte på siden, rett under lydspilleren, så elevene (og Teach) vet hva de ser.

`wichtige-themen/8-klasse/die-einfache-unterhaltung/index.html` viser dialogen som chatteboble-replikker (Mia venstrejustert i blått, Tom høyrejustert i rødbrunt), der replikken som spilles nå får en gul kant/bakgrunn via `<audio>`-elementets `timeupdate`-hendelse. Man kan også trykke direkte på en replikk-boble for å hoppe dit i lyden (`audio.currentTime = replikk.start`). Et utvalg ord i replikkene (f.eks. «vierzehn», «ganz in der Nähe», «Klassenzimmer», «derselben», «das freut mich») har `.dw-gloss`-tooltip med norsk oversettelse, samme mønster som Wikisource-sidene. Under samtalen ligger en «Ord og uttrykk»-seksjon som gjenbruker de 8 uttrykkskategoriene fra Word-manuset (hilse, wie geht's, navn, alder, kommer fra, bosted, hobby, avskjed), pluss seks ekstra fraser hentet direkte fra teksten. Til slutt en 5-spørsmuls forståelsesquiz og en skriveoppgave («lag din egen mini-samtale») med ordteller og kopier-knapp.

`wichtige-themen/index.html` (hub, 3 kort) og `wichtige-themen/8-klasse/index.html` (hub, 7 temaer — kun «Die einfache Unterhaltung» bygget, de resterende seks fra Teachs opprinnelige liste ligger som `dw-soon`) følger samme kort-mønster som resten av siden. `9-klasse/` og `10-klasse/` er rene venteside-stubber siden Teach ikke har bestemt temaer for de trinnene ennå. Toppnavigasjonen fikk et nytt punkt (⭐ Wichtige Themen) satt inn i alle 148 HTML-filer (se over), forsiden fikk et nytt kort, og søkeindeksen fikk 2 nye oppføringer — ingen nøkkelkollisjoner funnet.

Full verifisering: `node --check` på det nye script-blokken (0 feil, etter å ha luket ut en falsk positiv fra en `<script>`-omtale inni en HTML-kommentar), alle 148 sider verifisert med riktig relativ sti til den nye seksjonen via automatisk generert lenke-prefiks (stikkprøver på dybde 0/2/3 kontrollert manuelt), en lokal HTTP-server som bekreftet 200 OK på alle nye sider og på lydfilen, og en Playwright-gjennomgang med skjermbilder av forsiden, hub-siden og den nye dialogsiden. Highlight-logikkens indeksberegning ble testet direkte i nettleseren mot fem tidspunkt (0/5/22/40/56 sek) og traff riktig replikk hver gang.

**Wichtige Themen utvidet: Hobbys und Freizeit og Eine Verabredung** — Teach spilte selv inn de to gjenstående dialogene fra TTS-manuset (punkt 53) i ElevenLabs og lastet opp lydfilene (33,72 sek og 30,93 sek), og ba om at de ble lagt inn i 8.-klasse-delen av Wichtige Themen «på samme måte som Die einfache Unterhaltung». Begge sider bygget etter nøyaktig samme mal (chatteboble-dialog med lyd-synkronisert fremheving, klikk-for-å-hoppe, hover-glosser, «Ord og uttrykk»-seksjon, 5-spørsmuls quiz, skriveoppgave), samme proporsjonale tidsestimeringsmetode som forrige runde, kalibrert mot hver fils faktiske, `ffprobe`-bekreftede lengde.

`wichtige-themen/8-klasse/hobbys-und-freizeit/index.html` bruker dialogen mellom Sara og Jonas om hobbyer fra TTS-manuset (11 replikker) — gloser på «Freizeit», «Verein», «üben», «unterschiedlich». `wichtige-themen/8-klasse/eine-verabredung/index.html` bruker avtale-dialogen (også 11 replikker, samme to talere) — denne fikk i tillegg en egen liten faktaboks («🕒 Klokka på tysk») som forklarer det tyske 24-timersformatet for klokkeslett, siden nettopp klokkeslett-øving var et bevisst poeng med denne teksten allerede i det opprinnelige manuset. Begge sidene bruker generiske CSS-klassenavn (`.a`/`.b` i stedet for `.mia`/`.tom`) siden talerne er andre enn i den første dialogen.

`wichtige-themen/8-klasse/index.html` fikk `dw-soon`-kortet for «Hobbys und Freizeit» erstattet med en ekte lenke, pluss et helt nytt kort for «Eine Verabredung» (som ikke var i Teachs opprinnelige sju-temaers liste som eget tema, men er del B av «Hobbys und Freizeit»-temaet i manuset — bygget som egen side siden Teach lastet den opp som egen lydfil). Hub-siden har nå 8 kort totalt (3 bygget, 4 fortsatt `dw-soon`: Meine Familie, Im Restaurant, Zu Weihnachten, Einkaufen, Mein Aussehen — manus for alle disse finnes allerede i punkt 53 sitt Word-dokument). Søkeindeksen fikk 2 nye oppføringer, ingen kollisjoner (én pre-eksisterende, allerede kjent duplikat — «wechselpräpositionen» — er urelatert til denne runden).

Full verifisering: `node --check` på begge nye script-blokker (0 feil), en lokal HTTP-server som bekreftet 200 OK på begge sider og begge lydfiler, og en Playwright-gjennomgang som testet highlight-indeksberegningen direkte mot flere tidspunkt per side (traff riktig replikk hver gang) og bekreftet at `<audio>`-elementets rapporterte varighet er identisk med `ffprobe`-målingen på begge filer.

**Wichtige Themen utvidet: Meine Familie (to monologer, Lena og Finn)** — Teach spilte inn de to siste manusene fra «Meine Familie»-temaet (punkt 53) i ElevenLabs, denne gangen navngitt med personnavn i filnavnet («Meine Familie - Lena», «Meine Familie - Finn») fremfor to helt separate temanavn. Siden begge filer delte samme temanavn og kun varierte i hvilken versjon (liten/stor familie), ble de bygget som ÉN side med to seksjoner — samme struktur som i det opprinnelige Word-manuset (Versjon A/Versjon B) — i stedet for to separate hub-kort slik Hobbys und Freizeit/Eine Verabredung ble (der lydfilene hadde helt distinkte temanavn).

    Et nytt strukturelt element: Lena og Finns tekster er **monologer**, ikke dialoger med replikkveksling, så samme chatteboble-mønster som de tre andre sidene passet ikke. I stedet fikk siden et nytt, gjenbrukbart «les-med»-mønster (`.dw-readline`): hver setning er en egen blokk i én sammenhengende kolonne (ikke venstre/høyre-vekslende bobler), som får en gul venstrekant og bakgrunn når den leses — samme klikk-for-å-hoppe-funksjon som bobler har. Rendring og synkronisering er faktorert ut i en delt funksjon (`dwSetupReadAlong(containerId, audioId, lines)`) som kalles én gang per versjon, siden siden har to uavhengige lydspillere og tekstblokker på samme side.

    Tidsestimeringen bruker samme proporsjonale metode som de andre sidene, men med en kortere antatt pause mellom setninger (0,35 sek, mot 0,22 sek for dialog-replikker) siden en sammenhengende monolog naturlig har kortere pust-pauser enn en samtale med replikkskifte. Kalibrert mot hver fils faktiske lengde (45,17 sek for Lena, 52,61 sek for Finn, begge bekreftet med `ffprobe`).

    Gloser på «vorstellen», «arbeitet als», «nervig», «wichtig» (Lena) og «Geschwister», «Ärztin», «langweilig» (Finn). Én felles «Ord og uttrykk»-seksjon (familiemedlemmer, yrkesuttrykk, «wir sind … Personen») og én felles 7-spørsmuls quiz som blander spørsmål fra begge tekstene, pluss én skriveoppgave («skriv om din egen familie»).

    `wichtige-themen/8-klasse/index.html` fikk `dw-soon`-kortet for «Meine Familie» erstattet med en ekte lenke — hub-siden har nå 4 av 8 temaer bygget (Zu Weihnachten, Im Restaurant, Einkaufen, Mein Aussehen gjenstår, manus finnes i punkt 53 sitt Word-dokument). Søkeindeksen fikk 1 ny oppføring, ingen kollisjoner.

**Wichtige Themen utvidet: Im Restaurant og Zu Weihnachten** — Teach spilte inn to av de fire gjenstående manusene fra TTS-manus-dokumentet i ElevenLabs (Im Restaurant nå med tre stemmer: Lisa, David og en egen Kellner-stemme) og lastet opp lydfilene (77,09 sek og 78,92 sek), og ba om at de ble lagt inn i 8.-klasse-delen av Wichtige Themen etter samme mønster som de andre delene.

`wichtige-themen/8-klasse/im-restaurant/index.html` er den første dialogsiden med tre talere i stedet for to — chatteboble-mønsteret fikk derfor en ny, sentrert `.c`-stil (lilla) for Kellner-replikkene, i tillegg til de vanlige venstre-/høyrejusterte `.a`/`.b`-stilene for gjestene. 26 replikker dekker hele restaurantbesøket: velkomst, bordanvisning, meny, bestilling, servering, «Schmeckt es Ihnen?» og regningen.

`wichtige-themen/8-klasse/zu-weihnachten/index.html` er en monolog (Leon forteller om sin egen julefeiring i Tyskland) og bruker derfor les-med-mønsteret fra Meine Familie-siden. Siden fikk i tillegg en egen «Tyske juletradisjoner»-seksjon med korte forklaringer av Adventskalender, Nikolaustag, Adventskranz, Heiligabend og Weihnachtsfeiertage, siden disse ikke nødvendigvis er kjent for norske elever fra før.

`wichtige-themen/8-klasse/index.html` har nå 6 av 8 temaer bygget (kun Einkaufen og Mein Aussehen gjenstår). Søkeindeksen fikk 2 nye oppføringer; nøkkelordet «restaurant» ble bevisst unngått som egen nøkkel siden det allerede er en eksakt nøkkel for den eldre `sprechen/restaurant/`-siden.

**Wichtige Themen fullført: Einkaufen og Mein Aussehen (siste to temaer)** — Teach spilte inn de to siste manusene fra TTS-manus-dokumentet i ElevenLabs (Einkaufen: 50,76 sek, Emma og Verkäuferin; Mein Aussehen: to separate filer, Sophie 29,57 sek og Ben 28,45 sek) og lastet dem opp, med samme ønske om samme mønster som resten av seksjonen.

`wichtige-themen/8-klasse/einkaufen/index.html` bruker det vanlige to-taler-chatteboble-mønsteret (samme oppsett som Hobbys und Freizeit), med Emma til venstre og Verkäuferin til høyre. 17 replikker dekker hele handleturen: å be om hjelp, velge farge, bytte størrelse etter prøving, spørre om pris og betale med kort.

`wichtige-themen/8-klasse/mein-aussehen/index.html` er to uavhengige monologer — Sophie og Ben beskriver hvert sitt utseende (høyde, hårfarge, øyefarge, kroppsfigur) — og bruker derfor les-med-mønsteret med to separate lydspillere/tekstblokker, samme struktur som Meine Familie-siden (Versjon A/Versjon B).

`wichtige-themen/8-klasse/index.html` har nå **alle 8 temaer bygget** — hele listen Teach opprinnelig ga er dermed fullført som sider. Søkeindeksen fikk 2 nye oppføringer, ingen nye eksakte kollisjoner (én pre-eksisterende dupliserte nøkkel, «kellner», ble samtidig oppdaget og rettet — den lå både på Café-siden fra en tidligere runde og på Im Restaurant-siden fra forrige runde; Im Restaurant-siden bruker nå «kellner servitør» i stedet).

**Ny toppnivå-seksjon: Ordbok.** Teach ønsket en integrert norsk-tysk ordbok på siden. Siden Deutschwelt er et statisk nettsted uten backend, var alternativet å slå opp mot en ekstern ordbok-API (upraktisk pga. CORS og driftsavhengighet) eller å bygge inn et eget, bundlet datasett med klientsidesøk — Teach valgte det siste. Datakilden er Heinzelnisse (heinzelnisse.info), en åpen kildekode norsk-tysk ordbok (GPL-2.0 / CC BY-NC-SA 3.0). Siden heinzelnisse.info ikke var tilgjengelig fra byggemiljøet, lastet Teach selv ned og lastet opp `heinzelliste.txt`-filen; formatet ble reverse-engineert fra den åpne konverteringskoden til prosjektet `Wunderfitz/heinzelnisse-sqlite` på GitHub (enkel bit-vis XOR-liknende obfuskering av hver byte, deretter en 10-kolonners TSV med norsk/tysk ord, kjønn/ordklasse, valgfri tilleggsinfo og kategori). Hele ordlisten — 45 141 oppføringer, ikke en filtrert delmengde — ble pakket til en kompakt `ordbok.json` (2,6 MB) med korte feltnavn (`no`, `de`, `ng`, `dg`, `x`, `cat`) og lagt i en ny `ordbok/`-mappe.

`ordbok/index.html` er en enkel søkeside: et søkefelt henter `ordbok.json` én gang med `fetch()`, og søket filtrerer deretter live i nettleseren (ingen server, ingen indeksering på forhånd) — søket virker begge veier (skriv et norsk eller tysk ord), prioriterer eksakte treff først, så «starter med», så «inneholder», og viser maks 60 treff av gangen med en tydelig telling hvis det er flere. Kjønn/ordklasse-koder fra datasettet (m, f, n, adj, adv, osv.) vises som lesbare norske merkelapper. Siden fikk et nytt toppnivå-punkt i navigasjonsmenyen (📔 Ordbok, satt inn i alle 156 HTML-filer), et nytt kort på forsiden, og to nye søkeindeks-oppføringer — ingen nye nøkkelkollisjoner (samme pre-eksisterende «wechselpräpositionen»-duplikat som før, urelatert til denne runden).

    Full verifisering: `node --check` på all inline JS (0 feil), lokal HTTP-server bekreftet 200 OK på siden og `ordbok.json`, en lenke-integritetssjekk av alle ~3500 lokale lenker i alle 156 HTML-filer (0 ekte brudd), og en funksjonstest av søkelogikken mot kjente ordpar (f.eks. «hus»↔«Haus», «katt»↔«Katze») som bekreftet korrekt tosidig treff og riktig prioritering av eksakte treff.

**Ny toppnivå-seksjon: Snakker du nysk? (tysk-norske lignende ord).** Teach lastet opp sitt eget Word-dokument `Snakker du nysk.docx` — en liste hun ofte bruker med nye 8.-klasseelever, med tyske ord som ligner på norske, gruppert i 13 kategorier (Am Körper, In der Küche, Tiere, Verb, Zahlen, osv.), med et tomt felt for den norske oversettelsen. Hun ba om et nytt kort i hovedmenyen basert på dokumentet, med utfyllingsfelt og en grønn hake ved riktig svar. Innholdet ble hentet ut av tabellen i dokumentet med `python-docx` (225 ord fordelt på 13 kategorier, identifisert ved at kategirads-rader har tekst i begge kolonner mens ordrader kun har det tyske ordet), og den norske fasiten for alle 225 ordene ble skrevet manuelt — noen ord godtar flere stavemåter (f.eks. «bein»/«ben», «sju»/«syv», «tykk»/«tjukk», «frisk»/«sunn») for å ikke straffe gyldige varianter.

    `aehnliche-woerter/index.html` bygger hele siden fra en liten datafil (`nysk_data.js`, 225 ord, 13 kategorier) i stedet for håndskrevet HTML per ord. Hvert ord får et inputfelt: riktig svar (sammenlignet normalisert — små bokstaver, trimmet, uten tegnsetting) gir en grønn hake og låser feltet; feil svar markeres med rød kant først når eleven forlater feltet (ikke mens de skriver), slik at det ikke føles straffende midt i skrivingen. Enter-tasten hopper til neste felt. En sticky fremdriftslinje øverst («X av 225 riktige») oppdateres live, med en «🔄 Nullstill»-knapp og en «👁️ Vis fasit»-knapp (viser riktig svar i grå tekst ved siden av feltet, uten å overskrive det eleven har skrevet — nyttig for gjennomgang i etterkant). Ved alle 225 riktige vises en gratulasjonsmelding.

    Siden fikk et nytt, 19. toppnivå-punkt i navigasjonsmenyen (🪄 Snakker du nysk?, satt inn i alle 157 HTML-filer), et nytt kort på forsiden, og to nye søkeindeks-oppføringer — ingen nye nøkkelkollisjoner.

    Full verifisering: `node --check` på datafilen og sidens inline JS (0 feil), en automatisk konsistenssjekk som bekreftet at alle 225 ord og alle 245 godkjente svarvarianter normaliserer til seg selv korrekt, lokal HTTP-server bekreftet 200 OK på siden og datafilen, en full lenke-integritetssjekk av alle 157 HTML-filer (0 ekte brudd), og en Playwright-gjennomgang som testet riktig svar (grønn hake + låst felt), feil svar ved fokustap (rød kant), en alternativ stavemåte («ben» for «Bein»), nullstilling og fasit-visning — alt fungerte som forventet.

**Forsiden redesignet: fra sitemap-grid til oppdagelses-dashboard.** Forsiden hadde vokst til 19 like store kort i ett langt rutenett — all funksjonalitet var der, men hierarkiet var borte. Ingen eksisterende lenker, data eller funksjoner (søk, `dwIndex`, Wortschatz der Woche) ble fjernet — kun presentasjonen ble bygget om, i seks lag:

    1. **Hero** — uendret innhold (tittel, søkefelt, DACH-flaggvelger), men lagt til to CTA-knapper: «🚀 Los geht's» (ankerlenke til ferdighets-seksjonen) og «🎲 Überrasche mich!» (hopper til et tilfeldig, allerede bygget sted — velger tilfeldig blant alle oppføringer i `dwIndex` med `built:true`).
    2. **Velg en ferdighet** — Sprechen/Hören/Lesen/Schreiben løftet ut som fire store, likestilte kort øverst, siden disse fire ferdighetene er kjernen i faget.
    3. **DACH-verden** — Städte-, Länder- og landsside-kortene (Deutschland/Österreich/Schweiz) slått sammen til tre fargede «landpaneler» med klikkbare by-piller (11 byer totalt) pluss en lenke videre til det eksisterende plasser-byene-selv-kartet i `laender/`. Ikke et geografisk nøyaktig kart — et stilisert reisekart-uttrykk, for å unngå et amatørmessig forsøk på presis kartografi.
    4. **Heute auf Deutschwelt** — fire roterende fliser (Challenge des Tages → `challenges/taegliche-herausforderung/`, Stadt des Tages → en av de 11 byene, Film/Serie des Tages → en av de 8 filmene/seriene, Wort der Woche → samme `dwWeeks`-datasett som tickeren før). By/film velges deterministisk ut fra dag-i-året (`dwDayIndex`), så alle besøkende ser samme anbefaling samme dag, og den bytter automatisk neste dag — uten backend. Den rullende Wortschatz-tickeren ble først fjernet, men er gjeninnført (se «Rulleteksten er tilbake på forsiden» under) — flisen og tickeren finnes nå side om side.
    5. **Deine Mission** — ett stort, fremhevet kort («Eine Reise durch Deutschland») som presenterer det eksisterende Reise-innholdet (`reiseplanlegger/`, `koffer/`, `reisetagebuch/`) som tre nummererte steg i ett oppdrag, med en tydelig «Start oppdraget»-knapp til `reise/`.
    6. **Utforsk mer** — de resterende 12 seksjonene samlet i fire kompakte kategori-kort med korte lenkelister (Sprache, Entdecken, Medien, Extras) i stedet for 12 like store kort.

    Teknisk: `dwIndex` (179 oppføringer, 550 nøkler) og `dwWeeks` (50 uker) er bevart helt uendret og gjenbrukt direkte fra det gamle scriptet — kun `dwSearch` sin DOM-tilkobling og en ny `dwBuildHeute()`-funksjon ble lagt til. By-pillene inni landpanelene bruker `onclick` med `event.preventDefault()` + `event.stopPropagation()` for å navigere til riktig by uten at klikket også trigger landpanelets egen lenke (en reell bug ble funnet og rettet her under testing — `stopPropagation()` alene stoppet ikke den omsluttende `<a>`-taggens native navigasjon, kun `preventDefault()` gjør det).

    Full verifisering: `node --check` på hele det nye scriptet (0 feil), en automatisk sjekk som bekreftet at alle 179 `dwIndex`-oppføringer, 550 nøkler og 50 `dwWeeks`-uker er identiske med før redesignet (kun ett pre-eksisterende, kjent duplikat), en full lenke-integritetssjekk av alle ~3700 lokale lenker i hele nettstedet (0 ekte brudd), en `dw-nav-active`-sjekk (uendret — samme to pre-eksisterende sider som før), og en omfattende Playwright-gjennomgang: ingen JS-konsolfeil, søkefunksjonen fungerer uendret, alle 11 by-piller og alle 3 landpanel-lenker navigerer til riktig side, «Los geht's» scroller til riktig seksjon, «Überrasche mich!» ble testet flere ganger og landet hver gang på en ekte, fungerende side (200 OK), og skjermbilder ble tatt og visuelt inspisert på desktop- (1400px), nettbrett- (820px) og mobilbredde (390px) for å bekrefte at alle seks seksjoner bryter om til ett system pent.

    Full verifisering: `node --check` (0 feil), lokal HTTP-server bekreftet 200 OK på siden og begge lydfiler, og en Playwright-gjennomgang bekreftet at begge `<audio>`-elementenes rapporterte varighet er identisk med `ffprobe`-målingen, samt korrekt highlight-indeks mot flere tidspunkt på begge versjoner.

**Forsiden: «⭐ Wichtige Themen» løftet opp som fremhevet kjerneseksjon.** Seksjonen lå som en vanlig lenke i «Sprache»-listen nederst på siden, men er et av de viktigste startpunktene for elevene. Den ligger nå som egen seksjon rett under «Velg en ferdighet» (nest øverst på siden), med en annen visuell behandling enn de øvrige kortene: varm kremfarget flate med gull-ramme og en burgunder/gull-aksent i venstre kant, et «Kjerneinnhold»-merke, stor overskrift og lead-tekst («Die wichtigsten Themen für deinen Deutschunterricht – übersichtlich gesammelt.»), en tydelig burgunder knapp «Alle wichtigen Themen →» til `wichtige-themen/`, nivå-piller (8./9./10. klasse) og et rutenett med alle 8 temaer fra 8. klasse som direktelenker (Die einfache Unterhaltung, Meine Familie, Hobbys und Freizeit, Eine Verabredung, Im Restaurant, Zu Weihnachten, Einkaufen, Mein Aussehen). Lenken er tatt ut av «Sprache»-listen siden den nå er fremhevet; toppmenyen har den fortsatt. Responsivt: to kolonner på desktop, én kolonne under 860 px, ett tema per rad under 520 px. Verifisert med Playwright (ingen JS-feil, CTA og tema-lenker navigerer riktig, alle 12 lenker i seksjonen finnes) og skjermbilder på desktop/nettbrett/mobil.

### Forsiden: ordbok-søk under «Eine Reise durch Deutschland»

Forsiden har fått et lite ordbok-søkefelt («📔 Slå opp et ord») rett under Deine Mission-kortet (`#dw-ordsearch` i `index.html`). Søket virker begge veier (norsk ⇄ tysk) og viser de 5 beste treffene (eksakt → begynner med → inneholder), med lenken «Se alle N treff i ordboken →» til `ordbok/?q=…`. `ordbok/ordbok.json` (2,6 MB) hentes først når eleven begynner å skrive, slik at forsiden ikke laster tyngre. `ordbok/index.html` leser `?q=` og fyller inn søket automatisk.

### Verben-Konjugator (`verben/`)

Teach ba om en enkel verb-oversikt à la Reverso. Siden Deutschwelt er statisk og Reverso ikke kan bygges inn eller kopieres, ble det bygget en egen, gratis løsning. Grunnlaget er åpne bøyningsdata fra Wiktionary (lisens CC BY-SA), hentet fra samlingen `viorelsfetea/german-verbs-database` (8 047 verb med Präsens ich/du/er, Präteritum ich, Partizip II, Hilfsverb og Imperativ). Derfra ble 338 verb valgt ut for 8.–10. trinn (A1–B1, inkl. 33 refleksive og 59 adskillbare), med norsk betydning og omtrentlig nivå skrevet for hånd.

Resten av formene er generert av en Python-motor (`build_verbs.py`, ikke del av nettstedet): wir/sie fra infinitiv, ihr fra stammen (+et etter d/t/chn osv.), alle Präteritum-personer fra ich-formen (svake: -te/-st/-n/-t, sterke: -/-st/-en/-t, med -est etter s/ß/z/t/d), Perfekt fra hjelpeverbet haben/sein + Partizip II, Futur I fra werden + infinitiv, og Imperativ (du/ihr/Sie). Adskillbare verb flytter partikkelen til slutten, og refleksive verb får mich/dich/… (Akkusativ eller Dativ) på riktig plass. «sein» er skrevet inn for hånd. Uregelmessige former merkes automatisk og vises i rødt. Modalverbene har ingen imperativ; «regnen» og «schneien» vises bare med «es». Noen få verb har en liten fotnote (haben/sein-valg, Dativ-verb, falske venner).

`verben/index.html` søker i infinitiv, norsk betydning og alle bøyde former (så «ging» finner «gehen», og «spise» finner «essen»), har nivåfilter A1/A2/B1, «Tilfeldig verb», direktelenker via `#gehen`/`#sich-freuen`, og en «Skriv selv»-modus der hvert felt får grønn hake når svaret er riktig (ß og ss godtas begge deler, hjelpeknapper for ä/ö/ü/ß). Menypunktet «🔄 Verben» er satt inn i alle HTML-filer, forsiden har fått en lenke under «Sprache», søkeindeksen en ny oppføring (nøklene «verben» og «konjugieren» ble flyttet fra den eldre Präsens-oppføringen), og `grammatikk/verb/` har fått et kort øverst. **Datakvalitet:** formene er stikkprøvekontrollert, men ikke manuelt gjennomgått for alle 338 verb — verbene i Wiktionary-data kan ha avvik (f.eks. «du bäckst», «du hießest»), så Teach bør se gjennom listen over uregelmessige verb før elevene bruker den mye.

### Forsiden: rulleteksten «Wortschatz der Woche» er tilbake

Teach savnet den rullende teksten som ble borte i forside-redesignet. Den er gjeninnført som en slank stripe (`.dw-ticker`, `#dw-ticker`) rett under hero-seksjonen og over «Velg en ferdighet»: overskriften «📅 Wortschatz der Woche — Uke N» med lenken «Alle 498 ord →» til `grammatikk/wortschatz-woche/`, og en kontinuerlig rullende rad med ukens 10 ord (ren CSS-animasjon, pause ved hover). Samme `dwWeeks`/`dwCurrentWeek()`-data som før, via en ny `dwBuildTicker()`. Ny detalj: `prefers-reduced-motion` stopper animasjonen og gjør raden i stedet vannrett scrollbar. Flisen «Wort der Woche» i «Heute auf Deutschwelt» er beholdt.

### Zahlen (`grammatikk/zahlen/`)

Teach ba om en side om tall under Grammatik/Språk: oversikt over tallene, årstall, ordenstall og klokka, med en søkefunksjon der eleven skriver tallet og ser hvordan det skrives på tysk. Bygget som `grammatikk/zahlen/index.html` — ett selvstendig dokument uten datafil. Alle tallordene lages av en liten regelmotor (`DWZ`, inline i siden): `card(n)` (grunntall opp til 999 999 999, med ein/eins-regelen, dreißig/sechzehn/siebzehn og «hundert/tausend» med og uten ein-), `ord(n)` (ordenstall: erste, dritte, siebte, achte, -te t.o.m. 19, -ste fra 20), `year(n)` (1100–1999 som «hundre-tall»: neunzehnhundertvierundachtzig), `decimal`, `euro`, `official(h,m)` og `informalList(h,m)` (klokka: halb, Viertel, nach/vor, regionale varianter) og `parseWords` (tysk tallord → tall). Motoren er enhetstestet mot ca. 70 kjente verdier, og `parseWords(card(n))` gir tilbake n for alle tall 0–2000 og en rekke store tall.

**Tall-søkeren** øverst tolker det eleven skriver: heltall (også med tusenskille 1.234.567), ordenstall (`3.`), desimaltall (`3,14`), negative tall, beløp (`12,50 €`), klokkeslett (`14:30`, med analog SVG-klokke), datoer (`17.5.`, `3.10.2026`) og tyske tallord (`dreiundzwanzig` → 23, med stavekontroll: «zwanzigeins» gir «einundzwanzig»). Hvert resultat vises som egne kort (grunntall, ordenstall, årstall, dato, klokka, en setning) med forklaring og 🔊-knapp (nettleserens innebygde tale-syntese, vises bare hvis støttet). Resten av siden har seksjoner for tall 0–20 (med uttalehint), tierne og 21–99-regelen (enerne først), store tall/Million/Milliarde og tegnsetting, ordenstall med datoer/måneder/høytider, årstall med eksempler (inkl. 1814 og 1905), klokka (offisielt vs. uformelt, tabell for 3:00–3:55, «halb vier = 3:30», klokka akkurat nå), tall i hverdagen og en øvingsdel med 8 øvelser (tall, ordenstall, årstall, klokka offisielt/uformelt) med live-sjekk og grønn hake. Siden er lenket fra `grammatikk/index.html` (kort under «Ord for seg selv»), forsiden (Sprache-listen + søkeindeks, nye nøkler som «tall», «klokke», «ordenstall», «årstall»; ingen nye kollisjoner) og fra kortet «Klokka på tysk» i `grammatikk/tidsuttrykk/`, som tidligere var en «Kommer snart»-plassholder. Den ble ikke lagt i toppmenyen (den har allerede 20 punkter).


### Toppmeny-lenke til Zahlen + Adjektiv-siden (`grammatikk/adjektiv/`)

**Meny:** Teach syntes tallsiden var vanskelig å finne, så «🔢 Zahlen» er nå et eget punkt i toppmenyen (rett etter «🔄 Verben») på alle HTML-sider — menyen har dermed 21 punkter. På Zahlen-siden selv er punktet markert som aktivt (`dw-nav-active`).

**Adjektiv-siden** (`grammatikk/adjektiv/index.html` + `adjektiv_data.js`) erstatter den gamle kategori-huben med «Kommer snart»-kort. Siden har fire deler, med hurtiglenker øverst: (1) **Søk** — skriv norsk eller tysk (også en bøyd form som «älteren» eller «besten»), nivåfilter A1–B1, «Tilfeldig adjektiv», direktelenker `#alt`; treffet viser eksempelsetning (tysk + norsk), Positiv/Komparativ/Superlativ (omlyd og uregelmessige former i rødt), og tre bøyningstabeller (svak/blandet/sterk) for alle fire kasus × m/f/n/flertall, for hvert av de tre gradene, med endelsen uthevet; «Skriv selv» gjør alle felt til inputs med grønn hake. (2) **Forklaring** på norsk: hva et adjektiv er, de tre bruksmåtene (etter sein = uten endelse, foran substantiv = med endelse, som adverb), komparativ/superlativ med alle regler (-er/-st, -est, omlyd, -el/-er-ord, uregelmessige, so…wie/…er als, ikke-gradbøybare), og bøyning med oversiktstabell og huskeregler. (3) **Endelsestrener** — tilfeldig setning («Ich sehe den ___ (alt) Hund.»), valg av grad og artikkeltype, hint, poengtelling. (4) Alle adjektiv A–Å.

**Data:** `adjektiv_data.js` har 198 oppføringer (`a` adjektiv, `n` norsk, `l` nivå, `c` komparativ, `s` superlativ-stamme uten -en, `cm`/`sm` med røde markører ‹ ›, `ps` stamme før endelse (hoch→hoh, teuer→teur, dunkel→dunkl), `c2`/`s2` alternativ form, `ng` ikke gradbøybar, `ind` ubøyelig (orange/lila/rosa/beige), `nd` viel/wenig, `t` brukes i trener, `e`/`en` eksempelsetning). Dataene er laget av et Python-skript (regler for -er/-st/-est, listene over omlyd og uregelmessige former) og kontrollert mot ca. 50 kjente former. Endelsene i tabellene settes sammen i nettleseren av `END`/`ART`-tabellene i siden, så datafilen trenger bare stammene.

**Lagt inn:** kortet i `grammatikk/index.html`, «🎨 Adjektiv» i Sprache-listen på forsiden, søkeindeks-oppføring (nøkler: adjektiv, komparativ, superlativ, steigern, deklination …). Ikke lagt i toppmenyen (den er allerede lang). Kjent begrensning: de tyske eksempelsetningene og norske oversettelsene er skrevet for hånd og ikke gjennomgått av en morsmålsbruker.


### Musikk: «Hits år for år (1996–2025)»

Teach ga tre tabeller med tre kjente sanger per år fra 1996 til 2025 (90 plasseringer) og ba om å få dem inn på musikksiden, bortsett fra de som allerede lå der. Løst som en egen seksjon («📅 Hits år for år») under sangkortene i `musik/index.html`, med fanene 1996–2005 / 2006–2015 / 2016–2025 / Alle. Dataene ligger i `dwYears` i siden (år → tre sanger). Sanger som allerede finnes i spilleren (13 plasseringer, f.eks. Du hast, Tage wie diese, Komet, Roller, Chöre) får knappen «▶ Spill her» som spiller dem i den eksisterende spilleren; matchingen skjer på tittel + artist. De øvrige får «🔎 Finn på YouTube», en lenke til YouTube-søk i ny fane, fordi det ikke er verifiserte video-ID-er for dem (de 27 sangene i spilleren er sjekket enkeltvis, disse er det ikke). Seksjonen sier tydelig at sangene ikke er innholdsvurdert. Tre sanger har merknad: Shirin David – Bauch Beine Po (🔞), Brothers Keepers – Adriano (⚠️, rasistisk drap), Nina Chuba – Wildberry Lillet (⚠️, alkohol), samt Die Ärzte – Ein Schwein namens Männer (⚠️, sjekk først). Kjente begrensninger: enkelte sanger står under to år slik Teach oppga (f.eks. MfG 1999/2000, Auf uns 2013/2014, Leiser 2017/2018, Komet 2022/2023); den uryddige oppføringen «Benson Boone / alternativ: Apache 207 – Miami» for 2024 er erstattet med «Apache 207 – Miami»; årstallene for de nyeste sangene er stikkprøvekontrollert mot nettet, men ikke alle 90 er kontrollert enkeltvis.


### Filme & Serien: seks nye filmer

Teach ba om å legge til Harte Jungs (2000), Mädchen, Mädchen (2001), Knallharte Jungs (2002), Türkisch für Anfänger (2012), Willkommen bei den Hartmanns (2016) og Das perfekte Geheimnis (2019) etter samme mønster som de eksisterende kortene (tittel, år · sjanger · regi, FSK-merke, beskrivelse, eventuell «Merk:»-linje og trailerknapp). Siden har nå 17 filmer + 5 serier. Regissør og aldersgrense er sjekket mot flere filmsider (Filmstarts, Moviepilot, artechock, Wikipedia), og alle seks YouTube-trailer-ID-ene er bekreftet å finnes (via YouTubes oEmbed-endepunkt). Aldersgrenser: Harte Jungs 12, Mädchen Mädchen 12, Knallharte Jungs 12 (Wikipedia oppgir FSK 16 for kinofassungen og 12 for TV-versjonen — dette står i merknaden), Türkisch für Anfänger 12, Hartmanns 6, Das perfekte Geheimnis 12. Fire av filmene (Harte Jungs, Mädchen Mädchen, Knallharte Jungs, Das perfekte Geheimnis) har en tydelig «Merk:»-linje om at innholdet (seksualitet, grov humor, utroskap) er mer voksent enn FSK 12 skulle tilsi, og at de passer best for eldre elever. Søkeindeksen på forsiden har fått nøkler for alle seks titlene. «Heute auf Deutschwelt» (`dwHeuteFilms`) er med vilje ikke utvidet med de nye filmene. Kjent begrensning: «Türkisch für Anfänger» oppgis som produsert 2011 i noen kilder; kinopremieren var 2012, og det står i kortet. Beskrivelsene er skrevet av Claude ut fra filmsidene og ikke sett mot selve filmene.


### Filme & Serien: fem nye serier (og siden gjelder nå hele ungdomstrinnet)

Teach ba om å legge til Kleo (2022), Babylon Berlin (2017), Deutschland 83 (2015), Das Boot (2018) og Berlin, Berlin (2002). Teach presiserte at listen ikke bare er for 8. trinn, men også for 10. trinn og elever på vei til videregående, at noen titler har høyere aldersgrense, og at serien sjelden blir sett (vanskelig å få tak i, sjelden med norsk tekst) — listen er et overblikk. Introteksten og filkommentaren er derfor endret til «ungdomstrinnet (8.–10. trinn)» og forklarer dette. Siden har nå 17 filmer + 10 serier. Alle fem trailer-ID-er er bekreftet å finnes (oEmbed). Aldersgrenser fra DVD/FSK: Babylon Berlin 12 (alle sesonger), Deutschland 83 12, Das Boot 12 (sesong 1), Berlin, Berlin 12. Kleo er en Netflix-serie uten FSK-merke i det jeg fant, så den er merket «Ikke FSK-klassifisert · anbefalt 16+» (Netflix selv markerer den som for modent publikum). Babylon Berlin og Das Boot har «Merk:»-linje om at innholdet er tyngre enn FSK 12 skulle tilsi (begge har 18-årsgrense i Storbritannia), og Das Boot nevner at dialogen er flerspråklig. Trailerlenken for Babylon Berlin gjelder siste (femte) sesong, som ble vist i ARD i september 2026; trailerlenken for Berlin, Berlin går til Netflix-filmen «Berlin, Berlin: Lolle on the Run» (2020) fordi selve TV-serien ikke har en trailer. Deutschland 83-kortet lenker til Geschichte-sidene om Den kalde krigen og Berlinmuren. Søkeindeksen har fått nøkler for alle titlene. Beskrivelsene er skrevet av Claude ut fra nettkilder; ingen av seriene er sett av oss.

## Slik legger du til en ny seksjon

1. **Kopier den mappen som ligner mest** på det du skal lage:
   - En ny by → kopier en av de eksisterende `staedte/`-mappene til f.eks.
     `staedte/salzburg/` (eller en annen ny by-mappe). Husk «Berühmte
     Personen»-seksjonen (samme `.dw-people-grid`-mønster på alle 11 byer
     nå) — 2–3 personer med ekte, verifiserte fakta (fødested/år ELLER en
     klar «bodde/arbeidet der»-tilknytning), ikke oppdiktede. Sjekk også om
     byen bruker euro eller en annen valuta (Zürich, Bern og Genf bruker
     CHF, se `dwCurrency`-mønsteret der — og husk en tydelig merknad på
     siden om dette, akkurat som på de tre). Husk også å legge det nye
     byportrettkortet under riktig landeoverskrift (🇩🇪/🇦🇹/🇨🇭) i
     `staedte/index.html` — se endringsloggoppføringen «Fire nye
     byportretter: Salzburg, Innsbruck, Bern, Genf + landegruppering i
     Städte-huben» lenger opp for `.dw-country-h2`-mønsteret.
   - **Et nytt tema i en av de 11 grammatikk-kategoriene** (siden
     «Grammatikk-restrukturering»-runden er `grammatikk/` en hub-av-huber —
     se eget avsnitt lenger opp): finn riktig kategorimappe (`artikler/`,
     `analyse/`, `adverbial/`, `adjektiv/`, `eiendomsord/`, `konjunksjoner/`,
     `personlig-pronomen/`, `preposisjoner/`, `sporreord/`, `tidsuttrykk/`
     eller `verb/`) og lag den nye siden **inni** den, f.eks.
     `grammatikk/preposisjoner/wechsel/`. Kopier `grammatikk/artikler/dativ/`
     som mal for samme spillmotor som Nominativ/Akkusativ/Dativ/Verben (ett
     spørsmål, ett svar) — men husk at en leaf-side nå ligger tre nivåer
     under rota, så `assets/style.css`-lenken og alle navigasjonslenker
     (unntatt selve Grammatik-lenken) skal ha `../../../`, mens
     Grammatik-lenken i navigasjonen (`.dw-nav-active`) og første ledd i
     brødsmulestien skal ha `../../`. Brødsmulestien blir tre ledd:
     `<a href="../../">🧩 Grammatik</a> → <a href="../">Kategorinavn</a> →
     Temanavn`. Bytt ut det tilhørende `dw-soon`-plassholderkortet i
     kategori-hub-siden (`grammatikk/<kategori>/index.html`) med et ekte
     `<a class="dw-card" href="ny-mappe/">`-kort. Hører temaet naturlig til
     9.–10. trinn (A2/B1) → legg `.dw-level-tag`-merket på kortet og lenk
     siden inn fra `fortgeschritten/index.html` også — se «Om 9.–10.
     trinn-nivået» lenger ned.
   - Et grammatikktema som trenger å blande FLERE spørsmålstyper i ett
     spill (som «Das Substantiv-ABC» blander kjønn/kasus/plural) → kopier
     `grammatikk/artikler/substantiv-abc/` og bytt ut `dwQuiz`-poolen. Hvert
     element har et `type`-felt (legg gjerne til en ny type om nødvendig)
     som `dwLoad()` sjekker for å vite hvordan setningen/valgene skal
     bygges — se kommentaren øverst i filen for detaljer.
     Referanseseksjonene (`.dw-rule`/`.dw-section`) øverst på siden kan
     gjenbrukes for enhver side som trenger regler/tabeller før selve
     øvingsspillet.
   - En ny ukentlig ordforråds-/rulletekst-type funksjon (data delt mellom
     forsiden og en egen side, gruppert i "uker" eller lignende perioder) →
     se `grammatikk/wortschatz-woche/` (ligger for seg selv, utenfor de 11
     kategoriene) og ticker-koden i `index.html`
     (`.dw-ticker`/`dwBuildTicker()`) for mønsteret: samme datasett
     (`dwWeeks`) duplisert i begge filer, en dato-basert
     `dwCurrentWeek()`-funksjon, og dynamisk quiz-bygging
     (`dwBuildQuiz()`) som trekker feilalternativer tilfeldig fra hele
     ordpoolen i stedet for faste `choices`-arrays.
   - Et nytt "analyser hele setningen"-tema (samme motor som
     Satz-Detektiv, der flere ledd i én setning skal kategoriseres etter
     hverandre) → kopier `grammatikk/analyse/satzanalyse/` og bytt ut
     `dwSentences`. Husk å holde setningene korte og grammatisk 100 % sikre
     — poolen er håndskrevet, ikke generert, nettopp for å unngå feil
     bøying/kasus. Lengre/mer avanserte setninger (leddsetninger,
     verb-sist-regelen) passer bedre som en egen, mer avansert side for
     9./10. trinn (og hører da naturlig hjemme i `grammatikk/analyse/`
     likevel, bare med `.dw-level-tag`).
   - Et nytt historietema → kopier den av `geschichte/berliner-mauer/`,
     `geschichte/kaiserreich/`, `geschichte/zweiter-weltkrieg/`,
     `geschichte/kleinstaaterei/` eller `geschichte/kalter-krieg/` som
     ligner mest, til f.eks. `geschichte/weimarer-republik/`. NB: alvorlige
     tema (som Holocaust) bør omtales faktabasert og kortfattet, slik det
     gjøres i norske lærebøker — se merknaden øverst i
     `geschichte/zweiter-weltkrieg/index.html`. Hører temaet naturlig til
     9.–10. trinn (dypere systemsammenligning, analyse eller kobling til
     dagens verden, ikke bare et vanskeligere ordforråd) → legg
     `.dw-level-tag`-merket på kortet i `geschichte/index.html` og lenk siden
     inn fra en ny «🕰️ Geschichte»-seksjon i `fortgeschritten/index.html`
     (se `geschichte/kalter-krieg/` for et eksempel med systemsammenlignings-
     tabell og to-perspektiv-lesing i stedet for bare tidslinje+lesetekst).
   - En ny detektiv-mysterie-lesetekst → kopier
     `lesen/wer-hat-den-kuchen-gegessen/` eller `lesen/der-verlorene-rucksack/`
     til f.eks. `lesen/den-hemmelige-dagbok/`.
   - En ny flash fiction-tekst (kort historie, egen dikting, med "Was ist
     der Twist?"-refleksjon) → kopier `lesen/der-regenschirm/` eller
     `lesen/die-sms/`. Hold teksten på ekte A1-nivå (Präsens/Perfekt, korte
     setninger, kjent ordforråd) — se merknaden øverst i filen.
   - En ny "ekte litteratur"-bonustekst (offentlig eiendom / gemeinfri
     tekst av en kjent forfatter) → kopier `lesen/kafka-parabeln/`-mønsteret
     (original tysk tekst + skjult norsk oversettelse du kan vise/skjule +
     gloseliste + hovedidé-spørsmål). Sjekk ALLTID opphavsrett først —
     tommelfingerregel i Tyskland/EU: 70 år etter forfatterens dødsår. Ikke
     bruk moderne, fortsatt opphavsrettsbeskyttede tekster.
   - En ny lyttevideo (f.eks. Nicos Weg Folge 16) → kopier en av de 15
     eksisterende `hoeren/nicos-weg-…/`-mappene (f.eks.
     `hoeren/nicos-weg-eine-pizza-bitte/`) til f.eks. `hoeren/nicos-weg-folge-16/`,
     og bytt video-ID-en i `<iframe src="https://www.youtube-nocookie.com/embed/…">`
     (finn video-ID-en i YouTube-lenken, delen etter `watch?v=` — sjekk alltid
     at ID-en er ekte, f.eks. via YouTubes oEmbed-endepunkt, før du publiserer;
     direkte `curl` mot oEmbed er blokkert av byggemiljøets proxy, men
     `WebFetch`-verktøyet når frem — se «Om video-ID-verifisering» lenger
     opp). Husk å bytte ut `dwListenWords`, Wortschatz-parene og hele
     `dwQuiz`-arrayet med innhold for den nye episoden, legg til et kort i
     `hoeren/index.html`, og legg til minst én egen, særegen søkenøkkel i
     `dwIndex` i rot-`index.html` (kjør en full kollisjonsskann etterpå).
   - En ny samtalesituasjon (f.eks. Am Flughafen) → kopier den av
     `sprechen/cafe/`, `sprechen/restaurant/`, `sprechen/butikken/`,
     `sprechen/hotell/` eller `sprechen/taxi/` som ligner mest, bytt ut
     `dwNodes` med en ny forgrenet dialog, og legg til kortet i
     `sprechen/index.html` (`sprechen/` har allerede sin egen hub, så
     ingen endring i toppnavigasjonen trengs).
   - Et nytt norm-/regeltema (f.eks. Pünktlichkeit eller Mülltrennung) →
     kopier `normen/hoeflichkeit/` til f.eks. `normen/puenktlichkeit/`
     (NB: da må `normen/` også få en egen hub-`index.html`, se mønsteret
     over).
   - Et nytt tema i «Deutsch im echten Leben» (f.eks. Gaming & Internet,
     Alltagssituationen eller Gleiches Wort andere Welt — de tre
     `dw-soon`-plassholderne som allerede ligger i `leben/index.html`) →
     kopier den av `leben/alltagssprache/` (quiz + sammenligning),
     `leben/chat/` (innkommende chat + skriv-et-svar) eller
     `leben/jugendwoerter/` (referansekort + testquiz) som ligner mest,
     bytt ut innholdet, og fjern `class="dw-soon"`/`href="#"` fra kortet
     i `leben/index.html` (`leben/` har allerede sin egen hub, så ingen
     endring i toppnavigasjonen trengs).
   - En ny skriveoppgave → kopier `schreiben/sms-chat/` (for et nytt
     samtalescenario, bytt `dwScenario`) eller `schreiben/wortkiste/` (for
     en ny ordpool, bytt `dwWordPool`) — begge har allerede
     egenvurderings-sjekklisten (`dwCheckItems`) klar til å tilpasses.
   - En ny skriveramme med setningsstartere (som Personenbeschreibung,
     Präsentation, Einen Ort beschreiben, Mein Tag, Wo ist was?) → kopier
     den som ligner mest (én tekstfelt-seksjon vs. flere), bytt ut
     `dwStarters` (én array per tekstfelt) og `dwCheckItems`. Legg gjerne
     til en `.dw-grammar`-boks (alltid synlig, ikke `<details>` — brukes
     for grammatikkpunkter eleven MÅ passe på, til forskjell fra
     `.dw-phrases`-boksen som er valgfri/skjult og brukes til nyttige
     fraser). Se `schreiben/wo-ist-was/` for hvordan en kompakt
     referansetabell (`.dw-table`) kan legges til når temaet trenger det
     (der ble den brukt som en lettvekts erstatning for en egen
     Dativ-grammatikkside, den gangen `grammatikk/dativ/` ikke var bygget
     ennå — nå finnes den, se «Om 9.–10. trinn-nivået» lenger ned).
   - En ny reiseoppgave → kopier den av `reise/reiseplanlegger/`,
     `reise/koffer/` eller `reise/reisetagebuch/` som ligner mest, og bytt
     ut `dwCities`/`dwScenarios`+`dwItemPool`/`dwStarters` etter hvilken
     mal du brukte.
   - En ny challenge → kopier `challenges/taegliche-herausforderung/`
     (bytt `dwChallengePool`), `challenges/wortschatz-jagd/` (bytt
     `dwPairs`) eller `challenges/escape-room/` (bytt `dwClues` — husk at
     `digit`-verdiene bare trenger å være ulike sifre, ikke i noen
     bestemt rekkefølge).
   - En ny film/serie på Filme & Serien-siden → kopier ett av
     `<div class="dw-media-card">`-blokkene i `filme-serien/index.html`
     og bytt tittel, år/sjanger/regi, FSK-chip
     (`dw-fsk-low`/`dw-fsk-mid`/`dw-fsk-high`/`dw-fsk-none`), beskrivelse
     og trailer-lenke. **Verifiser alltid at video-ID-en i YouTube-lenken
     faktisk eksisterer** før du publiserer — enkleste måte er å sjekke
     `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json`
     og se at tittelen som kommer tilbake stemmer med filmen/serien.
   - En ny sang på Musik-siden → legg til et nytt objekt i `dwSongs`-arrayet
     i `musik/index.html` (`artist`, `title`, `year`, `genre`, `id`,
     `about`, `tier`: `"none"`/`"note"`/`"warning"`, valgfritt `note` og
     `yearCorrected`). **Verifiser alltid video-ID-en** på samme måte som
     for Filme & Serien over, og vurder innholdet ærlig — sett `tier` til
     `"note"` eller `"warning"` hvis teksten har tyngre innhold (rus, vold,
     seksuelt ladet språk), ikke bare `"none"` som standard.
   - En ny by i kartspillet på Deutschland-siden → legg til et nytt objekt i
     `dwCities`-arrayet i `deutschland/index.html` (`name`, `x`, `y`, `pop`,
     `fact`). **Regn ALDRI `x`/`y` for hånd** — de må komme fra byens ekte
     lengde-/breddegrad projisert med samme metode som kartomrisset (se
     kommentaren øverst i filen og «Om Deutschland-siden» i denne README-en
     for hvordan projeksjonen fungerer), ellers havner byen feil plassert på
     kartet mens spillet fortsatt tror den er riktig. Siden rettingen bruker
     «nærmeste by»-logikk (ikke en fast radius), trenger du ikke justere
     noen toleranseverdi — det holder å legge til byen med korrekte
     koordinater.
   - Et nytt tema i kultur-/fakta-delen av Deutschland-siden (f.eks. en
     egen seksjon om skolesystem, ferier eller musikk/film-kultur utover det
     Filme & Serien/Musik allerede dekker) → kopier `.dw-section`-mønsteret
     fra en av de fire eksisterende seksjonene, og sjekk alle fakta med
     websøk før publisering — akkurat som resten av siden.
2. **Bytt ut innholdet** i den nye `index.html` — tekst, emoji, ordliste
   (`dwWords`), spørsmål (`dwQuiz`), dialog (`dwNodes`), tidslinje
   (`dwTimeline`), video-ID og lytteord (`dwListenWords`), eller
   chat-scenario/ordpool og sjekkliste (`dwScenario`/`dwWordPool`/
   `dwCheckItems`), avhengig av hvilken mal du brukte.
3. **Sjekk stien til `assets/style.css`** øverst i filen — den må ha like
   mange `../` som mappen ligger dypt under rotmappen (se de andre filene
   for eksempel).
4. **Oppdater navigasjonsmenyen** (`<nav class="dw-nav">`) øverst i *alle*
   filer i hele nettstedet, slik at den nye siden er nåbar samme vei fra
   alle sider.
5. **Koble til fra forsiden eller riktig hub-side**: finn eller lag kortet
   for seksjonen i `<div class="dw-grid">`, fjern `class="dw-soon"` og
   `href="#"` hvis det var en "kommer snart"-plassholder, og sett riktig
   relativ lenke.
6. **Legg gjerne til søkeord** i `dwIndex`-listen i `index.html` sitt
   `<script>`, slik at søkefeltet på forsiden finner den nye siden.

## Publisere med GitHub Pages

1. Opprett et nytt repository på GitHub og last opp *innholdet* i denne
   mappen (ikke selve zip-filen — pakk den ut først). Last opp mappe for
   mappe (drag-and-drop) for å være sikker på at strukturen bevares.
2. Gå til **Settings → Pages** i repositoryet.
3. Under **Source**, velg **Deploy from a branch**, velg branch `main` og
   mappe `/ (root)`, og trykk **Save**.
4. Etter noen minutter er siden tilgjengelig på
   `https://<brukernavn>.github.io/<repo-navn>/`.

**Merk:** GitHub Pages på en gratis konto krever at repositoryet er
**offentlig (public)** — koden og innholdet er da synlig for alle. Det er
uproblematisk for dette nettstedet siden det ikke inneholder elevdata,
karakterer eller annen personlig informasjon — bare undervisningsinnhold.

## Design

Alle sider deler samme fargepalett og komponentmønster (klasser som
`dw-header`, `dw-card`, `dw-section`) slik at nye seksjoner ser ut som en
naturlig del av samme nettsted. `assets/style.css` inneholder foreløpig
kun navigasjonsbaren og "kommer snart"-stilen — resten av stilen ligger
fortsatt i hver enkelt side. Hvis nettstedet vokser mye, kan det være
verdt å samle mer av den delte stilen i `assets/style.css` også.

**Visuell redesign — Schwarz-Rot-Gold (runde «Visuell redesign»):** Teach
syntes nettstedet virket «plain og firkantet» og ba om at fargene på
siden ble dannet av de tyske fargene, at flaggene til Tyskland, Østerrike
og Sveits fikk plass på forsiden, at emoji ble fjernet fra kortene i
hubene til fordel for en tematisk, integrert bakgrunn som ikke går ut
over lesbarheten, og en «spenstigere» skrifttype i banneret på
hovedsiden. Claude avklarte tre valg med AskUserQuestion (pilot vs. hele
siden på én gang, enkle geometriske mønstre vs. mer detaljerte
illustrasjoner, og hvor flaggene skulle plasseres) — Teach valgte pilot
først (forsiden + Grammatikk-huben), enkle geometriske mønstre, og en
diskret flaggstripe i banneret. Etter godkjenning av piloten ble stilen
rullet ut på hele nettstedet, pluss at emoji også ble fjernet fra selve
banner-overskriftene (`<h1>`) på alle sider, ikke bare fra kortene.

- **Fargepalett:** `--dw-primary:#161616` (svart), `--dw-primary-light:#9c1329`
  (rødt) og `--dw-accent:#d9a91c` (gult) — de samme tre CSS-variablene som
  før (bare nye hex-verdier), så navigasjonsbaren i `assets/style.css`
  (som leser dem via `var(--dw-primary, …)`) fikk automatisk den nye
  paletten uten egne endringer der. `.dw-header` har fått en tre-trinns
  gradient `linear-gradient(120deg, var(--dw-primary) 0%,
  var(--dw-primary-light) 55%, var(--dw-accent) 100%)` (svart → rødt →
  gult) i stedet for den gamle to-trinns marineblå gradienten.
  Kortoverskrifter (`.dw-card h2`) bruker nå den røde fargen i stedet for
  svart/marineblå, for litt mer varme.
- **Skrift:** Google Fonts **Baloo 2** (600/700/800) lastes inn i alle
  sider og brukes på alle `.dw-header h1` — størst og tydeligst på
  forsidens «DEUTSCHWELT» (`clamp(2.6rem, 9vw, 4.4rem)`, med skygge for å
  stå tydelig mot gradienten), ellers samme font-size som hver side
  allerede hadde, bare med Baloo 2 i stedet for systemfonten. **Krever
  internettforbindelse til `fonts.googleapis.com`** — på et nettverk som
  blokkerer Google Fonts faller nettleseren automatisk tilbake til
  systemfonten (fallback-stabelen er fortsatt med i `font-family`), så
  ingenting går i stykker, men banneret ser da ut som før.
- **Flagg:** Tyskland/Østerrike/Sveits vises som tre små, rene CSS-tegnede
  flagg (`.dw-flag-de/-at/-ch`, bygget med `linear-gradient`/`::before`/
  `::after` — ingen bilder eller emoji) rett under undertittelen i
  forsidens banner.
- **Emoji fjernet, erstattet med tematiske mønstre:** alle `<span
  class="dw-icon">`-emoji er fjernet fra kortene i alle 21 hub-sider
  (sider med et `.dw-grid` av `.dw-card`-lenker) og fra alle `<h1>`
  banner-overskrifter på alle 93 sider. Hvert kort har i stedet fått en
  lett, tematisk SVG-bakgrunn (f.eks. lydbølger for Hören, en
  bybilde-silhuett for Städte, et spørsmålstegn for Spørreord, en
  lyskaster/lynpil for Verb) — se `PATTERNS`-biblioteket i
  build-scriptet fra denne runden (ikke lagt inn i selve nettstedet, kun
  brukt til å generere CSS-en). Mønsteret er en `data:image/svg+xml`-URI
  med lav fyll-/strøk-opasitet (ca. 0,07–0,12) direkte bakt inn i SVG-en,
  så det er trygt lesbart som tekstur uten å gå ut over kontrasten på
  teksten oppå. **Forsiden og Grammatikk-huben** (hub-av-huber) har hver
  sitt **eget, unike mønster per kort** (15 + 12 = 27 distinkte motiver,
  siden hvert kort der peker til et helt eget tema). **De øvrige 19
  hub-sidene** (f.eks. Städte, Geschichte, Hören, alle grammatikk-
  kategori-hubene) bruker **ett gjenbrukt mønster per hub**, likt på
  alle kortene i den huben — en bevisst avveining for å holde omfanget
  overkommelig, siden disse hubenes kort peker til under-temaer av
  samme overordnede sak (f.eks. alle 15 Hören-episodene er «Nicos Weg»,
  så de deler lydbølge-mønsteret; de 7 byene i Städte deler
  bybilde-mønsteret). `.dw-card .dw-icon`-CSS-regelen (nå ubrukt) er
  fjernet fra alle 93 sider som en opprydding.
- **Uendret:** selve navigasjonsmenyens emoji (🏠 Forside, 🧩 Grammatik
  osv.) er bevisst beholdt — Teach ba kun om at emoji ble fjernet fra
  kortene og banner-overskriftene, ikke fra navigasjonen.

Full verifisering etter redesignen: JS-syntaks-sjekk og lenke-
integritetssjekk (1855 relative lenker, 0 ekte brutte) på alle 93 sider,
pluss en automatisert gjennomgang med Playwright som åpnet alle 93
sidene og bekreftet 0 JavaScript-feil og ingen HTTP-feil.

## Kjente begrensninger

- **Banner-skriften (Baloo 2) krever internettforbindelse til Google
  Fonts** (`fonts.googleapis.com`/`fonts.gstatic.com`). Blokkerer skolens
  nettverk dette, faller nettleseren automatisk tilbake til systemfonten
  — banneret ser da ut som før redesignen, men ingenting slutter å
  fungere.
- **Hören-videoene er avhengig av YouTube.** Hvis skolens nettverk
  blokkerer YouTube helt (både innebygging og direktelenke), fungerer
  ikke denne seksjonen uten videre — da må videoene evt. lastes ned og
  vises lokalt av læreren i stedet.
- **Personlig fremgang på tvers av økter** (f.eks. en "Mein Deutsch"-side
  som husker hver elevs resultater) og en **lærerdel** med innsending og
  oversikt over elevsvar krever en database/backend — dette er utenfor
  hva et rent statisk nettsted kan gjøre, og må eventuelt løses med en
  enkel tilleggstjeneste senere.
- **«Heute auf Deutschwelt» (Stadt/Film des Tages) bruker elevens egen
  klokke, ikke en server.** Rotasjonen regnes ut fra `new Date()` i
  nettleseren, så en elev med feil dato/klokkeslett innstilt på
  enheten sin kan se en annen anbefaling enn klassekameratene — dette
  påvirker kun hvilken by/film som fremheves, ikke noe annet
  funksjonalitet, og alle forslagene er uansett ekte, fungerende sider.
- **«Die Verwandlung», Dritter Teil, er ikke 100 % komplett.** Kun de tre
  første avsnittene kunne hentes ordrett fra kilden denne runden (se
  Klassikere-runden over for detaljer). Siden viser den ordrette teksten
  så langt den går, et tydelig merket sammendrag (skrevet av Claude, ikke
  sitert som Kafka-tekst) av resten av handlingen, og en lenke til en
  gratis kilde for hele originalteksten. Hvis noen får hentet ut resten
  ordrett senere, bør sammendraget byttes ut med ekte tekst.
