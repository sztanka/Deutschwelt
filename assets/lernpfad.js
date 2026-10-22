/* Deutschwelt — Lernpfad (læringssti). Motor: øvelser, hjerter, XP, streak, stjerner.
   Data: window.DWLP (lernpfad/data.js). Fremgang lagres i localStorage (kun i denne nettleseren). */
(function () {
  'use strict';
  var D = window.DWLP;
  if (!D) return;

  /* ---------- hjelpere ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function fold(s) {
    return String(s).toLowerCase().replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/[.,!?;:…«»"'’\-–—()]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function strip(t) { return t.replace(/[.,!?;:…«»"()]/g, ''); }
  function fmt(w) { var a = w[1]; if (a === 'adj') return w[0]; if (a === 'pl') return 'die ' + w[0] + ' (flt.)'; return a + ' ' + w[0]; }
  function spoken(w) { var a = w[1]; if (a === 'adj') return w[0]; if (a === 'pl') return 'die ' + w[0]; return a + ' ' + w[0]; }
  function today(off) { var d = new Date(); d.setDate(d.getDate() + (off || 0)); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  var PRAISE = ['Riktig!', 'Flott!', 'Bra jobbet!', 'Perfekt!', 'Super!', 'Sehr gut!', 'Genau!', 'Ausgezeichnet!'];

  /* ---------- lagring ---------- */
  var KEY = 'dw_lernpfad_v1';
  var storageOK = true;
  var S = { xp: 0, streak: 0, last: '', nodes: {}, sound: true, unlockAll: false };
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var o = JSON.parse(raw); if (o && typeof o === 'object') adopt(o); }
    } catch (e) { storageOK = false; }
  }
  function adopt(o) {
    S.xp = Math.max(0, +o.xp || 0); S.streak = Math.max(0, +o.streak || 0); S.last = typeof o.last === 'string' ? o.last : '';
    S.sound = o.sound !== false; S.unlockAll = !!o.unlockAll; S.nodes = {};
    if (o.nodes && typeof o.nodes === 'object') {
      Object.keys(o.nodes).forEach(function (k) {
        var n = o.nodes[k]; if (n && typeof n === 'object') S.nodes[k] = { stars: Math.min(3, Math.max(0, +n.stars || 0)), done: !!n.done };
      });
    }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { storageOK = false; } }
  function curStreak() { if (!S.last) return 0; return (S.last === today() || S.last === today(-1)) ? S.streak : 0; }

  /* ---------- lyd (WebAudio, ingen filer) ---------- */
  var ac = null;
  function tone(f, t0, d, type, v) {
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'sine'; o.frequency.value = f; g.gain.value = 0.0001;
    o.connect(g); g.connect(ac.destination);
    var t = ac.currentTime + t0;
    g.gain.exponentialRampToValueAtTime(v || 0.15, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.start(t); o.stop(t + d + 0.05);
  }
  function sfx(k) {
    if (!S.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      if (k === 'ok') { tone(660, 0, .14); tone(880, .1, .2); }
      else if (k === 'bad') { tone(240, 0, .18, 'sawtooth', .08); tone(170, .14, .25, 'sawtooth', .08); }
      else if (k === 'done') { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * .13, .3); }); }
    } catch (e) { }
  }

  /* ---------- konfetti ---------- */
  function confetti() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = document.createElement('canvas'); c.id = 'lp-confetti'; document.body.appendChild(c);
    var w = c.width = innerWidth, h = c.height = innerHeight, x = c.getContext('2d');
    var cols = ['#d9a91c', '#9c1329', '#161616', '#2e7d32', '#1F4E79', '#f3d36b'];
    var ps = []; for (var i = 0; i < 140; i++) ps.push({ x: Math.random() * w, y: -20 - Math.random() * h * .5, vx: (Math.random() - .5) * 4, vy: 2 + Math.random() * 4, s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: pick(cols) });
    var t0 = Date.now();
    (function f() {
      x.clearRect(0, 0, w, h);
      ps.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.vy += .05; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6); x.restore(); });
      if (Date.now() - t0 < 2600) requestAnimationFrame(f); else c.remove();
    })();
  }

  function toast(msg) {
    var t = document.createElement('div'); t.className = 'lp-toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }

  /* ---------- lydklipp og uttale ---------- */
  var au = new Audio(); au.preload = 'auto'; var stopAt = 0, curSrc = '';
  au.addEventListener('timeupdate', function () { if (stopAt && au.currentTime >= stopAt) { au.pause(); stopAt = 0; } });
  function playClip(slug, c, rate) {
    var src = D.base + slug + '/' + c.a;
    au.playbackRate = rate || 1;
    function go() { try { au.currentTime = c.s; } catch (e) { } stopAt = c.e; var p = au.play(); if (p && p.catch) p.catch(function () { }); }
    if (curSrc !== src) {
      curSrc = src; au.src = src;
      var once = function () { au.removeEventListener('loadedmetadata', once); go(); };
      au.addEventListener('loadedmetadata', once); au.load();
    } else go();
  }
  function speak(text) {
    try {
      if (!('speechSynthesis' in window)) { toast('Nettleseren din kan ikke lese opp tekst.'); return; }
      var vs = speechSynthesis.getVoices();
      var de = vs.filter(function (v) { return /^de/i.test(v.lang); });
      if (vs.length && !de.length) { toast('Fant ingen tysk stemme på denne enheten.'); return; }
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text); u.lang = 'de-DE'; if (de.length) u.voice = de[0]; u.rate = 0.9;
      speechSynthesis.speak(u);
    } catch (e) { }
  }

  /* ---------- øvelser ---------- */
  function others(arr, cur, n, key) {
    var out = [], seen = {}; seen[key ? key(cur) : cur] = 1;
    shuffle(arr).forEach(function (x) { var k = key ? key(x) : x; if (!seen[k] && out.length < n) { seen[k] = 1; out.push(x); } });
    return out;
  }

  /* felles flervalg. cfg: q, big, speakText, sentence(html), clip, slug, options[{t,ok}], ans(visning), note, make */
  function exMC(cfg) {
    return {
      type: 'mc', make: cfg.make,
      render: function (body, api) {
        var self = this, h = '<div class="lp-q">' + esc(cfg.q) + '</div>';
        if (cfg.clip) {
          h += '<button class="lp-bigsay" id="lp-play" aria-label="Spill av lyden">🔊</button><button class="lp-slow" id="lp-slow">🐢 Spill saktere</button>';
        }
        if (cfg.big) h += '<div class="lp-bigword"><span>' + esc(cfg.big) + '</span>' + (cfg.speakText ? '<button class="lp-say" id="lp-say" aria-label="Hør uttalen">🔊</button>' : '') + '</div>';
        if (cfg.sentenceHTML) h += '<div class="lp-sentence">' + cfg.sentenceHTML + '</div>';
        h += '<div class="lp-opts" role="radiogroup">';
        self.opts = cfg.options.slice();
        self.opts.forEach(function (o, i) { h += '<button class="lp-opt" role="radio" aria-checked="false" data-i="' + i + '"><kbd>' + (i + 1) + '</kbd><span>' + esc(o.t) + '</span></button>'; });
        h += '</div>';
        body.innerHTML = h; self.sel = -1;
        var btns = body.querySelectorAll('.lp-opt');
        Array.prototype.forEach.call(btns, function (b) {
          b.addEventListener('click', function () {
            if (self.locked) return; self.sel = +b.getAttribute('data-i');
            Array.prototype.forEach.call(btns, function (x) { x.classList.remove('lp-sel'); x.setAttribute('aria-checked', 'false'); });
            b.classList.add('lp-sel'); b.setAttribute('aria-checked', 'true'); api.ready(true);
          });
        });
        self.btns = btns;
        if (cfg.clip) {
          $('lp-play').onclick = function () { playClip(cfg.slug, cfg.clip, 1); };
          $('lp-slow').onclick = function () { playClip(cfg.slug, cfg.clip, 0.7); };
          setTimeout(function () { playClip(cfg.slug, cfg.clip, 1); }, 250);
        }
        if (cfg.speakText && $('lp-say')) $('lp-say').onclick = function () { speak(cfg.speakText); };
      },
      check: function () {
        var self = this, ok = self.opts[self.sel].ok; self.locked = true;
        Array.prototype.forEach.call(self.btns, function (b, i) {
          b.disabled = true;
          if (self.opts[i].ok) b.classList.add('lp-ok');
          else if (i === self.sel) b.classList.add('lp-no');
          b.classList.remove('lp-sel');
        });
        return { ok: ok, ans: cfg.ans, note: cfg.note };
      },
      pickKey: function (n) { if (this.locked || n < 1 || n > this.opts.length) return false; this.btns[n - 1].click(); return true; }
    };
  }

  /* skriveøvelse. cfg: q, hint, test(val)->{ok,note}, ans, clip, slug, speakText, chars */
  function exType(cfg) {
    return {
      type: 'type', make: cfg.make, solution: cfg.solution || cfg.ans,
      render: function (body, api) {
        var h = '<div class="lp-q">' + esc(cfg.q) + '</div>';
        if (cfg.clip) h += '<button class="lp-bigsay" id="lp-play" aria-label="Spill av lyden">🔊</button><button class="lp-slow" id="lp-slow">🐢 Spill saktere</button>';
        h += '<input class="lp-input" id="lp-in" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="de" aria-label="Svar på tysk" placeholder="Skriv på tysk …">';
        h += '<div class="lp-chars" aria-label="Spesialtegn">' + ['ä', 'ö', 'ü', 'ß'].map(function (c) { return '<button type="button" data-c="' + c + '">' + c + '</button>'; }).join('') + '</div>';
        if (cfg.hint) h += '<p class="lp-hint">' + esc(cfg.hint) + '</p>';
        body.innerHTML = h;
        var inp = $('lp-in'); this.inp = inp;
        inp.addEventListener('input', function () { api.ready(inp.value.trim().length > 0); });
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); api.primary(); } });
        Array.prototype.forEach.call(body.querySelectorAll('.lp-chars button'), function (b) {
          b.addEventListener('click', function () { var s = inp.selectionStart || inp.value.length; inp.value = inp.value.slice(0, s) + b.getAttribute('data-c') + inp.value.slice(inp.selectionEnd || s); inp.focus(); inp.setSelectionRange(s + 1, s + 1); api.ready(true); });
        });
        if (cfg.clip) {
          $('lp-play').onclick = function () { playClip(cfg.slug, cfg.clip, 1); };
          $('lp-slow').onclick = function () { playClip(cfg.slug, cfg.clip, 0.7); };
          setTimeout(function () { playClip(cfg.slug, cfg.clip, 1); }, 250);
        }
        setTimeout(function () { if (!cfg.clip) inp.focus(); }, 60);
      },
      check: function () {
        var r = cfg.test(this.inp.value); this.inp.readOnly = true; this.inp.classList.add(r.ok ? 'lp-ok' : 'lp-no');
        return { ok: r.ok, ans: cfg.ans, note: r.note || cfg.note };
      }
    };
  }

  /* par-øvelse (ingen «Sjekk»-knapp) */
  function exMatch(words) {
    var make = function () { return exMatch(words); };
    return {
      type: 'match', make: make, noCheck: true, words: words,
      render: function (body, api) {
        var L = shuffle(words), R = shuffle(words), selL = null, selR = null, left = words.length, flawed = false, lock = false;
        var h = '<div class="lp-q">Finn parene</div><div class="lp-match"><div class="lp-opts" id="lp-ml"></div><div class="lp-opts" id="lp-mr"></div></div>';
        body.innerHTML = h;
        function mk(col, items, side) {
          items.forEach(function (w) {
            var b = document.createElement('button'); b.className = 'lp-opt'; b.type = 'button';
            b.textContent = side === 'L' ? fmt(w) : w[2]; b.setAttribute('data-k', w[0]);
            b.addEventListener('click', function () {
              if (lock || b.classList.contains('lp-gone')) return;
              if (side === 'L') { if (selL) selL.classList.remove('lp-sel'); selL = b; }
              else { if (selR) selR.classList.remove('lp-sel'); selR = b; }
              b.classList.add('lp-sel');
              if (selL && selR) {
                var okp = selL.getAttribute('data-k') === selR.getAttribute('data-k'), a = selL, c = selR; selL = selR = null; lock = true;
                if (okp) {
                  a.classList.remove('lp-sel'); c.classList.remove('lp-sel'); a.classList.add('lp-ok'); c.classList.add('lp-ok'); sfx('ok');
                  setTimeout(function () { a.classList.add('lp-gone'); c.classList.add('lp-gone'); lock = false; left--; if (!left) api.matchDone(flawed); }, 350);
                } else {
                  a.classList.add('lp-no'); c.classList.add('lp-no');
                  if (!flawed) { flawed = true; api.lose(); }
                  else sfx('bad');
                  setTimeout(function () { a.classList.remove('lp-no', 'lp-sel'); c.classList.remove('lp-no', 'lp-sel'); lock = false; }, 500);
                }
              }
            });
            $(col).appendChild(b);
          });
        }
        mk('lp-ml', L, 'L'); mk('lp-mr', R, 'R');
      }
    };
  }

  /* setningsbygger */
  function exBuild(s, T) {
    var make = function () { return exBuild(s, T); };
    var toks = s.de.split(' ');
    var ansLow = toks.map(function (t) { return fold(t); });
    var pool = [];
    T.sents.forEach(function (o) { if (o !== s) o.de.split(' ').forEach(function (t, i) { var b = strip(t); if (i > 0 && b.length >= 3 && b === b.toLowerCase() && ansLow.indexOf(fold(b)) < 0 && pool.indexOf(b) < 0) pool.push(b); }); });
    var extra = shuffle(pool).slice(0, toks.length > 6 ? 2 : 1);
    return {
      type: 'build', make: make, solution: s.de,
      render: function (body, api) {
        var self = this; self.ans = []; var tiles = shuffle(toks.concat(extra).map(function (t, i) { return { t: t, id: i }; }));
        var h = '<div class="lp-q">Sett sammen setningen på tysk</div><div class="lp-bigword" style="font-size:1.25rem;font-weight:700"><span>' + esc(s.no) + '</span></div>';
        h += '<div class="lp-ans" id="lp-ans" aria-label="Din setning"></div><div class="lp-bank" id="lp-bank"></div>';
        body.innerHTML = h;
        var ansEl = $('lp-ans'), bank = $('lp-bank'); self.btnMap = {};
        function redrawAns() { api.ready(self.ans.length > 0); }
        tiles.forEach(function (tl) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'lp-tile'; b.textContent = tl.t;
          var inAns = false;
          b.addEventListener('click', function () {
            if (self.locked) return;
            if (!inAns) { inAns = true; self.ans.push(tl); var c = document.createElement('button'); c.type = 'button'; c.className = 'lp-tile'; c.textContent = tl.t;
              c.addEventListener('click', function () { if (self.locked) return; inAns = false; self.ans = self.ans.filter(function (x) { return x !== tl; }); c.remove(); b.classList.remove('lp-used'); redrawAns(); });
              ansEl.appendChild(c); b.classList.add('lp-used'); }
            redrawAns();
          });
          bank.appendChild(b);
        });
      },
      check: function () {
        this.locked = true; var got = this.ans.map(function (x) { return x.t; }).join(' ');
        var ok = got === s.de;
        $('lp-ans').style.background = ok ? '#e6f4e7' : '#fdeaea';
        return { ok: ok, ans: s.de, note: '' };
      }
    };
  }

  /* ---------- øvelsesfabrikker ---------- */
  function wDeNo(w, T) {
    var make = function () { return wDeNo(w, T); };
    var opts = [{ t: w[2], ok: true }].concat(others(T.words, w, 3, function (x) { return x[2] || x; }).map(function (x) { return { t: x[2], ok: false }; }));
    return exMC({ q: 'Hva betyr dette ordet?', big: fmt(w), speakText: spoken(w), options: shuffle(opts), ans: fmt(w) + ' = ' + w[2], note: '', make: make });
  }
  function wNoDe(w, T) {
    var make = function () { return wNoDe(w, T); };
    var opts = [{ t: fmt(w), ok: true }].concat(others(T.words, w, 3, function (x) { return typeof x === 'string' ? x : x[0]; }).map(function (x) { return { t: fmt(x), ok: false }; }));
    return exMC({ q: 'Hvordan sier du «' + w[2] + '» på tysk?', options: shuffle(opts), ans: fmt(w), make: make });
  }
  function wType(w) {
    var make = function () { return wType(w); };
    return exType({
      q: 'Skriv på tysk: «' + w[2] + '»', solution: spoken(w), hint: 'Tips: skriv gjerne med artikkel (der, die, das).', ans: fmt(w), make: make,
      test: function (val) {
        var v = fold(val), art = null, m = v.match(/^(der|die|das)\s+(.+)$/);
        if (m) { art = m[1]; v = m[2]; }
        if (v !== fold(w[0])) return { ok: false };
        var exp = w[1] === 'pl' ? 'die' : (w[1] === 'adj' ? null : w[1]);
        if (art && exp && art !== exp) return { ok: false, note: 'Riktig ord, men feil artikkel.' };
        return { ok: true, note: (!art && exp) ? 'Husk artikkelen: ' + fmt(w) : '' };
      }
    });
  }
  function sDeNo(s, T) {
    var make = function () { return sDeNo(s, T); };
    var opts = [{ t: s.no, ok: true }].concat(others(T.sents, s, 3, function (x) { return x.no; }).map(function (x) { return { t: x.no, ok: false }; }));
    return exMC({ q: 'Hva betyr setningen?', big: s.de, speakText: s.de, options: shuffle(opts), ans: s.no, make: make });
  }
  function sNoDe(s, T) {
    var make = function () { return sNoDe(s, T); };
    var opts = [{ t: s.de, ok: true }].concat(others(T.sents, s, 3, function (x) { return x.de; }).map(function (x) { return { t: x.de, ok: false }; }));
    return exMC({ q: 'Hvordan sier du dette på tysk?', big: s.no, options: shuffle(opts), ans: s.de, make: make });
  }
  function sCloze(s, T) {
    var make = function () { return sCloze(s, T); };
    var toks = s.de.split(' ');
    var cand = []; toks.forEach(function (t, i) { if (strip(t).length >= 4) cand.push(i); });
    if (!cand.length) return sNoDe(s, T);
    var ci = pick(cand), tgt = toks[ci], word = strip(tgt), cap = word.charAt(0) !== word.charAt(0).toLowerCase();
    var pool = [];
    T.sents.forEach(function (o) { if (o !== s) o.de.split(' ').forEach(function (t) { var b = strip(t); if (b.length >= 4 && fold(b) !== fold(word) && (b.charAt(0) !== b.charAt(0).toLowerCase()) === cap && pool.indexOf(b) < 0) pool.push(b); }); });
    T.words.forEach(function (w) { if (w[1] !== 'adj' && fold(w[0]) !== fold(word) && cap && pool.indexOf(w[0]) < 0) pool.push(w[0]); });
    var wrong = shuffle(pool).slice(0, 2);
    if (wrong.length < 2) return sNoDe(s, T);
    var opts = shuffle([{ t: word, ok: true }].concat(wrong.map(function (x) { return { t: x, ok: false }; })));
    var shown = toks.map(function (t, i) { return i === ci ? '<span class="lp-blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>' + esc(tgt.slice(word.length)) : esc(t); }).join(' ');
    return exMC({ q: 'Hvilket ord mangler?', sentenceHTML: shown + '<div class="lp-hint">' + esc(s.no) + '</div>', options: opts, ans: s.de, make: make });
  }
  function hQ(h, T) {
    var make = function () { return hQ(h, T); };
    var opts = shuffle([{ t: h.ok, ok: true }].concat(h.bad.map(function (x) { return { t: x, ok: false }; })));
    return exMC({ q: h.q, clip: { a: h.a, s: h.s, e: h.e }, slug: T.slug, options: opts, ans: h.ok, note: 'Det som ble sagt: «' + h.t + '»', make: make });
  }
  function hPick(s, T) {
    var make = function () { return hPick(s, T); };
    var opts = shuffle([{ t: s.de, ok: true }].concat(others(T.sents, s, 2, function (x) { return x.de; }).map(function (x) { return { t: x.de, ok: false }; })));
    return exMC({ q: 'Hva hører du?', clip: s.clip, slug: T.slug, options: opts, ans: s.de, note: s.no, make: make });
  }
  function hType(s, T) {
    var make = function () { return hType(s, T); };
    return exType({ q: 'Skriv det du hører', clip: s.clip, slug: T.slug, ans: s.de, note: s.no, make: make, test: function (v) { return { ok: fold(v) === fold(s.de) }; } });
  }

  function lessonExercises(T, k) {
    var W = T.words, ex = [], i;
    if (k === 'w1' || k === 'w2') {
      var half = Math.ceil(W.length / 2), ws = shuffle(k === 'w1' ? W.slice(0, half) : W.slice(half));
      var g = function (n) { return ws[n % ws.length]; };
      ex = [wDeNo(g(0), T), wDeNo(g(1), T), wDeNo(g(2), T), wDeNo(g(3), T), exMatch(ws.slice(0, 5)), wNoDe(g(4), T), wDeNo(g(5), T), wNoDe(g(1), T),
        wType(g(2)), wNoDe(g(6), T), exMatch(ws.slice(5, 10).length >= 4 ? ws.slice(5, 10) : ws.slice(0, 5)), wType(g(7)), wType(g(0)), wNoDe(g(8), T)];
    } else if (k === 's') {
      var ss = shuffle(T.sents), sg = function (n) { return ss[n % ss.length]; };
      ex = [exBuild(sg(0), T), sDeNo(sg(1), T), sCloze(sg(2), T), exBuild(sg(3), T), sNoDe(sg(4), T), sCloze(sg(5), T), exBuild(sg(6), T), sDeNo(sg(7), T), exBuild(sg(8), T), sCloze(sg(9), T)];
    } else if (k === 'h') {
      var hs = shuffle(T.hear), cs = shuffle(T.sents.filter(function (x) { return x.clip; }));
      ex = hs.map(function (h) { return hQ(h, T); });
      var extra = [];
      cs.slice(0, 3).forEach(function (s) { extra.push(hPick(s, T)); });
      cs.filter(function (s) { return s.de.split(' ').length <= 8; }).slice(0, 2).forEach(function (s) { extra.push(hType(s, T)); });
      shuffle(extra).forEach(function (e, n) { ex.splice(Math.min(ex.length, 1 + n * 2), 0, e); });
    } else {
      var ww = shuffle(W), s2 = shuffle(T.sents), cl = s2.filter(function (x) { return x.clip; }), hh = shuffle(T.hear);
      ex = [wDeNo(ww[0], T), wNoDe(ww[1], T), exMatch(ww.slice(2, 7)), wType(ww[3]), exBuild(s2[0], T), sCloze(s2[1], T), hQ(hh[0], T), wNoDe(ww[8], T),
        exBuild(s2[2], T), sDeNo(s2[3], T), hQ(hh[1], T), cl.length ? hPick(cl[0], T) : hQ(hh[2], T), wType(ww[9]), exMatch(ww.slice(10, 15))];
    }
    return ex;
  }

  var KINDS = [
    { k: 'w1', t: 'Ord 1', ic: '📖', d: 'Lær de første ordene i temaet.' },
    { k: 'w2', t: 'Ord 2', ic: '📖', d: 'Flere nye ord, og repeter de forrige.' },
    { k: 's', t: 'Setninger', ic: '💬', d: 'Bygg og forstå setninger fra samtalen.' },
    { k: 'h', t: 'Lytt', ic: '🎧', d: 'Hør klipp fra lydfilen og svar på spørsmål.' },
    { k: 'm', t: 'Mestertest', ic: '👑', d: 'Blandet test fra hele temaet.' }
  ];

  /* ---------- sti ---------- */
  function nodeId(T, k) { return T.slug + ':' + k; }
  function isDone(T, k) { var n = S.nodes[nodeId(T, k)]; return !!(n && n.done); }
  function isOpen(ti, k) {
    if (S.unlockAll) return true;
    var T = D.themes[ti];
    var unit = ti === 0 || ['w1', 'w2', 's', 'h'].every(function (kk) { return isDone(D.themes[ti - 1], kk); });
    if (!unit) return false;
    if (k === 'w1') return true;
    if (k === 'w2') return isDone(T, 'w1');
    if (k === 's') return isDone(T, 'w2');
    if (k === 'h') return isDone(T, 's');
    return ['w1', 'w2', 's', 'h'].every(function (kk) { return isDone(T, kk); });
  }
  function stars(n) { var s = ''; for (var i = 1; i <= 3; i++) s += '<span class="' + (i <= n ? 'lp-star-on' : 'lp-star-off') + '">★</span>'; return s; }
  var XOFF = [0, 44, 70, 44, 0, -44, -70, -44];
  function renderPath() {
    var cur = null, total = 0, done = 0, totalStars = 0, h = '';
    D.themes.forEach(function (T, ti) {
      var unitOpen = isOpen(ti, 'w1'), allGold = true;
      KINDS.forEach(function (K) { var n = S.nodes[nodeId(T, K.k)]; if (!n || n.stars < 3) allGold = false; });
      h += '<section class="lp-unit' + (unitOpen ? '' : ' lp-lockedunit') + '" style="--c:' + T.color + '" aria-label="' + esc(T.title) + '">';
      h += '<div class="lp-banner"><div><small>Enhet ' + (ti + 1) + (allGold ? ' · 👑 gullkrone' : '') + '</small><h2>' + T.icon + ' ' + esc(T.title) + '</h2></div><a href="../wichtige-themen/8-klasse/' + T.slug + '/">Temaside</a></div>';
      h += '<div class="lp-nodes">';
      KINDS.forEach(function (K, ki) {
        var id = nodeId(T, K.k), n = S.nodes[id], open = isOpen(ti, K.k), isD = !!(n && n.done); total++; if (isD) { done++; totalStars += n.stars; }
        var isCur = !cur && open && !isD; if (isCur) cur = id;
        var cls = 'lp-node' + (K.k === 'm' ? ' lp-master' : '') + (!open ? ' lp-locked' : '') + (isD ? ' lp-done' : '') + (isCur ? ' lp-current' : '');
        h += '<div class="lp-node-wrap" style="--x:' + XOFF[(ti * 5 + ki) % 8] + 'px">' + (isCur ? '<div class="lp-start-bubble">START</div>' : '');
        h += '<button class="' + cls + '" data-t="' + ti + '" data-k="' + K.k + '" aria-label="' + esc(T.title + ': ' + K.t + (isD ? ', fullført, ' + n.stars + ' av 3 stjerner' : (open ? '' : ', låst'))) + '"' + (isCur ? ' id="lp-cur"' : '') + '>' + (open ? K.ic : '🔒') + '</button>';
        h += '<div class="lp-node-label">' + K.t + '</div><div class="lp-node-stars" aria-hidden="true">' + (isD ? stars(n.stars) : '') + '</div></div>';
      });
      h += '</div></section>';
    });
    $('lp-path').innerHTML = h;
    Array.prototype.forEach.call($('lp-path').querySelectorAll('.lp-node'), function (b) { b.addEventListener('click', function () { openIntro(+b.getAttribute('data-t'), b.getAttribute('data-k')); }); });
    $('lp-s-streak').textContent = curStreak(); $('lp-s-xp').textContent = S.xp; $('lp-s-stars').textContent = totalStars;
    $('lp-ov-n').textContent = done + ' av ' + total + ' leksjoner'; $('lp-ov-bar').style.width = Math.round(done / total * 100) + '%';
    $('lp-ov-bar').parentNode.setAttribute('aria-valuenow', Math.round(done / total * 100));
  }

  /* ---------- ark (modal) ---------- */
  var ov = $('lp-ov'), sheet = $('lp-sheet'), lastFocus = null;
  function openSheet(html) { lastFocus = document.activeElement; sheet.innerHTML = html; ov.classList.add('lp-open'); document.body.style.overflow = 'hidden'; var f = sheet.querySelector('button,input,textarea'); if (f) f.focus(); }
  function closeSheet() { ov.classList.remove('lp-open'); sheet.innerHTML = ''; if (!$('lp-ls').classList.contains('lp-open')) document.body.style.overflow = ''; if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus(); }
  $('lp-dim').addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('lp-open')) closeSheet(); });

  function openIntro(ti, k) {
    var T = D.themes[ti], K = KINDS.filter(function (x) { return x.k === k; })[0], open = isOpen(ti, k), n = S.nodes[nodeId(T, k)];
    var h = '<h3>' + K.ic + ' ' + esc(T.title) + ' · ' + K.t + '</h3>';
    if (!open) {
      h += '<p>Denne leksjonen er låst. ' + (k === 'm' ? 'Fullfør de fire første leksjonene i enheten for å åpne mestertesten.' : (k === 'w1' ? 'Fullfør forrige enhet først.' : 'Fullfør forrige leksjon først.')) + '</p><button class="lp-btn lp-ghost" id="lp-close">Lukk</button>';
    } else {
      h += '<p>' + K.d + ' Du har 5 hjerter, og hver feil koster ett.</p>' + (n && n.done ? '<p><b>Beste resultat:</b> <span aria-hidden="true">' + stars(n.stars) + '</span> ' + n.stars + ' av 3 stjerner. Prøv igjen for å få flere!</p>' : '');
      h += '<button class="lp-btn" id="lp-go">Start leksjon</button><button class="lp-btn lp-ghost" id="lp-close">Avbryt</button>';
    }
    openSheet(h);
    $('lp-close').onclick = closeSheet;
    if ($('lp-go')) $('lp-go').onclick = function () { closeSheet(); startLesson(ti, k); };
  }

  /* ---------- leksjon ---------- */
  var ls = $('lp-ls'), L = null;
  function setHearts() { $('lp-hearts').textContent = '❤️ ' + L.hearts; $('lp-hearts').setAttribute('aria-label', L.hearts + ' hjerter igjen'); }
  function setProg() { $('lp-prog-i').style.width = Math.round(L.done / L.total * 100) + '%'; }
  function startLesson(ti, k) {
    var T = D.themes[ti], q = lessonExercises(T, k);
    L = { ti: ti, k: k, T: T, queue: q, idx: 0, total: q.length, done: 0, hearts: 5, mistakes: 0, first: 0, busy: false };
    ls.style.setProperty('--c', T.color);
    ls.innerHTML = '<div class="lp-lesson" role="dialog" aria-modal="true" aria-label="Leksjon"><div class="lp-ltop"><button class="lp-x" id="lp-quit" aria-label="Avslutt leksjonen">✕</button><div class="lp-prog" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i id="lp-prog-i"></i></div><div class="lp-hearts" id="lp-hearts"></div></div><div class="lp-lbody" id="lp-body"></div><div class="lp-fb" id="lp-fb"><div class="lp-fb-in" id="lp-bar"></div></div></div>';
    ls.classList.add('lp-open'); document.body.style.overflow = 'hidden';
    $('lp-quit').onclick = function () {
      openSheet('<h3>Avslutte leksjonen?</h3><p>Du mister fremgangen i denne leksjonen.</p><button class="lp-btn" id="lp-stay">Fortsett leksjonen</button><button class="lp-btn lp-bad" id="lp-leave">Avslutt</button>');
      $('lp-stay').onclick = closeSheet; $('lp-leave').onclick = function () { closeSheet(); endLesson(); };
    };
    setHearts(); setProg(); next();
  }
  function endLesson() { ls.classList.remove('lp-open'); ls.innerHTML = ''; document.body.style.overflow = ''; L = null; if (au) au.pause(); renderPath(); var c = $('lp-cur'); if (c) c.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  var API = {
    ready: function (b) { var c = $('lp-check'); if (c) c.disabled = !b; },
    primary: function () { var b = $('lp-check') || $('lp-next'); if (b && !b.disabled) b.click(); },
    lose: function () { L.hearts--; L.mistakes++; setHearts(); sfx('bad'); if (L.hearts <= 0) setTimeout(fail, 700); },
    matchDone: function (flawed) {
      if (!L || L.hearts <= 0) return; L.done++; if (!flawed) L.first++; setProg();
      var fb = $('lp-fb'); fb.className = 'lp-fb lp-good'; $('lp-bar').innerHTML = '<p class="lp-fb-t">' + (flawed ? 'Ferdig!' : pick(PRAISE)) + '</p><button class="lp-btn" id="lp-next">Fortsett</button>';
      if (!flawed) sfx('ok'); $('lp-next').onclick = function () { L.idx++; next(); }; $('lp-next').focus();
    }
  };
  function next() {
    if (L.hearts <= 0) { fail(); return; }
    if (L.idx >= L.queue.length) { finish(); return; }
    var ex = L.queue[L.idx]; L.cur = ex; L.checked = false;
    var body = $('lp-body'), fb = $('lp-fb'); fb.className = 'lp-fb';
    $('lp-bar').innerHTML = ex.noCheck ? '' : '<button class="lp-btn" id="lp-check" disabled>Sjekk</button>';
    body.scrollTop = 0; ex.render(body, API);
    if ($('lp-check')) $('lp-check').onclick = check;
  }
  function check() {
    var ex = L.cur; if (L.checked) return; L.checked = true;
    var r = ex.check(); L.res = r; var fb = $('lp-fb');
    if (r.ok) {
      sfx('ok'); fb.className = 'lp-fb lp-good'; if (!ex.retry) L.first++; L.done++; setProg();
      $('lp-bar').innerHTML = '<p class="lp-fb-t" role="status">' + pick(PRAISE) + '</p>' + (r.note ? '<p class="lp-fb-d">' + esc(r.note) + '</p>' : '') + (r.ans ? '<p class="lp-fb-d">' + esc(r.ans) + '</p>' : '') + '<button class="lp-btn" id="lp-next">Fortsett</button>';
    } else {
      L.hearts--; L.mistakes++; setHearts(); sfx('bad'); fb.className = 'lp-fb lp-bad';
      $('lp-bar').innerHTML = '<p class="lp-fb-t" role="alert">Ikke helt …</p><p class="lp-fb-d"><b>Riktig svar:</b> ' + esc(r.ans || '') + '</p>' + (r.note ? '<p class="lp-fb-d">' + esc(r.note) + '</p>' : '') + '<button class="lp-btn lp-bad" id="lp-next">Fortsett</button>';
      if (L.hearts > 0 && ex.make && L.queue.length < 40) { var c = ex.make(); c.retry = true; L.queue.push(c); }
    }
    $('lp-next').onclick = function () { L.idx++; next(); }; $('lp-next').focus();
  }
  function fail() {
    if (!L) return; var T = L.T, ti = L.ti, k = L.k;
    $('lp-fb').className = 'lp-fb'; $('lp-bar').innerHTML = '';
    $('lp-body').innerHTML = '<div class="lp-result"><div style="font-size:3.4rem">💔</div><h2>Tom for hjerter</h2><p>Det er helt greit å bomme. Prøv igjen, så går det bedre!</p><button class="lp-btn" id="lp-again">Prøv igjen</button><button class="lp-btn lp-ghost" id="lp-back">Tilbake til stien</button></div>';
    $('lp-again').onclick = function () { ls.classList.remove('lp-open'); ls.innerHTML = ''; startLesson(ti, k); };
    $('lp-back').onclick = endLesson;
  }
  function finish() {
    var m = L.mistakes, st = m === 0 ? 3 : (m <= 2 ? 2 : 1), id = nodeId(L.T, L.k), gain = L.first * 10 + st * 5 + (L.k === 'm' ? 10 : 0);
    var n = S.nodes[id] || { stars: 0, done: false }; n.done = true; n.stars = Math.max(n.stars, st); S.nodes[id] = n; S.xp += gain;
    var t = today();
    if (S.last !== t) { S.streak = (S.last === today(-1)) ? S.streak + 1 : 1; S.last = t; }
    save(); sfx('done'); if (st >= 2) confetti();
    var acc = Math.round((L.total - Math.min(m, L.total)) / L.total * 100);
    $('lp-fb').className = 'lp-fb'; $('lp-bar').innerHTML = ''; $('lp-prog-i').style.width = '100%';
    $('lp-body').innerHTML = '<div class="lp-result"><div style="font-size:3rem">' + (st === 3 ? '🏆' : '🎉') + '</div><h2>Leksjon fullført!</h2><div class="lp-bigstars" aria-label="' + st + ' av 3 stjerner">' + stars(st) + '</div>' +
      '<div class="lp-res-stats"><div class="lp-res-stat"><small>XP</small><b>+' + gain + '</b></div><div class="lp-res-stat"><small>Treff</small><b>' + acc + '%</b></div><div class="lp-res-stat"><small>🔥 Streak</small><b>' + curStreak() + '</b></div></div>' +
      '<p>' + (st === 3 ? 'Helt uten feil. Fantastisk!' : 'Prøv igjen senere for å få alle tre stjernene.') + '</p><button class="lp-btn" id="lp-fin">Fortsett</button></div>';
    $('lp-fin').onclick = endLesson; $('lp-fin').focus();
  }
  document.addEventListener('keydown', function (e) {
    if (!L || !ls.classList.contains('lp-open') || ov.classList.contains('lp-open')) return;
    var tag = (e.target && e.target.tagName) || '';
    if (e.key === 'Enter' && tag !== 'BUTTON' && tag !== 'INPUT') { e.preventDefault(); API.primary(); }
    else if (/^[1-9]$/.test(e.key) && tag !== 'INPUT' && L.cur && L.cur.pickKey && !L.checked) { if (L.cur.pickKey(+e.key)) e.preventDefault(); }
  });

  /* ---------- innstillinger ---------- */
  function openSettings() {
    var h = '<h3>⚙️ Innstillinger</h3>';
    if (!storageOK) h += '<div class="lp-note">Nettleseren din lar ikke siden lagre fremgang. Du kan bruke siden, men fremgangen forsvinner når du lukker den. Bruk «Eksporter» for å ta vare på den.</div>';
    h += '<div class="lp-row"><span>Lydeffekter</span><button class="lp-switch" id="lp-sw-snd" role="switch" aria-checked="' + S.sound + '" aria-label="Lydeffekter"></button></div>';
    h += '<div class="lp-row"><span>Åpne alle leksjoner<br><span class="lp-mini">For lærer, eller hvis du vil hoppe fritt</span></span><button class="lp-switch" id="lp-sw-all" role="switch" aria-checked="' + S.unlockAll + '" aria-label="Åpne alle leksjoner"></button></div>';
    h += '<p class="lp-mini" style="margin-top:12px">Fremgangen lagres bare i denne nettleseren, på denne enheten. Det lagres ingen personopplysninger. Skal du bytte enhet, kan du flytte fremgangen med en kode:</p>';
    h += '<button class="lp-btn lp-ghost" id="lp-exp">Eksporter fremgang (kopier kode)</button>';
    h += '<textarea class="lp-field" id="lp-code" rows="3" placeholder="Lim inn koden her for å importere" aria-label="Kode for fremgang"></textarea><button class="lp-btn lp-ghost" id="lp-imp">Importer kode</button>';
    h += '<button class="lp-btn lp-bad" id="lp-reset">Nullstill all fremgang</button><button class="lp-btn lp-ghost" id="lp-close">Lukk</button>';
    openSheet(h);
    $('lp-close').onclick = closeSheet;
    function sw(id, key) { $(id).onclick = function () { S[key] = !S[key]; this.setAttribute('aria-checked', S[key]); save(); renderPath(); }; }
    sw('lp-sw-snd', 'sound'); sw('lp-sw-all', 'unlockAll');
    $('lp-exp').onclick = function () {
      var code = 'DWLP1:' + btoa(unescape(encodeURIComponent(JSON.stringify(S)))); $('lp-code').value = code;
      try { navigator.clipboard.writeText(code).then(function () { toast('Koden er kopiert.'); }, function () { toast('Marker og kopier koden i feltet.'); }); } catch (e) { toast('Marker og kopier koden i feltet.'); }
    };
    $('lp-imp').onclick = function () {
      var v = $('lp-code').value.trim();
      try { if (v.indexOf('DWLP1:') !== 0) throw 0; adopt(JSON.parse(decodeURIComponent(escape(atob(v.slice(6)))))); save(); renderPath(); closeSheet(); toast('Fremgangen er importert.'); }
      catch (e) { toast('Koden er ugyldig.'); }
    };
    $('lp-reset').onclick = function () {
      openSheet('<h3>Nullstille alt?</h3><p>All fremgang, XP og streak slettes fra denne nettleseren. Dette kan ikke angres.</p><button class="lp-btn lp-bad" id="lp-yes">Ja, nullstill</button><button class="lp-btn lp-ghost" id="lp-no">Avbryt</button>');
      $('lp-no').onclick = closeSheet; $('lp-yes').onclick = function () { S.xp = 0; S.streak = 0; S.last = ''; S.nodes = {}; save(); renderPath(); closeSheet(); toast('Fremgangen er nullstilt.'); };
    };
  }
  $('lp-gear').addEventListener('click', openSettings);

  D.debug = function () { return L; };
  load(); renderPath();
  var c0 = $('lp-cur'); if (c0 && (location.hash === '#start')) c0.scrollIntoView({ block: 'center' });
  if (window.speechSynthesis && speechSynthesis.getVoices) speechSynthesis.getVoices();
})();
