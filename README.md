# Deutschwelt

Digital tyskunivers-plattform for norske ungdomsskoleelever (8. trinn, A1).
Statisk nettsted — ren HTML/CSS/JavaScript, ingen server eller database nødvendig.

## Mappestruktur

```
deutschwelt-site/
├── index.html                    → forsiden ("Was möchtest du heute machen?")
├── assets/
│   └── style.css                 → delt navigasjonsstil (brukes av alle sider)
├── grammatikk/
│   └── index.html                → "Der Artikel-Detektiv" (der/die/das)
├── staedte/
│   └── berlin/
│       └── index.html            → byportrett: Berlin
└── sprechen/
    └── cafe/
        └── index.html            → "Du bist dran!" — Im Café
```

Hver seksjon ligger i sin egen mappe med en `index.html`, slik at adressen
blir ren og kort (f.eks. `.../staedte/berlin/` i stedet for
`.../staedte/berlin/index.html`).

## Slik legger du til en ny seksjon

1. **Kopier den mappen som ligner mest** på det du skal lage:
   - En ny by (f.eks. Wien) → kopier `staedte/berlin/` til `staedte/wien/`.
   - Et nytt grammatikktema (f.eks. Akkusativ) → kopier `grammatikk/` til en
     ny mappe, f.eks. `grammatikk/akkusativ/`.
   - En ny samtalesituasjon (f.eks. Am Bahnhof) → kopier `sprechen/cafe/`
     til `sprechen/bahnhof/`.
2. **Bytt ut innholdet** i den nye `index.html` — tekst, emoji, ordliste
   (`dwWords`), spørsmål (`dwQuiz`) eller dialog (`dwNodes`), avhengig av
   hvilken mal du brukte.
3. **Sjekk stien til `assets/style.css`** øverst i filen — den må ha like
   mange `../` som mappen ligger dypt under rotmappen (se de andre filene
   for eksempel).
4. **Oppdater navigasjonsmenyen** (`<nav class="dw-nav">`) øverst i alle
   filer, slik at den nye siden vises der du vil ha den.
5. **Koble til fra forsiden** (`index.html`): finn kortet for seksjonen i
   `<div class="dw-grid">`, fjern `class="dw-soon"` og `href="#"`, og sett
   riktig relativ lenke (f.eks. `href="staedte/wien/"`).

## Publisere med GitHub Pages

1. Opprett et nytt repository på GitHub og last opp *innholdet* i denne
   mappen (ikke selve zip-filen — pakk den ut først).
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
kun navigasjonsbaren — resten av stilen ligger fortsatt i hver enkelt
side. Hvis nettstedet vokser mye, kan det være verdt å samle mer av den
delte stilen i `assets/style.css` også.
