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
│   ├── nominativ/
│   │   └── index.html                → "Der Artikel-Detektiv" (der/die/das)
│   ├── akkusativ/
│   │   └── index.html                → "Die Akkusativ-Jagd" (den/die/das)
│   ├── verben-regelmaessig/
│   │   └── index.html                → "Verb-Werkstatt": presens av regelrette verb
│   └── verben-unregelmaessig/
│       └── index.html                → "Verb-Werkstatt": presens av sein, haben m.fl.
├── staedte/
│   ├── index.html                    → hub-side: velg by
│   ├── berlin/
│   │   └── index.html                → byportrett: Berlin
│   └── wien/
│       └── index.html                → byportrett: Wien
├── geschichte/
│   ├── index.html                    → hub-side: velg historietema
│   └── berliner-mauer/
│       └── index.html                → "Die Berliner Mauer" (tidslinje + lese/skrive/muntlig-opplegg)
├── lesen/
│   ├── index.html                    → hub-side: velg lesetekst
│   ├── ein-wochenende-in-berlin/
│   │   └── index.html                → leseforståelse: Lukas' helg i Berlin
│   └── wer-hat-den-kuchen-gegessen/
│       └── index.html                → leseforståelse: mysterium i klasse 8b
├── hoeren/
│   ├── index.html                    → hub-side: velg lyttevideo
│   ├── nicos-weg-hallo/
│   │   └── index.html                → video + oppgaver: Nicos Weg, Folge 1 (Hallo!)
│   └── nicos-weg-kein-problem/
│       └── index.html                → video + oppgaver: Nicos Weg, Folge 2 (Kein Problem!)
├── schreiben/
│   ├── index.html                    → hub-side: velg skriveoppgave
│   ├── sms-chat/
│   │   └── index.html                → "SMS-Chat" — eleven skriver begge sider av en chat
│   └── wortkiste/
│       └── index.html                → "Die Wortkiste" — skriv med tilfeldig trukne ord
└── sprechen/
    └── cafe/
        └── index.html                → "Du bist dran!" — Im Café
```

Hver seksjon ligger i sin egen mappe med en `index.html`, slik at adressen
blir ren og kort (f.eks. `.../staedte/berlin/` i stedet for
`.../staedte/berlin/index.html`).

**Mønster for hub-sider:** så snart en seksjon har to eller flere
undersider (som `staedte/`, `geschichte/`, `grammatikk/`, `lesen/`,
`hoeren/` og `schreiben/` nå har), får den en egen `index.html` som viser
et lite kortgalleri med lenker videre — akkurat som forsiden, bare
smalere. `sprechen/` har foreløpig bare én underside, så navigasjonsmenyen
peker rett dit; når du legger til nummer to der, lag en tilsvarende
hub-side og pek menyen dit i stedet (se steg 4 under).

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

## Slik legger du til en ny seksjon

1. **Kopier den mappen som ligner mest** på det du skal lage:
   - En ny by (f.eks. Zürich) → kopier `staedte/wien/` til `staedte/zuerich/`.
   - Et nytt grammatikktema (f.eks. Dativ) → kopier `grammatikk/akkusativ/`
     til f.eks. `grammatikk/dativ/`.
   - Et nytt historietema → kopier `geschichte/berliner-mauer/` til f.eks.
     `geschichte/kaiserreich/`.
   - En ny lesetekst → kopier `lesen/wer-hat-den-kuchen-gegessen/` til
     f.eks. `lesen/der-verlorene-rucksack/`.
   - En ny lyttevideo (f.eks. Nicos Weg Folge 3) → kopier
     `hoeren/nicos-weg-kein-problem/` til f.eks. `hoeren/nicos-weg-folge-3/`,
     og bytt video-ID-en i `<iframe src="https://www.youtube-nocookie.com/embed/…">`
     (finn video-ID-en i YouTube-lenken, delen etter `watch?v=`).
   - En ny samtalesituasjon (f.eks. Am Bahnhof) → kopier `sprechen/cafe/`
     til `sprechen/bahnhof/` (NB: da må `sprechen/` også få en egen
     hub-`index.html`, se mønsteret over).
   - En ny skriveoppgave → kopier `schreiben/sms-chat/` (for et nytt
     samtalescenario, bytt `dwScenario`) eller `schreiben/wortkiste/` (for
     en ny ordpool, bytt `dwWordPool`) — begge har allerede
     egenvurderings-sjekklisten (`dwCheckItems`) klar til å tilpasses.
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
