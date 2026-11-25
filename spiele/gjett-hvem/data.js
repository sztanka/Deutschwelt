/* Deutschwelt — «Wer ist es?» (Gjett hvem): data og spørsmålsbygger.
   To brett med 24 personer hver:  'look' (tegnede ansikter fra egenskaper)  og  'bio' (personkort med alder, by, yrke, hobby, kjæledyr).
   Et spørsmål er en liste av «atomer» (én egenskap hver) satt sammen med  og / oder.  Atomene vet selv:
     – spørsmålet på tysk  (verb + «die Person» + resten)  og norsk hjelp,
     – om de stemmer for en gitt person,
     – ja- og nei-setning (tysk) til svaret, avhengig av personens kjønn (er / sie).
   Ren JS uten DOM, slik at den kan testes i node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DWWerData = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------------- utseende ---------------- */
  var HC = { blond: ['blonde', 'blonden', 'blondt'], braun: ['braune', 'braunen', 'brunt'], schwarz: ['schwarze', 'schwarzen', 'svart'], rot: ['rote', 'roten', 'rødt'], grau: ['graue', 'grauen', 'grått'] };
  var EC = { blau: ['blaue', 'blauen', 'blå'], braun: ['braune', 'braunen', 'brune'], gruen: ['grüne', 'grünen', 'grønne'] };
  // [navn, kjønn, hårfarge, hårlengde, øyne, brille, hodeplagg (H=Hut, M=Mütze), skjegg, smiler, fregner, øreringer]
  var LOOK_RAW = [
    ['Anna', 'f', 'blond', 'lang', 'blau', 0, 0, 0, 1, 0, 1],
    ['Ben', 'm', 'braun', 'kurz', 'braun', 1, 0, 0, 1, 0, 0],
    ['Clara', 'f', 'braun', 'lang', 'gruen', 0, 0, 0, 0, 1, 0],
    ['David', 'm', 'schwarz', 'kurz', 'braun', 0, 0, 1, 1, 0, 0],
    ['Emma', 'f', 'rot', 'lang', 'gruen', 0, 0, 0, 1, 1, 0],
    ['Felix', 'm', 'blond', 'kurz', 'blau', 0, 'M', 0, 1, 0, 0],
    ['Greta', 'f', 'grau', 'kurz', 'blau', 1, 0, 0, 1, 0, 1],
    ['Hans', 'm', 'grau', 'glatze', 'braun', 1, 'H', 1, 0, 0, 0],
    ['Ida', 'f', 'schwarz', 'kurz', 'braun', 0, 'M', 0, 0, 0, 1],
    ['Jonas', 'm', 'rot', 'kurz', 'gruen', 0, 0, 0, 0, 1, 0],
    ['Klara', 'f', 'blond', 'kurz', 'gruen', 1, 0, 0, 0, 0, 0],
    ['Lukas', 'm', 'braun', 'lang', 'blau', 0, 'M', 1, 1, 0, 0],
    ['Mia', 'f', 'schwarz', 'lang', 'braun', 0, 0, 0, 1, 0, 0],
    ['Nico', 'm', 'schwarz', 'glatze', 'blau', 0, 0, 1, 0, 0, 0],
    ['Olga', 'f', 'grau', 'lang', 'braun', 1, 'H', 0, 1, 0, 1],
    ['Paul', 'm', 'blond', 'lang', 'gruen', 0, 0, 1, 0, 1, 0],
    ['Rosa', 'f', 'rot', 'kurz', 'blau', 0, 0, 0, 1, 1, 1],
    ['Sven', 'm', 'braun', 'glatze', 'gruen', 0, 'H', 0, 0, 0, 0],
    ['Tina', 'f', 'braun', 'kurz', 'braun', 0, 'H', 0, 1, 0, 0],
    ['Uwe', 'm', 'grau', 'kurz', 'gruen', 1, 0, 1, 1, 0, 0],
    ['Vera', 'f', 'blond', 'lang', 'braun', 1, 0, 0, 0, 0, 0],
    ['Willi', 'm', 'rot', 'lang', 'braun', 0, 0, 1, 0, 1, 0],
    ['Yara', 'f', 'schwarz', 'kurz', 'gruen', 0, 0, 0, 0, 1, 1],
    ['Zoe', 'f', 'braun', 'lang', 'blau', 1, 'M', 0, 1, 0, 0]
  ];
  var LOOK = LOOK_RAW.map(function (r, i) {
    return { id: i, name: r[0], g: r[1], hc: r[2], hl: r[3], eyes: r[4], glasses: !!r[5], hat: r[6] || '', beard: !!r[7], smile: !!r[8], freckles: !!r[9], earrings: !!r[10] };
  });

  /* ---------------- personkort ---------------- */
  var JOBS = {
    schule: { m: 'Schüler', f: 'Schülerin', q: 'Schüler/in', no: 'elev', av: 'A1' },
    lehrer: { m: 'Lehrer', f: 'Lehrerin', q: 'Lehrer/in', no: 'lærer', av: 'A2' },
    arzt: { m: 'Arzt', f: 'Ärztin', q: 'Arzt/Ärztin', no: 'lege', av: 'A2' },
    koch: { m: 'Koch', f: 'Köchin', q: 'Koch/Köchin', no: 'kokk', av: 'A2' },
    student: { m: 'Student', f: 'Studentin', q: 'Student/in', no: 'student', av: 'A2' },
    polizei: { m: 'Polizist', f: 'Polizistin', q: 'Polizist/in', no: 'politi', av: 'A2' },
    verkauf: { m: 'Verkäufer', f: 'Verkäuferin', q: 'Verkäufer/in', no: 'selger', av: 'A2' },
    baecker: { m: 'Bäcker', f: 'Bäckerin', q: 'Bäcker/in', no: 'baker', av: 'A2' }
  };
  var HOBBIES = {
    fussball: { v: 'spielt', rest: 'gern Fußball', neg: 'nicht gern Fußball', no: 'spiller gjerne fotball', icon: '⚽' },
    gitarre: { v: 'spielt', rest: 'gern Gitarre', neg: 'nicht gern Gitarre', no: 'spiller gjerne gitar', icon: '🎸' },
    lesen: { v: 'liest', rest: 'gern', neg: 'nicht gern', no: 'leser gjerne', icon: '📚' },
    tanzen: { v: 'tanzt', rest: 'gern', neg: 'nicht gern', no: 'danser gjerne', icon: '💃' },
    schwimmen: { v: 'schwimmt', rest: 'gern', neg: 'nicht gern', no: 'svømmer gjerne', icon: '🏊' },
    kochen: { v: 'kocht', rest: 'gern', neg: 'nicht gern', no: 'lager gjerne mat', icon: '🍳' },
    reiten: { v: 'reitet', rest: 'gern', neg: 'nicht gern', no: 'rir gjerne', icon: '🐴' },
    malen: { v: 'malt', rest: 'gern', neg: 'nicht gern', no: 'maler gjerne', icon: '🎨' }
  };
  var PETS = {
    hund: { rest: 'einen Hund', neg: 'keinen Hund', no: 'hund', icon: '🐶' },
    katze: { rest: 'eine Katze', neg: 'keine Katze', no: 'katt', icon: '🐱' },
    fisch: { rest: 'einen Fisch', neg: 'keinen Fisch', no: 'fisk', icon: '🐟' },
    vogel: { rest: 'einen Vogel', neg: 'keinen Vogel', no: 'fugl', icon: '🐦' },
    pferd: { rest: 'ein Pferd', neg: 'kein Pferd', no: 'hest', icon: '🐴' },
    keins: { rest: 'ein Haustier', neg: 'kein Haustier', no: 'kjæledyr', icon: '' }
  };
  var CITIES = ['Berlin', 'Hamburg', 'München', 'Köln', 'Wien', 'Graz', 'Zürich', 'Bern'];
  // [navn, kjønn, alder, by, yrke, hobby, kjæledyr]
  var BIO_RAW = [
    ['Mia', 'f', 14, 'Berlin', 'schule', 'fussball', 'hund'],
    ['Leon', 'm', 15, 'Hamburg', 'schule', 'gitarre', 'katze'],
    ['Lena', 'f', 13, 'Wien', 'schule', 'tanzen', 'keins'],
    ['Finn', 'm', 12, 'Bern', 'schule', 'schwimmen', 'fisch'],
    ['Sophie', 'f', 16, 'Köln', 'schule', 'reiten', 'pferd'],
    ['Max', 'm', 17, 'Zürich', 'schule', 'fussball', 'keins'],
    ['Julia', 'f', 22, 'München', 'student', 'malen', 'katze'],
    ['Tim', 'm', 24, 'Graz', 'student', 'gitarre', 'hund'],
    ['Frau Weber', 'f', 38, 'Hamburg', 'lehrer', 'lesen', 'katze'],
    ['Herr Braun', 'm', 45, 'Berlin', 'lehrer', 'fussball', 'keins'],
    ['Dr. Schmidt', 'f', 41, 'Wien', 'arzt', 'schwimmen', 'hund'],
    ['Dr. Keller', 'm', 52, 'Zürich', 'arzt', 'lesen', 'vogel'],
    ['Herr Fischer', 'm', 33, 'München', 'koch', 'kochen', 'keins'],
    ['Frau Wagner', 'f', 29, 'Köln', 'koch', 'tanzen', 'hund'],
    ['Jan', 'm', 27, 'Berlin', 'polizei', 'schwimmen', 'hund'],
    ['Nina', 'f', 31, 'Bern', 'polizei', 'reiten', 'pferd'],
    ['Frau Koch', 'f', 55, 'Graz', 'verkauf', 'kochen', 'katze'],
    ['Herr Bauer', 'm', 48, 'Köln', 'verkauf', 'malen', 'vogel'],
    ['Oma Lotte', 'f', 72, 'Wien', 'baecker', 'lesen', 'katze'],
    ['Opa Karl', 'm', 70, 'Hamburg', 'baecker', 'kochen', 'hund'],
    ['Emil', 'm', 11, 'München', 'schule', 'malen', 'fisch'],
    ['Hanna', 'f', 18, 'Bern', 'schule', 'gitarre', 'keins'],
    ['Paula', 'f', 26, 'Berlin', 'student', 'tanzen', 'katze'],
    ['Ole', 'm', 35, 'Graz', 'koch', 'fussball', 'fisch']
  ];
  var BIO = BIO_RAW.map(function (r, i) { return { id: i, name: r[0], g: r[1], age: r[2], city: r[3], job: r[4], hobby: r[5], pet: r[6] }; });

  /* ---------------- atomer ---------------- */
  function P(g) { return g === 'f' ? 'sie' : 'er'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  var CATS = {
    look: [
      { id: 'gender', label: 'Mann / Frau', icon: '🧑', lv: 'A1' },
      { id: 'hc', label: 'Hårfarge', icon: '💇', lv: 'A1' },
      { id: 'hl', label: 'Hårlengde', icon: '✂️', lv: 'A1' },
      { id: 'eyes', label: 'Øyne', icon: '👁️', lv: 'A1' },
      { id: 'glasses', label: 'Briller', icon: '👓', lv: 'A2' },
      { id: 'hat', label: 'Hatt / lue', icon: '🎩', lv: 'A2' },
      { id: 'beard', label: 'Skjegg', icon: '🧔', lv: 'A2' },
      { id: 'smile', label: 'Smil', icon: '😊', lv: 'A2' },
      { id: 'freckles', label: 'Fregner', icon: '🌞', lv: 'B1' },
      { id: 'earrings', label: 'Øreringer', icon: '💎', lv: 'B1' },
      { id: 'name', label: 'Navn', icon: '🏷️', lv: 'B1' }
    ],
    bio: [
      { id: 'gender', label: 'Mann / Frau', icon: '🧑', lv: 'A1' },
      { id: 'age', label: 'Alder', icon: '🎂', lv: 'A1' },
      { id: 'city', label: 'By', icon: '🏙️', lv: 'A1' },
      { id: 'pet', label: 'Kjæledyr', icon: '🐾', lv: 'A1' },
      { id: 'hobby', label: 'Hobby', icon: '🎯', lv: 'A2' },
      { id: 'job', label: 'Yrke', icon: '💼', lv: 'A2' },
      { id: 'name', label: 'Navn', icon: '🏷️', lv: 'B1' }
    ]
  };
  var LV = { A1: 1, A2: 2, B1: 3 };

  /* Hver atom-fabrikk lager objekter {id, cat, v (verb 3. person), q (rest til spørsmålet), no (norsk hjelp), test(char), yes(g), nei(g)} */
  function atomsFor(set, cat) {
    var out = [], k;
    function A(id, v, q, no, test, yes, nei) { out.push({ id: id, cat: cat, v: v, q: q, no: no, test: test, yes: yes, nei: nei }); }
    if (cat === 'gender') {
      A(cat + ':f', 'ist', 'eine Frau', 'Er personen en kvinne/jente?', function (c) { return c.g === 'f'; }, function (g) { return 'ist eine Frau'; }, function (g) { return 'ist ein Mann'; });
      A(cat + ':m', 'ist', 'ein Mann', 'Er personen en mann/gutt?', function (c) { return c.g === 'm'; }, function (g) { return 'ist ein Mann'; }, function (g) { return 'ist eine Frau'; });
      return out;
    }
    if (cat === 'name') {
      (set === 'look' ? LOOK : BIO).forEach(function (c) { A('name:' + c.id, 'heißt', c.name, 'Heter personen ' + c.name + '?', function (x) { return x.id === c.id; }, function () { return 'heißt ' + c.name; }, function () { return 'heißt nicht ' + c.name; }); });
      return out;
    }
    if (set === 'look') {
      if (cat === 'hc') Object.keys(HC).forEach(function (k) { A('hc:' + k, 'hat', HC[k][0] + ' Haare', 'Har personen ' + HC[k][2] + ' hår?', function (c) { return c.hc === k; }, function () { return 'hat ' + HC[k][0] + ' Haare'; }, function () { return 'hat keine ' + HC[k][1] + ' Haare'; }); });
      if (cat === 'hl') {
        A('hl:kurz', 'hat', 'kurze Haare', 'Har personen kort hår?', function (c) { return c.hl === 'kurz'; }, function () { return 'hat kurze Haare'; }, function () { return 'hat keine kurzen Haare'; });
        A('hl:lang', 'hat', 'lange Haare', 'Har personen langt hår?', function (c) { return c.hl === 'lang'; }, function () { return 'hat lange Haare'; }, function () { return 'hat keine langen Haare'; });
        A('hl:glatze', 'hat', 'eine Glatze', 'Er personen skallet?', function (c) { return c.hl === 'glatze'; }, function () { return 'hat eine Glatze'; }, function () { return 'hat keine Glatze'; });
      }
      if (cat === 'eyes') Object.keys(EC).forEach(function (k) { A('eyes:' + k, 'hat', EC[k][0] + ' Augen', 'Har personen ' + EC[k][2] + ' øyne?', function (c) { return c.eyes === k; }, function () { return 'hat ' + EC[k][0] + ' Augen'; }, function () { return 'hat keine ' + EC[k][1] + ' Augen'; }); });
      if (cat === 'glasses') A('glasses', 'trägt', 'eine Brille', 'Har personen briller?', function (c) { return c.glasses; }, function () { return 'trägt eine Brille'; }, function () { return 'trägt keine Brille'; });
      if (cat === 'hat') {
        A('hat:H', 'trägt', 'einen Hut', 'Har personen hatt?', function (c) { return c.hat === 'H'; }, function () { return 'trägt einen Hut'; }, function () { return 'trägt keinen Hut'; });
        A('hat:M', 'trägt', 'eine Mütze', 'Har personen lue?', function (c) { return c.hat === 'M'; }, function () { return 'trägt eine Mütze'; }, function () { return 'trägt keine Mütze'; });
      }
      if (cat === 'beard') A('beard', 'hat', 'einen Bart', 'Har personen skjegg?', function (c) { return c.beard; }, function () { return 'hat einen Bart'; }, function () { return 'hat keinen Bart'; });
      if (cat === 'smile') A('smile', 'lächelt', '', 'Smiler personen?', function (c) { return c.smile; }, function () { return 'lächelt'; }, function () { return 'lächelt nicht'; });
      if (cat === 'freckles') A('freckles', 'hat', 'Sommersprossen', 'Har personen fregner?', function (c) { return c.freckles; }, function () { return 'hat Sommersprossen'; }, function () { return 'hat keine Sommersprossen'; });
      if (cat === 'earrings') A('earrings', 'trägt', 'Ohrringe', 'Har personen øreringer?', function (c) { return c.earrings; }, function () { return 'trägt Ohrringe'; }, function () { return 'trägt keine Ohrringe'; });
    } else {
      if (cat === 'age') [14, 20, 30, 45].forEach(function (n) {
        A('age:' + n, 'ist', 'älter als ' + n, 'Er personen eldre enn ' + n + ' år?', function (c) { return c.age > n; }, function () { return 'ist älter als ' + n; }, function () { return 'ist nicht älter als ' + n; });
      });
      if (cat === 'city') CITIES.forEach(function (k) { A('city:' + k, 'wohnt', 'in ' + k, 'Bor personen i ' + k + '?', function (c) { return c.city === k; }, function () { return 'wohnt in ' + k; }, function () { return 'wohnt nicht in ' + k; }); });
      if (cat === 'pet') Object.keys(PETS).forEach(function (k) { var x = PETS[k]; A(k === 'keins' ? 'pet:any' : 'pet:' + k, 'hat', x.rest, 'Har personen ' + (k === 'keins' ? 'et kjæledyr' : x.no) + '?', function (c) { return k === 'keins' ? c.pet !== 'keins' : c.pet === k; }, function () { return 'hat ' + x.rest; }, function () { return 'hat ' + x.neg; }); });
      if (cat === 'hobby') Object.keys(HOBBIES).forEach(function (k) { var x = HOBBIES[k]; A('hobby:' + k, x.v, x.rest, 'Hobby: personen ' + x.no + '?', function (c) { return c.hobby === k; }, function () { return x.v + ' ' + x.rest; }, function () { return x.v + ' ' + x.neg; }); });
      if (cat === 'job') Object.keys(JOBS).forEach(function (k) { var x = JOBS[k]; A('job:' + k, 'ist', x.q, 'Er personen ' + x.no + '?', function (c) { return c.job === k; }, function (g) { return 'ist ' + x[g]; }, function (g) { return 'ist kein' + (g === 'f' ? 'e ' : ' ') + x[g]; }); });
    }
    return out;
  }
  // «Hat die Person eine Glatze?» osv. – tilstanden «hat keine …» for kvinne/mann trenger ikke å bøyes, men «ist kein/keine» gjør det (se job)
  var ATOM_CACHE = {};
  function atoms(set, cat) { var key = set + ':' + cat; return ATOM_CACHE[key] || (ATOM_CACHE[key] = atomsFor(set, cat)); }
  function allAtoms(set) { var o = {}; CATS[set].forEach(function (c) { atoms(set, c.id).forEach(function (a) { o[a.id] = a; }); }); return o; }
  function chars(set) { return set === 'bio' ? BIO : LOOK; }

  /* ---------------- spørsmål ---------------- */
  // q = { a: ['hc:blond'], op: 'und'|'oder' }  eller  { free: 'tekst' }
  function evalQ(set, q, c) {
    var all = allAtoms(set), res = q.a.map(function (id) { return all[id].test(c); });
    return q.op === 'oder' ? res.some(Boolean) : res.every(Boolean);
  }
  function valid(set, q) {
    if (!q) return false;
    if (q.free != null) return typeof q.free === 'string' && q.free.trim().length > 1 && q.free.length < 140;
    var all = allAtoms(set);
    return Array.isArray(q.a) && q.a.length >= 1 && q.a.length <= 2 && q.a.every(function (id) { return !!all[id]; }) && (q.a.length === 1 || q.op === 'und' || q.op === 'oder');
  }
  function text(set, q) {
    if (q.free != null) return q.free.trim();
    var all = allAtoms(set), a = q.a.map(function (id) { return all[id]; });
    var t = cap(a[0].v) + ' die Person' + (a[0].q ? ' ' + a[0].q : '');
    if (a[1]) t += ' ' + q.op + ' ' + a[1].v + ' die Person' + (a[1].q ? ' ' + a[1].q : '');
    return t + '?';
  }
  function textNo(set, q) {
    if (q.free != null) return '';
    var all = allAtoms(set), a = q.a.map(function (id) { return all[id]; });
    var t = a[0].no.replace(/\?$/, '');
    if (a[1]) t += (q.op === 'und' ? ' og ' : ' eller ') + a[1].no.charAt(0).toLowerCase() + a[1].no.slice(1).replace(/\?$/, '');
    return t + '?';
  }
  // svarsetninger (for den som svarer – to knapper) basert på hemmelig person
  function answers(set, q, secret) {
    var g = secret.g, p = P(g);
    if (q.free != null) return { yes: 'Ja.', no: 'Nein.' };
    var all = allAtoms(set), a = q.a.map(function (id) { return all[id]; });
    if (a.length === 1) return { yes: 'Ja, ' + p + ' ' + a[0].yes(g) + '.', no: 'Nein, ' + p + ' ' + a[0].nei(g) + '.' };
    var t0 = a[0].test(secret), t1 = a[1].test(secret);
    var y = q.op === 'und' ? 'Ja, ' + p + ' ' + a[0].yes(g) + ' und ' + a[1].yes(g) + '.' : 'Ja, ' + p + ' ' + (t0 ? a[0].yes(g) : '') + (t0 && t1 ? ' und ' : '') + (t1 ? a[1].yes(g) : '') + '.';
    if (q.op === 'oder' && !t0 && !t1) y = 'Ja, ' + p + ' ' + a[0].yes(g) + ' oder ' + a[1].yes(g) + '.';
    var n = 'Nein, ' + p + ' ' + (q.op === 'oder' ? a[0].nei(g) + ' und ' + a[1].nei(g) : (t0 && !t1 ? a[0].yes(g) + ', aber ' + a[1].nei(g) : (!t0 && t1 ? a[0].nei(g) + ', aber ' + a[1].yes(g) : a[0].nei(g) + ' und ' + a[1].nei(g)))) + '.';
    return { yes: y, no: n };
  }
  // setning som vises til spørreren etter at svaret er gitt
  function sentence(set, q, secret, yes) {
    var s = answers(set, q, secret); return yes ? s.yes : s.no;
  }
  function categories(set, level) { var lv = LV[level] || 1; return CATS[set].filter(function (c) { return LV[c.lv] <= lv; }); }

  /* personkort-tekst (bio) */
  function bioLines(c) {
    var h = HOBBIES[c.hobby], pt = PETS[c.pet], j = JOBS[c.job];
    return {
      l1: c.age + ' Jahre · ' + c.city,
      l2: j[c.g],
      l3: (c.hobby === 'fussball' || c.hobby === 'gitarre' ? 'spielt gern ' + (c.hobby === 'fussball' ? 'Fußball' : 'Gitarre') : h.v + ' gern'),
      l4: c.pet === 'keins' ? 'kein Haustier' : 'hat ' + pt.rest,
      ic: h.icon, pi: pt.icon
    };
  }
  function bioAvatar(c) {
    if (c.age >= 65) return c.g === 'f' ? '👵' : '👴';
    if (c.age >= 40) return c.g === 'f' ? '👩‍🦳' : '👨‍🦳';
    if (c.age >= 18) return c.g === 'f' ? '👩' : '👨';
    return c.g === 'f' ? '👧' : '👦';
  }

  return { LOOK: LOOK, BIO: BIO, HC: HC, EC: EC, JOBS: JOBS, HOBBIES: HOBBIES, PETS: PETS, CATS: CATS, atoms: atoms, allAtoms: allAtoms, chars: chars, evalQ: evalQ, valid: valid, text: text, textNo: textNo, answers: answers, sentence: sentence, categories: categories, bioLines: bioLines, bioAvatar: bioAvatar, P: P };
});
