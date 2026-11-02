/* Deutschwelt — Andere Länder: tabell, kartspill, ordsøk, memory. Data: DW_LAND (daten.js), DW_MAP (kart.js). */
(function () {
  'use strict';
  var RAW = window.DW_LAND || [], M = window.DW_MAP, LNO = window.DW_SPRACHE_NO || {};
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; }
  function bare(s) { return String(s).replace(/^(der|die|das)\s+/i, ''); }

  /* ---------- data ---------- */
  var L = RAW.map(function (r) {
    var groups = r[5].split('/').map(function (g) { return g.split('|'); });
    return {
      id: r[0], no: r[1], de: r[2].split('|'), m: r[3].split('|'), f: r[4].split('|'),
      langGroups: groups, langs: [].concat.apply([], groups), lshow: groups.map(function (g) { return g[0]; }),
      tag: r[6], reg: r[7]
    };
  });
  var BYID = {}; L.forEach(function (c) { BYID[c.id] = c; });
  function deName(c) { return c.de[0]; }
  function plural(c) { return /^(die )?(Niederlande|USA)$/.test(deName(c)); }

  /* ---------- sammenligning (ä=ae=a, ß=ss, artikkel ignoreres) ---------- */
  function f1(s) { return String(s).toLowerCase().replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/[^a-z0-9]/g, ''); }
  function f2(s) { return String(s).toLowerCase().replace(/ß/g, 'ss').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/[^a-z0-9]/g, ''); }
  function same(input, accepted) {
    var v = bare(String(input).trim()), a1 = f1(v), a2 = f2(v);
    if (!a1) return false;
    return accepted.some(function (x) { var X = bare(x); return f1(X) === a1 || f2(X) === a2; });
  }
  var COLS = { de: 'de', m: 'm', f: 'f', sp: 'langs' };
  function answers(c, col) { return c[COLS[col]]; }
  function show(c, col) { return col === 'sp' ? c.lshow.join(' / ') : (col === 'de' ? c.de[0] : c[col][0]); }
  function patternOf(s) { return s.split(' ').map(function (w) { return w.charAt(0) + new Array(w.length).join('_'); }).join(' '); }

  /* =====================================================  TABELL  ===================================================== */
  (function table() {
    var host = $('ct'), last = null;
    var heads = { eu: 'Europa', w: 'Resten av verden' }, html = '<div class="dw-ct-head"><span>Land (norsk)</span><span>Land på tysk</span><span>Mann</span><span>Frau</span><span>Sprache</span></div>';
    ['eu', 'w'].forEach(function (rg) {
      html += '<h3 data-reg="' + rg + '">' + heads[rg] + '</h3>';
      L.filter(function (c) { return c.reg === rg; }).forEach(function (c) {
        html += '<div class="dw-ct-row" data-id="' + c.id + '" data-reg="' + rg + '" data-tag="' + c.tag + '"><div class="dw-ct-no">' + esc(c.no) +
          (c.tag === 'e' ? '<span class="dw-tg">🟢 ligner norsk</span>' : (c.tag === 'w' ? '<span class="dw-tg">🟠 pass ekstra på</span>' : '')) + '</div>';
        ['de', 'm', 'f', 'sp'].forEach(function (col) {
          var lab = { de: 'tysk landnavn', m: 'mann', f: 'kvinne', sp: 'språk' }[col];
          html += '<input type="text" data-col="' + col + '" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="de" aria-label="' + esc(c.no + ' – ' + lab) + '" placeholder="' + { de: 'Land', m: 'Mann', f: 'Frau', sp: 'Sprache' }[col] + '">';
        });
        html += '</div>';
      });
    });
    host.innerHTML = html;
    host.addEventListener('focusin', function (e) { if (e.target.tagName === 'INPUT') last = e.target; });
    host.addEventListener('input', function (e) { if (e.target.tagName === 'INPUT') { e.target.classList.remove('ok', 'bad', 'shown'); } });
    host.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
      e.preventDefault(); var all = vis(); var i = all.indexOf(e.target); if (all[i + 1]) all[i + 1].focus();
    });
    document.querySelectorAll('.dw-charbar button').forEach(function (b) {
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () {
        var inp = last; if (!inp) return; var s = inp.selectionStart == null ? inp.value.length : inp.selectionStart, e2 = inp.selectionEnd == null ? s : inp.selectionEnd, ch = b.getAttribute('data-c');
        inp.value = inp.value.slice(0, s) + ch + inp.value.slice(e2); inp.focus(); inp.setSelectionRange(s + 1, s + 1); inp.classList.remove('ok', 'bad', 'shown');
      });
    });
    function rows() { return Array.prototype.slice.call(host.querySelectorAll('.dw-ct-row')).filter(function (r) { return !r.hidden; }); }
    function vis() { var o = []; rows().forEach(function (r) { r.querySelectorAll('input').forEach(function (i) { o.push(i); }); }); return o; }
    function applyFilter() {
      var rg = $('ct-reg').value, tg = $('ct-tag').value, n = { eu: 0, w: 0 };
      host.querySelectorAll('.dw-ct-row').forEach(function (r) {
        var okR = (!rg || r.getAttribute('data-reg') === rg) && (!tg || r.getAttribute('data-tag') === tg); r.hidden = !okR; if (okR) n[r.getAttribute('data-reg')]++;
      });
      host.querySelectorAll('h3').forEach(function (h) { h.hidden = !n[h.getAttribute('data-reg')]; });
      applyHint();
    }
    function applyHint() {
      var on = $('ct-hint').checked;
      host.querySelectorAll('.dw-ct-row').forEach(function (r) {
        var c = BYID[r.getAttribute('data-id')];
        r.querySelectorAll('input').forEach(function (i) {
          var col = i.getAttribute('data-col'); i.placeholder = on ? patternOf(show(c, col).split(' / ')[0]) : { de: 'Land', m: 'Mann', f: 'Frau', sp: 'Sprache' }[col];
        });
      });
    }
    $('ct-reg').onchange = applyFilter; $('ct-tag').onchange = applyFilter; $('ct-hint').onchange = applyHint;
    $('ct-check').onclick = function () {
      var ok = 0, bad = 0, empty = 0;
      rows().forEach(function (r) {
        var c = BYID[r.getAttribute('data-id')];
        r.querySelectorAll('input').forEach(function (i) {
          var v = i.value.trim(); i.classList.remove('ok', 'bad', 'shown');
          if (!v) { empty++; return; }
          if (same(v, answers(c, i.getAttribute('data-col')))) { ok++; i.classList.add('ok'); } else { bad++; i.classList.add('bad'); }
        });
      });
      $('ct-status').textContent = ok + ' riktige · ' + bad + ' å rette · ' + empty + ' tomme' + (bad === 0 && empty === 0 ? ' — Sehr gut! 🎉' : '');
    };
    $('ct-solve').onclick = function () {
      rows().forEach(function (r) {
        var c = BYID[r.getAttribute('data-id')];
        r.querySelectorAll('input').forEach(function (i) {
          var col = i.getAttribute('data-col');
          if (i.value.trim() && same(i.value, answers(c, col))) { i.classList.remove('bad'); i.classList.add('ok'); return; }
          i.value = show(c, col); i.classList.remove('ok', 'bad'); i.classList.add('shown');
        });
      });
      $('ct-status').textContent = 'Fasit vist (blå felt). Trykk «Tøm» for å prøve på nytt.';
    };
    $('ct-clear').onclick = function () {
      rows().forEach(function (r) { r.querySelectorAll('input').forEach(function (i) { i.value = ''; i.classList.remove('ok', 'bad', 'shown'); }); });
      $('ct-status').textContent = '';
    };
    applyFilter();
  })();

  /* =====================================================  KARTSPILL  ===================================================== */
  (function mapGame() {
    if (!M) return;
    var svg = $('mp-svg'), NS = 'http://www.w3.org/2000/svg', W = M.W, H = M.H;
    var vb = { x: 0, y: 0, w: W, h: H }, playable = [], G = null, labelsOn = false;
    function mk(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
    var gbg = mk('g', {}), gc = mk('g', {}), gl = mk('g', { id: 'mp-labels' });
    M.bg.forEach(function (d) { gbg.appendChild(mk('path', { d: d, 'class': 'dw-bgland' })); });
    Object.keys(M.eu).forEach(function (id) {
      var c = BYID[id], ok = c && M.eu[id].a >= 40;
      if (ok) playable.push(c);
      gc.appendChild(mk('path', { d: M.eu[id].d, 'class': 'dw-c' + (ok ? '' : ' dw-npc'), 'data-id': id }));
      if (c) { var t = mk('text', { x: M.eu[id].c[0], y: M.eu[id].c[1], 'data-id': id, 'data-a': M.eu[id].a }); t.textContent = bare(deName(c).replace(/ und Herzegowina| \(.*\)/, '')).replace('Republik Moldau', 'Moldau'); t.style.display = 'none'; gl.appendChild(t); }
    });
    svg.appendChild(gbg); svg.appendChild(gc); svg.appendChild(gl);
    function pathOf(id) { return gc.querySelector('[data-id="' + id + '"]'); }
    function labelOf(id) { return gl.querySelector('[data-id="' + id + '"]'); }

    /* zoom og flytting */
    function setVB() {
      vb.w = Math.max(W / 8, Math.min(W, vb.w)); vb.h = vb.w * H / W;
      vb.x = Math.max(0, Math.min(W - vb.w, vb.x)); vb.y = Math.max(0, Math.min(H - vb.h, vb.y));
      svg.setAttribute('viewBox', vb.x + ' ' + vb.y + ' ' + vb.w + ' ' + vb.h);
      svg.classList.toggle('dw-zoomed', vb.w < W - 1);
      var rect = svg.getBoundingClientRect(), px = rect.width || 600, fs = 10.5 * vb.w / px;
      gl.setAttribute('font-size', fs.toFixed(2)); gl.style.strokeWidth = (fs * .28).toFixed(2);
      refreshLabels();
    }
    function zoom(f) { var cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2; vb.w *= f; setVB(); vb.x = cx - vb.w / 2; vb.y = cy - vb.h / 2; setVB(); }
    $('mp-zin').onclick = function () { zoom(1 / 1.6); };
    $('mp-zout').onclick = function () { zoom(1.6); };
    $('mp-zreset').onclick = function () { vb.x = 0; vb.y = 0; vb.w = W; setVB(); };
    var drag = null, moved = false;
    svg.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y }; moved = false; });
    svg.addEventListener('pointermove', function (e) {
      if (!drag || vb.w >= W - 1) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 7) return;
      moved = true; var rect = svg.getBoundingClientRect(), k = vb.w / rect.width;
      vb.x = drag.vx - dx * k; vb.y = drag.vy - dy * k; setVB();
    });
    function endDrag() { drag = null; }
    svg.addEventListener('pointerup', endDrag); svg.addEventListener('pointercancel', endDrag); svg.addEventListener('pointerleave', endDrag);
    window.addEventListener('resize', setVB);

    /* etiketter */
    function refreshLabels() {
      var scale = Math.pow(W / vb.w, 2);
      gl.querySelectorAll('text').forEach(function (t) {
        var id = t.getAttribute('data-id'), solved = G && G.solved[id];
        var big = +t.getAttribute('data-a') * scale >= 500;
        t.style.display = (solved || (labelsOn && big)) ? '' : 'none';
      });
    }
    $('mp-learn').onchange = function () { labelsOn = this.checked; refreshLabels(); };

    /* spill */
    function speakDe(txt) {
      try { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(txt); u.lang = 'de-DE'; u.rate = .85;
        var v = (speechSynthesis.getVoices() || []).filter(function (x) { return /^de/i.test(x.lang); })[0]; if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) { }
    }
    function cur() { return G.queue[G.i]; }
    function clearMarks() { gc.querySelectorAll('.dw-c').forEach(function (p) { p.classList.remove('dw-ok', 'dw-wrong', 'dw-miss', 'dw-reveal'); }); }
    function start(list) {
      var n = parseInt($('mp-n').value, 10), pool = list || shuffle(playable);
      G = { queue: n && !list ? pool.slice(0, n) : pool, i: 0, score: 0, tries: 0, lock: false, solved: {}, missed: [], done: false };
      clearMarks(); $('mp-result').hidden = true; $('mp-fb').textContent = ''; $('mp-fb').className = 'dw-feedback';
      vb = { x: 0, y: 0, w: W, h: H }; setVB(); ask();
    }
    function ask() {
      var c = cur(), el = $('mp-prompt'), tx = (plural(c) ? 'Wo liegen ' : 'Wo liegt ') + deName(c) + '?';
      el.innerHTML = '<span>' + esc(tx) + '</span><button type="button" id="mp-say" aria-label="Hør uttalen">🔊</button>';
      $('mp-say').onclick = function () { speakDe(deName(c)); };
      $('mp-sub').textContent = $('mp-no').checked ? '🇳🇴 ' + c.no : '';
      $('mp-score').textContent = 'Land ' + (G.i + 1) + ' av ' + G.queue.length + ' · richtig beim ersten Versuch: ' + G.score;
      G.tries = 0; G.lock = false;
    }
    $('mp-no').onchange = function () { if (G && !G.done) $('mp-sub').textContent = this.checked ? '🇳🇴 ' + cur().no : ''; };
    function nextQ() { G.i++; if (G.i >= G.queue.length) finish(); else ask(); }
    function finish() {
      G.done = true; var n = G.queue.length, pct = Math.round(G.score / n * 100);
      $('mp-prompt').textContent = 'Fertig! 🎉'; $('mp-sub').textContent = '';
      $('mp-score').textContent = G.score + ' von ' + n + ' beim ersten Versuch (' + pct + ' %)';
      var h = '<h3>' + (pct >= 90 ? 'Ausgezeichnet!' : (pct >= 70 ? 'Sehr gut!' : (pct >= 50 ? 'Gut gemacht!' : 'Übung macht den Meister!'))) + '</h3>';
      if (G.missed.length) {
        h += '<p>Disse bør du øve mer på:</p><ul>' + G.missed.map(function (c) { return '<li><b>' + esc(deName(c)) + '</b> (' + esc(c.no) + ')</li>'; }).join('') + '</ul>';
        h += '<button type="button" class="dw-btn" id="mp-again-miss">Øv på feilene</button> ';
      }
      h += '<button type="button" class="dw-btn dw-btn-ghost" id="mp-again">Nytt spill</button>';
      var r = $('mp-result'); r.innerHTML = h; r.hidden = false;
      $('mp-again').onclick = function () { start(); };
      if ($('mp-again-miss')) $('mp-again-miss').onclick = function () { start(shuffle(G.missed)); };
      gc.querySelectorAll('.dw-c').forEach(function (p) { p.classList.remove('dw-wrong'); });
      G.missed.forEach(function (c) { var p = pathOf(c.id); if (p) { p.classList.remove('dw-ok'); p.classList.add('dw-miss'); } });
      refreshLabels();
    }
    svg.addEventListener('click', function (e) {
      if (moved) { moved = false; return; }
      var t = e.target; if (!t.classList || !t.classList.contains('dw-c')) return;
      if (!G || G.done || G.lock) return;
      var id = t.getAttribute('data-id'), c = cur(), fb = $('mp-fb');
      if (t.classList.contains('dw-npc')) { fb.className = 'dw-feedback'; fb.textContent = (BYID[id] ? deName(BYID[id]) : 'Dieses Land') + ' ist zu klein für dieses Spiel — versuch ein anderes Land.'; return; }
      if (G.solved[id]) return;
      if (id === c.id) {
        t.classList.remove('dw-wrong'); t.classList.add('dw-ok'); G.solved[id] = 1; if (G.tries === 0) G.score++;
        fb.className = 'dw-feedback good'; fb.textContent = G.tries === 0 ? 'Richtig! ✔' : 'Richtig — beim zweiten Versuch.';
        G.lock = true; refreshLabels(); setTimeout(nextQ, 650);
      } else {
        G.tries++; t.classList.add('dw-wrong'); setTimeout(function () { t.classList.remove('dw-wrong'); }, 700);
        var other = BYID[id] ? deName(BYID[id]) : 'ein anderes Land';
        fb.className = 'dw-feedback bad';
        if (G.tries >= 2) {
          fb.textContent = 'Nein, das ist ' + other + '. ' + deName(c) + ' liegt hier (gelb).'; G.missed.push(c); G.solved[c.id] = 1; G.lock = true;
          var p = pathOf(c.id); p.classList.add('dw-reveal'); refreshLabels();
          setTimeout(function () { p.classList.remove('dw-reveal'); p.classList.add('dw-miss'); nextQ(); }, 2200);
        } else fb.textContent = 'Nein, das ist ' + other + '. Versuch es noch einmal!';
      }
    });
    $('mp-start').onclick = function () { start(); };
    setVB();
    window.DW_MAPGAME = { start: start, state: function () { return G; }, playable: playable };
  })();

  /* =====================================================  ORDSØK  ===================================================== */
  (function wordsearch() {
    var SIZE = 13, grid, placed, wordsInfo, found, sel = null, host = $('ws-grid'), cells = [], DIRS_EASY = [[0, 1], [1, 0], [1, 1]], DIRS_HARD = [[0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]];
    var LETTERS = 'EEEEEENNNNIIIRRRSSSTTTAAAUUDDHHLLCCGGMMOOBBWFKZPVÄÖÜ';
    function toGrid(w) { return bare(w).toUpperCase().replace(/ß/g, 'SS').replace(/[^A-ZÄÖÜ]/g, ''); }
    function candidates(mode) {
      var out = [];
      L.forEach(function (c) {
        if (mode === 'land') { var alt = c.de.map(bare).filter(function (x) { return !/\s/.test(x); })[0]; if (alt) out.push({ w: toGrid(alt), show: alt, clue: c.no }); }
        else if (mode === 'mann') { out.push({ w: toGrid(c.m[0]), show: c.m[0], clue: 'mann fra ' + c.no }); }
        else { c.langGroups.forEach(function (g) { var l = g[0]; if (LNO[l]) out.push({ w: toGrid(l), show: l, clue: LNO[l] + ' (språk)' }); }); }
      });
      var seen = {}, res = [];
      shuffle(out).forEach(function (o) { if (o.w.length >= 4 && o.w.length <= SIZE && !seen[o.w]) { seen[o.w] = 1; res.push(o); } });
      return res;
    }
    function build() {
      var mode = $('ws-mode').value, n = parseInt($('ws-n').value, 10), dirs = $('ws-lvl').value === 'hard' ? DIRS_HARD : DIRS_EASY;
      var cand = candidates(mode).slice(0, n + 6), tries = 0, ok = false;
      while (!ok && tries < 30) {
        tries++; grid = []; for (var r = 0; r < SIZE; r++) { grid.push([]); for (var c = 0; c < SIZE; c++) grid[r].push(''); }
        placed = []; var list = shuffle(cand).slice(0, n).sort(function (a, b) { return b.w.length - a.w.length; }); ok = true;
        for (var i = 0; i < list.length; i++) { if (!place(list[i], dirs)) { ok = false; break; } }
      }
      for (var r2 = 0; r2 < SIZE; r2++) for (var c2 = 0; c2 < SIZE; c2++) if (!grid[r2][c2]) grid[r2][c2] = LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
      found = {}; sel = null; render();
    }
    function place(o, dirs) {
      var w = o.w, len = w.length;
      for (var a = 0; a < 300; a++) {
        var d = dirs[Math.floor(Math.random() * dirs.length)], r = Math.floor(Math.random() * SIZE), c = Math.floor(Math.random() * SIZE), er = r + d[0] * (len - 1), ec = c + d[1] * (len - 1);
        if (er < 0 || er >= SIZE || ec < 0 || ec >= SIZE) continue;
        var fit = true; for (var k = 0; k < len; k++) { var ch = grid[r + d[0] * k][c + d[1] * k]; if (ch && ch !== w.charAt(k)) { fit = false; break; } }
        if (!fit) continue;
        for (var k2 = 0; k2 < len; k2++) grid[r + d[0] * k2][c + d[1] * k2] = w.charAt(k2);
        placed.push({ w: w, show: o.show, clue: o.clue, r: r, c: c, d: d, len: len }); return true;
      }
      return false;
    }
    function render() {
      host.style.gridTemplateColumns = 'repeat(' + SIZE + ',auto)'; host.innerHTML = ''; cells = [];
      for (var r = 0; r < SIZE; r++) { cells.push([]); for (var c = 0; c < SIZE; c++) {
        var b = document.createElement('div'); b.className = 'dw-ws-cell'; b.setAttribute('role', 'gridcell'); b.setAttribute('data-r', r); b.setAttribute('data-c', c); b.textContent = grid[r][c]; host.appendChild(b); cells[r].push(b); } }
      renderList(); $('ws-status').textContent = '';
    }
    function renderList() {
      var showDe = $('ws-show').checked, ul = $('ws-list'); ul.innerHTML = '';
      placed.slice().sort(function (a, b) { return a.clue < b.clue ? -1 : 1; }).forEach(function (p) {
        var li = document.createElement('li'); li.setAttribute('data-w', p.w); if (found[p.w]) li.className = 'done';
        li.innerHTML = esc(p.clue) + (showDe || found[p.w] ? '<small>' + esc(p.show) + '</small>' : ''); ul.appendChild(li);
      });
    }
    function line(a, b) {
      var dr = b.r - a.r, dc = b.c - a.c, n = Math.max(Math.abs(dr), Math.abs(dc));
      if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) return null;
      var sr = Math.sign(dr), sc = Math.sign(dc), out = []; for (var i = 0; i <= n; i++) out.push({ r: a.r + sr * i, c: a.c + sc * i }); return out;
    }
    function cellAt(e) { var el = document.elementFromPoint(e.clientX, e.clientY); if (el && el.classList && el.classList.contains('dw-ws-cell')) return { r: +el.getAttribute('data-r'), c: +el.getAttribute('data-c') }; return null; }
    function mark(ln, on) { cells.forEach(function (row) { row.forEach(function (x) { x.classList.remove('sel'); }); }); if (on && ln) ln.forEach(function (p) { cells[p.r][p.c].classList.add('sel'); }); }
    function finishSel(ln) {
      mark(null, false); if (!ln || ln.length < 2) return;
      var s = ln.map(function (p) { return grid[p.r][p.c]; }).join(''), rs = s.split('').reverse().join('');
      var hit = placed.filter(function (p) { return !found[p.w] && (p.w === s || p.w === rs); })[0];
      if (!hit) { $('ws-status').textContent = ''; return; }
      found[hit.w] = Object.keys(found).length % 4 + 1;
      ln.forEach(function (p) { var cl = cells[p.r][p.c].classList; cl.remove('found', 'found2', 'found3', 'found4'); cl.add(found[hit.w] === 1 ? 'found' : 'found' + found[hit.w]); });
      renderList();
      var left = placed.filter(function (p) { return !found[p.w]; }).length;
      $('ws-status').textContent = left ? '✔ ' + hit.show + ' — noch ' + left + ' Wörter' : '🎉 Super! Alle Wörter gefunden!';
    }
    var down = null, anchor = null;
    host.addEventListener('pointerdown', function (e) {
      var c = cellAt(e); if (!c) return; e.preventDefault();
      if (anchor) { var ln = line(anchor, c); anchor = null; finishSel(ln); down = null; return; }
      down = c; mark([c], true);
    });
    host.addEventListener('pointermove', function (e) { if (!down) return; var c = cellAt(e); if (!c) return; var ln = line(down, c); if (ln) mark(ln, true); });
    function up(e) {
      if (!down) return; var c = cellAt(e), d = down; down = null;
      if (!c || (c.r === d.r && c.c === d.c)) { anchor = d; mark([d], true); return; }
      finishSel(line(d, c));
    }
    host.addEventListener('pointerup', up); host.addEventListener('pointercancel', function () { down = null; mark(null, false); });
    ['ws-mode', 'ws-n', 'ws-lvl'].forEach(function (id) { $(id).onchange = build; });
    $('ws-new').onclick = build; $('ws-show').onchange = renderList;
    $('ws-solve').onclick = function () {
      placed.forEach(function (p) { if (found[p.w]) return; found[p.w] = Object.keys(found).length % 4 + 1; for (var k = 0; k < p.len; k++) { var cl = cells[p.r + p.d[0] * k][p.c + p.d[1] * k].classList; cl.add('hint'); } });
      renderList(); $('ws-status').textContent = 'Løsningen er markert med gul ramme.';
    };
    build();
    window.DW_WS = { placed: function () { return placed; }, grid: function () { return grid; }, found: function () { return found; }, cells: function () { return cells; }, size: SIZE };
  })();

  /* =====================================================  MEMORY  ===================================================== */
  (function memory() {
    var board = $('mm-board'), first = null, lock = false, moves = 0, pairs = 0, total = 0;
    function cardsFor(mode, reg, n) {
      var pool = L.filter(function (c) { return !reg || c.reg === reg; }), items = [], usedB = {};
      shuffle(pool).forEach(function (c) {
        var a, b;
        if (mode === 'de') { a = c.no; b = deName(c); }
        else if (mode === 'lang') { if (c.langGroups.length !== 1) return; a = deName(c); b = c.lshow[0]; }
        else { a = deName(c); b = c.m[0] + ' / ' + c.f[0]; }
        if (usedB[b] || usedB[a]) return; usedB[b] = 1; usedB[a] = 1; items.push({ a: a, b: b });
      });
      return items.slice(0, n);
    }
    function build() {
      var items = cardsFor($('mm-mode').value, $('mm-reg').value, parseInt($('mm-n').value, 10)), deck = [];
      items.forEach(function (it, k) { deck.push({ k: k, t: it.a }); deck.push({ k: k, t: it.b }); });
      deck = shuffle(deck); first = null; lock = false; moves = 0; pairs = 0; total = items.length;
      board.className = 'dw-mm' + (deck.length > 12 ? ' cols6' : ''); board.innerHTML = '';
      deck.forEach(function (d) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'dw-card'; b.setAttribute('data-k', d.k); b.setAttribute('aria-label', 'Kort');
        b.innerHTML = '<span class="dw-card-in"><span class="dw-face back" aria-hidden="true">?</span><span class="dw-face front">' + esc(d.t) + '</span></span>';
        b.addEventListener('click', function () { flip(b); }); board.appendChild(b);
      });
      upd(); $('mm-status').textContent = items.length < parseInt($('mm-n').value, 10) ? 'Merk: Det finnes bare ' + items.length + ' par med disse valgene.' : '';
    }
    function upd() { $('mm-moves').textContent = 'Trekk: ' + moves; $('mm-pairs').textContent = 'Par: ' + pairs + ' / ' + total; }
    function flip(b) {
      if (lock || b.classList.contains('flip') || b.classList.contains('matched')) return;
      b.classList.add('flip'); b.setAttribute('aria-label', b.querySelector('.front').textContent);
      if (!first) { first = b; return; }
      moves++; var a = first; first = null;
      if (a.getAttribute('data-k') === b.getAttribute('data-k')) {
        a.classList.add('matched'); b.classList.add('matched'); a.classList.remove('flip'); b.classList.remove('flip'); pairs++; upd();
        if (pairs === total) $('mm-status').textContent = '🎉 Super! Du hast alle Paare in ' + moves + ' Zügen gefunden!';
      } else {
        lock = true; upd();
        setTimeout(function () { a.classList.remove('flip'); b.classList.remove('flip'); a.setAttribute('aria-label', 'Kort'); b.setAttribute('aria-label', 'Kort'); lock = false; }, 1000);
      }
    }
    ['mm-mode', 'mm-reg', 'mm-n'].forEach(function (id) { $(id).onchange = build; });
    $('mm-new').onclick = build; build();
  })();
})();
