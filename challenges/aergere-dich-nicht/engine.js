/* Deutschwelt — «Ärgere dich nicht» (Ludo med tyskoppgaver): spillmotor (kjører kun hos verten)
   Ren logikk uten DOM og nettverk, slik at den kan testes i Node (module.exports) og brukes i nettleseren (window.DWLudo).
   Verten eier alt: terningkast, oppgaver, retting, trekk og turrekkefølge. Alle andre får bare tilstands-«snapshots» (JSON)
   og sender «roll» / «answer» / «pick». Fasiten (priv) sendes aldri til gjestene før oppgaven er besvart.
   Avhenger av: ../stigespill/engine.js (DWStige: verbvalg og retting av verbbøying), data.js (DW_LUDO_DATA: ordlister) og dwVerben. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../stigespill/engine.js'), require('./data.js'));
  else root.DWLudo = factory(root.DWStige, root.DW_LUDO_DATA);
})(typeof self !== 'undefined' ? self : this, function (E, D) {
  'use strict';

  /* ---------- brettgeometri (11 × 11 ruter, som i originalen) ---------- */
  var RING = [[6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [10, 5],
    [10, 6], [9, 6], [8, 6], [7, 6], [6, 6], [6, 7], [6, 8], [6, 9], [6, 10], [5, 10],
    [4, 10], [4, 9], [4, 8], [4, 7], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 5],
    [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0], [5, 0]];
  var START = [0, 10, 20, 30];
  var LANE = [[[5, 1], [5, 2], [5, 3], [5, 4]], [[9, 5], [8, 5], [7, 5], [6, 5]], [[5, 9], [5, 8], [5, 7], [5, 6]], [[1, 5], [2, 5], [3, 5], [4, 5]]];
  var YARD = [[[8.5, 1.2], [9.8, 1.2], [8.5, 2.5], [9.8, 2.5]], [[8.5, 8.5], [9.8, 8.5], [8.5, 9.8], [9.8, 9.8]], [[1.2, 8.5], [2.5, 8.5], [1.2, 9.8], [2.5, 9.8]], [[1.2, 1.2], [2.5, 1.2], [1.2, 2.5], [2.5, 2.5]]];
  var SEATS = [{ name: 'Rød', col: '#e8222b' }, { name: 'Blå', col: '#3f86d6' }, { name: 'Grønn', col: '#35b04a' }, { name: 'Gul', col: '#f2c200' }];
  var ICONS = E.ICONS, PRON = E.PRON, TENSES = E.TENSES, SETS = E.SETS;
  var KINDS = ['oversett', 'artikkel', 'pronomen', 'verb'];
  var THEMES = ['n', 's', 'g', 'o'];
  var RESULT_OK = 2300, RESULT_BAD = 4800, RESULT_NONE = 1900, GONE_MS = 9000, PICK_MS = 25000, HOME_D = 40, LAST_D = 43;

  /* ---------- hjelpere ---------- */
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffle(a, rnd) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function norm(s) { return String(s || '').trim().toLowerCase().replace(/[.!?,;:]+$/g, '').replace(/\s+/g, ' '); }
  function tl(s) { return s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss'); }
  function tn(s) { return s.replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').replace(/é/g, 'e'); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- ord ---------- */
  function artOf(w) { return (w.art === 'der' || w.art === 'die' || w.art === 'das') ? w.art : (w.art === 'pl' ? 'die' : ''); }
  function isNoun(w) { return w.art === 'der' || w.art === 'die' || w.art === 'das'; }
  function grp(w) { return isNoun(w) || w.art === 'pl' ? 'n' : w.art; }
  function dispDe(w) { var a = artOf(w); return a ? a + ' ' + w.de : w.de; }
  var POS_NO = { der: 'substantiv', die: 'substantiv', das: 'substantiv', pl: 'substantiv (flertall)', prop: 'navn', adj: 'adjektiv', adv: 'adverb', v: 'verb', konj: 'konjunksjon', prep: 'preposisjon', pron: 'pronomen' };
  function noAlts(no) {
    var out = [];
    String(no).split(/[,;]/).forEach(function (x) { x = x.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim(); if (x) out.push(x); });
    return out.length ? out : [String(no).trim()];
  }
  function lvOk(de, lv) { var n = de.length; return lv === 'A1' ? n <= 7 : lv === 'A2' ? n <= 10 : true; }
  function wordPool(st) {
    var out = [], seen = {};
    (st.themes || []).forEach(function (c) {
      ((D.words[c]) || []).forEach(function (w) {
        var k = w[0] + '|' + w[1]; if (seen[k]) return;
        if (!lvOk(w[0], st.level)) return;
        seen[k] = 1; out.push({ de: w[0], art: w[1], no: w[2], cat: c });
      });
    });
    return out;
  }

  /* ---------- pronomen og eiendomsord ---------- */
  var NOMP = [['ich', 'jeg'], ['du', 'du'], ['er', 'han'], ['sie', 'hun'], ['es', 'det'], ['wir', 'vi'], ['ihr', 'dere'], ['sie', 'de'], ['Sie', 'De (høflig)']];
  var OBJ_AKK = ['mich', 'dich', 'ihn', 'sie', 'es', 'uns', 'euch', 'sie', 'Sie'];
  var OBJ_DAT = ['mir', 'dir', 'ihm', 'ihr', 'ihm', 'uns', 'euch', 'ihnen', 'Ihnen'];
  var STEMS = ['mein', 'dein', 'sein', 'ihr', 'sein', 'unser', 'euer', 'ihr', 'Ihr'];
  var ENDS = { nom: { m: '', f: 'e', n: '' }, akk: { m: 'en', f: 'e', n: '' }, dat: { m: 'em', f: 'er', n: 'em' } };
  var CASE_NO = { nom: 'nominativ', akk: 'akkusativ', dat: 'dativ' };
  function possForm(owner, gender, kase) {
    var stem = STEMS[owner], end = ENDS[kase][gender];
    if (owner === 6 && end) return 'eur' + end;
    return stem + end;
  }
  var AKK_FR = [['Mein Freund', 'sieht'], ['Die Lehrerin', 'fragt'], ['Mein Bruder', 'sucht'], ['Meine Mutter', 'besucht'], ['Der Arzt', 'kennt'], ['Mein Vater', 'ruft'], ['Unsere Nachbarin', 'hört'], ['Mein Onkel', 'braucht'], ['Meine Tante', 'mag']];
  var DAT_FR = [['Mein Freund', 'hilft', ''], ['Die Lehrerin', 'antwortet', ''], ['Das Buch', 'gehört', ''], ['Die Pizza', 'schmeckt', ''], ['Meine Mutter', 'schenkt', 'ein Buch'], ['Mein Vater', 'dankt', ''], ['Das Haus', 'gefällt', '']];
  var VERB_HINT = { sep: 'Trennbart verb: partikkelen kommer helt sist, f.eks. «stehe auf».', ref: 'Refleksivt verb: ta med pronomenet, f.eks. «freue mich».', perf: 'Perfekt: skriv hjelpeverb + partisipp, f.eks. «hat gelernt» eller «ist gegangen».' };

  function defaults() {
    return {
      tasks: ['oversett', 'artikkel'], themes: ['n', 's'], level: 'A2', transDir: 'begge', answerMode: 'velg', reqArt: false,
      sets: ['svake', 'sterke'], tenses: ['praesens'], pieces: 2, start: 'one', time: 0, minutes: 0, help: true, hostPlays: false
    };
  }

  /* ---------- retting ---------- */
  function gradeTyped(priv, given, byInf) {
    var g = norm(given); if (!g) return 'empty';
    var i;
    switch (priv.t) {
      case 'verb': return E.grade(byInf[priv.v], priv.tense, priv.person, given);
      case 'choice': return g === norm(priv.choice) ? 'ok' : 'bad';
      case 'de': { // skriv tysk ord (evt. med artikkel)
        var m = /^(der|die|das)\s+(.+)$/.exec(g), art = '', word = g;
        if (m) { art = m[1]; word = m[2]; }
        var okWord = false, near = false;
        priv.accept.forEach(function (a) { var n = norm(a); if (word === n) okWord = true; else if (tl(word) === tl(n) && /[äöüß]/.test(n)) near = true; });
        if (!okWord && !near) return 'bad';
        if (priv.art) { if (art && art !== priv.art) return 'bad'; if (priv.req && !art) return 'bad'; }
        else if (art) return 'bad';
        return okWord ? 'ok' : 'near';
      }
      case 'no': { // skriv norsk ord
        var h = g.replace(/^(å|en|ei|et|ein)\s+/, '');
        for (i = 0; i < priv.accept.length; i++) { var n = norm(priv.accept[i]).replace(/^(å|en|ei|et|ein)\s+/, ''); if (h === n) return 'ok'; }
        for (i = 0; i < priv.accept.length; i++) { var n2 = tn(norm(priv.accept[i])).replace(/^(å|en|ei|et|ein)\s+/, ''); if (tn(h) === n2 && /[æøå]/.test(norm(priv.accept[i]))) return 'near'; }
        return 'bad';
      }
      case 'form': { // pronomen / eiendomsord: godta også «meinen Hund»
        var accept = priv.accept.map(norm);
        if (accept.indexOf(g) >= 0) return 'ok';
        if (priv.noun) { var gg = g.replace(new RegExp('\\s+' + priv.noun.toLowerCase() + '$'), ''); if (accept.indexOf(gg) >= 0) return 'ok'; }
        return 'bad';
      }
    }
    return 'bad';
  }

  /* ---------- spill ---------- */
  function createGame(verbs, opts) {
    opts = opts || {};
    var byInf = {}; verbs.forEach(function (v) { byInf[v.i] = v; });
    var seed = (opts.seed != null ? opts.seed : Math.floor(Math.random() * 4294967296)) >>> 0;
    var rnd = mulberry(seed);
    var G = {
      code: opts.code || '', seq: 0, phase: 'lobby', stage: 'idle', settings: Object.assign(defaults(), opts.settings || {}),
      players: [], turn: 0, cur: null, last: null, log: [], events: [], winner: null, summary: null,
      deadline: 0, resultUntil: 0, pickUntil: 0, goneSince: 0, nextPid: 1, tokens: {}, errors: [], round: 0, recent: [], endAt: 0, extra: false, finishedN: 0, tid: 0
    };
    var api = {};

    function pl(pid) { for (var i = 0; i < G.players.length; i++) if (G.players[i].id === pid) return G.players[i]; return null; }
    function curP() { return G.players[G.turn] || null; }
    function addLog(txt, cls) { G.log.push({ t: txt, c: cls || '' }); if (G.log.length > 60) G.log.shift(); }
    function bump() { G.seq++; }
    function ev(e) { G.events.push(e); }
    function rint(n) { return Math.floor(rnd() * n); }
    function pick1(a) { return a[rint(a.length)]; }
    function cleanName(n, idx) { n = String(n || '').replace(/[<>&"]/g, '').replace(/\s+/g, ' ').trim().slice(0, 14); return n || ('Spiller ' + (idx + 1)); }
    function uniqName(n) { var base = n, k = 2; while (G.players.some(function (p) { return p.name.toLowerCase() === n.toLowerCase(); })) { n = base + ' ' + k++; if (n.length > 16) n = base.slice(0, 12) + ' ' + (k - 1); } return n; }
    function pickIcon(want) {
      var taken = G.players.map(function (p) { return p.icon; });
      if (want && ICONS.indexOf(want) >= 0 && taken.indexOf(want) < 0) return want;
      for (var i = 0; i < ICONS.length; i++) if (taken.indexOf(ICONS[i]) < 0) return ICONS[i];
      return ICONS[G.players.length % ICONS.length];
    }

    /* ----- oppgavegenerering ----- */
    function recentOk(key) { return G.recent.indexOf(key) < 0; }
    function remember(key) { G.recent.push(key); if (G.recent.length > 28) G.recent.shift(); }
    function choose(fn, tries) { var t, r; for (t = 0; t < (tries || 14); t++) { r = fn(); if (recentOk(r.key)) break; } remember(r.key); return r; }
    function useTyped() { var m = G.settings.answerMode; return m === 'skriv' || (m === 'mix' && rnd() < .5); }
    function distract(list, correct, n, sameKey, textFn) {
      var out = [], cand = shuffle(list, rnd), seenT = {}; seenT[textFn(correct)] = 1;
      cand.forEach(function (w) { if (out.length >= n) return; if (sameKey && sameKey(w) !== sameKey(correct)) return; var t = textFn(w); if (seenT[t]) return; seenT[t] = 1; out.push(t); });
      if (out.length < n) cand.forEach(function (w) { if (out.length >= n) return; var t = textFn(w); if (seenT[t]) return; seenT[t] = 1; out.push(t); });
      return out;
    }
    function mkTrans(wp, allw) {
      var w = pick1(wp), st = G.settings, dir = st.transDir === 'begge' ? (rnd() < .5 ? 'no-de' : 'de-no') : st.transDir;
      var typed = useTyped(), alts = noAlts(w.no), a = artOf(w), type = typeof w.art === 'string' ? w.art : '';
      if (dir === 'de-no' && (w.art === 'prop' || alts.join(' ').length > 28)) typed = false;
      var pos = POS_NO[w.art] || '';
      var pub = { k: 'trans', mode: typed ? 'type' : 'choice', head: dir === 'no-de' ? 'Oversett til tysk' : 'Oversett til norsk', keys: dir === 'no-de' ? 'de' : 'no', pos: pos }, priv;
      if (dir === 'no-de') {
        pub.main = w.no; pub.sub = '(' + pos + ')' + (typed && a && st.reqArt ? ' – skriv med artikkel' : (typed ? ' – skriv ordet på tysk' : ''));
        if (typed) priv = { t: 'de', accept: [w.de], art: a, req: !!(a && st.reqArt) };
        else {
          var ds = distract(allw, w, 3, grp, function (x) { return dispDe(x); }), correct = dispDe(w);
          pub.opts = shuffle(ds.concat([correct]), rnd); priv = { t: 'choice', choice: correct };
        }
        priv.sol = dispDe(w); priv.solNo = w.no;
      } else {
        pub.main = dispDe(w); pub.sub = '(' + pos + ')' + (typed ? ' – skriv på norsk' : '');
        if (typed) priv = { t: 'no', accept: alts };
        else {
          var ds2 = distract(allw, w, 3, grp, function (x) { return noAlts(x.no)[0]; }), c2 = alts[0];
          pub.opts = shuffle(ds2.concat([c2]), rnd); priv = { t: 'choice', choice: c2 };
          priv.accept = alts;
        }
        priv.sol = w.no; priv.solNo = dispDe(w);
      }
      var key = 'tr:' + dir + ':' + w.de;
      return { pub: pub, priv: priv, key: key, label: dispDe(w) + ' = ' + w.no, ctx: dir === 'no-de' ? 'norsk → tysk' : 'tysk → norsk' };
    }
    function mkArt(wp) {
      var nouns = wp.filter(isNoun); if (!nouns.length) return null;
      var w = pick1(nouns), st = G.settings;
      var pub = { k: 'art', mode: 'choice', head: 'Velg riktig artikkel', main: w.de, sub: st.help ? '(' + noAlts(w.no)[0] + ')' : '', opts: ['der', 'die', 'das'], optStyle: 'art' };
      return { pub: pub, priv: { t: 'choice', choice: w.art, sol: w.art + ' ' + w.de, solNo: w.no }, key: 'art:' + w.de, label: dispDe(w) + ' = ' + w.no, ctx: 'artikkel' };
    }
    function formOpts(correct, all) { // alle former blandet, tilfeldige 3 + riktig
      var uniq = []; all.forEach(function (x) { var lx = x.toLowerCase(); if (lx !== correct.toLowerCase() && !uniq.some(function (y) { return y.toLowerCase() === lx; })) uniq.push(x); });
      return shuffle(shuffle(uniq, rnd).slice(0, 3).concat([correct]), rnd);
    }
    function mkPron() {
      var st = G.settings, lv = st.level, kinds = ['pn', 'pz'];
      if (lv !== 'A1') kinds.push('po', 'pz');
      if (lv === 'B1') kinds.push('po', 'pz');
      var k = pick1(kinds), typed = useTyped(), i, pub, priv, key, label, ctx;
      if (k === 'pn') {
        i = rint(NOMP.length); var item = NOMP[i], dir = st.transDir === 'begge' ? (rnd() < .5 ? 'no-de' : 'de-no') : st.transDir;
        if (dir === 'no-de') {
          pub = { k: 'pron', mode: typed ? 'type' : 'choice', head: 'Oversett pronomenet til tysk', main: item[1], sub: '', keys: 'de' };
          var accD = item[0].toLowerCase(), sieLike = accD === 'sie';
          if (typed) priv = { t: 'form', accept: [accD] };
          else {
            var pool = []; NOMP.forEach(function (x) { var d = x[0].toLowerCase(); if (d !== accD && pool.indexOf(d) < 0) pool.push(d); });
            pub.opts = shuffle(shuffle(pool, rnd).slice(0, 3).concat([item[0]]), rnd); priv = { t: 'choice', choice: item[0] };
          }
          priv.sol = item[0]; label = item[1] + ' = ' + item[0]; ctx = 'pronomen norsk → tysk';
        } else {
          pub = { k: 'pron', mode: typed ? 'type' : 'choice', head: 'Oversett pronomenet til norsk', main: item[0], sub: item[0] === 'sie' ? '(kan bety både «hun» og «de»)' : (item[0] === 'Sie' ? '(høflig form)' : ''), keys: 'no' };
          var accN = []; NOMP.forEach(function (x) { var nx = x[1].replace(/\s*\(.*\)/, '').toLowerCase(); if (x[0].toLowerCase() === item[0].toLowerCase() && accN.indexOf(nx) < 0) accN.push(nx); });
          if (item[0] === 'Sie') accN = ['de'];
          var shown = item[0] === 'Sie' ? 'De' : null;
          if (typed) priv = { t: 'form', accept: accN };
          else {
            var poolN = []; NOMP.forEach(function (x) { var n = x[1].replace(/\s*\(.*\)/, '').toLowerCase(); if (accN.indexOf(n) < 0 && poolN.indexOf(n) < 0 && !(n === 'de' && accN.indexOf('de') >= 0)) poolN.push(n); });
            pub.opts = shuffle(shuffle(poolN, rnd).slice(0, 3).concat([shown || accN[0]]), rnd); priv = { t: 'choice', choice: shown || accN[0] };
          }
          priv.sol = accN.join(' / '); label = item[0] + ' = ' + accN.join(' / '); ctx = 'pronomen tysk → norsk';
        }
        key = 'pn:' + label;
      } else if (k === 'pz') {
        var cases = lv === 'A1' ? ['nom'] : lv === 'A2' ? ['nom', 'akk', 'akk'] : ['nom', 'akk', 'dat', 'dat'];
        var kase = pick1(cases), owner = rint(STEMS.length), nn, frame;
        var cand = D.poss.filter(function (x) { return kase !== 'dat' || x[2] === 'p' || x[3]; });
        nn = pick1(cand); var N = nn[0], gender = nn[1], isP = nn[2] === 'p';
        if (kase === 'nom') frame = 'Das ist ___ ' + N + '.';
        else if (kase === 'akk') frame = isP ? pick1(['Ich besuche', 'Ich sehe', 'Ich frage']) + ' ___ ' + N + '.' : pick1(['Ich suche', 'Ich brauche', 'Ich habe']) + ' ___ ' + N + '.';
        else frame = isP ? 'Ich spreche mit ___ ' + N + '.' : 'Das liegt in ___ ' + N + '.';
        var form = possForm(owner, gender, kase);
        var art = gender === 'm' ? 'der' : gender === 'f' ? 'die' : 'das';
        pub = { k: 'pron', mode: typed ? 'type' : 'choice', head: 'Fyll inn eiendomsordet', main: frame, sub: 'Eieren er «' + NOMP[owner][0] + '» (' + NOMP[owner][1].replace(/\s*\(.*\)/, '') + ') · ' + CASE_NO[kase] + ' · ' + art + ' ' + N, keys: 'de' };
        var allF = []; ['m', 'f', 'n'].forEach(function (g) { ['nom', 'akk', 'dat'].forEach(function (c) { var f = possForm(owner, g, c); if (allF.indexOf(f) < 0) allF.push(f); }); });
        allF.push(possForm(owner, 'f', 'nom') + 'n');
        if (typed) priv = { t: 'form', accept: [form], noun: N };
        else { pub.opts = formOpts(form, allF); priv = { t: 'choice', choice: form }; }
        priv.sol = form; label = frame.replace('___', '«' + form + '»'); ctx = 'eiendomsord (' + CASE_NO[kase] + ')'; key = 'pz:' + kase + ':' + owner + ':' + N;
      } else {
        var kase2 = (lv === 'B1' && rnd() < .55) ? 'dat' : 'akk', who = rint(9), fr, sentence, form2;
        if (kase2 === 'akk') { fr = pick1(AKK_FR); sentence = fr[0] + ' ' + fr[1] + ' ___.'; form2 = OBJ_AKK[who]; }
        else { fr = pick1(DAT_FR); sentence = fr[0] + ' ' + fr[1] + ' ___' + (fr[2] ? ' ' + fr[2] : '') + '.'; form2 = OBJ_DAT[who]; }
        pub = { k: 'pron', mode: typed ? 'type' : 'choice', head: 'Fyll inn pronomenet', main: sentence, sub: '«' + NOMP[who][1].replace(/\s*\(.*\)/, '') + '» (' + NOMP[who][0] + ') · ' + CASE_NO[kase2], keys: 'de' };
        var tbl = kase2 === 'akk' ? OBJ_AKK : OBJ_DAT, allO = [];
        tbl.forEach(function (x) { if (allO.indexOf(x) < 0) allO.push(x); });
        var accO = [form2.toLowerCase()];
        if (typed) priv = { t: 'form', accept: accO };
        else {
          var other = []; allO.forEach(function (x) { var lx = x.toLowerCase(); if (lx !== form2.toLowerCase() && !other.some(function (y) { return y.toLowerCase() === lx; })) other.push(x); });
          pub.opts = shuffle(shuffle(other, rnd).slice(0, 3).concat([form2]), rnd); priv = { t: 'choice', choice: form2 };
        }
        priv.sol = form2; label = sentence.replace('___', '«' + form2 + '»'); ctx = 'personlig pronomen (' + CASE_NO[kase2] + ')'; key = 'po:' + kase2 + ':' + who + ':' + sentence;
      }
      return { pub: pub, priv: priv, key: key, label: label, ctx: ctx };
    }
    function mkVerb(vp, person) {
      var v = pick1(vp), st = G.settings, tense = pick1(st.tenses.length ? st.tenses : ['praesens']);
      var hints = []; if (tense === 'perfekt') hints.push(VERB_HINT.perf); if (v.r) hints.push(VERB_HINT.ref); else if (tense !== 'perfekt' && !v.r && /\s\S+$/.test(String(v.p[0]).replace(/[‹›]/g, ''))) hints.push(VERB_HINT.sep);
      var pub = { k: 'verb', mode: 'type', head: 'Bøy verbet', main: v.i, sub: st.help && v.n ? v.n : '', pr: PRON[person], tense: tense, tenseLabel: TENSES[tense].label, hints: hints, keys: 'de' };
      var priv = { t: 'verb', v: v.i, tense: tense, person: person, sol: E.solutions(v, tense, person)[0], solNo: v.n || '' };
      return { pub: pub, priv: priv, key: 'vb:' + v.i + ':' + tense, label: v.i + ' (' + TENSES[tense].label + ')', ctx: 'verb' };
    }
    function pickTask(die) {
      var st = G.settings, kinds = st.tasks.filter(function (k) { return KINDS.indexOf(k) >= 0; });
      var wp = wordPool(st), allw = wp.length >= 8 ? wp : wordPool(Object.assign({}, st, { themes: ['n', 's', 'g'], level: 'B1' }));
      var vp = E.pool(verbs, st);
      kinds = kinds.filter(function (k) { return k === 'oversett' ? wp.length >= 1 : k === 'artikkel' ? wp.some(isNoun) : k === 'verb' ? vp.length >= 1 : true; });
      if (!kinds.length) kinds = ['pronomen'];
      var kind = pick1(kinds), t;
      t = choose(function () { return kind === 'oversett' ? mkTrans(wp, allw) : kind === 'artikkel' ? mkArt(wp) : kind === 'pronomen' ? mkPron() : mkVerb(vp, die - 1); });
      t.kind = kind; return t;
    }

    api.G = G;
    api.pools = function (s) {
      var st = Object.assign({}, G.settings, s || {}), wp = wordPool(st);
      return { words: wp.length, nouns: wp.filter(isNoun).length, verbs: E.pool(verbs, st).length };
    };
    api.setSettings = function (s) {
      if (G.phase !== 'lobby') return false;
      var t = G.settings;
      if (s.tasks) t.tasks = s.tasks.filter(function (x) { return KINDS.indexOf(x) >= 0; });
      if (s.themes) t.themes = s.themes.filter(function (x) { return THEMES.indexOf(x) >= 0; });
      if (s.sets) t.sets = s.sets.filter(function (x) { return SETS.indexOf(x) >= 0; });
      if (s.tenses) t.tenses = s.tenses.filter(function (x) { return TENSES[x]; });
      if (s.level && ['A1', 'A2', 'B1'].indexOf(s.level) >= 0) t.level = s.level;
      if (s.transDir && ['begge', 'no-de', 'de-no'].indexOf(s.transDir) >= 0) t.transDir = s.transDir;
      if (s.answerMode && ['velg', 'skriv', 'mix'].indexOf(s.answerMode) >= 0) t.answerMode = s.answerMode;
      if (s.start && ['one', 'six'].indexOf(s.start) >= 0) t.start = s.start;
      if (s.pieces != null) t.pieces = Math.max(1, Math.min(4, parseInt(s.pieces, 10) || 2));
      if (s.time != null) t.time = Math.max(0, Math.min(120, parseInt(s.time, 10) || 0));
      if (s.minutes != null) t.minutes = Math.max(0, Math.min(90, parseInt(s.minutes, 10) || 0));
      ['reqArt', 'help', 'hostPlays'].forEach(function (k) { if (s[k] != null) t[k] = !!s[k]; });
      bump(); return true;
    };
    api.addPlayer = function (info) {
      info = info || {};
      if (G.players.length >= 4) return { ok: false, msg: 'Rommet er fullt (maks 4 spillere – ett for hver farge).' };
      if (G.phase !== 'lobby') return { ok: false, msg: 'Spillet er allerede i gang.' };
      var tok = info.token || ('t' + Math.random().toString(36).slice(2, 10));
      var p = { id: 'p' + (G.nextPid++), name: uniqName(cleanName(info.name, G.players.length)), icon: pickIcon(info.icon), seat: -1, pieces: [], conn: true, local: !!info.local, right: 0, wrong: 0, best: 0, streak: 0, tries: 0, caps: 0, kicked: 0, finished: false, finishedAt: 0 };
      G.players.push(p); G.tokens[p.id] = tok;
      addLog(p.name + ' ' + p.icon + ' ble med', 'sys');
      bump(); return { ok: true, pid: p.id, token: tok, name: p.name, icon: p.icon };
    };
    api.rejoin = function (token) { for (var pid in G.tokens) if (G.tokens[pid] === token) { var p = pl(pid); if (p) { p.conn = true; bump(); return pid; } } return null; };
    api.setConn = function (pid, on) { var p = pl(pid); if (!p || p.local || p.conn === on) return; p.conn = on; addLog(p.name + (on ? ' er tilbake' : ' mistet kontakten'), 'sys'); bump(); };
    api.removePlayer = function (pid) {
      var i = G.players.findIndex(function (p) { return p.id === pid; }); if (i < 0) return;
      var wasCur = (G.phase === 'play' && i === G.turn), name = G.players[i].name;
      if (G.phase === 'play') { G.players[i].conn = false; G.players[i].gone = true; addLog(name + ' forlot spillet', 'sys'); bump(); if (wasCur) { G.extra = false; advance(Date.now()); } return; }
      G.players.splice(i, 1); delete G.tokens[pid]; addLog(name + ' forlot spillet', 'sys'); bump();
    };
    api.check = function () {
      var st = G.settings; if (!st.tasks.length) return 'Velg minst én oppgavetype.';
      var pools = api.pools();
      if (st.tasks.indexOf('oversett') >= 0 && pools.words < 6) return 'For få ord (' + pools.words + ') med disse valgene. Velg flere temaer eller høyere nivå.';
      if (st.tasks.indexOf('artikkel') >= 0 && pools.nouns < 4) return 'For få substantiv (' + pools.nouns + ') til artikkeloppgaver. Velg flere temaer eller høyere nivå.';
      if (st.tasks.indexOf('verb') >= 0 && (pools.verbs < 4 || !st.tenses.length)) return 'For få verb (' + pools.verbs + ') med disse valgene. Velg flere verbgrupper, en tid eller høyere nivå.';
      return '';
    };
    api.start = function (now) {
      now = now || Date.now();
      if (G.phase !== 'lobby') return { ok: false, msg: 'Spillet er allerede i gang.' };
      if (!G.players.length) return { ok: false, msg: 'Det trengs minst én spiller.' };
      var st = G.settings, bad = api.check(); if (bad) return { ok: false, msg: bad };
      var n = G.players.length, seats = n === 2 ? [0, 2] : [0, 1, 2, 3].slice(0, n);
      G.players = G.players.filter(function (p) { return !p.gone; });
      G.players.forEach(function (p, i) {
        p.seat = seats[i]; p.pieces = []; for (var k = 0; k < st.pieces; k++) p.pieces.push(-1);
        if (st.start === 'one') p.pieces[0] = 0;
        p.right = p.wrong = p.best = p.streak = p.tries = p.caps = p.kicked = 0; p.finished = false; p.finishedAt = 0;
      });
      G.phase = 'play'; G.stage = 'roll'; G.turn = 0; G.cur = null; G.last = null; G.winner = null; G.summary = null; G.errors = []; G.log = []; G.recent = []; G.extra = false; G.finishedN = 0;
      G.endAt = st.minutes ? now + st.minutes * 60000 : 0;
      addLog('Spillet er i gang! Kast terningen, svar riktig på oppgaven – og flytt en brikke.', 'sys');
      G.events = [{ k: 'start' }]; markTurn(now); bump(); return { ok: true };
    };
    function markTurn(now) { G.goneSince = 0; G.deadline = 0; G.pickUntil = 0; G.cur = null; var p = curP(); if (p && !p.conn && !p.local) G.goneSince = now; }

    /* ----- trekk ----- */
    function ownAt(p, d, except) { for (var i = 0; i < p.pieces.length; i++) if (i !== except && p.pieces[i] === d) return true; return false; }
    function allIn(p) { return p.pieces.every(function (d) { return d === -1; }); }
    function legal(p, die) {
      var out = [], yardDone = false;
      p.pieces.forEach(function (d, i) {
        if (d === -1) {
          if (yardDone) return;
          if (die === 6 || (G.settings.start === 'one' && allIn(p))) { yardDone = true; if (!ownAt(p, 0, i)) out.push({ i: i, from: -1, to: 0 }); }
        } else if (d < HOME_D + 4) { var to = d + die; if (to <= LAST_D && !ownAt(p, to, i)) out.push({ i: i, from: d, to: to }); }
      });
      return out;
    }
    function ringAt(seat, d) { return (START[seat] + d) % 40; }
    function applyMove(p, mv) {
      var path = []; if (mv.from === -1) path.push(0); else for (var d = mv.from + 1; d <= mv.to; d++) path.push(d);
      p.pieces[mv.i] = mv.to; ev({ k: 'move', pid: p.id, i: mv.i, path: path });
      var cap = null;
      if (mv.to <= 39) {
        var r = ringAt(p.seat, mv.to);
        G.players.forEach(function (q) {
          if (q.id === p.id) return;
          q.pieces.forEach(function (d, j) { if (d >= 0 && d <= 39 && ringAt(q.seat, d) === r) { q.pieces[j] = -1; q.kicked++; p.caps++; cap = { pid: q.id, name: q.name, i: j }; ev({ k: 'capture', pid: q.id, i: j, by: p.id }); } });
        });
      }
      if (mv.to >= HOME_D) ev({ k: 'home', pid: p.id, i: mv.i });
      if (!p.finished && p.pieces.every(function (d) { return d >= HOME_D; })) { p.finished = true; p.finishedAt = ++G.finishedN; if (!G.winner) G.winner = p.id; ev({ k: 'win', pid: p.id }); }
      return cap;
    }

    api.roll = function (pid, now) {
      now = now || Date.now();
      var p = curP();
      if (G.phase !== 'play' || G.stage !== 'roll' || !p || p.id !== pid) return { ok: false };
      var die = 1 + rint(6), moves = legal(p, die);
      G.events = [{ k: 'roll', pid: pid, die: die }];
      G.cur = { tid: ++G.tid, pid: pid, die: die, person: die - 1, moves: moves, task: null, priv: null, key: '', label: '', ctx: '' };
      if (!moves.length) {
        var again = G.settings.start === 'six' && allIn(p) && p.tries < 2;
        if (again) p.tries++; else p.tries = 0;
        ev({ k: 'nomove', pid: pid });
        G.last = { none: true, pid: pid, die: die, again: again };
        addLog(p.name + ' kastet ' + die + ' – ingen brikke kan flyttes' + (again ? ' (nytt forsøk)' : ''), 'sys');
        G.stage = 'result'; G.resultUntil = now + RESULT_NONE; G.extra = again;
        bump(); return { ok: true };
      }
      p.tries = 0;
      var t = pickTask(die);
      G.cur.task = t.pub; G.cur.priv = t.priv; G.cur.key = t.key; G.cur.label = t.label; G.cur.ctx = t.ctx; G.cur.kind = t.kind;
      G.stage = 'answer'; G.deadline = G.settings.time ? now + G.settings.time * 1000 : 0;
      bump(); return { ok: true };
    };
    api.answer = function (pid, text, now, timedOut) {
      now = now || Date.now();
      var p = curP();
      if (G.phase !== 'play' || G.stage !== 'answer' || !p || p.id !== pid) return { ok: false };
      var c = G.cur, given = timedOut ? '' : String(text == null ? '' : text).trim().slice(0, 60);
      var g = timedOut ? 'empty' : gradeTyped(c.priv, given, byInf), ok = (g === 'ok' || g === 'near');
      G.events = [{ k: 'result', pid: pid, ok: ok }];
      var info = { pid: pid, ok: ok, near: g === 'near', timeout: !!timedOut, given: given, sol: c.priv.sol, solNo: c.priv.solNo || '', die: c.die, kind: c.kind, label: c.label, task: c.task, again: false };
      G.last = info;
      if (ok) {
        p.right++; p.streak++; if (p.streak > p.best) p.best = p.streak;
        addLog(p.name + ': ' + c.label + ' ✓', 'ok');
        G.deadline = 0;
        if (c.moves.length === 1) { var cap = applyMove(p, c.moves[0]); info.moved = c.moves[0]; info.cap = cap; G.extra = (c.die === 6 && !G.winner); info.again = G.extra; G.stage = 'result'; G.resultUntil = now + RESULT_OK + (cap ? 900 : 0); if (cap) addLog(p.name + ' slo ut ' + cap.name + '! 😤', 'sys'); }
        else { G.stage = 'pick'; G.pickUntil = now + PICK_MS; G.extra = (c.die === 6); info.picking = true; }
      } else {
        p.wrong++; p.streak = 0; G.extra = false;
        addLog(p.name + ': ' + c.label + ' ✗ ' + (timedOut ? '(tiden gikk ut)' : (given || '–') + ' → ' + c.priv.sol), 'bad');
        G.errors.push({ pid: pid, name: p.name, kind: c.kind, key: c.key, label: c.label, ctx: c.ctx, given: given, sol: c.priv.sol, person: c.person });
        G.stage = 'result'; G.deadline = 0; G.resultUntil = now + RESULT_BAD;
      }
      bump(); return { ok: true, good: ok };
    };
    api.pick = function (pid, i, now) {
      now = now || Date.now();
      var p = curP();
      if (G.phase !== 'play' || G.stage !== 'pick' || !p || p.id !== pid) return { ok: false };
      var mv = null; G.cur.moves.forEach(function (m) { if (m.i === i) mv = m; });
      if (!mv) return { ok: false };
      G.events = []; var cap = applyMove(p, mv);
      G.last.moved = mv; G.last.cap = cap; G.last.picking = false; G.extra = (G.cur.die === 6 && !G.winner); G.last.again = G.extra;
      if (cap) addLog(p.name + ' slo ut ' + cap.name + '! 😤', 'sys');
      G.stage = 'result'; G.pickUntil = 0; G.resultUntil = now + 1500 + (cap ? 900 : 0);
      bump(); return { ok: true };
    };
    function advance(now) {
      if (G.winner) { finish('win'); return; }
      if (G.endAt && now >= G.endAt && !G.extra) { finish('time'); return; }
      if (!G.players.length) { G.stage = 'idle'; return; }
      var n = G.players.length, idx = G.turn, i;
      var cp = curP();
      if (G.extra && cp && (cp.conn || cp.local)) { G.extra = false; G.stage = 'roll'; G.events = [{ k: 'turn', pid: cp.id, extra: true }]; markTurn(now); bump(); return; }
      G.extra = false;
      for (i = 1; i <= n; i++) { var j = (G.turn + i) % n; if (G.players[j].conn || G.players[j].local) { idx = j; break; } }
      if (i > n) idx = (G.turn + 1) % n;
      G.turn = idx; G.stage = 'roll'; G.events = [{ k: 'turn', pid: G.players[idx].id }]; markTurn(now); bump();
    }
    function progress(p) { var s = 0; p.pieces.forEach(function (d) { if (d >= 0) s += d + 1; }); return s; }
    function homeN(p) { return p.pieces.filter(function (d) { return d >= HOME_D; }).length; }
    function finish(why) {
      G.phase = 'end'; G.stage = 'idle'; G.cur = null; G.events = [{ k: 'end' }];
      var rank = G.players.slice().sort(function (a, b) {
        if (a.finished !== b.finished) return a.finished ? -1 : 1;
        if (a.finished && b.finished) return a.finishedAt - b.finishedAt;
        if (homeN(b) !== homeN(a)) return homeN(b) - homeN(a);
        if (progress(b) !== progress(a)) return progress(b) - progress(a);
        return b.right - a.right;
      }).map(function (p, i) { return { pid: p.id, name: p.name, icon: p.icon, seat: p.seat, home: homeN(p), total: p.pieces.length, progress: progress(p), right: p.right, wrong: p.wrong, best: p.best, caps: p.caps, kicked: p.kicked, finished: p.finished, rank: i + 1 }; });
      var agg = {};
      G.errors.forEach(function (e) { var k = e.key; (agg[k] = agg[k] || { key: k, kind: e.kind, label: e.label, ctx: e.ctx, count: 0, items: [] }); agg[k].count++; agg[k].items.push({ name: e.name, given: e.given, sol: e.sol, person: e.person }); });
      var hard = Object.keys(agg).map(function (k) { return agg[k]; }).sort(function (a, b) { return b.count - a.count; });
      G.summary = { why: why, rank: rank, hard: hard, errors: G.errors.slice(), kinds: kindStats() };
      addLog(why === 'win' ? '🏆 ' + (pl(G.winner) ? pl(G.winner).name : '') + ' fikk alle brikkene i hus!' : why === 'time' ? 'Tiden er ute – spillet er avsluttet.' : 'Spillet ble avsluttet.', 'sys');
      bump();
    }
    function kindStats() { return null; }
    api.tick = function (now) {
      now = now || Date.now(); var p = curP();
      if (G.phase !== 'play') return false;
      if (G.stage === 'answer' && G.deadline && now >= G.deadline && p) { api.answer(p.id, '', now, true); return true; }
      if (G.stage === 'pick' && p && G.pickUntil && now >= G.pickUntil) {
        var best = G.cur.moves.slice().sort(function (a, b) { return b.to - a.to; })[0]; api.pick(p.id, best.i, now); return true;
      }
      if (G.stage === 'result' && now >= G.resultUntil) { advance(now); return true; }
      if (p && !p.conn && !p.local && (G.stage === 'roll' || G.stage === 'answer' || G.stage === 'pick')) {
        if (!G.goneSince) G.goneSince = now;
        else if (now - G.goneSince >= GONE_MS * (G.stage === 'roll' ? 1 : 1.6)) { addLog(p.name + ' var borte – turen hoppes over', 'sys'); G.extra = false; advance(now); return true; }
      } else if (G.goneSince && p && (p.conn || p.local)) G.goneSince = 0;
      return false;
    };
    api.skip = function (now) {
      if (G.phase !== 'play' || !curP() || G.stage === 'result') return false;
      addLog(curP().name + ' ble hoppet over', 'sys'); G.extra = false; advance(now || Date.now()); return true;
    };
    api.endGame = function () { if (G.phase === 'play') { finish('ended'); return true; } return false; };
    api.toLobby = function () {
      G.phase = 'lobby'; G.stage = 'idle'; G.cur = null; G.last = null; G.winner = null; G.summary = null; G.errors = []; G.events = []; G.log = []; G.round++; G.extra = false;
      G.players = G.players.filter(function (p) { return (p.local || p.conn) && !p.gone; });
      G.players.forEach(function (p) { p.seat = -1; p.pieces = []; p.right = p.wrong = p.best = p.streak = 0; p.finished = false; });
      Object.keys(G.tokens).forEach(function (k) { if (!pl(k)) delete G.tokens[k]; });
      bump();
    };
    api.snapshot = function (now) {
      now = now || Date.now();
      var cur = null;
      if (G.cur) {
        cur = { tid: G.cur.tid, pid: G.cur.pid, die: G.cur.die, person: G.cur.person, task: G.cur.task, kind: G.cur.kind || '', moves: (G.stage === 'pick' ? G.cur.moves : []), remaining: (G.stage === 'answer' && G.deadline) ? Math.max(0, G.deadline - now) : null, pickLeft: (G.stage === 'pick' && G.pickUntil) ? Math.max(0, G.pickUntil - now) : null, nmoves: G.cur.moves.length };
      }
      var last = G.last ? Object.assign({}, G.last) : null;
      if (last && G.stage !== 'result' && G.stage !== 'pick') { /* fasit vises først etter svar */ }
      return {
        v: 1, code: G.code, seq: G.seq, phase: G.phase, stage: G.stage, settings: G.settings,
        players: G.players.map(function (p) { return { id: p.id, name: p.name, icon: p.icon, seat: p.seat, pieces: p.pieces, conn: p.conn, local: p.local, right: p.right, wrong: p.wrong, best: p.best, caps: p.caps, kicked: p.kicked, finished: p.finished, home: homeN(p), progress: progress(p) }; }),
        turn: G.turn, cur: cur, last: (G.stage === 'result' || G.stage === 'pick') ? last : null, log: G.log.slice(-30), events: G.events, winner: G.winner, summary: G.summary,
        resultMs: (G.stage === 'result') ? Math.max(0, G.resultUntil - now) : 0, clockMs: (G.phase === 'play' && G.endAt) ? Math.max(0, G.endAt - now) : null
      };
    };
    api.clearEvents = function () { G.events = []; };
    api.hasToken = function (tok) { for (var k in G.tokens) if (G.tokens[k] === tok) return k; return null; };
    api.serialize = function () { return JSON.stringify({ seed: seed, G: G }); };
    api._legal = legal; api._pickTask = pickTask;
    return api;
  }
  function restore(verbs, json) {
    var o = JSON.parse(json), g = createGame(verbs, { seed: o.seed, code: o.G.code });
    Object.keys(o.G).forEach(function (k) { g.G[k] = o.G[k]; });
    g.G.players.forEach(function (p) { if (!p.local) p.conn = false; });
    return g;
  }
  /* utskrift: lag oppgaver uten spill (brukes av trykk-siden) */
  function makeTasks(verbs, settings, n, seed, die) {
    var g = createGame(verbs, { seed: seed, settings: settings }), out = [];
    for (var i = 0; i < n; i++) { var t = g._pickTask(die || (1 + (i % 6))); out.push({ kind: t.kind, pub: t.pub, priv: t.priv, label: t.label, key: t.key }); }
    return out;
  }

  return {
    createGame: createGame, restore: restore, makeTasks: makeTasks, defaults: defaults, RING: RING, LANE: LANE, YARD: YARD, START: START, SEATS: SEATS, ICONS: ICONS,
    PRON: PRON, TENSES: TENSES, SETS: SETS, KINDS: KINDS, THEMES: THEMES, possForm: possForm, gradeTyped: gradeTyped, noAlts: noAlts, dispDe: dispDe, wordPool: wordPool
  };
});
