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
│   │   ├── index.html                → kategori-hub: Substantiv-ABC, Nominativ, Akkusativ, Dativ + Genitiv (kommer)
│   │   ├── substantiv-abc/
│   │   │   └── index.html            → "Das Substantiv-ABC": kjønn, artikkel i alle kasus (Nominativ/Akkusativ/Dativ) og pluralformer — referanse + blandet øvingsspill
│   │   ├── nominativ/
│   │   │   └── index.html            → "Der Artikel-Detektiv" (der/die/das)
│   │   ├── akkusativ/
│   │   │   └── index.html            → "Die Akkusativ-Jagd" (den/die/das)
│   │   └── dativ/
│   │       └── index.html            → "Der Dativ-Kompass" (dem/der) — 🎓 9.–10. trinn (A2/B1)
│   ├── analyse/
│   │   ├── index.html                → kategori-hub: Satzanalyse + ordstilling (kommer)
│   │   └── satzanalyse/
│   │       └── index.html            → "Der Satz-Detektiv": finn Subjekt/Verb/Objekt/Adverbial
│   ├── verb/
│   │   ├── index.html                → kategori-hub, delt inn i verbtider: Presens er bygget, Perfekt/Präteritum/Plusquamperfekt/Futur I/Futur II er planlagt
│   │   ├── praesens-regelmaessig/
│   │   │   └── index.html            → "Verb-Werkstatt": presens av regelrette verb
│   │   └── praesens-unregelmaessig/
│   │       └── index.html            → "Verb-Werkstatt": presens av sein, haben m.fl.
│   ├── preposisjoner/
│   │   └── index.html                → kategori-hub (alt planlagt): Akkusativ-, Dativ- og Wechselpräpositionen
│   ├── adverbial/
│   │   └── index.html                → kategori-hub (alt planlagt): TeKaMoLo, stedsadverbial
│   ├── adjektiv/
│   │   └── index.html                → kategori-hub (alt planlagt): adjektivbøying, komparativ/superlativ
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
│   └── wortschatz-woche/
│       └── index.html                → "Wortschatz der Woche": 498 høyfrekvente ord fordelt på 50 uker (10/uke), ordliste + dynamisk quiz — samme ukesdata som forsidens rulletekst — ligger for seg selv, utenfor de 11 kategoriene
├── staedte/
│   ├── index.html                    → hub-side: velg by (7 kort)
│   ├── berlin/
│   │   └── index.html                → byportrett: Berlin
│   ├── wien/
│   │   └── index.html                → byportrett: Wien
│   ├── zuerich/
│   │   └── index.html                → byportrett: Zürich (budsjett i sveitserfranc, CHF)
│   ├── hamburg/
│   │   └── index.html                → byportrett: Hamburg
│   ├── muenchen/
│   │   └── index.html                → byportrett: München
│   ├── koeln/
│   │   └── index.html                → byportrett: Köln
│   └── frankfurt/
│       └── index.html                → byportrett: Frankfurt am Main
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
│   └── kafka-parabeln/
│       └── index.html                → bonus: to ekte, gemeinfrie tekster av Franz Kafka + norsk oversettelse
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
│   └── index.html                    → "Filme & Serien" — 11 filmer + 5 serier med trailerlenker
├── musik/
│   └── index.html                    → "Musik" — 27 tyske sanger med innebygd YouTube-spiller
├── deutschland/
│   └── index.html                    → "Deutschland" — kultur/tradisjon/fakta + interaktivt dra-og-slipp-kart (10 største byer)
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

**Om toppnavigasjonen:** den har nå 16 punkter (🏠 Forside ·
🧩 Grammatik · 🏙️ Städte · 🕰️ Geschichte · 📖 Lesen · 🎧 Hören · ✍️ Schreiben ·
🗺️ Reise · 🏆 Challenges · 🎬 Filme & Serien · 🎵 Musik · 🇩🇪 Deutschland ·
🎩 Normen & Regler · 📱 Deutsch im echten Leben · 🗣️ Sprechen · 🎓 9.–10. trinn —
🇩🇪 Deutschland er nyest, se «Om Deutschland-siden» lenger ned) og bruker `flex-wrap` i
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
læreboka. `leben/index.html` er en hub med 7 kort: 4 er bygget ut
(`alltagssprache/`, `chat/`, `jugendwoerter/`, `schule/`) og 3 er
`dw-soon`-plassholdere (Gaming & Internet, Alltagssituationen, Gleiches
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

## Slik legger du til en ny seksjon

1. **Kopier den mappen som ligner mest** på det du skal lage:
   - En ny by → kopier en av de eksisterende `staedte/`-mappene til f.eks.
     `staedte/salzburg/`. Husk «Berühmte Personen»-seksjonen (samme
     `.dw-people-grid`-mønster på alle 7 byer nå) — 2–3 personer med ekte,
     verifiserte fakta (fødested/år ELLER en klar «bodde/arbeidet der»-
     tilknytning), ikke oppdiktede. Sjekk også om byen bruker euro eller en
     annen valuta (Zürich bruker CHF, se `dwCurrency`-mønsteret der).
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
