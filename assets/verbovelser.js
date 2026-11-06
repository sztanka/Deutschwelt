/* Deutschwelt — felles øvelsesmotor for verb i presens (verbovelser.js)
   Widgets (aktiveres automatisk ved klassenavn; valgfri JSON-konfig i <script type="application/json">):
     .dwv-table  – utfyllingstabell (verb × pronomen)            .dwv-gap  – fyll inn i setninger
     .dwv-mc     – flervalgsquiz                                  .dwv-pair – match pronomen og verbform
     .dwv-who    – «hvem kan dette være?»                         .dwv-round – tilfeldig runde fra verblista (dwVerben)
   Tabs: aktiveres når <body data-dwv-tabs>. Krever verben/verben_data.js (dwVerben) for pair/who/round. */
(function () {
  'use strict';
  var V = window.dwVerben || [];
  var SENT = window.DWV_SENT || [];
  var PRON = ['ich', 'du', 'er / sie / es', 'wir', 'ihr', 'sie / Sie'];
  var byInf = {};
  V.forEach(function (v) { byInf[v.i] = v; });

  /* ---------- hjelpefunksjoner ---------- */
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function shuffle(a) { a = a.slice(); for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = a[k]; a[k] = a[j]; a[j] = t; } return a; }
  function strip(s) { return String(s).replace(/[‹›]/g, ''); }
  function norm(s) { return String(s).trim().toLowerCase().replace(/\s+/g, ' '); }
  function tl(s) { return s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss'); }
  function first(x) { return [].concat(x)[0]; }
  function grade(val, ans) {
    var v = norm(val); if (!v) return 'empty';
    var a = [].concat(ans), i;
    for (i = 0; i < a.length; i++) if (v === norm(a[i])) return 'ok';
    for (i = 0; i < a.length; i++) if (tl(v) === tl(norm(a[i])) && /[äöüß]/.test(a[i])) return 'near';
    return 'bad';
  }
  function mark(inp, st) {
    inp.classList.remove('dw-st-ok', 'dw-st-near', 'dw-st-bad', 'dw-st-shown');
    if (st) inp.classList.add('dw-st-' + st);
  }
  function ins(inp, ch) {
    var s = inp.selectionStart, e = inp.selectionEnd;
    if (s == null) { inp.value += ch; } else { inp.value = inp.value.slice(0, s) + ch + inp.value.slice(e); inp.selectionStart = inp.selectionEnd = s + 1; }
    inp.focus(); inp.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function keyRow(host) {
    var r = el('div', 'dw-keys'); r.appendChild(el('span', '', 'Spesialtegn:'));
    ['ä', 'ö', 'ü', 'ß'].forEach(function (k) {
      var b = el('button', 'dw-key', k); b.type = 'button'; b.setAttribute('aria-label', 'Sett inn ' + k);
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () { var i = host._last || host.querySelector('input.dw-fi:not([readonly])'); if (i) ins(i, k); });
      r.appendChild(b);
    });
    return r;
  }
  function wire(host, inputs, onchange) {
    inputs.forEach(function (inp, n) {
      inp.setAttribute('autocomplete', 'off'); inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('autocorrect', 'off'); inp.setAttribute('spellcheck', 'false');
      inp.addEventListener('focus', function () { host._last = inp; });
      inp.addEventListener('input', onchange);
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); var nx = inputs[n + 1]; if (nx) nx.focus(); else if (host._check) host._check(); }
      });
    });
  }
  function cfgOf(root) {
    var s = root.querySelector('script[type="application/json"]');
    if (!s) return {};
    try { return JSON.parse(s.textContent); } catch (e) { return {}; }
  }
  function btn(cls, txt) { var b = el('button', cls, txt); b.type = 'button'; return b; }

  /* ---------- verbgrupper ---------- */
  var SPECIAL = { sein: 1, haben: 1, werden: 1, wissen: 1, 'können': 1, 'dürfen': 1, 'müssen': 1, sollen: 1, wollen: 1, 'mögen': 1, tun: 1, geschehen: 1, plaudern: 1 };
  function groupOf(v) {
    if (v.r || !v.p || v.p.length < 6 || SPECIAL[v.i]) return 'x';
    var m = v.p.map(function (x) { return x.indexOf('‹') >= 0; });
    if (!m.some(Boolean)) return 'weak';
    if (!m[0] && m[1] && m[2] && !m[3] && !m[4] && !m[5]) return 'vowel';
    return 'x';
  }
  function isSep(v) { return /\s\S+$/.test(strip(v.p[0])); }
  function levelOk(L) { return function (v) { return L === 'A1' ? v.l === 'A1' : L === 'A2' ? v.l !== 'B1' : true; }; }
  function pool(kind, level) {
    var ok = levelOk(level);
    return V.filter(function (v) {
      var g = groupOf(v); if (g === 'x' || !ok(v)) return false;
      if (kind === 'weak' && g !== 'weak') return false;
      if (kind === 'vowel' && g !== 'vowel') return false;
      if (isSep(v) && level !== 'B1') return false;
      return true;
    });
  }
  function pickVerbs(kind, level, n) {
    if (kind === 'mixed') {
      var w = shuffle(pool('weak', level)), s = shuffle(pool('vowel', level));
      var ns = Math.min(s.length, Math.ceil(n / 2)), nw = Math.min(w.length, n - ns);
      return shuffle(w.slice(0, nw).concat(s.slice(0, ns)));
    }
    return shuffle(pool(kind, level)).slice(0, n);
  }
  /* seks former; ved -eln/-ern godtas begge ich-formene (ich sammle / sammele, wandere / wandre) */
  function formsOf(v) {
    var f = v.p.map(strip), out = f.slice();
    if (!isSep(v) && /e[lr]n$/.test(v.i)) {
      var stem = v.i.slice(0, -1), set = [f[0], stem + 'e', stem.slice(0, -2) + stem.slice(-1) + 'e'];
      out[0] = set.filter(function (x, i) { return set.indexOf(x) === i; });
    }
    return out;
  }
  function formText(v, i) { return first(formsOf(v)[i]); }

  /* ---------- utfyllingstabell ---------- */
  function tableWidget(root, cfg) {
    var mode = cfg.default || 0, checked = false;
    cfg.hl = cfg.hl || [];
    root.classList.add('dw-fill');
    root.innerHTML = '';
    root.appendChild(el('h4', '', '📝 ' + (cfg.title || 'Fyll ut tabellen')));
    if (cfg.intro) root.appendChild(el('p', 'dw-fi-intro', cfg.intro));
    var mb = el('div', 'dw-fill-modes'); root.appendChild(mb);
    var tw = el('div', 'dw-tw'); root.appendChild(tw);
    root.appendChild(keyRow(root));
    var row = el('div', 'dw-frow');
    var bC = btn('dw-fbtn', 'Sjekk'), bS = btn('dw-fbtn dw-sec', 'Vis fasit'), bR = btn('dw-fbtn dw-sec', 'Nullstill');
    var st = el('span', 'dw-fstat', '');
    row.appendChild(bC); row.appendChild(bS); row.appendChild(bR); row.appendChild(st); root.appendChild(row);
    var msg = el('div', 'dw-fmsg'); root.appendChild(msg);
    var cells = [];
    function build() {
      tw.innerHTML = ''; cells = []; checked = false; msg.className = 'dw-fmsg';
      mb.innerHTML = '';
      if (cfg.modes.length > 1) cfg.modes.forEach(function (m, i) { var b = btn(i === mode ? 'dw-on' : '', m.l); b.onclick = function () { mode = i; build(); }; mb.appendChild(b); });
      var blanks = cfg.modes[mode].b;
      var t = el('table'), thead = el('thead'), trh = el('tr');
      trh.appendChild(el('th', '', ''));
      cfg.verbs.forEach(function (v) { var th = el('th', '', v.inf); if (v.no) th.appendChild(el('small', '', v.no)); trh.appendChild(th); });
      thead.appendChild(trh); t.appendChild(thead);
      var tb = el('tbody');
      PRON.forEach(function (p, ri) {
        var tr = el('tr'); tr.appendChild(el('td', 'dw-pr', p));
        cfg.verbs.forEach(function (v) {
          var td = el('td', cfg.hl.indexOf(ri) >= 0 ? 'dw-hlc' : '');
          if (blanks.indexOf(ri) >= 0) {
            var inp = el('input', 'dw-fi'); inp.type = 'text'; inp.setAttribute('aria-label', v.inf + ' – ' + p);
            cells.push({ inp: inp, ans: v.f[ri], irr: (cfg.hl.length === 0 || cfg.hl.indexOf(ri) >= 0) }); td.appendChild(inp);
          } else { td.className += ' dw-given'; td.textContent = first(v.f[ri]); }
          tr.appendChild(td);
        });
        tb.appendChild(tr);
      });
      t.appendChild(tb); tw.appendChild(t);
      wire(root, cells.map(function (c) { return c.inp; }), function () { update(); });
      update();
    }
    function update() {
      var ok = 0, bad = 0, total = cells.length;
      cells.forEach(function (c) {
        if (c.inp.classList.contains('dw-st-shown')) return;
        var g = grade(c.inp.value, c.ans);
        if (g === 'ok') { ok++; mark(c.inp, 'ok'); c.inp.title = ''; }
        else if (g === 'near') { mark(c.inp, 'near'); c.inp.title = 'Nesten! Bruk ä, ö, ü eller ß (knappene under tabellen).'; }
        else if (checked) { mark(c.inp, 'bad'); bad++; }
        else mark(c.inp, '');
      });
      st.textContent = '✅ ' + ok + ' av ' + total;
      st.className = 'dw-fstat' + (ok === total && total ? ' dw-all' : '');
      if (ok === total && total) { msg.className = 'dw-fmsg dw-show'; msg.textContent = '🎉 Alle riktige!'; }
      else if (checked && bad) {
        var irr = cells.some(function (c) { return c.irr && c.inp.classList.contains('dw-st-bad'); });
        msg.className = 'dw-fmsg dw-show'; msg.textContent = (cfg.hint && irr) ? '💡 ' + cfg.hint : 'Røde ruter er ikke riktige ennå – prøv igjen. Gule ruter mangler bare ä/ö/ü/ß.';
      } else if (!ok || !checked) msg.className = 'dw-fmsg';
    }
    root._check = function () { checked = true; update(); };
    bC.onclick = function () { checked = true; update(); };
    bS.onclick = function () { cells.forEach(function (c) { c.inp.value = first(c.ans); mark(c.inp, 'shown'); }); st.textContent = 'Fasit vist'; st.className = 'dw-fstat'; msg.className = 'dw-fmsg'; };
    bR.onclick = function () { build(); };
    build();
  }

  /* ---------- fyll inn i setninger ---------- */
  function gapWidget(root, cfg) {
    var checked = false;
    root.classList.add('dw-fill', 'dw-fg');
    root.innerHTML = '';
    root.appendChild(el('h4', '', '✍️ ' + (cfg.title || 'Fullfør setningene')));
    root.appendChild(el('p', 'dw-fi-intro', cfg.intro || 'Skriv riktig verbform i hullet. Rutene blir grønne når svaret er riktig.'));
    var ol = el('ol'); root.appendChild(ol);
    var rows = [];
    cfg.items.forEach(function (it) {
      var li = el('li'), parts = it.s.split('___');
      li.appendChild(document.createTextNode(parts[0]));
      var inp = el('input', 'dw-fi'); inp.type = 'text'; inp.size = Math.max(5, first(it.a).length + 2); inp.setAttribute('aria-label', 'Svar');
      li.appendChild(inp);
      if (parts[1]) li.appendChild(document.createTextNode(parts[1]));
      if (it.v) li.appendChild(el('span', 'dw-gv', '(' + it.v + ')'));
      var m = el('span', 'dw-gm', ''); li.appendChild(m);
      ol.appendChild(li); rows.push({ inp: inp, ans: it.a, m: m });
    });
    root.appendChild(keyRow(root));
    var row = el('div', 'dw-frow');
    var bC = btn('dw-fbtn', 'Sjekk svar'), bS = btn('dw-fbtn dw-sec', 'Vis fasit'), bR = btn('dw-fbtn dw-sec', 'Nullstill');
    var st = el('span', 'dw-fstat', '');
    row.appendChild(bC); row.appendChild(bS); row.appendChild(bR); row.appendChild(st); root.appendChild(row);
    var msg = el('div', 'dw-fmsg'); root.appendChild(msg);
    function update() {
      var ok = 0, bad = 0;
      rows.forEach(function (r) {
        if (r.inp.classList.contains('dw-st-shown')) return;
        var g = grade(r.inp.value, r.ans);
        if (g === 'ok') { ok++; mark(r.inp, 'ok'); r.m.textContent = '✅'; }
        else if (g === 'near') { mark(r.inp, 'near'); r.m.textContent = '🟡'; }
        else if (checked) { mark(r.inp, 'bad'); r.m.textContent = '❌'; bad++; }
        else { mark(r.inp, ''); r.m.textContent = ''; }
      });
      st.textContent = '✅ ' + ok + ' av ' + rows.length; st.className = 'dw-fstat' + (ok === rows.length ? ' dw-all' : '');
      if (ok === rows.length) { msg.className = 'dw-fmsg dw-show'; msg.textContent = '🎉 Alle riktige!'; }
      else if (checked && bad) { msg.className = 'dw-fmsg dw-show'; msg.textContent = cfg.hint ? '💡 ' + cfg.hint : 'Prøv igjen på de røde.'; }
      else msg.className = 'dw-fmsg';
    }
    root._check = function () { checked = true; update(); };
    wire(root, rows.map(function (r) { return r.inp; }), update);
    bC.onclick = function () { checked = true; update(); };
    bS.onclick = function () { rows.forEach(function (r) { r.inp.value = first(r.ans); mark(r.inp, 'shown'); r.m.textContent = ''; }); st.textContent = 'Fasit vist'; st.className = 'dw-fstat'; msg.className = 'dw-fmsg'; };
    bR.onclick = function () { checked = false; rows.forEach(function (r) { r.inp.value = ''; mark(r.inp, ''); r.m.textContent = ''; }); msg.className = 'dw-fmsg'; update(); };
    update();
  }

  /* ---------- flervalgsquiz ---------- */
  function mcWidget(root, cfg) {
    var ALL = cfg.items, N = cfg.n || ALL.length, Q = [], i = 0, score = 0, done = false, missed = [];
    root.innerHTML = '';
    var card = el('div', 'dw-ex-card'); root.appendChild(card);
    card.innerHTML =
      '<div class="dwv-mc-play"><div class="dw-ex-top"><span class="dwv-c"></span><span class="dwv-s"></span></div>' +
      '<div class="dw-ex-bar"><div class="dw-ex-fill"></div></div><div class="dw-ex-cue"></div><div class="dw-ex-sent"></div>' +
      '<div class="dw-ex-choices" role="group" aria-label="Svaralternativer"></div>' +
      '<button type="button" class="dw-ex-hintbtn">💡 Vis hint</button><div class="dw-ex-fb" aria-live="polite"></div>' +
      '<button type="button" class="dw-ex-btn dwv-next" style="display:none">Neste →</button></div>' +
      '<div class="dw-ex-result"><h3 style="margin:0;font-family:\'Baloo 2\',sans-serif;font-size:1.4rem">Ferdig! 🎉</h3><div class="dw-ex-score"></div><p class="dwv-msg"></p><div class="dw-ex-review"></div>' +
      '<button type="button" class="dw-ex-btn dw-gold dwv-again">🔁 Ny runde</button></div>';
    var $ = function (s) { return card.querySelector(s); };
    function start() {
      Q = shuffle(ALL).slice(0, N); i = 0; score = 0; missed = [];
      $('.dwv-mc-play').style.display = 'block'; $('.dw-ex-result').classList.remove('dw-show'); render();
    }
    function render() {
      var q = Q[i]; done = false;
      $('.dwv-c').textContent = 'Oppgave ' + (i + 1) + ' av ' + Q.length; $('.dwv-s').textContent = 'Poeng: ' + score;
      $('.dw-ex-fill').style.width = (i / Q.length * 100) + '%'; $('.dw-ex-cue').textContent = q.cue || '';
      $('.dw-ex-sent').innerHTML = esc(q.s).replace('___', '<span class="dw-blank">&nbsp;&nbsp;&nbsp;&nbsp;</span>');
      $('.dw-ex-choices').innerHTML = shuffle(q.c).map(function (c) { return '<button type="button" class="dw-ex-choice" data-v="' + esc(c) + '">' + esc(c) + '</button>'; }).join('');
      var fb = $('.dw-ex-fb'); fb.className = 'dw-ex-fb'; fb.innerHTML = '';
      $('.dw-ex-hintbtn').style.display = 'inline'; $('.dwv-next').style.display = 'none';
    }
    $('.dw-ex-choices').addEventListener('click', function (e) {
      var b = e.target.closest('.dw-ex-choice'); if (!b || done) return;
      done = true; var q = Q[i], v = b.getAttribute('data-v'), ok = v === q.a;
      card.querySelectorAll('.dw-ex-choice').forEach(function (x) { x.disabled = true; if (x.getAttribute('data-v') === q.a) x.classList.add('dw-correct'); });
      if (!ok) b.classList.add('dw-wrong');
      var bl = $('.dw-blank'); bl.textContent = q.a; bl.classList.add('dw-filled'); if (!ok) bl.classList.add('dw-bad');
      if (ok) score++; else missed.push(q);
      var fb = $('.dw-ex-fb'); fb.className = 'dw-ex-fb dw-show ' + (ok ? 'dw-good' : 'dw-bad');
      fb.innerHTML = (ok ? '✅ Riktig! ' : '❌ Riktig svar er <b>' + esc(q.a) + '</b>. ') + esc(q.e || '');
      $('.dw-ex-hintbtn').style.display = 'none'; $('.dwv-s').textContent = 'Poeng: ' + score;
      var nx = $('.dwv-next'); nx.style.display = 'inline-block'; nx.textContent = (i === Q.length - 1) ? 'Se resultatet →' : 'Neste →'; nx.focus();
    });
    $('.dw-ex-hintbtn').addEventListener('click', function () { var fb = $('.dw-ex-fb'); fb.className = 'dw-ex-fb dw-show'; fb.innerHTML = '💡 ' + esc(Q[i].h || ''); });
    $('.dwv-next').addEventListener('click', function () {
      if (i < Q.length - 1) { i++; render(); return; }
      $('.dwv-mc-play').style.display = 'none'; $('.dw-ex-result').classList.add('dw-show');
      $('.dw-ex-score').textContent = score + ' / ' + Q.length;
      var pct = score / Q.length;
      $('.dwv-msg').textContent = pct === 1 ? 'Perfekt — ingen feil!' : pct >= 0.75 ? 'Veldig bra! Les gjennom de få feilene under.' : pct >= 0.5 ? 'Greit på vei — se på tabellene og prøv igjen.' : 'Les forklaringen en gang til, og prøv på nytt.';
      $('.dw-ex-review').innerHTML = missed.length ? '<b>Dette bør du se på igjen:</b><ul>' + missed.map(function (q) { return '<li>' + esc(q.s).replace('___', '<b>' + esc(q.a) + '</b>') + ' — ' + esc(q.e || '') + '</li>'; }).join('') + '</ul>' : '🎉 Du hadde alt riktig!';
      $('.dw-ex-fill').style.width = '100%';
    });
    $('.dwv-again').addEventListener('click', start);
    start();
  }

  /* ---------- match pronomen og verbform ---------- */
  function pairGame(host, verbs, title) {
    var idx = 0, errs = 0, matched = 0;
    host.innerHTML = '';
    var h = el('h4'); host.appendChild(h);
    host.appendChild(el('p', 'dw-fi-intro', 'Trykk på et pronomen og deretter på verbformen som hører til. Riktige par blir grønne.'));
    var grid = el('div', 'dwv-pair-grid'); host.appendChild(grid);
    var row = el('div', 'dw-frow');
    var bN = btn('dw-fbtn', 'Neste verb →'), bR = btn('dw-fbtn dw-sec', 'Start på nytt'), st = el('span', 'dw-fstat', '');
    row.appendChild(bN); row.appendChild(bR); row.appendChild(st); host.appendChild(row);
    var msg = el('div', 'dw-fmsg'); host.appendChild(msg);
    var forms, left, right, selL, selR;
    function build() {
      var v = verbs[idx % verbs.length]; forms = formsOf(v).map(first);
      errs = 0; matched = 0; selL = selR = null; msg.className = 'dw-fmsg';
      h.textContent = '🔗 ' + (title || 'Match pronomen og verbform') + ': ' + v.i + ' (' + v.n + ')';
      grid.innerHTML = '';
      var cl = el('div', 'dwv-col'), cr = el('div', 'dwv-col');
      left = PRON.map(function (p, i) { var b = btn('dwv-chip dwv-pron', p); b.onclick = function () { choose('L', i, b); }; cl.appendChild(b); return { b: b, i: i, done: false }; });
      right = shuffle(forms.map(function (f, i) { return { f: f, i: i }; })).map(function (o) {
        var b = btn('dwv-chip dwv-form', o.f); b.onclick = function () { choose('R', o.i, b, o); }; cr.appendChild(b); return { b: b, f: o.f, done: false };
      });
      grid.appendChild(cl); grid.appendChild(cr); status();
    }
    function status() { st.textContent = '✅ ' + matched + ' av 6' + (errs ? ' · ❌ ' + errs + ' feil' : ''); st.className = 'dw-fstat' + (matched === 6 ? ' dw-all' : ''); }
    function clearSel(side) { (side === 'L' ? left : right).forEach(function (o) { o.b.classList.remove('dwv-sel'); }); }
    function choose(side, i, b, o) {
      if (b.disabled) return;
      clearSel(side); b.classList.add('dwv-sel');
      if (side === 'L') selL = { i: i, b: b }; else selR = { f: o.f, b: b };
      if (selL && selR) {
        var ok = selR.f === forms[selL.i], l = selL, r = selR;
        selL = selR = null;
        if (ok) {
          [l.b, r.b].forEach(function (x) { x.classList.remove('dwv-sel'); x.classList.add('dwv-ok'); x.disabled = true; });
          matched++;
          if (matched === 6) { msg.className = 'dw-fmsg dw-show'; msg.textContent = errs ? '🎉 Ferdig med ' + errs + ' feil. Prøv et nytt verb!' : '🎉 Perfekt – ingen feil!'; }
        } else {
          errs++; [l.b, r.b].forEach(function (x) { x.classList.add('dwv-no'); });
          setTimeout(function () { [l.b, r.b].forEach(function (x) { x.classList.remove('dwv-no', 'dwv-sel'); }); }, 550);
        }
        status();
      }
    }
    bN.onclick = function () { idx++; build(); };
    bR.onclick = function () { build(); };
    build();
  }

  /* ---------- hvem kan dette være? ---------- */
  function whoGame(host, verbs, n) {
    var Q = [], i = 0, score = 0, missed = [], picked = {}, locked = false;
    host.innerHTML = '';
    host.appendChild(el('h4', '', '🕵️ Hvem kan dette være?'));
    host.appendChild(el('p', 'dw-fi-intro'));
    host.lastChild.innerHTML = 'Se på verbformen og trykk på <b>alle</b> pronomen den kan passe til. Noen former passer til flere – f.eks. <i>spielen</i> = <b>wir</b> <i>og</i> <b>sie / Sie</b>.';
    var top = el('div', 'dw-ex-top'); var c = el('span'), s = el('span'); top.appendChild(c); top.appendChild(s); host.appendChild(top);
    var q = el('div', 'dwv-who-q'); host.appendChild(q);
    var chips = el('div', 'dwv-who-chips'); host.appendChild(chips);
    var fb = el('div', 'dw-ex-fb'); host.appendChild(fb);
    var row = el('div', 'dw-frow'); var bC = btn('dw-fbtn', 'Sjekk'), bN = btn('dw-fbtn', 'Neste →'); bN.style.display = 'none'; row.appendChild(bC); row.appendChild(bN); host.appendChild(row);
    var res = el('div', 'dw-ex-result'); host.appendChild(res);
    function start() {
      var vs = shuffle(verbs).slice(0, n); Q = vs.map(function (v) {
        var forms = formsOf(v).map(first), k = Math.floor(Math.random() * 6), set = [];
        forms.forEach(function (f, j) { if (f === forms[k]) set.push(j); });
        return { v: v, form: forms[k], set: set };
      });
      i = 0; score = 0; missed = []; res.className = 'dw-ex-result'; res.innerHTML = ''; show();
    }
    function show() {
      var it = Q[i]; picked = {}; locked = false;
      q.style.display = ''; chips.style.display = ''; top.style.display = ''; row.style.display = '';
      c.textContent = 'Oppgave ' + (i + 1) + ' av ' + Q.length; s.textContent = 'Poeng: ' + score;
      q.innerHTML = '<span class="dwv-who-form">' + esc(it.form) + '</span> <small>' + esc(it.v.i) + ' · ' + esc(it.v.n) + '</small>';
      chips.innerHTML = '';
      PRON.forEach(function (p, j) { var b = btn('dwv-chip dwv-pron', p); b.onclick = function () { if (locked) return; picked[j] = !picked[j]; b.classList.toggle('dwv-sel', !!picked[j]); }; chips.appendChild(b); });
      fb.className = 'dw-ex-fb'; fb.innerHTML = ''; bC.style.display = ''; bN.style.display = 'none';
    }
    bC.onclick = function () {
      if (locked) return; locked = true;
      var it = Q[i], got = Object.keys(picked).filter(function (k) { return picked[k]; }).map(Number).sort();
      var ok = got.join() === it.set.join();
      if (ok) score++; else missed.push(it);
      [].forEach.call(chips.children, function (b, j) {
        var want = it.set.indexOf(j) >= 0;
        b.classList.remove('dwv-sel'); if (want) b.classList.add('dwv-ok'); else if (picked[j]) b.classList.add('dwv-no');
      });
      fb.className = 'dw-ex-fb dw-show ' + (ok ? 'dw-good' : 'dw-bad');
      fb.innerHTML = (ok ? '✅ Riktig! ' : '❌ ') + '<b>' + esc(it.form) + '</b> passer til: <b>' + it.set.map(function (j) { return PRON[j]; }).join(' og ') + '</b>.';
      s.textContent = 'Poeng: ' + score; bC.style.display = 'none'; bN.style.display = ''; bN.textContent = i === Q.length - 1 ? 'Se resultatet →' : 'Neste →';
    };
    bN.onclick = function () {
      if (i < Q.length - 1) { i++; show(); return; }
      q.style.display = chips.style.display = top.style.display = row.style.display = 'none'; fb.className = 'dw-ex-fb';
      res.className = 'dw-ex-result dw-show';
      res.innerHTML = '<div class="dw-ex-score">' + score + ' / ' + Q.length + '</div><p>' + (score === Q.length ? 'Perfekt!' : score >= Q.length * 0.7 ? 'Veldig bra!' : 'Se på endelsene en gang til og prøv igjen.') + '</p>' +
        (missed.length ? '<div class="dw-ex-review"><b>Dette bør du se på igjen:</b><ul>' + missed.map(function (m) { return '<li><b>' + esc(m.form) + '</b> (' + esc(m.v.i) + ') = ' + m.set.map(function (j) { return PRON[j]; }).join(' og ') + '</li>'; }).join('') + '</ul></div>' : '');
      var again = btn('dw-ex-btn dw-gold', '🔁 Ny runde'); again.onclick = start; res.appendChild(again);
    };
    start();
  }

  /* ---------- tilfeldig runde ---------- */
  function sentenceItems(kind, level, n) {
    var ok = levelOk(level);
    var cand = SENT.filter(function (e) {
      var v = byInf[e[0]]; if (!v || !ok(v)) return false;
      var g = groupOf(v); if (g === 'x') return false;
      return kind === 'mixed' || g === kind;
    });
    var used = {}, out = [];
    shuffle(cand).forEach(function (e) {
      if (out.length >= n) return;
      if (used[e[0]] && cand.length > n * 1.5) return;
      used[e[0]] = 1;
      var v = byInf[e[0]];
      out.push({ s: e[2], a: formsOf(v)[e[1]], v: v.i + ' · ' + v.n });
    });
    return out;
  }
  function roundWidget(root) {
    var cfg = cfgOf(root);
    root.innerHTML = '';
    var box = el('div', 'dwv-ctrl');
    function sel(label, id, opts, def) {
      var w = el('label', 'dwv-lbl'); w.appendChild(el('span', '', label));
      var s = el('select'); s.id = id;
      opts.forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; if (o[0] === def) op.selected = true; s.appendChild(op); });
      w.appendChild(s); box.appendChild(w); return s;
    }
    var sK = sel('Verbtype', null, [['weak', 'Regelrette (svake)'], ['vowel', 'Vokalskifte (sterke)'], ['mixed', 'Blandet']], cfg.kind || 'weak');
    var sL = sel('Nivå', null, [['A1', 'A1 – lett'], ['A2', 'A1–A2 – normal'], ['B1', 'A1–B1 – vanskelig']], cfg.level || 'A2');
    var sT = sel('Oppgavetype', null, [['table', 'Tabell (fyll inn)'], ['gap', 'Setninger (fyll inn)'], ['pair', 'Match pronomen og verbform'], ['who', 'Hvem kan dette være?']], cfg.task || 'table');
    var go = btn('dw-fbtn', '🎲 Lag ny runde'); box.appendChild(go);
    root.appendChild(box);
    var info = el('p', 'dwv-info'); root.appendChild(info);
    var out = el('div', 'dw-fill dwv-out'); root.appendChild(out);
    function gen() {
      var kind = sK.value, level = sL.value, task = sT.value;
      out.className = 'dw-fill dwv-out';
      info.textContent = '';
      if (!V.length) { out.textContent = 'Kunne ikke laste verblista. Last siden på nytt.'; return; }
      if (task === 'table') {
        var vs = pickVerbs(kind, level, 3);
        if (!vs.length) { out.textContent = 'Fant ingen verb som passer.'; return; }
        tableWidget(out, {
          title: 'Fyll ut: ' + vs.map(function (v) { return v.i; }).join(', '),
          intro: 'Bøy verbene i presens. Velg «Lett» hvis du bare vil øve på du og er / sie / es.',
          verbs: vs.map(function (v) { return { inf: v.i, no: v.n, f: formsOf(v) }; }),
          modes: [{ l: 'Alle seks formene', b: [0, 1, 2, 3, 4, 5] }, { l: 'Lett: du og er / sie / es', b: [1, 2] }],
          hl: kind === 'vowel' ? [1, 2] : [], hint: kind === 'weak' ? 'Stamme + endelse: -e, -st, -t, -en, -t, -en. Stammen på -t/-d får ekstra e (du arbeitest).' : 'Vokalskifte bare i du og er / sie / es – de andre formene er helt vanlige.', default: 0
        });
      } else if (task === 'gap') {
        var items = sentenceItems(kind, level, 10);
        if (!items.length) { out.textContent = 'Fant ikke nok setninger på dette nivået – prøv et høyere nivå eller en annen verbtype.'; return; }
        gapWidget(out, { title: 'Fullfør setningene (' + items.length + ')', items: items, hint: 'Sjekk subjektet: ich → -e, du → -st, er/sie/es → -t, wir → -en, ihr → -t, sie/Sie → -en. Vokalskifte-verb skifter vokal i du og er/sie/es.' });
      } else if (task === 'pair') {
        var pv = pickVerbs(kind, level, 8);
        if (!pv.length) { out.textContent = 'Fant ingen verb som passer.'; return; }
        pairGame(out, pv);
      } else {
        var wv = pickVerbs(kind, level, 10);
        if (!wv.length) { out.textContent = 'Fant ingen verb som passer.'; return; }
        whoGame(out, wv, Math.min(10, wv.length));
      }
      info.textContent = 'Runden er hentet tilfeldig fra verblista vår – trykk «Lag ny runde» for nye verb.';
    }
    go.onclick = gen;
    [sK, sL, sT].forEach(function (s) { s.onchange = gen; });
    gen();
  }

  /* ---------- faner ---------- */
  function initTabs() {
    var bar = document.getElementById('dw-tabs'); if (!bar) return;
    var btns = [].slice.call(bar.querySelectorAll('button'));
    var panels = [].slice.call(document.querySelectorAll('.dw-tabpanel'));
    function show(name, noHash) {
      var found = false;
      panels.forEach(function (p) { var on = p.id === name; if (on) found = true; p.hidden = !on; });
      if (!found) { name = panels[0].id; panels[0].hidden = false; }
      btns.forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-tab') === name ? 'true' : 'false'); });
      if (!noHash) { try { history.replaceState(null, '', '#' + name); } catch (e) { } }
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-tab')); bar.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); });
    [].forEach.call(document.querySelectorAll('[data-go]'), function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-go')); bar.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); });
    function fromHash() {
      var h = decodeURIComponent((location.hash || '').slice(1));
      if (!h) { show(panels[0].id, true); return; }
      var tgt = document.getElementById(h);
      if (tgt && tgt.classList.contains('dw-tabpanel')) { show(h, true); bar.scrollIntoView(); return; }
      if (tgt) { var p = tgt.closest('.dw-tabpanel'); if (p) { show(p.id, true); setTimeout(function () { tgt.scrollIntoView(); }, 30); return; } }
      show(panels[0].id, true);
    }
    window.addEventListener('hashchange', fromHash);
    fromHash();
  }

  /* ---------- oppstart ---------- */
  function init() {
    document.documentElement.classList.add('dw-js');
    [].forEach.call(document.querySelectorAll('.dwv-table'), function (r) { tableWidget(r, cfgOf(r)); });
    [].forEach.call(document.querySelectorAll('.dwv-gap'), function (r) { gapWidget(r, cfgOf(r)); });
    [].forEach.call(document.querySelectorAll('.dwv-mc'), function (r) { mcWidget(r, cfgOf(r)); });
    [].forEach.call(document.querySelectorAll('.dwv-pair'), function (r) {
      var c = cfgOf(r), vs = (c.verbs || []).map(function (x) { return byInf[x]; }).filter(Boolean);
      if (!vs.length) vs = pickVerbs(c.kind || 'weak', c.level || 'A1', 8);
      if (vs.length) pairGame(r, c.shuffle ? shuffle(vs) : vs, c.title);
    });
    [].forEach.call(document.querySelectorAll('.dwv-who'), function (r) {
      var c = cfgOf(r), vs = (c.verbs || []).map(function (x) { return byInf[x]; }).filter(Boolean);
      if (!vs.length) vs = pickVerbs(c.kind || 'weak', c.level || 'A1', 10);
      if (vs.length) whoGame(r, vs, Math.min(c.n || 10, vs.length));
    });
    [].forEach.call(document.querySelectorAll('.dwv-round'), roundWidget);
    if (document.body.hasAttribute('data-dwv-tabs')) initTabs();
  }
  window.DWV = { pool: pool, pickVerbs: pickVerbs, formsOf: formsOf, groupOf: groupOf, isSep: isSep, byInf: byInf, sentenceItems: sentenceItems, grade: grade };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
