/* Deutschwelt — Øveprøve Perfektum (generator + automatisk retting)
   Bygger en ny prøve (58 poeng, 8 oppgaver) fra verbdataene i verben/verben_data.js.
   Samme prøvenummer gir alltid samme prøve (seedet tilfeldighet).            */
(function () {
  'use strict';
  var V = window.dwVerben || [];
  var BANK = window.DW_OP_BANK;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- verbklassifisering ---------- */
  var PRE = ['be', 'ver', 'er', 'zer', 'ent', 'emp', 'miss'];
  var byInf = {};
  function strip(s) { return String(s || '').replace(/[‹›]/g, ''); }
  V.forEach(function (v) {
    byInf[v.i] = v;
    var pp = strip(v.pp), inf = v.i, irr = (v.pp || '').indexOf('‹') >= 0, kind;
    if (/ieren$/.test(inf) && pp.indexOf('ge') !== 0) kind = 'noge';
    else {
      var p = null;
      PRE.forEach(function (x) { if (!p && inf.indexOf(x) === 0 && pp.indexOf(x) === 0 && !/^bei/.test(inf)) p = x; });
      if (p) kind = 'noge';
      else if (pp.indexOf('ge') === 0) kind = 'ge';
      else if (pp.slice(1).indexOf('ge') >= 0) kind = 'sep';
      else kind = 'other';
    }
    v._pp = pp; v._irr = irr; v._kind = kind;
    v._strong = irr && /en$/.test(pp);          // sterkt verb
    v._mixed = irr && !/en$/.test(pp);          // blandet (bringen, denken …)
    v._sein = v.h === 'sein';
  });
  var EX = {};
  ['sollen', 'wollen', 'dürfen', 'können', 'mögen', 'müssen', 'haben', 'sein', 'werden', 'tun', 'wissen', 'kennen',
    'gefallen', 'regnen', 'schneien', 'kosten', 'schmecken', 'passen', 'dauern', 'stimmen', 'fehlen', 'gehören',
    'scheinen', 'heißen', 'bewegen', 'hängen', 'rennen', 'nennen', 'bringen', 'denken', 'kriegen', 'backen', 'braten',
    'gebrauchen', 'gelingen', 'gelten', 'genießen', 'genügen', 'geschehen', 'gestalten', 'gestehen', 'fangen', 'schieben', 'stehlen', 'riechen', 'schlagen', 'schneiden', 'bitten', 'brechen'].forEach(function (x) { EX[x] = 1; });

  function levelOk(L) {
    return function (v) { return L === 'A1' ? v.l === 'A1' : L === 'A2' ? v.l !== 'B1' : true; };
  }
  function pool(L, fn) {
    var ok = levelOk(L);
    return V.filter(function (v) { return !v.r && !EX[v.i] && v._pp && ok(v) && fn(v); });
  }

  /* ---------- tilfeldighet (seedet) ---------- */
  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var R = Math.random;
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function take(arr, n, used, soft) {
    var out = [], sh = shuffle(arr);
    function pass(skipSoft) {
      sh.forEach(function (v) {
        if (out.length >= n) return;
        var k = typeof v === 'string' ? v : v.i;
        if (used[k] || (skipSoft && soft && soft[k])) return;
        used[k] = 1; out.push(v);
      });
    }
    pass(true); pass(false);
    return out;
  }

  /* ---------- tekstbehandling ---------- */
  function fold(s) {
    return String(s || '').toLowerCase().trim()
      .replace(/ß/g, 'ss').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u')
      .replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u')
      .replace(/[.,!?;:"“”„()]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function tokens(s) { var f = fold(s); return f ? f.split(' ') : []; }
  function lev(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) d[i] = [i];
    for (j = 1; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function num(n) { return (Math.round(n * 2) / 2).toString().replace('.', ','); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function firstWord(s) { return strip(s).split(' ')[0]; }

  /* ---------- generator ---------- */
  var PERSONS = [['ich', 'bin', 'habe'], ['du', 'bist', 'hast'], ['er / sie / es', 'ist', 'hat'],
    ['wir', 'sind', 'haben'], ['ihr', 'seid', 'habt'], ['sie / Sie', 'sind', 'haben']];
  var SEIN_FORMS = ['bin', 'bist', 'ist', 'sind', 'seid'], HABEN_FORMS = ['habe', 'hast', 'hat', 'haben', 'habt'];

  function generate(seed, L, withFree) {
    R = mulberry(seed);
    var used = {}, soft = {}, t = { seed: seed, level: L, free: withFree };

    // Oppg. 6 og 7 først (setningsbankene styrer hvilke verb som er "brukt")
    var ok = levelOk(L);
    function mk(e) { var v = byInf[e[0]]; return v; }
    function seinEntry(v, p) { return /^(bin|bist|ist|sind|seid)$/.test(firstWord(v.f[p])); }

    var b6 = shuffle(BANK.opp6.filter(function (e) { return mk(e) && ok(mk(e)); }));
    var pick6 = [], tries = 0;
    do {
      var s6 = b6.filter(function (e) { return seinEntry(byInf[e[0]], e[1]); }), h6 = b6.filter(function (e) { return !seinEntry(byInf[e[0]], e[1]); });
      var u = {}; pick6 = [];
      shuffle(s6).forEach(function (e) { if (pick6.length < 2 && !u[e[0]]) { u[e[0]] = 1; pick6.push(e); } });
      shuffle(h6).forEach(function (e) { if (pick6.length < 6 && !u[e[0]]) { u[e[0]] = 1; pick6.push(e); } });
      var pers = {}; pick6.forEach(function (e) { pers[e[1]] = 1; });
      tries++;
      b6 = shuffle(b6);
    } while (Object.keys(pers).length < 4 && tries < 12);
    pick6 = shuffle(pick6);
    t.o6 = pick6.map(function (e) {
      var v = byInf[e[0]]; soft[e[0]] = 1;
      return { v: v, p: e[1], text: e[2], aux: firstWord(v.f[e[1]]), pp: v._pp };
    });

    var b7 = BANK.opp7.filter(function (e) { return byInf[e[2]] && ok(byInf[e[2]]) && !soft[e[2]]; });
    var s7 = shuffle(b7.filter(function (e) { return seinEntry(byInf[e[2]], e[3]); })), h7 = shuffle(b7.filter(function (e) { return !seinEntry(byInf[e[2]], e[3]); }));
    var pick7 = [], u7 = {};
    s7.forEach(function (e) { if (pick7.length < 2 && !u7[e[2]]) { u7[e[2]] = 1; pick7.push(e); } });
    // minst ett uten ge- hvis mulig
    var nogeFirst = h7.filter(function (e) { return byInf[e[2]]._kind === 'noge'; });
    if (nogeFirst.length) { var e0 = nogeFirst[0]; u7[e0[2]] = 1; pick7.push(e0); }
    h7.forEach(function (e) { if (pick7.length < 4 && !u7[e[2]]) { u7[e[2]] = 1; pick7.push(e); } });
    pick7 = shuffle(pick7);
    t.o7 = pick7.map(function (e) {
      var v = byInf[e[2]]; soft[e[2]] = 1;
      return { no: e[0], de: e[1], v: v, p: e[3], aux: firstWord(v.f[e[3]]), pp: v._pp };
    });

    // Oppg. 1
    var cols = shuffle([0, 0, 0, 1, 1, 1]);
    t.o1 = PERSONS.map(function (r, i) { return { pr: r[0], sein: r[1], haben: r[2], given: cols[i] }; });

    // Oppg. 4 (sein-delen) reserveres først, så oppg. 2 ikke tar alle sein-verbene
    var strSein = pool(L, function (v) { return v._kind === 'ge' && v._strong && v._sein; });
    var nSein = Math.min(strSein.length, 2 + (R() < 0.4 ? 1 : 0));
    var s4 = take(strSein, nSein, used, soft);

    // Oppg. 2: 4 sein + 4 haben
    var simple = function (v) { return v._kind === 'ge' || (L === 'B1' && v._kind === 'sep'); };
    var seinPool = pool(L, function (v) { return v._sein && simple(v) && !v._mixed; });
    ['sein', 'werden'].forEach(function (x) { if (byInf[x]) seinPool.push(byInf[x]); });
    var habPool = pool(L, function (v) { return !v._sein && simple(v); });
    var s2 = take(seinPool, 4, used, soft), h2 = take(habPool, 8 - s2.length, used, soft);
    t.o2 = shuffle(s2.concat(h2)).map(function (v) { return { v: v, ans: v.h }; });

    // Oppg. 3: svake verb
    var weakHab = pool(L, function (v) { return v._kind === 'ge' && !v._irr && !v._sein; });
    var weakSein = pool(L, function (v) { return v._kind === 'ge' && !v._irr && v._sein; });
    var sepWeak = pool(L, function (v) { return v._kind === 'sep' && !v._irr && !v._sein; });
    var w = [];
    if (weakSein.length && R() < 0.5) w = w.concat(take(weakSein, 1, used, soft));
    var nSep = L === 'A1' ? 0 : L === 'A2' ? (R() < 0.5 ? 1 : 0) : 2;
    w = w.concat(take(sepWeak, nSep, used, soft));
    w = w.concat(take(weakHab, 6 - w.length, used, soft));
    t.o3 = shuffle(w).map(function (v) { return { v: v, aux: v._sein ? 'ist' : 'hat', pp: v._pp }; });

    // Oppg. 4: sterke verb
    var strHab = pool(L, function (v) { return v._kind === 'ge' && v._strong && !v._sein; });
    var sepStr = pool(L, function (v) { return v._kind === 'sep' && v._strong; });
    var nSep4 = L === 'A1' ? 0 : L === 'A2' ? (R() < 0.5 ? 1 : 0) : 2;
    s4 = s4.concat(take(sepStr, nSep4, used, soft));
    s4 = s4.concat(take(strHab, 8 - s4.length, used, soft));
    t.o4 = shuffle(s4).map(function (v) { return { v: v, aux: v._sein ? 'ist' : 'hat', pp: v._pp }; });

    // Oppg. 5: uten ge-
    var nStr = pool(L, function (v) { return v._kind === 'noge' && v._strong && !v._sein; });
    var nIer = pool(L, function (v) { return v._kind === 'noge' && !v._irr && !v._sein && /ieren$/.test(v.i); });
    var nWeak = pool(L, function (v) { return v._kind === 'noge' && !v._irr && !v._sein && !/ieren$/.test(v.i); });
    var s5 = take(nStr, 3, used, soft).concat(take(nIer, 2, used, soft));
    s5 = s5.concat(take(nWeak, 8 - s5.length, used, soft));
    if (s5.length < 8) s5 = s5.concat(take(nIer, 8 - s5.length, used, soft));
    t.o5 = shuffle(s5).map(function (v) { return { v: v, pp: v._pp }; });

    // Oppg. 8: hjelpeverb
    var hu = {};
    var help = take(pool(L, function (v) { return v._kind === 'ge' && v._strong && v._sein; }), 2, hu)
      .concat(take(pool(L, function (v) { return v._kind === 'ge' && v._strong && !v._sein; }), 4, hu))
      .concat(take(pool(L, function (v) { return v._kind === 'ge' && !v._irr && !v._sein; }), 3, hu))
      .concat(take(pool(L, function (v) { return v._kind === 'noge' && !v._sein && !v._mixed; }), 3, hu));
    t.help = shuffle(help).map(function (v) { return v.i; });
    return t;
  }

  /* ---------- tegning ---------- */
  var T = null, GRADED = false, items = {}, t0 = 0, timer = null, lastInput = null;

  function inp(cls, ph) {
    var i = el('input', 'op-in ' + (cls || ''));
    i.type = 'text'; i.autocomplete = 'off'; i.setAttribute('autocapitalize', 'none');
    i.spellcheck = false; i.setAttribute('autocorrect', 'off');
    if (ph) i.placeholder = ph;
    i.addEventListener('focus', function () { lastInput = i; });
    i.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var all = [].slice.call(document.querySelectorAll('#oppgaver .op-in:not(:disabled), #oppgaver .op-sel:not(:disabled)'));
      var k = all.indexOf(i);
      if (k >= 0 && all[k + 1]) { e.preventDefault(); all[k + 1].focus(); }
    });
    return i;
  }
  function sel(opts) {
    var s = el('select', 'op-sel');
    s.innerHTML = '<option value="">–</option>' + opts.map(function (o) { return '<option value="' + o + '">' + o + '</option>'; }).join('');
    return s;
  }
  function section(nr, title, pts, intro) {
    var s = el('section', 'op-task');
    s.id = 'op-t' + nr;
    s.innerHTML = '<h2><span class="op-nr">' + nr + '</span> ' + title +
      ' <span class="op-pts" id="op-pts' + nr + '">' + pts + ' poeng</span></h2>' + (intro ? '<p class="op-intro">' + intro + '</p>' : '');
    return s;
  }
  function fb(row) { var f = el('span', 'op-fb'); row.appendChild(f); return f; }

  function build(t) {
    items = { o1: [], o2: [], o3: [], o4: [], o5: [], o6: [], o7: [], o8: [] };
    var root = $('oppgaver'); root.innerHTML = '';
    var sec, row, grid;

    // 1
    sec = section(1, 'Haben og sein', 6, 'Fyll inn riktig form av hjelpeverbene i presens. Grå felt er allerede fylt ut — fyll ut de 6 hvite feltene (1 poeng hver).');
    var tb = el('table', 'op-tab');
    tb.innerHTML = '<tr><th></th><th>sein</th><th>haben</th></tr>';
    t.o1.forEach(function (r) {
      var tr = el('tr'); tr.appendChild(el('th', '', r.pr));
      [['sein', r.sein, 0], ['haben', r.haben, 1]].forEach(function (c) {
        var td = el('td');
        if (r.given === c[2]) { td.className = 'op-given'; td.textContent = c[1]; }
        else {
          var i = inp('op-sm'); td.appendChild(i);
          var f = el('span', 'op-fb'); td.appendChild(f);
          items.o1.push({ input: i, exp: c[1], fb: f });
        }
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    sec.appendChild(tb); root.appendChild(sec);

    // 2
    sec = section(2, 'Haben eller sein?', 8, 'Velg hvilket hjelpeverb som brukes i perfektum: <b>haben</b> eller <b>sein</b>.');
    grid = el('div', 'op-grid2');
    t.o2.forEach(function (o) {
      row = el('div', 'op-row');
      row.appendChild(el('span', 'op-lab', '<b>' + o.v.i + '</b>'));
      var s = sel(['haben', 'sein']); row.appendChild(s);
      var f = fb(row);
      items.o2.push({ sel: s, exp: o.ans, fb: f, v: o.v });
      grid.appendChild(row);
    });
    sec.appendChild(grid); root.appendChild(sec);

    // 3
    sec = section(3, 'Svake verb', 6, 'Velg hjelpeverb og skriv partisippet i perfektum, 3. person entall (<i>er/sie hat … / ist …</i>). Eksempel: <i>sagen → hat gesagt</i>');
    t.o3.forEach(function (o) {
      row = el('div', 'op-row');
      row.appendChild(el('span', 'op-lab', '<b>' + o.v.i + '</b>'));
      var s = sel(['hat', 'ist']); row.appendChild(s);
      var i = inp(); row.appendChild(i);
      var f = fb(row);
      items.o3.push({ sel: s, input: i, aux: o.aux, pp: o.pp, fb: f });
      sec.appendChild(row);
    });
    root.appendChild(sec);

    // 4
    sec = section(4, 'Sterke verb', 8, 'Velg riktig hjelpeverb og skriv partisippet (3. person entall). <b>Husk:</b> noen av dem bruker <i>sein</i>!');
    t.o4.forEach(function (o) {
      row = el('div', 'op-row');
      row.appendChild(el('span', 'op-lab', '<b>' + o.v.i + '</b> <small>å ' + esc(o.v.n) + '</small>'));
      var s = sel(['hat', 'ist']); row.appendChild(s);
      var i = inp(); row.appendChild(i);
      var f = fb(row);
      items.o4.push({ sel: s, input: i, aux: o.aux, pp: o.pp, fb: f });
      sec.appendChild(row);
    });
    root.appendChild(sec);

    // 5
    sec = section(5, 'Verb uten «ge-»', 8, 'Noen verb får ikke ge- foran partisippet. Skriv partisippet (alle bruker <b>haben</b>).');
    t.o5.forEach(function (o) {
      row = el('div', 'op-row');
      row.appendChild(el('span', 'op-lab', '<b>' + o.v.i + '</b> <small>å ' + esc(o.v.n) + '</small>'));
      row.appendChild(el('span', 'op-static', 'er/sie hat'));
      var i = inp(); row.appendChild(i);
      var f = fb(row);
      items.o5.push({ input: i, pp: o.pp, fb: f });
      sec.appendChild(row);
    });
    root.appendChild(sec);

    // 6
    sec = section(6, 'Fyll inn setningene', 6, 'Skriv riktig form av hjelpeverbet og partisippet av verbet i parentes. <b>1 poeng per setning – begge deler må være riktig.</b>');
    t.o6.forEach(function (o, k) {
      row = el('div', 'op-sent');
      var parts = o.text.split(/(\{a\}|\{p\})/), ia = null, ip = null;
      row.appendChild(el('span', 'op-letter', String.fromCharCode(97 + k) + ')'));
      parts.forEach(function (p) {
        if (p === '{a}') { ia = inp('op-sm'); row.appendChild(ia); }
        else if (p === '{p}') { ip = inp('op-md'); row.appendChild(ip); }
        else if (p) row.appendChild(document.createTextNode(p));
      });
      row.appendChild(el('span', 'op-verb', '(' + o.v.i + ')'));
      var f = fb(row);
      items.o6.push({ a: ia, p: ip, aux: o.aux, pp: o.pp, fb: f });
      sec.appendChild(row);
    });
    root.appendChild(sec);

    // 7
    sec = section(7, 'Oversett til tysk', 8, 'Skriv hele setningen i perfektum. <b>2 poeng per setning:</b> 1 for riktig hjelpeverb, 1 for riktig partisipp og ordstilling (partisippet sist). <small>Retteren sjekker hjelpeverb og partisipp — resten sammenligner du selv med fasiten.</small>');
    t.o7.forEach(function (o, k) {
      row = el('div', 'op-tr');
      row.appendChild(el('div', 'op-no', '<span class="op-letter">' + String.fromCharCode(97 + k) + ')</span> ' + esc(o.no)));
      var i = inp('op-wide'); row.appendChild(i);
      var f = el('div', 'op-fb op-fbblock'); row.appendChild(f);
      items.o7.push({ input: i, o: o, fb: f });
      sec.appendChild(row);
    });
    root.appendChild(sec);

    // 8
    if (t.free) {
      sec = section(8, 'Skriv fritt: Min helg', 8, 'Skriv <b>5 setninger</b> i perfektum om en helg (ekte eller oppdiktet). Bruk <b>minst 2 sterke verb</b>, <b>1 svakt verb</b> og <b>1 verb uten ge-</b>. Bruk <b>minst 1 gang sein</b> som hjelpeverb.');
      var chips = el('div', 'op-chips', '<b>Hjelp – verb du kan bruke:</b> ' + t.help.map(function (x) { return '<span class="op-chip">' + x + '</span>'; }).join(' '));
      sec.appendChild(chips);
      for (var k = 0; k < 5; k++) {
        row = el('div', 'op-free');
        row.appendChild(el('span', 'op-letter', (k + 1) + '.'));
        var i = inp('op-wide', k === 0 ? 'f.eks. Am Samstag bin ich nach Bergen gefahren.' : '');
        row.appendChild(i);
        var f = el('div', 'op-fb op-fbblock'); row.appendChild(f);
        items.o8.push({ input: i, fb: f });
        sec.appendChild(row);
      }
      var rq = el('div', 'op-req'); rq.id = 'op-req';
      sec.appendChild(rq);
      root.appendChild(sec);
    }
  }

  /* ---------- retting ---------- */
  function mark(inputEl, ok) {
    inputEl.classList.add(ok ? 'op-ok' : 'op-bad');
  }
  function lastTok(s) { var tk = tokens(s); return tk.length ? tk[tk.length - 1] : ''; }
  function setFb(f, ok, txt) {
    f.className = f.className.replace(/ ?op-(good|miss|part)/g, '') + ' ' + (ok === 1 ? 'op-good' : ok === 0.5 ? 'op-part' : 'op-miss');
    f.innerHTML = txt;
  }
  function empty(items_) { return 0; }

  var INF = null;
  var PPMAP = null;
  function ppmap() {
    if (PPMAP) return PPMAP;
    PPMAP = {}; INF = {};
    V.forEach(function (v) { INF[fold(v.i)] = v; });
    V.forEach(function (v) { if (!v._pp) return; var k = fold(v._pp); (PPMAP[k] = PPMAP[k] || []).push(v); });
    return PPMAP;
  }

  function grade() {
    var res = { o1: [0, 6], o2: [0, 8], o3: [0, 6], o4: [0, 8], o5: [0, 8], o6: [0, 6], o7: [0, 8], o8: [0, 8] };
    var blanks = 0;
    function blank(a) { if (!a || !String(a.value).trim()) blanks++; }

    items.o1.forEach(function (x) {
      blank(x.input);
      var ok = fold(x.input.value) === fold(x.exp);
      mark(x.input, ok); if (ok) res.o1[0] += 1; else x.fb.innerHTML = ' <b class="op-fix">' + x.exp + '</b>';
    });
    items.o2.forEach(function (x) {
      if (!x.sel.value) blanks++;
      var ok = x.sel.value === x.exp;
      mark(x.sel, ok); if (ok) res.o2[0] += 1; else setFb(x.fb, 0, '→ ' + x.exp);
    });
    items.o3.forEach(function (x) {
      blank(x.input); if (!x.sel.value) blanks++;
      var aOk = x.sel.value === x.aux, pOk = lastTok(x.input.value) === fold(x.pp);
      mark(x.sel, aOk); mark(x.input, pOk);
      var pts = (aOk ? 0.5 : 0) + (pOk ? 0.5 : 0); res.o3[0] += pts;
      setFb(x.fb, pts === 1 ? 1 : pts ? 0.5 : 0, pts === 1 ? '✓' : '→ ' + x.aux + ' ' + x.pp);
    });
    items.o4.forEach(function (x) {
      blank(x.input); if (!x.sel.value) blanks++;
      var aOk = x.sel.value === x.aux, pOk = lastTok(x.input.value) === fold(x.pp);
      mark(x.sel, aOk); mark(x.input, pOk);
      var pts = pOk ? (aOk ? 1 : 0.5) : 0; res.o4[0] += pts;
      setFb(x.fb, pts, pts === 1 ? '✓' : '→ ' + x.aux + ' ' + x.pp);
    });
    items.o5.forEach(function (x) {
      blank(x.input);
      var got = lastTok(x.input.value), pOk = got === fold(x.pp);
      mark(x.input, pOk);
      if (pOk) { res.o5[0] += 1; setFb(x.fb, 1, '✓'); }
      else setFb(x.fb, 0, '→ hat ' + x.pp + (/^ge/.test(got) && !/^ge/.test(x.pp) ? ' <em>(ingen ge-!)</em>' : ''));
    });
    items.o6.forEach(function (x) {
      blank(x.a); blank(x.p);
      var aOk = fold(x.a.value) === fold(x.aux), pOk = lastTok(x.p.value) === fold(x.pp);
      mark(x.a, aOk); mark(x.p, pOk);
      if (aOk && pOk) { res.o6[0] += 1; setFb(x.fb, 1, '✓'); }
      else setFb(x.fb, 0, '→ ' + x.aux + ' … ' + x.pp);
    });
    items.o7.forEach(function (x) {
      blank(x.input);
      var tk = tokens(x.input.value), aux = fold(x.o.aux), pp = fold(x.o.pp), last = tk.length ? tk[tk.length - 1] : '';
      var aPts = 0, pPts = 0, notes = [];
      if (!tk.length) { notes.push('ikke besvart'); }
      else if (tk.indexOf(aux) >= 0) aPts = 1;
      else if (tk.some(function (w) { return w.length > 2 && lev(w, aux) === 1 && w !== aux; }) ) { aPts = 0.5; notes.push('liten skrivefeil i hjelpeverbet'); }
      else notes.push('hjelpeverbet skulle vært «' + x.o.aux + '»');
      if (!tk.length) { }
      else if (last === pp) pPts = 1;
      else if (tk.indexOf(pp) >= 0) { pPts = 0.5; notes.push('partisippet skal stå <b>sist</b>'); }
      else if (last && lev(last, pp) === 1) { pPts = 0.5; notes.push('liten skrivefeil i partisippet («' + x.o.pp + '»)'); }
      else notes.push('partisippet skulle vært «' + x.o.pp + '»');
      var pts = aPts + pPts; res.o7[0] += pts;
      mark(x.input, pts === 2);
      var exact = fold(x.input.value) === fold(x.o.de);
      setFb(x.fb, pts === 2 ? 1 : pts ? 0.5 : 0,
        (pts === 2 ? '✓ ' : '<b>' + num(pts) + ' av 2.</b> ' + notes.join('; ') + '. ') +
        (exact ? '' : '<br>Fasit: <b>' + esc(x.o.de) + '</b>' + (pts === 2 ? ' <small>(sjekk resten av setningen selv)</small>' : '')));
    });
    if (T.free) {
      var okVerbs = { strong: {}, weak: {}, noge: {}, sein: {} };
      var map = ppmap(), nS = 0, nW = 0, nN = 0, nSe = 0;
      items.o8.forEach(function (x) {
        blank(x.input);
        var tk = tokens(x.input.value), pts = 0, note = '';
        var iA = -1, isSein = false;
        tk.forEach(function (w, i) {
          if (iA < 0 && HABEN_FORMS.indexOf(w) >= 0) iA = i;
          else if (iA < 0 && SEIN_FORMS.indexOf(w) >= 0) { iA = i; isSein = true; }
        });
        var last = tk.length ? tk[tk.length - 1] : '';
        var vs = map[last] || [];
        if (!tk.length) note = 'Ikke besvart.';
        else if (tk.length < 3) note = 'Skriv en hel setning.';
        else if (iA < 0) note = 'Fant ikke hjelpeverb (habe/hat/bin/ist …).';
        else if (iA >= tk.length - 1) note = 'Hjelpeverbet må stå foran partisippet, og partisippet skal stå sist.';
        else if (vs.length) {
          var good = vs.filter(function (v) { return v._sein === isSein; });
          if (good.length) {
            pts = 1; var v = good[0];
            if (isSein) okVerbs.sein[v.i] = 1;
            if (v._kind === 'noge') okVerbs.noge[v.i] = 1;
            else if (v._irr) okVerbs.strong[v.i] = 1;
            else okVerbs.weak[v.i] = 1;
            note = '✓ ' + v.i + ' (' + (isSein ? 'sein' : 'haben') + ')';
          } else { pts = 0.5; note = 'Partisippet «' + last + '» er riktig, men hjelpeverbet skal være <b>' + (isSein ? 'haben' : 'sein') + '</b> (' + vs[0].i + ').'; }
        } else if (INF[last]) {
          note = '«' + esc(last) + '» er infinitiv. I perfektum skal <b>partisippet</b> stå sist (f.eks. ' + INF[last]._pp + ').';
        } else if (/^ge\w+(t|en)$/.test(last) || /^(be|ver|er|zer|ent|emp|miss)\w+(t|en)$/.test(last) || /ieren$|iert$/.test(last)) {
          pts = 0.5; note = 'Kjenner ikke partisippet «' + esc(last) + '» fra verblista vår – sjekk selv at det er riktig.';
        } else note = 'Setningen ender ikke på et partisipp. Husk: partisippet står sist.';
        res.o8[0] += pts;
        mark(x.input, pts === 1);
        setFb(x.fb, pts, note);
      });
      nS = Object.keys(okVerbs.strong).length; nW = Object.keys(okVerbs.weak).length;
      nN = Object.keys(okVerbs.noge).length; nSe = Object.keys(okVerbs.sein).length;
      var r1 = nS >= 2, r2 = nW >= 1 && nN >= 1, r3 = nSe >= 1;
      res.o8[0] += (r1 ? 1 : 0) + (r2 ? 1 : 0) + (r3 ? 1 : 0);
      $('op-req').style.display = 'block';
      $('op-req').innerHTML = '<b>Krav til innholdet (3 poeng):</b><ul>' +
        '<li class="' + (r1 ? 'op-yes' : 'op-no2') + '">' + (r1 ? '✓' : '✗') + ' minst 2 ulike sterke/uregelrette verb (fant ' + nS + ') — 1 poeng</li>' +
        '<li class="' + (r2 ? 'op-yes' : 'op-no2') + '">' + (r2 ? '✓' : '✗') + ' minst 1 svakt verb (fant ' + nW + ') og 1 verb uten ge- (fant ' + nN + ') — 1 poeng</li>' +
        '<li class="' + (r3 ? 'op-yes' : 'op-no2') + '">' + (r3 ? '✓' : '✗') + ' minst 1 setning med sein (fant ' + nSe + ') — 1 poeng</li></ul>' +
        '<small>Den automatiske rettingen sjekker oppbygging (hjelpeverb + partisipp sist) og verbtyper. Meningen og resten av språket vurderer du eller læreren selv.</small>';
    } else { res.o8 = [0, 0]; }
    res.blanks = blanks;
    return res;
  }

  /* ---------- resultat ---------- */
  var AREAS = [
    { n: 'haben og sein', t: ['o1', 'o2'], tip: 'Bøy begge verbene fra hukommelsen. Lær regelen om bevegelsesverb og tilstandsendring (sein).' },
    { n: 'Svake verb', t: ['o3'], tip: 'ge- + stamme + -t. Øv med 10 nye verb.' },
    { n: 'Sterke verb', t: ['o4'], tip: 'Lær lista over verb i perfektum utenat (kort eller Quizlet).' },
    { n: 'Uten «ge-»', t: ['o5'], tip: 'Husk be-, ver-, er-, zer-, ent-, emp-, miss- og -ieren.' },
    { n: 'Hele setninger', t: ['o6', 'o7', 'o8'], tip: 'Skriv egne setninger. Hjelpeverbet på plass 2, partisippet sist.' }
  ];
  function msg(frac) {
    if (frac >= 50 / 58) return ['🏆', 'Veldig bra', 'Du mestrer perfektum godt.'];
    if (frac >= 40 / 58) return ['👍', 'Bra', 'Øv litt mer på det du bommet på.'];
    if (frac >= 30 / 58) return ['🙂', 'Middels', 'Gå gjennom verblisten og haben/sein-reglene igjen.'];
    return ['💪', 'Trenger mer øving', 'Start med haben/sein-tabellen og de svake verbene.'];
  }
  function mmss(ms) { var s = Math.round(ms / 1000); return Math.floor(s / 60) + ' min ' + (s % 60) + ' s'; }

  function showResult(res) {
    var tot = 0, max = 0;
    Object.keys(res).forEach(function (k) { if (/^o\d$/.test(k)) { tot += res[k][0]; max += res[k][1]; } });
    for (var n = 1; n <= 8; n++) {
      var r = res['o' + n], pe = $('op-pts' + n);
      if (pe && r) { pe.textContent = num(r[0]) + ' / ' + r[1] + ' poeng'; pe.className = 'op-pts op-pts-done'; }
    }
    var frac = max ? tot / max : 0, pct = Math.round(frac * 100), m = msg(frac);
    var bars = AREAS.map(function (a) {
      var s = 0, mx = 0; a.t.forEach(function (k) { if (res[k]) { s += res[k][0]; mx += res[k][1]; } });
      var p = mx ? s / mx : 1, low = p < 0.7;
      return '<div class="op-area ' + (low ? 'op-low' : 'op-hi') + '"><div class="op-area-h"><b>' + a.n + '</b><span>' + num(s) + ' / ' + mx + '</span></div>' +
        '<div class="op-bar"><i style="width:' + Math.round(p * 100) + '%"></i></div>' +
        '<div class="op-area-t">' + (low ? '📌 ' + a.tip : '✅ Sitter bra!') + '</div></div>';
    }).join('');
    var box = $('resultat');
    box.innerHTML =
      '<div class="op-emoji">' + m[0] + '</div>' +
      '<div class="op-big">' + num(tot) + ' <small>av ' + max + ' poeng</small></div>' +
      '<div class="op-pct">' + pct + ' %</div>' +
      '<p class="op-verdict"><b>' + m[1] + '</b> – ' + m[2] + '</p>' +
      '<div class="op-meta">Prøve nr. ' + T.seed + ' · nivå ' + ({ A1: 'A1', A2: 'A1–A2', B1: 'A1–B1' }[T.level]) +
      ' · tid: ' + mmss(Date.now() - t0) + (res.blanks ? ' · ' + res.blanks + ' felt ble stående tomme' : '') + '</div>' +
      '<h3>📋 Hva bør jeg øve på?</h3><div class="op-areas">' + bars + '</div>' +
      '<div class="op-links"><a href="../">📖 Les reglene på Perfekt-siden</a> <a href="../../../../verben/">🔄 Slå opp verb i verbkonjugatoren</a></div>' +
      '<p class="op-scrolldown">Rettingen står under hver oppgave – grønt er riktig, rødt er feil, og riktig svar vises ved siden av. ⬇️</p>';
    box.classList.add('op-show');
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (tot > 0) saveHistory(tot, max, pct);
    return { tot: tot, max: max, pct: pct };
  }

  /* ---------- historikk (valgfritt, bare i denne nettleseren) ---------- */
  var HK = 'dwOveproveHistorie';
  function loadHistory() { try { return JSON.parse(localStorage.getItem(HK) || '[]'); } catch (e) { return []; } }
  function saveHistory(tot, max, pct) {
    try {
      var h = loadHistory();
      h.unshift({ d: new Date().toISOString().slice(0, 10), s: tot, m: max, p: pct, n: T.seed });
      localStorage.setItem(HK, JSON.stringify(h.slice(0, 8)));
    } catch (e) { }
    renderHistory();
  }
  function renderHistory() {
    var h = loadHistory(), box = $('historie');
    if (!h.length) { box.style.display = 'none'; return; }
    box.style.display = '';
    box.innerHTML = '<b>Dine siste forsøk</b> <small>(lagres bare i denne nettleseren)</small><ul>' + h.map(function (x) {
      return '<li>' + x.d + ' · prøve nr. ' + x.n + ' · <b>' + num(x.s) + '/' + x.m + '</b> (' + x.p + ' %)</li>';
    }).join('') + '</ul>';
  }

  /* ---------- flyt ---------- */
  function startTest(seed, level, free) {
    T = generate(seed, level, free);
    GRADED = false;
    build(T);
    $('resultat').className = 'op-result'; $('resultat').innerHTML = '';
    $('oppsett').style.display = 'none';
    $('prove').style.display = '';
    $('op-seed').textContent = 'Prøve nr. ' + seed;
    $('op-max').textContent = free ? '58' : '50';
    $('btn-rett').disabled = false; $('btn-rett').style.display = '';
    $('igjen-wrap').style.display = 'none';
    $('charbar').style.display = '';
    t0 = Date.now();
    clearInterval(timer);
    timer = setInterval(function () {
      var s = Math.floor((Date.now() - t0) / 1000);
      $('op-timer').textContent = '⏱ ' + Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
    }, 1000);
    $('op-timer').textContent = '⏱ 0:00';
    window.scrollTo(0, 0);
    try { history.replaceState(null, '', '#' + seed + (level !== 'A2' ? '-' + level : '') + (free ? '' : '-x')); } catch (e) { }
  }
  function rett() {
    if (GRADED) return;
    GRADED = true; clearInterval(timer);
    var res = grade();
    [].forEach.call(document.querySelectorAll('#oppgaver input, #oppgaver select'), function (x) { x.disabled = true; });
    showResult(res);
    $('btn-rett').style.display = 'none';
    $('igjen-wrap').style.display = '';
    $('charbar').style.display = 'none';
  }
  function newSeed() { return 10000 + Math.floor(Math.random() * 89999); }
  function readSetup() {
    var raw = $('inp-seed').value.replace(/\D/g, '');
    return { seed: raw ? parseInt(raw, 10) : newSeed(), level: $('sel-level').value, free: $('chk-free').checked };
  }

  function init() {
    if (!V.length || !BANK) { $('oppsett').innerHTML = '<p>Kunne ikke laste verbdataene. Prøv å laste siden på nytt.</p>'; return; }
    $('btn-start').addEventListener('click', function () { var s = readSetup(); startTest(s.seed, s.level, s.free); });
    $('btn-rett').addEventListener('click', rett);
    $('btn-igjen').addEventListener('click', function () { startTest(T.seed, T.level, T.free); });
    [].forEach.call(document.querySelectorAll('.btn-ny'), function (b) {
      b.addEventListener('click', function () { startTest(newSeed(), T ? T.level : $('sel-level').value, T ? T.free : $('chk-free').checked); });
    });
    [].forEach.call(document.querySelectorAll('.btn-print'), function (b) { b.addEventListener('click', function () { window.print(); }); });
    $('btn-oppsett').addEventListener('click', function () {
      clearInterval(timer);
      $('prove').style.display = 'none'; $('oppsett').style.display = ''; window.scrollTo(0, 0);
    });
    [].forEach.call(document.querySelectorAll('#charbar button'), function (b) {
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () {
        var i = lastInput; if (!i || i.disabled) return;
        var s = i.selectionStart == null ? i.value.length : i.selectionStart, e2 = i.selectionEnd == null ? s : i.selectionEnd;
        i.value = i.value.slice(0, s) + b.textContent + i.value.slice(e2);
        i.focus(); i.setSelectionRange(s + 1, s + 1);
      });
    });
    renderHistory();
    // Delbar lenke: #12345, #12345-B1, #12345-x (uten oppg. 8)
    var m = /^#(\d{3,7})(?:-(A1|A2|B1))?(-x)?$/.exec(location.hash || '');
    if (m) { $('inp-seed').value = m[1]; if (m[2]) $('sel-level').value = m[2]; if (m[3]) $('chk-free').checked = false; }
    window.DW_OVEPROVE = { generate: generate, startTest: startTest, rett: rett, get T() { return T; }, get items() { return items; }, fold: fold };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
