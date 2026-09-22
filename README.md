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
│   ├── index.html                    → hub-side: velg grammatikktema
│   ├── substantiv-abc/
│   │   └── index.html                → "Das Substantiv-ABC": kjønn, artikkel i alle kasus (Nominativ/Akkusativ/Dativ) og pluralformer — referanse + blandet øvingsspill
│   ├── nominativ/
│   │   └── index.html                → "Der Artikel-Detektiv" (der/die/das)
│   ├── akkusativ/
│   │   └── index.html                → "Die Akkusativ-Jagd" (den/die/das)
│   ├── dativ/
│   │   └── index.html                → "Der Dativ-Kompass" (dem/der) — 🎓 9.–10. trinn (A2/B1)
│   ├── verben-regelmaessig/
│   │   └── index.html                → "Verb-Werkstatt": presens av regelrette verb
│   ├── verben-unregelmaessig/
│   │   └── index.html                → "Verb-Werkstatt": presens av sein, haben m.fl.
│   └── satzanalyse/
│       └── index.html                → "Der Satz-Detektiv": finn Subjekt/Verb/Objekt/Adverbial
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
│   ├── kaiserreich/
│   │   └── index.html                → "Deutsches Kaiserreich" (1871–1918, tidslinje + lese/skrive/muntlig-opplegg)
│   ├── zweiter-weltkrieg/
│   │   └── index.html                → "Zweiter Weltkrieg" (1939–1945, med norsk vinkling — 9. april 1940)
│   └── berliner-mauer/
│       └── index.html                → "Die Berliner Mauer" (tidslinje + lese/skrive/muntlig-opplegg)
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
│   └── nicos-weg-ich-heisse-emma/
│       └── index.html                → video + oppgaver: Nicos Weg, Folge 5 (Ich heiße Emma)
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
                                         sin naturlige seksjon (f.eks. grammatikk/dativ/),
                                         og lenkes hit med .dw-level-tag-merket
