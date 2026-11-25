/* Deutschwelt — Quiz-Arena: ferdige spørsmålssett og omforming av oppgaver fra spillgeneratoren (DWLudo.makeTasks).
   Format: se engine.js. Her skrives mc-spørsmål som M(spørsmål, riktig, feil1, feil2, …) – riktig svar står først og blandes av spillet. */
(function () {
  'use strict';
  function M(q, right) { var w = Array.prototype.slice.call(arguments, 2), n = typeof w[w.length - 1] === 'string' && /^\?/.test(w[w.length - 1]) ? w.pop().slice(1) : ''; return { t: 'mc', q: q, o: [right].concat(w), c: 0, n: n, sh: true }; }
  function F(q, c, n) { return { t: 'tf', q: q, c: c, n: n || '' }; }
  function T(q, a, n) { return { t: 'type', q: q, a: a, n: n || '' }; }
  var SETS = [
    { id: 'b-vorstellen', cat: 'Muntlig', title: 'Sich vorstellen (muntlig tema)', desc: 'Presentere seg selv: navn, alder, bosted og hobbyer.', qs: [
      M('Wie heißt du?', 'Ich heiße Mia.', 'Ich bin 14.', 'Ich wohne in Berlin.', 'Ich komme aus Mia.'),
      M('Wie alt bist du?', 'Ich bin vierzehn Jahre alt.', 'Ich heiße vierzehn.', 'Ich habe vierzehn Jahre alt.', 'Ich bin vierzehn Jahren.'),
      M('Woher kommst du?', 'Ich komme aus Norwegen.', 'Ich wohne aus Norwegen.', 'Ich bin in Norwegen aus.', 'Ich kommen aus Norwegen.'),
      M('Wo wohnst du?', 'Ich wohne in Oslo.', 'Ich wohne aus Oslo.', 'Ich wohnen in Oslo.', 'Ich komme in Oslo.'),
      M('Was ist dein Hobby?', 'Ich spiele gern Fußball.', 'Ich bin gern Fußball.', 'Ich spielst gern Fußball.', 'Ich habe gern Fußball.'),
      M('Wie geht’s?', 'Gut, danke! Und dir?', 'Ich heiße gut.', 'Ich bin vierzehn.', 'Ich wohne gut.'),
      M('Ergänze: Ich ___ Anna.', 'heiße', 'heißt', 'heißen', 'heißest'),
      M('Ergänze: Er ___ aus Schweden.', 'kommt', 'komme', 'kommst', 'kommen'),
      M('Was bedeutet «Freut mich!»?', 'Hyggelig å møte deg!', 'Takk skal du ha!', 'Ha det bra!', 'God morgen!'),
      M('Wie sagt man «Jeg er 15 år gammel»?', 'Ich bin 15 Jahre alt.', 'Ich habe 15 Jahre.', 'Ich heiße 15 Jahre.', 'Ich bin 15 Jahren alt.')
    ] },
    { id: 'b-familie', cat: 'Muntlig', title: 'Familie (muntlig tema)', desc: 'Familiemedlemmer og eiendomsord.', qs: [
      M('Der Bruder meiner Mutter ist mein …', 'Onkel', 'Opa', 'Cousin', 'Neffe'),
      M('Was bedeutet «die Schwester»?', 'søster', 'datter', 'tante', 'niese'),
      M('Ergänze: Das ist ___ Mutter.', 'meine', 'mein', 'meiner', 'meinen'),
      M('Ergänze: Ich habe ___ Bruder.', 'einen', 'ein', 'eine', 'einem'),
      M('Wie sagt man «bestemor» auf Deutsch?', 'Oma', 'Opa', 'Tante', 'Mutti'),
      M('Was bedeutet «die Eltern»?', 'foreldre', 'søsken', 'barn', 'besteforeldre'),
      M('Das Kind meiner Tante ist mein …', 'Cousin / meine Cousine', 'Neffe', 'Enkel', 'Bruder'),
      M('Ergänze: Wir haben zwei ___.', 'Kinder', 'Kinds', 'Kindes', 'Kindern'),
      M('Ergänze: Er ___ zwei Schwestern.', 'hat', 'haben', 'hast', 'habt'),
      M('Wie sagt man «søsken» auf Deutsch?', 'Geschwister', 'Eltern', 'Großeltern', 'Kinder'),
      T('Skriv på tysk: «bror»', ['Bruder', 'der Bruder'], 'Substantiv: du kan skrive med eller uten artikkel.')
    ] },
    { id: 'b-schule', cat: 'Muntlig', title: 'Schule und Fächer', desc: 'Skolefag, klasserom og klokkeslett.', qs: [
      M('Wie heißt das Fach «kroppsøving»?', 'Sport', 'Kunst', 'Musik', 'Erdkunde'),
      M('Wie heißt das Fach «geografi»?', 'Erdkunde', 'Geschichte', 'Biologie', 'Physik'),
      M('Montag, Dienstag, ___, Donnerstag, Freitag', 'Mittwoch', 'Samstag', 'Sonntag', 'Februar'),
      M('Was bedeutet «die Pause»?', 'friminutt', 'time', 'lekse', 'prøve'),
      M('Was bedeutet «die Hausaufgaben»?', 'lekser', 'klasserom', 'pult', 'lærer'),
      M('Ergänze: Wir ___ Deutsch.', 'lernen', 'lernt', 'lerne', 'lernst'),
      M('Wie sagt man «Klokka er åtte»?', 'Es ist acht Uhr.', 'Es hat acht Uhr.', 'Es ist die acht.', 'Es ist acht Stunde.'),
      M('Welches Wort passt nicht?', 'Banane', 'Kreide', 'Tafel', 'Heft', '?Skolting: kritt, tavle, hefte – og ett som ikke hører til.'),
      M('Was bedeutet «der Lehrer»?', 'lærer', 'elev', 'rektor', 'vaktmester'),
      F('«Das Klassenzimmer» bedeutet klasserom.', true)
    ] },
    { id: 'b-hobbys', cat: 'Muntlig', title: 'Hobbys und Freizeit', desc: 'Fritid, aktiviteter og verb.', qs: [
      M('Ich ___ gern Gitarre.', 'spiele', 'spielst', 'spielt', 'spielen'),
      M('Er ___ gern Bücher. (lesen)', 'liest', 'lest', 'lesst', 'lese'),
      M('Wir ___ am Wochenende ins Kino. (gehen)', 'gehen', 'geht', 'gehe', 'gehst'),
      M('Was bedeutet «Rad fahren»?', 'sykle', 'kjøre bil', 'gå', 'løpe'),
      M('Was bedeutet «schwimmen»?', 'svømme', 'synge', 'sove', 'sitte'),
      M('Du ___ sehr gut. (tanzen)', 'tanzt', 'tanze', 'tanzen', 'tanzst'),
      M('Wie sagt man «Jeg treffer venner»?', 'Ich treffe Freunde.', 'Ich treffe Freunden.', 'Ich trifft Freunde.', 'Ich Freunde treffe.'),
      M('Wie fragt man «Hva gjør du på fritida?»', 'Was machst du in deiner Freizeit?', 'Wie machst du deine Freizeit?', 'Wo machst du Freizeit?', 'Was bist du in der Freizeit?'),
      M('«Ich höre gern Musik.» bedeutet …', 'Jeg hører gjerne på musikk.', 'Jeg spiller gjerne musikk.', 'Jeg liker ikke musikk.', 'Jeg synger gjerne.'),
      F('«Ich lese gern» bedeutet «Jeg leser gjerne».', true)
    ] },
    { id: 'b-essen', cat: 'Muntlig', title: 'Essen und Trinken', desc: 'Mat, drikke og å bestille.', qs: [
      M('___ Apfel', 'der', 'die', 'das', 'den', '?Skolting: Apfel er hankjønn.'),
      M('___ Milch', 'die', 'der', 'das', 'dem'),
      M('___ Brot', 'das', 'der', 'die', 'den'),
      M('___ Käse', 'der', 'die', 'das', 'den'),
      M('___ Wasser', 'das', 'der', 'die', 'dem'),
      M('Was bedeutet «Guten Appetit!»?', 'Vær så god / smaker det!', 'God natt!', 'Takk for maten!', 'Hvor mye koster det?'),
      M('Wie fragt man nach dem Preis?', 'Was kostet das?', 'Was ist das?', 'Wo ist das?', 'Wer kostet das?'),
      M('«Ich möchte ein Glas Wasser, bitte.» bedeutet …', 'Jeg vil gjerne ha et glass vann.', 'Jeg har et glass vann.', 'Jeg drikker ikke vann.', 'Hvor er vannet?'),
      M('Welche Mahlzeit ist am Morgen?', 'das Frühstück', 'das Mittagessen', 'das Abendessen', 'der Nachtisch'),
      M('Wie sagt man «Det smaker godt!»?', 'Das schmeckt gut!', 'Das riecht gut!', 'Das ist gut Essen!', 'Das sieht gut!')
    ] },
    { id: 'g-akkusativ', cat: 'Grammatikk', title: 'Akkusativ', desc: 'Akkusativ etter verb og preposisjoner (für, ohne, durch …).', qs: [
      M('Ich sehe ___ Mann.', 'den', 'der', 'dem', 'des', '?Hankjønn i akkusativ.'),
      M('Sie kauft ___ Tasche.', 'die', 'der', 'den', 'dem', '?Hunkjønn endres ikke i akkusativ.'),
      M('Er hat ___ Hund.', 'einen', 'ein', 'eine', 'einem'),
      M('Wir besuchen ___ Freundin.', 'unsere', 'unser', 'unserem', 'unseren'),
      M('Ich esse ___ Apfel.', 'einen', 'ein', 'einem', 'einer'),
      M('Er liebt ___ Kind. (das Kind)', 'das', 'den', 'dem', 'die'),
      M('Welche Präposition verlangt Akkusativ?', 'für', 'mit', 'von', 'bei'),
      M('Das Geschenk ist ___ dich.', 'für', 'mit', 'nach', 'zu'),
      M('Ich kaufe ___ Buch. (das Buch)', 'ein', 'einen', 'einem', 'einer'),
      M('Hast du ___ Schwester?', 'eine', 'einen', 'einer', 'einem')
    ] },
    { id: 'g-dativ', cat: 'Grammatikk', title: 'Dativ und Präpositionen', desc: 'Dativ etter mit, bei, nach, aus, von, zu, seit + Wo/Wohin.', qs: [
      M('Ich wohne bei ___ Oma.', 'meiner', 'meine', 'meinen', 'meinem'),
      M('Ich fahre mit ___ Bus.', 'dem', 'den', 'der', 'das'),
      M('Sie kommt aus ___ Schule.', 'der', 'die', 'den', 'dem'),
      M('Er gibt ___ Mann das Buch.', 'dem', 'den', 'der', 'dessen'),
      M('Nach ___ Schule gehe ich nach Hause.', 'der', 'die', 'den', 'das'),
      M('Das Buch gehört ___ Lehrerin.', 'der', 'die', 'den', 'dem'),
      M('Welche Präposition verlangt immer Dativ?', 'mit', 'für', 'ohne', 'durch'),
      M('Ich spiele mit ___ Kindern.', 'den', 'die', 'der', 'dem'),
      M('Wir wohnen in ___ Stadt. (Wo?)', 'der', 'die', 'den', 'dem', '?Hvor? = dativ.'),
      M('Ich gehe in ___ Stadt. (Wohin?)', 'die', 'der', 'dem', 'den', '?Hvorhen? = akkusativ.')
    ] },
    { id: 'g-wortstellung', cat: 'Grammatikk', title: 'Wortstellung', desc: 'Verbet på plass 2, ja/nei-spørsmål, weil-setninger og trennbare verb.', qs: [
      M('Welcher Satz ist richtig?', 'Heute gehe ich ins Kino.', 'Heute ich gehe ins Kino.', 'Ich heute gehe ins Kino.', 'Heute gehe ins Kino ich.'),
      M('Welcher Satz ist richtig?', 'Am Montag haben wir Sport.', 'Am Montag wir haben Sport.', 'Wir am Montag haben Sport.', 'Haben am Montag wir Sport.'),
      M('Welche Frage ist richtig?', 'Spielst du Fußball?', 'Du Fußball spielst?', 'Fußball du spielst?', 'Spielst Fußball du?'),
      M('Welcher Satz ist richtig?', 'Ich lerne Deutsch, weil ich nach Wien reise.', 'Ich lerne Deutsch, weil reise ich nach Wien.', 'Ich lerne Deutsch, weil ich reise nach Wien.', 'Ich lerne Deutsch, weil nach Wien ich reise.', '?Etter weil går verbet sist.'),
      M('Welcher Aussagesatz ist richtig?', 'Ich kann gut schwimmen.', 'Ich kann schwimmen gut.', 'Ich schwimmen kann gut.', 'Ich gut kann schwimmen.'),
      M('Welcher Satz ist richtig?', 'Ich habe gestern Fußball gespielt.', 'Ich habe gestern gespielt Fußball.', 'Ich gestern habe Fußball gespielt.', 'Ich Fußball habe gestern gespielt.'),
      M('Welche W-Frage ist richtig?', 'Wo wohnst du?', 'Wo du wohnst?', 'Wohnst wo du?', 'Wo wohnen du?'),
      M('Welcher Satz ist richtig?', 'Ich stehe um sieben Uhr auf.', 'Ich aufstehe um sieben Uhr.', 'Ich auf stehe um sieben Uhr.', 'Ich stehe auf um sieben Uhr.', '?Trennbare verb: prefikset går til slutt.'),
      M('Morgen ___ ich einen Test. (schreiben)', 'schreibe', 'schreibst', 'schreibt', 'schreiben'),
      M('Welches Wort steht im Aussagesatz immer auf Position 2?', 'das konjugierte Verb', 'das Subjekt', 'das Adjektiv', 'der Artikel')
    ] },
    { id: 'g-perfekt', cat: 'Grammatikk', title: 'Perfekt: haben oder sein?', desc: 'Hjelpeverb i perfektum.', qs: [
      M('Ich ___ nach Berlin gefahren.', 'bin', 'habe', 'hast', 'war'),
      M('Wir ___ Fußball gespielt.', 'haben', 'sind', 'seid', 'hat'),
      M('Er ___ zu Hause geblieben.', 'ist', 'hat', 'haben', 'bin', '?Bleiben går med sein.'),
      M('Sie ___ ein Buch gelesen. (hun)', 'hat', 'ist', 'haben', 'sind'),
      M('Ich ___ um sieben Uhr aufgestanden.', 'bin', 'habe', 'hat', 'war'),
      M('Du ___ gut geschlafen.', 'hast', 'bist', 'hat', 'habt'),
      M('Ihr ___ nach Wien geflogen.', 'seid', 'habt', 'sind', 'bin'),
      M('Das Kind ___ gefallen.', 'ist', 'hat', 'haben', 'hast'),
      M('Meine Eltern ___ Pizza gegessen.', 'haben', 'sind', 'hat', 'seid'),
      M('Verben der Bewegung bilden das Perfekt meist mit …', 'sein', 'haben', 'werden', 'können')
    ] },
    { id: 'g-modal', cat: 'Grammatikk', title: 'Modalverben', desc: 'können, müssen, wollen, dürfen, sollen, möchten.', qs: [
      M('Ich ___ schwimmen. (können)', 'kann', 'kannst', 'können', 'könnt'),
      M('Du ___ nach Hause gehen. (müssen)', 'musst', 'muss', 'müssen', 'müsst'),
      M('Wir ___ Deutsch lernen. (wollen)', 'wollen', 'will', 'willst', 'wollt'),
      M('Er ___ nicht kommen. (dürfen)', 'darf', 'dürft', 'dürfen', 'darfst'),
      M('Ihr ___ leise sein. (sollen)', 'sollt', 'soll', 'sollen', 'sollst'),
      M('Ich ___ gern ein Eis. (möchten)', 'möchte', 'möchtest', 'möchten', 'möchtet'),
      M('«Ich muss» bedeutet …', 'jeg må', 'jeg vil', 'jeg kan', 'jeg får lov'),
      M('«Ich darf» bedeutet …', 'jeg får lov til', 'jeg må', 'jeg skal', 'jeg vil'),
      M('Wo steht das zweite Verb im Satz mit Modalverb?', 'am Ende', 'am Anfang', 'nach dem Subjekt', 'vor dem Modalverb'),
      M('Welcher Satz ist richtig?', 'Ich kann heute nicht kommen.', 'Ich kann heute kommen nicht.', 'Ich kommen kann heute nicht.', 'Ich heute nicht kann kommen.')
    ] },
    { id: 'g-negation', cat: 'Grammatikk', title: 'Negation: nicht oder kein?', desc: 'nicht og kein / keine / keinen.', qs: [
      M('Ich habe ___ Hund. (der Hund)', 'keinen', 'kein', 'keine', 'nicht'),
      M('Das ist ___ Problem. (das Problem)', 'kein', 'keinen', 'keine', 'nicht'),
      M('Sie hat ___ Zeit. (die Zeit)', 'keine', 'kein', 'keinen', 'nicht'),
      M('Ich komme heute ___.', 'nicht', 'kein', 'keine', 'keinen'),
      M('Wir haben ___ Hausaufgaben.', 'keine', 'kein', 'keinen', 'nicht'),
      M('Welcher Satz ist richtig?', 'Ich habe keine Lust.', 'Ich habe nicht Lust.', 'Ich habe kein Lust.', 'Ich habe keinen Lust.'),
      M('Das ist ___ mein Bruder.', 'nicht', 'kein', 'keine', 'keinen'),
      M('«Ich mag keinen Fisch» bedeutet …', 'Jeg liker ikke fisk.', 'Jeg liker fisk.', 'Jeg har ikke fisk.', 'Jeg spiser fisk.'),
      M('Ich esse ___ Fleisch. (das Fleisch)', 'kein', 'keinen', 'nicht', 'keine'),
      F('«kein» steht vor einem Nomen.', true, '?Verb, adjektiv og hele setninger negeres med «nicht».')
    ] },
    { id: 'g-zahlen', cat: 'Grammatikk', title: 'Zahlen, Uhrzeit und Wochentage', desc: 'Tall, klokka og ukedager.', qs: [
      M('Was ist «dreizehn»?', '13', '30', '3', '31'),
      M('Was ist «vierzig»?', '40', '14', '4', '44'),
      M('Was ist «einundzwanzig»?', '21', '12', '120', '201', '?Tall på tysk: enerne først (ein-und-zwanzig).'),
      M('«Es ist halb drei.» Wie spät ist es?', '2:30', '3:30', '3:00', '2:15', '?Halb drei = halv tre = 2:30.'),
      M('«Viertel nach vier» bedeutet …', '4:15', '3:45', '4:45', '4:30'),
      M('«Viertel vor fünf» bedeutet …', '4:45', '5:15', '5:45', '4:15'),
      M('Wie fragt man «Hva er klokka?»', 'Wie spät ist es?', 'Wie viel kostet es?', 'Wie alt bist du?', 'Wie geht es?'),
      M('Was bedeutet «Dienstag»?', 'tirsdag', 'torsdag', 'onsdag', 'mandag'),
      M('Was bedeutet «Donnerstag»?', 'torsdag', 'tirsdag', 'lørdag', 'fredag'),
      M('Was ist «siebzehn»?', '17', '70', '7', '71')
    ] }
  ];

  /* ---- omforming av oppgaver fra DWLudo.makeTasks til quiz-spørsmål ---- */
  function fromTasks(tasks) {
    var out = [];
    (tasks || []).forEach(function (t) {
      var p = t.pub, v = t.priv, q = null;
      if (p.mode === 'choice') {
        var opts = p.opts.slice(), ci = opts.indexOf(v.choice); if (ci < 0) return;
        var text = p.k === 'art' ? 'Welcher Artikel? – ' + p.main : (p.k === 'pron' ? p.main.replace('___', '___') : p.head + ': ' + p.main);
        q = { t: 'mc', q: text, o: opts, c: ci, n: p.k === 'pron' ? (p.sub || '') : (p.sub && p.k !== 'trans' ? p.sub : ''), sh: p.optStyle !== 'art' };
        if (p.k === 'art') q.n = v.solNo ? 'Betyr: ' + v.solNo : '';
        if (p.k === 'trans') q.n = '';
      } else {
        var acc = (v.accept && v.accept.length ? v.accept.slice() : [v.sol]);
        if (v.art && v.accept) acc = acc.concat(v.accept.map(function (a) { return v.art + ' ' + a; }));
        if (p.k === 'verb') { q = { t: 'type', q: 'Bøy «' + p.main + '» (' + p.tenseLabel + ') for «' + p.pr + '»', a: [v.sol], n: (p.hints && p.hints[0]) || '' }; }
        else q = { t: 'type', q: p.head + ': ' + p.main, a: acc, n: '' };
      }
      out.push(q);
    });
    return out;
  }
  window.DWQuizBank = { SETS: SETS, fromTasks: fromTasks };
})();