```

`grammatikk/dativ/` (🧭 Der Dativ-Kompass) er det første ferdigbygde temaet på
9.–10. trinn-nivået — se «Om 9.–10. trinn-nivået» lenger ned.

Hver seksjon ligger i sin egen mappe med en `index.html`, slik at adressen
blir ren og kort (f.eks. `.../staedte/berlin/` i stedet for
`.../staedte/berlin/index.html`).

**Mønster for hub-sider:** så snart en seksjon har to eller flere
undersider (som `staedte/`, `geschichte/`, `grammatikk/`, `lesen/`,
`hoeren/`, `schreiben/`, `reise/`, `challenges/`, `leben/` og nå `sprechen/`
har), får den en egen `index.html` som viser et lite kortgalleri med lenker
videre — akkurat som forsiden, bare smalere.

**Om toppnavigasjonen:** den har nå 14 punkter (🏠 Forside ·
🧩 Grammatik · 🏙️ Städte · 🕰️ Geschichte · 📖 Lesen · 🎧 Hören · ✍️ Schreiben ·
🗺️ Reise · 🏆 Challenges · 🎬 Filme & Serien · 🎩 Normen & Regeln ·
📱 Deutsch im echten Leben · 🗣️ Sprechen · 🎓 9.–10. trinn — sistnevnte er ny,
se «Om 9.–10. trinn-nivået» lenger ned) og bruker `flex-wrap` i
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
sitater.

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
lagt til, akkurat som andre hub-barn (se `grammatikk/nominativ/` for
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
Akkusativ i `grammatikk/`), **men lenkes i tillegg samlet** i
`fortgeschritten/index.html`, en «hub av huber» merket med den nye
`.dw-level-tag`-CSS-klassen (definert i `assets/style.css`, blå kapsel —
brukes både som en liten merkelapp på kort og inline i brødsmulestien).
Piloten for hele mønsteret er **Der Dativ-Kompass**
(`grammatikk/dativ/`), bygget med nøyaktig samme spillmotor som
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

## Slik legger du til en ny seksjon

1. **Kopier den mappen som ligner mest** på det du skal lage:
   - En ny by → kopier en av de eksisterende `staedte/`-mappene til f.eks.
     `staedte/salzburg/`. Husk «Berühmte Personen»-seksjonen (samme
     `.dw-people-grid`-mønster på alle 7 byer nå) — 2–3 personer med ekte,
     verifiserte fakta (fødested/år ELLER en klar «bodde/arbeidet der»-
     tilknytning), ikke oppdiktede. Sjekk også om byen bruker euro eller en
     annen valuta (Zürich bruker CHF, se `dwCurrency`-mønsteret der).
   - Et nytt grammatikktema med samme spillmotor som Nominativ/Akkusativ/
     Dativ/Verben (ett spørsmål, ett svar) → kopier `grammatikk/dativ/` til
     f.eks. `grammatikk/genitiv/`. Hører temaet naturlig til 9.–10. trinn
     (A2/B1) → legg `.dw-level-tag`-merket på kortet i `grammatikk/index.html`
     og lenk siden inn fra `fortgeschritten/index.html` også — se «Om
     9.–10. trinn-nivået» lenger ned.
   - Et grammatikktema som trenger å blande FLERE spørsmålstyper i ett
     spill (som «Das Substantiv-ABC» blander kjønn/kasus/plural) → kopier
     `grammatikk/substantiv-abc/` og bytt ut `dwQuiz`-poolen. Hvert element
     har et `type`-felt (legg gjerne til en ny type om nødvendig) som
     `dwLoad()` sjekker for å vite hvordan setningen/valgene skal bygges —
     se kommentaren øverst i filen for detaljer. Referanseseksjonene
     (`.dw-rule`/`.dw-section`) øverst på siden kan gjenbrukes for enhver
     side som trenger regler/tabeller før selve øvingsspillet.
   - Et nytt "analyser hele setningen"-tema (samme motor som
     Satz-Detektiv, der flere ledd i én setning skal kategoriseres etter
     hverandre) → kopier `grammatikk/satzanalyse/` og bytt ut `dwSentences`.
     Husk å holde setningene korte og grammatisk 100 % sikre — poolen er
     håndskrevet, ikke generert, nettopp for å unngå feil bøying/kasus.
     Lengre/mer avanserte setninger (leddsetninger, verb-sist-regelen)
     passer bedre som en egen, mer avansert side for 9./10. trinn.
   - Et nytt historietema → kopier den av `geschichte/berliner-mauer/`,
     `geschichte/kaiserreich/` eller `geschichte/zweiter-weltkrieg/` som
     ligner mest, til f.eks. `geschichte/kalter-krieg/`. NB: alvorlige tema
     (som Holocaust) bør omtales faktabasert og kortfattet, slik det gjøres
     i norske lærebøker — se merknaden øverst i
     `geschichte/zweiter-weltkrieg/index.html`.
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
   - En ny lyttevideo (f.eks. Nicos Weg Folge 6) → kopier
     `hoeren/nicos-weg-ich-heisse-emma/` til f.eks. `hoeren/nicos-weg-folge-6/`,
     og bytt video-ID-en i `<iframe src="https://www.youtube-nocookie.com/embed/…">`
     (finn video-ID-en i YouTube-lenken, delen etter `watch?v=` — sjekk alltid
     at ID-en er ekte, f.eks. via YouTubes oEmbed-endepunkt, før du publiserer).
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

## Kjente begrensninger

- **Hören-videoene er avhengig av YouTube.** Hvis skolens nettverk
  blokkerer YouTube helt (både innebygging og direktelenke), fungerer
  ikke denne seksjonen uten videre — da må videoene evt. lastes ned og
  vises lokalt av læreren i stedet.
- **Personlig fremgang på tvers av økter** (f.eks. en "Mein Deutsch"-side
  som husker hver elevs resultater) og en **lærerdel** med innsending og
  oversikt over elevsvar krever en database/backend — dette er utenfor
  hva et rent statisk nettsted kan gjøre, og må eventuelt løses med en
  enkel tilleggstjeneste senere.
