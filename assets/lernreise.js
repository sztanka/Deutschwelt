/* Deutschwelt — Lernreise. Motor: dashbord, verdener, leksjoner (Gjett → Lær → Øv → Bruk), repetisjon (Leitner), prøve.
   Data: window.DWLR (lernreise/data/*.js). Fremgang lagres i localStorage (kun i denne nettleseren).
   Designregler: (1) alt som vises i en oppgave er innført først, (2) høyst ett nytt alternativ, (3) ord gjettes ved utelukkelse. */
(function () {
  'use strict';
  var D = window.DWLR;
  if (!D) return;

  /* ---------- hjelpere ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; }
  function fold(s) {
    return String(s).toLowerCase().replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/[’‘`´']/g, '').replace(/[.,!?;:…„“”«»"()\-–—]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function fold2(s) { return String(s).toLowerCase().replace(/ß/g, 'ss').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/[’‘`´']/g, '').replace(/[.,!?;:…„“”«»"()\-–—]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function same(a, b) { return fold(a) === fold(b) || fold2(a) === fold2(b); }
  function toks(s) { return fold(s).split(' ').filter(Boolean); }
  function words(s) { return String(s).replace(/[.,!?;:…„“”«»"()]/g, ' ').replace(/[’‘`´]/g, "'").split(/\s+/).filter(Boolean); }
  function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function today(off) { var d = new Date(); d.setDate(d.getDate() + (off || 0)); return ymd(d); }
  var PRAISE = ['Riktig!', 'Flott!', 'Bra jobbet!', 'Perfekt!', 'Super!', 'Sehr gut!', 'Genau!'];
  var SK = { hoeren: 'Hören', sprechen: 'Sprechen', lesen: 'Lesen', schreiben: 'Schreiben' };
  var SKI = { hoeren: '🎧', sprechen: '🗣️', lesen: '📖', schreiben: '✍️' };
  var SKT = { hoeren: 120, sprechen: 100, lesen: 280, schreiben: 100 }; /* riktige svar for full stolpe på Trinn 1 (Welt 1–3) */
  var LEVELS = { basis: 'Basis', std: 'Standard', hard: 'Herausforderung' };
  var INTERVAL = [0, 0, 1, 3, 7, 21];

  /* ---------- lagring ---------- */
  var KEY = 'dw_lernreise_v1', storageOK = true;
  var S = { xp: 0, streak: 0, last: '', level: 'std', hearts: false, sound: true, teacher: false, les: {}, words: {}, skills: {}, seen: {}, tips: {} };
  function adopt(o) {
    S.xp = Math.max(0, +o.xp || 0); S.streak = Math.max(0, +o.streak || 0); S.last = typeof o.last === 'string' ? o.last : '';
    S.level = LEVELS[o.level] ? o.level : 'std'; S.hearts = !!o.hearts; S.sound = o.sound !== false; S.teacher = !!o.teacher;
    S.les = {}; S.words = {}; S.skills = {}; S.seen = {}; S.tips = {};
    if (o.les) Object.keys(o.les).forEach(function (k) { var n = o.les[k]; if (n && typeof n === 'object') S.les[k] = { done: !!n.done, stars: Math.min(3, Math.max(0, +n.stars || 0)), pct: Math.min(100, Math.max(0, +n.pct || 0)), medal: ['', 'bronse', 'solv', 'gull'].indexOf(n.medal) > 0 ? n.medal : '', can: Array.isArray(n.can) ? n.can.map(function (x) { return Math.min(2, Math.max(0, +x || 0)); }) : [] }; });
    if (o.words) Object.keys(o.words).forEach(function (k) { var w = o.words[k]; if (w && typeof w === 'object') S.words[k] = { box: Math.min(5, Math.max(1, +w.box || 1)), due: typeof w.due === 'string' ? w.due : today(), ok: +w.ok || 0, bad: +w.bad || 0 }; });
    if (o.skills) Object.keys(o.skills).forEach(function (k) { if (SK[k] && o.skills[k]) S.skills[k] = { ok: Math.max(0, +o.skills[k].ok || 0), n: Math.max(0, +o.skills[k].n || 0) }; });
    if (o.seen) Object.keys(o.seen).forEach(function (k) { if (o.seen[k]) S.seen[k] = 1; });
    if (o.tips) Object.keys(o.tips).forEach(function (k) { if (o.tips[k]) S.tips[k] = 1; });
  }
  function load() { try { var raw = localStorage.getItem(KEY); if (raw) { var o = JSON.parse(raw); if (o && typeof o === 'object') adopt(o); } } catch (e) { storageOK = false; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { storageOK = false; } }
  function gapOK(last) {
    if (!last) return false;
    var p = last.split('-'), a = new Date(+p[0], +p[1] - 1, +p[2]), b = new Date(); b.setHours(0, 0, 0, 0);
    var d = Math.round((b - a) / 864e5); if (d <= 0) return true;
    for (var i = 1; i < d; i++) { var dw = new Date(a.getTime() + i * 864e5).getDay(); if (dw !== 0 && dw !== 6) return false; }
    return true;
  }
  function curStreak() { return gapOK(S.last) ? S.streak : 0; }
  function bumpStreak() { var t = today(); if (S.last !== t) { S.streak = gapOK(S.last) ? S.streak + 1 : 1; S.last = t; } }

  /* ---------- lyd: effekter, konfetti, melding ---------- */
  var ac = null;
  function tone(f, t0, d, type, v) {
    var o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.value = 0.0001; o.connect(g); g.connect(ac.destination);
    var t = ac.currentTime + t0; g.gain.exponentialRampToValueAtTime(v || 0.15, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.05);
  }
  function sfx(k) {
    if (!S.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
      if (k === 'ok') { tone(660, 0, .14); tone(880, .1, .2); } else if (k === 'bad') { tone(240, 0, .18, 'sawtooth', .08); tone(170, .14, .25, 'sawtooth', .08); }
      else if (k === 'done') { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * .13, .3); }); }
    } catch (e) { }
  }
  function confetti() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = document.createElement('canvas'); c.id = 'lp-confetti'; document.body.appendChild(c);
    var w = c.width = innerWidth, h = c.height = innerHeight, x = c.getContext('2d'), cols = ['#d9a91c', '#9c1329', '#161616', '#2e7d32', '#1F4E79', '#f3d36b'], ps = [];
    for (var i = 0; i < 140; i++) ps.push({ x: Math.random() * w, y: -20 - Math.random() * h * .5, vx: (Math.random() - .5) * 4, vy: 2 + Math.random() * 4, s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: pick(cols) });
    var t0 = Date.now();
    (function f() { x.clearRect(0, 0, w, h); ps.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.vy += .05; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6); x.restore(); }); if (Date.now() - t0 < 2600) requestAnimationFrame(f); else c.remove(); })();
  }
  function toast(msg) { var t = document.createElement('div'); t.className = 'lp-toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2800); }

  /* ---------- uttale: mp3 hvis den finnes, ellers nettleserstemme ---------- */
  var au = new Audio(); au.preload = 'auto';
  var voices = [];
  function loadVoices() { try { voices = speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
  function deVoice() {
    var de = voices.filter(function (v) { return /^de/i.test(v.lang); }); if (!de.length) return null;
    var good = de.filter(function (v) { return /google|natural|anna|katja|conrad|markus|petra|hedda/i.test(v.name); }); return (good[0] || de[0]);
  }
  var voiceWarned = false;
  function speak(text, o) {
    o = o || {};
    try {
      if (!('speechSynthesis' in window)) { if (!voiceWarned) { voiceWarned = true; toast('Nettleseren din kan ikke lese opp tekst.'); } if (o.onend) o.onend(); return; }
      loadVoices(); var v = deVoice();
      if (voices.length && !v) { if (!voiceWarned) { voiceWarned = true; toast('Fant ingen tysk stemme på denne enheten.'); } if (o.onend) o.onend(); return; }
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text); u.lang = 'de-DE'; if (v) u.voice = v; u.rate = o.rate || 0.85; u.pitch = o.pitch || 1;
      if (o.onend) { u.onend = o.onend; u.onerror = o.onend; }
      speechSynthesis.speak(u);
    } catch (e) { if (o.onend) o.onend(); }
  }
  var WORLD = D.W[1];
  /* Lydfiler: prøver alltid lernreise/audio/<verden>/<id>.mp3 først. Mangler filen (404), huskes det og nettleserstemmen brukes.
     Da trenger ikke lista D.audio å oppdateres for hånd når nye mp3-filer legges inn. */
  var noFile = {};
  function hasFile(id, slug) { return !noFile[(slug || WORLD.slug) + '/' + id]; }
  function playUnit(id, text, o) {
    o = o || {};
    var slug = o.slug || WORLD.slug, key = slug + '/' + id;
    if (id && hasFile(id, slug)) {
      var fell = false;
      var fb = function () { if (fell) return; fell = true; noFile[key] = true; speak(text, o); };
      try {
        au.pause(); au.onerror = fb; au.src = 'audio/' + slug + '/' + id + '.mp3'; au.playbackRate = o.rate || 1; au.onended = o.onend || null;
        var p = au.play(); if (p && p.catch) p.catch(function (err) { if (!err || err.name !== 'AbortError') fb(); });
        return;
      } catch (e) { fb(); return; }
    }
    speak(text, o);
  }
  function sayOf(c) { return (c.say || c.de).replace(/…/g, '').replace(/\s+/g, ' ').trim(); }

  /* ---------- ord-for-ord-forklaring (trykk på tyske ord) ---------- */
  function glossHTML(text, w) {
    return String(text).split(/(\s+)/).map(function (t) {
      if (/^\s+$/.test(t) || !t) return esc(t);
      var core = t.replace(/^[„“"(«]+|[.,!?;:…„“”"»)]+$/g, ''), g = w.G[core.toLowerCase().replace(/[’‘`´]/g, "'")];
      if (!g) return esc(t);
      var i = t.indexOf(core);
      return esc(t.slice(0, i)) + '<span class="lr-tok" tabindex="0" role="button" data-g="' + esc(g) + '">' + esc(core) + '</span>' + esc(t.slice(i + core.length));
    }).join('');
  }
  var pop = null;
  function showPop(el) {
    hidePop(); pop = document.createElement('div'); pop.className = 'lr-pop'; pop.setAttribute('role', 'status'); pop.textContent = el.getAttribute('data-g'); document.body.appendChild(pop);
    var r = el.getBoundingClientRect(); pop.style.left = Math.max(8, Math.min(innerWidth - pop.offsetWidth - 8, r.left + r.width / 2 - pop.offsetWidth / 2)) + 'px'; pop.style.top = Math.max(8, r.top - pop.offsetHeight - 8) + 'px';
    setTimeout(hidePop, 2600);
  }
  function hidePop() { if (pop) { pop.remove(); pop = null; } }
  document.addEventListener('click', function (e) { var t = e.target; if (t && t.classList && t.classList.contains('lr-tok')) { e.stopPropagation(); showPop(t); } else hidePop(); }, true);
  document.addEventListener('keydown', function (e) { var t = e.target; if ((e.key === 'Enter' || e.key === ' ') && t && t.classList && t.classList.contains('lr-tok')) { e.preventDefault(); showPop(t); } });

  /* ---------- opptak (tale) – blir bare på enheten ---------- */
  var rec = { stream: null, mr: null, chunks: [], url: '' };
  function recSupported() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder); }
  function recStart(onStop, onFail) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      rec.stream = stream; rec.chunks = []; var mr = new MediaRecorder(stream); rec.mr = mr;
      mr.ondataavailable = function (e) { if (e.data && e.data.size) rec.chunks.push(e.data); };
      mr.onstop = function () { try { stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) { } if (rec.url) { try { URL.revokeObjectURL(rec.url); } catch (e) { } } rec.url = URL.createObjectURL(new Blob(rec.chunks, { type: mr.mimeType || 'audio/webm' })); onStop(rec.url); };
      mr.start();
    }, function () { onFail(); });
  }
  function recStop() { try { if (rec.mr && rec.mr.state !== 'inactive') rec.mr.stop(); } catch (e) { } }
  function recRelease() { recStop(); try { if (rec.stream) rec.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) { } if (rec.url) { try { URL.revokeObjectURL(rec.url); } catch (e) { } rec.url = ''; } }

  /* ---------- repetisjon (Leitner) ---------- */
  function leit(id, ok, L) {
    var w = S.words[id] || (S.words[id] = { box: 1, due: today(), ok: 0, bad: 0 });
    if (ok) { w.ok++; if (L && L.touched[id]) return; if (L) L.touched[id] = 1; w.box = Math.min(5, w.box + 1); }
    else { w.bad++; if (L) L.touched[id] = 1; w.box = 1; }
    w.due = today(INTERVAL[w.box]);
  }
  function skillHit(k, ok) { if (!SK[k]) return; var s = S.skills[k] || (S.skills[k] = { ok: 0, n: 0 }); s.n++; if (ok) s.ok++; }

  /* ================= oppgaver ================= */
  function C(cx, id) { return cx.w.V[id]; }
  function nOpts(cx) { return cx.level === 'basis' ? 3 : 4; }
  function avoids(cx, a, b) { var A = C(cx, a), B = C(cx, b); return (A.avoid && A.avoid.indexOf(b) >= 0) || (B.avoid && B.avoid.indexOf(a) >= 0); }
  /* velger avledere kun blant kjente uttrykk, helst fra en annen kategori, og aldri med samme visningstekst */
  function distract(cx, tid, n, filter, key) {
    var t = C(cx, tid), pool = Object.keys(cx.K).filter(function (id) { return id !== tid && !avoids(cx, tid, id) && (!filter || filter(C(cx, id))); });
    var diff = shuffle(pool.filter(function (id) { return C(cx, id).cat !== t.cat; })), same = shuffle(pool.filter(function (id) { return C(cx, id).cat === t.cat; }));
    var seen = {}; seen[key(t)] = 1; var out = [];
    diff.concat(same).forEach(function (id) { var k = key(C(cx, id)); if (!seen[k] && out.length < n) { seen[k] = 1; out.push(id); } });
    return out;
  }
  function disp(c) { return c.nw ? c.de : c.de; }
  function noShow(c) { return c.nw ? c.no : c.no; }

  /* felles flervalg */
  function exMC(cfg) {
    return {
      type: cfg.type || 'mc', skill: cfg.skill, tid: cfg.tid, uses: cfg.uses || [], target: cfg.target, unscored: !!cfg.unscored, review: !!cfg.review, lesson: cfg.lesson, make: cfg.make,
      opts: cfg.options, tip: cfg.tip || 'mc',
      render: function (body, api) {
        var self = this, h = '';
        if (cfg.review) h += '<div class="lr-tag">🔁 Repetisjon</div>';
        h += '<div class="lp-q">' + esc(cfg.q) + '</div>';
        if (cfg.pre) h += cfg.pre;
        if (cfg.situation) h += '<div class="lr-sit"><span aria-hidden="true">' + cfg.situationEm + '</span> ' + esc(cfg.situation) + '</div>';
        if (cfg.hear) h += '<button class="lp-bigsay" id="lr-play" aria-label="Spill av lyden">🔊</button><button class="lp-slow" id="lr-slow">🐢 Spill saktere</button>';
        if (cfg.npc) h += '<div class="lr-bub lr-bub1"><div class="lr-av" aria-hidden="true">' + cfg.npcEm + '</div><div><div class="lr-who">' + esc(cfg.npcWho) + '</div><div class="lr-de">' + glossHTML(cfg.npc, cfg.w) + ' <button class="lp-say" id="lr-say" aria-label="Hør uttalen">🔊</button></div><div class="lr-no" id="lr-npcno" hidden>' + esc(cfg.npcNo) + '</div><button class="lr-linkbtn" id="lr-showno">Vis norsk</button></div></div>';
        if (cfg.em) h += '<div class="lr-bigem" aria-hidden="true">' + cfg.em + '</div>';
        if (cfg.big) h += '<div class="lp-bigword"><span>' + (cfg.glossBig ? glossHTML(cfg.big, cfg.w) : esc(cfg.big)) + '</span>' + (cfg.sayText ? '<button class="lp-say" id="lr-say" aria-label="Hør uttalen">🔊</button>' : '') + '</div>';
        h += '<div class="lp-opts' + (cfg.emo ? ' lr-emo' : '') + '" role="radiogroup">';
        cfg.options.forEach(function (o, i) { h += '<button class="lp-opt' + (cfg.emo ? ' lr-emoopt' : '') + '" role="radio" aria-checked="false" data-i="' + i + '"' + (cfg.emo ? ' aria-label="Alternativ ' + (i + 1) + '"' : '') + '><kbd>' + (i + 1) + '</kbd><span>' + esc(o.t) + '</span></button>'; });
        h += '</div>';
        if (!cfg.noHint) h += '<button class="lr-hintbtn" id="lr-hint" type="button">💡 Hint</button>';
        body.innerHTML = h; self.sel = -1; self.locked = false;
        var btns = body.querySelectorAll('.lp-opt'); self.btns = btns;
        Array.prototype.forEach.call(btns, function (b) {
          b.addEventListener('click', function () {
            if (self.locked) return; self.sel = +b.getAttribute('data-i');
            Array.prototype.forEach.call(btns, function (x) { x.classList.remove('lp-sel'); x.setAttribute('aria-checked', 'false'); });
            b.classList.add('lp-sel'); b.setAttribute('aria-checked', 'true'); api.ready(true);
          });
        });
        var play = function (rate) { playUnit(cfg.sayId, cfg.sayText || cfg.hear, { rate: rate }); };
        if (cfg.hear) { $('lr-play').onclick = function () { playUnit(cfg.sayId, cfg.hear, { rate: .85 }); }; $('lr-slow').onclick = function () { playUnit(cfg.sayId, cfg.hear, { rate: .6 }); }; setTimeout(function () { playUnit(cfg.sayId, cfg.hear, { rate: .85 }); }, 300); }
        if ($('lr-say')) $('lr-say').onclick = function () { playUnit(cfg.sayId, cfg.sayText || cfg.npc, { rate: .85, pitch: cfg.pitch }); };
        if ($('lr-showno')) $('lr-showno').onclick = function () { $('lr-npcno').hidden = false; this.hidden = true; };
        if (cfg.npc) setTimeout(function () { playUnit(cfg.sayId, cfg.npc, { rate: .85, pitch: cfg.pitch }); }, 300);
        if ($('lr-hint')) $('lr-hint').onclick = function () {
          if (self.locked) return; var wrong = []; cfg.options.forEach(function (o, i) { if (!o.ok && !btns[i].disabled) wrong.push(i); });
          if (wrong.length > 1) { var i = pick(wrong); btns[i].disabled = true; btns[i].classList.add('lr-dim'); if (self.sel === i) { self.sel = -1; api.ready(false); } this.textContent = '💡 Én ble fjernet'; if (wrong.length <= 2) this.disabled = true; }
        };
        if (cfg.after) cfg.after(body, self);
      },
      check: function () {
        var self = this, ok = cfg.options[self.sel].ok; self.locked = true;
        Array.prototype.forEach.call(self.btns, function (b, i) { b.disabled = true; if (cfg.options[i].ok) b.classList.add('lp-ok'); else if (i === self.sel) b.classList.add('lp-no'); b.classList.remove('lp-sel'); });
        return { ok: ok, ans: cfg.ans, note: (ok ? cfg.noteOk : cfg.noteBad) || cfg.note };
      },
      pickKey: function (n) { if (this.locked || n < 1 || n > cfg.options.length || this.btns[n - 1].disabled) return false; this.btns[n - 1].click(); return true; }
    };
  }

  function mkOpts(cx, tid, others, getT) {
    var o = [{ t: getT(C(cx, tid)), ok: true, cid: tid }];
    others.forEach(function (id) { o.push({ t: getT(C(cx, id)), ok: false, cid: id }); });
    return shuffle(o);
  }
  function base(cx, tid) { return { w: cx.w, tid: tid, lesson: cx.lesson }; }
  function extend(a, b) { for (var k in b) a[k] = b[k]; return a; }

  /* Gjett: nytt ord vises som riktig alternativ, de andre er ord eleven allerede kan. Ingen feil telles. */
  function fGuess(cx, tid) {
    var c = C(cx, tid), oth = distract(cx, tid, nOpts(cx) - 1, null, function (x) { return x.no; });
    if (oth.length < 2) return null;
    var cfg = extend(base(cx, tid), { type: 'guess', unscored: true, tip: 'guess', q: 'Gjett: hva tror du dette betyr?', big: c.de, sayText: sayOf(c), sayId: tid, em: c.em && c.pic ? '' : '',
      options: mkOpts(cx, tid, oth, function (x) { return x.no; }), ans: c.de + ' = ' + c.no, uses: oth, target: tid, skill: 'lesen', noHint: true, glossBig: false,
      noteOk: 'Bra gjettet!', noteBad: 'Det var en vanskelig en. Nå vet du det.', make: function () { return fGuess(cx, tid); } });
    return exMC(cfg);
  }
  function fDeNo(cx, tid, review) {
    var c = C(cx, tid), oth = distract(cx, tid, nOpts(cx) - 1, null, function (x) { return x.no; });
    return exMC(extend(base(cx, tid), { q: 'Hva betyr dette?', big: c.de, sayText: sayOf(c), sayId: tid, options: mkOpts(cx, tid, oth, function (x) { return x.no; }), ans: c.de + ' = ' + c.no, uses: [tid].concat(oth), skill: 'lesen', review: review, hint: c.hint, make: function () { return fDeNo(cx, tid, review); } }));
  }
  function fNoDe(cx, tid, review) {
    var c = C(cx, tid), oth = distract(cx, tid, nOpts(cx) - 1, null, function (x) { return x.de; });
    return exMC(extend(base(cx, tid), { q: 'Hvordan sier du «' + c.no + '» på tysk?', options: mkOpts(cx, tid, oth, function (x) { return x.de; }), ans: c.de, uses: [tid].concat(oth), skill: 'lesen', review: review, make: function () { return fNoDe(cx, tid, review); } }));
  }
  function fHearNo(cx, tid, review) {
    var c = C(cx, tid), oth = distract(cx, tid, nOpts(cx) - 1, null, function (x) { return x.no; });
    return exMC(extend(base(cx, tid), { q: 'Hør etter. Hva betyr det?', hear: sayOf(c), sayId: tid, options: mkOpts(cx, tid, oth, function (x) { return x.no; }), ans: c.de + ' = ' + c.no, uses: [tid].concat(oth), skill: 'hoeren', review: review, make: function () { return fHearNo(cx, tid, review); } }));
  }
  function fHearDe(cx, tid, review) {
    var c = C(cx, tid), oth = distract(cx, tid, nOpts(cx) - 1, null, function (x) { return x.de; });
    return exMC(extend(base(cx, tid), { q: 'Hør etter. Hva sier hun?', hear: sayOf(c), sayId: tid, options: mkOpts(cx, tid, oth, function (x) { return x.de; }), ans: c.de, noteOk: c.no, noteBad: c.no, uses: [tid].concat(oth), skill: 'hoeren', review: review, make: function () { return fHearDe(cx, tid, review); } }));
  }
  function picOK(cx, id) { var c = C(cx, id); return c.pic && c.em; }
  function fHearEmoji(cx, tid, review) {
    var c = C(cx, tid);
    if (!picOK(cx, tid)) return fHearNo(cx, tid, review);
    var oth = distract(cx, tid, nOpts(cx) - 1, function (x) { return x.pic && x.em; }, function (x) { return x.em; });
    if (oth.length < 2) return fHearNo(cx, tid, review);
    return exMC(extend(base(cx, tid), { q: 'Hør etter. Hvilket bilde passer?', hear: sayOf(c), sayId: tid, emo: true, options: mkOpts(cx, tid, oth, function (x) { return x.em; }), ans: c.de + ' = ' + c.no, uses: [tid].concat(oth), skill: 'hoeren', review: review, make: function () { return fHearEmoji(cx, tid, review); } }));
  }
  function fHear(cx, tid, review) {
    if (cx.level === 'basis') return fHearEmoji(cx, tid, review);
    if (cx.level === 'hard') return fHearDe(cx, tid, review);
    return pick([fHearNo, fHearDe, fHearEmoji])(cx, tid, review);
  }

  /* hører en hel setning og velger mellom setninger eleven kjenner */
  function fHearSent(cx, item, uid) {
    var opts = shuffle([{ t: item.ok, ok: true }].concat(item.bad.map(function (b) { return { t: b, ok: false }; })));
    if (cx.level === 'basis' && opts.length > 3) opts = opts.slice(0, 3);
    return exMC({ w: cx.w, lesson: cx.lesson, q: 'Hør etter. Hva sier hun?', hear: item.say, sayId: uid, options: opts, ans: item.ok, uses: [], skill: 'hoeren', sents: [item.say].concat(item.bad), make: function () { return fHearSent(cx, item, uid); } });
  }

  /* par */
  function fMatch(cx, ids, review) {
    var make = function () { return fMatch(cx, ids, review); };
    return {
      type: 'match', make: make, noCheck: true, skill: 'lesen', uses: ids.slice(), tid: null, tids: ids.slice(), lesson: cx.lesson, review: !!review, tip: 'match',
      pairs: ids.map(function (id) { return [id, C(cx, id).de, C(cx, id).no]; }),
      render: function (body, api) {
        var L = shuffle(ids), R = shuffle(ids), selL = null, selR = null, left = ids.length, flawed = false, lock = false;
        body.innerHTML = (review ? '<div class="lr-tag">🔁 Repetisjon</div>' : '') + '<div class="lp-q">Finn parene</div><div class="lp-match"><div class="lp-opts" id="lr-ml"></div><div class="lp-opts" id="lr-mr"></div></div>';
        function mk(col, items, side) {
          items.forEach(function (id) {
            var c = C(cx, id), b = document.createElement('button'); b.className = 'lp-opt'; b.type = 'button';
            b.textContent = side === 'L' ? c.de : c.no; b.setAttribute('data-k', id);
            b.addEventListener('click', function () {
              if (lock || b.classList.contains('lp-gone')) return;
              if (side === 'L') { if (selL) selL.classList.remove('lp-sel'); selL = b; } else { if (selR) selR.classList.remove('lp-sel'); selR = b; }
              b.classList.add('lp-sel');
              if (selL && selR) {
                var okp = selL.getAttribute('data-k') === selR.getAttribute('data-k'), a = selL, cc = selR; selL = selR = null; lock = true;
                if (okp) { a.classList.remove('lp-sel'); cc.classList.remove('lp-sel'); a.classList.add('lp-ok'); cc.classList.add('lp-ok'); sfx('ok'); if (side) playUnit(a.getAttribute('data-k'), sayOf(C(cx, a.getAttribute('data-k')))); setTimeout(function () { a.classList.add('lp-gone'); cc.classList.add('lp-gone'); lock = false; left--; if (!left) api.matchDone(flawed); }, 450); }
                else { a.classList.add('lp-no'); cc.classList.add('lp-no'); if (!flawed) { flawed = true; api.lose(ids); } else sfx('bad'); setTimeout(function () { a.classList.remove('lp-no', 'lp-sel'); cc.classList.remove('lp-no', 'lp-sel'); lock = false; }, 520); }
              }
            });
            $(col).appendChild(b);
          });
        }
        mk('lr-ml', L, 'L'); mk('lr-mr', R, 'R');
      }
    };
  }

  /* skriving. cfg: q, ans, accept(fn), pre, hear, sayId, hint, tid, skill */
  function exType(cfg) {
    return {
      type: 'type', skill: cfg.skill, tid: cfg.tid, tids: cfg.tids, uses: cfg.uses || [], solution: cfg.ans, lesson: cfg.lesson, review: !!cfg.review, make: cfg.make, tip: 'type',
      render: function (body, api) {
        var h = (cfg.review ? '<div class="lr-tag">🔁 Repetisjon</div>' : '') + '<div class="lp-q">' + esc(cfg.q) + '</div>';
        if (cfg.hear) h += '<button class="lp-bigsay" id="lr-play" aria-label="Spill av lyden">🔊</button><button class="lp-slow" id="lr-slow">🐢 Spill saktere</button>';
        if (cfg.big) h += '<div class="lp-bigword"><span>' + esc(cfg.big) + '</span></div>';
        h += '<input class="lp-input" id="lr-in" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="de" aria-label="Svar" placeholder="' + esc(cfg.placeholder || 'Skriv på tysk …') + '">';
        h += '<div class="lp-chars" aria-label="Spesialtegn">' + ['ä', 'ö', 'ü', 'ß'].map(function (c) { return '<button type="button" data-c="' + c + '">' + c + '</button>'; }).join('') + '</div>';
        h += '<p class="lp-hint" id="lr-pat">' + (cfg.pattern && cfg.level === 'basis' ? 'Tips: ' + esc(cfg.pattern) : '') + '</p><button class="lr-hintbtn" id="lr-hint" type="button">💡 Hint</button>';
        body.innerHTML = h; var inp = $('lr-in'); this.inp = inp;
        inp.addEventListener('input', function () { api.ready(inp.value.trim().length > 0); });
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); api.primary(); } });
        Array.prototype.forEach.call(body.querySelectorAll('.lp-chars button'), function (b) { b.addEventListener('click', function () { var s = inp.selectionStart || inp.value.length; inp.value = inp.value.slice(0, s) + b.getAttribute('data-c') + inp.value.slice(inp.selectionEnd || s); inp.focus(); inp.setSelectionRange(s + 1, s + 1); api.ready(true); }); });
        $('lr-hint').onclick = function () { if (cfg.pattern) { $('lr-pat').textContent = 'Tips: ' + cfg.pattern; this.disabled = true; } };
        if (cfg.hear) { $('lr-play').onclick = function () { playUnit(cfg.sayId, cfg.hear, { rate: .85 }); }; $('lr-slow').onclick = function () { playUnit(cfg.sayId, cfg.hear, { rate: .6 }); }; setTimeout(function () { playUnit(cfg.sayId, cfg.hear, { rate: .85 }); }, 300); }
        else setTimeout(function () { inp.focus(); }, 60);
      },
      check: function () {
        var v = this.inp.value, ok = cfg.accept ? cfg.accept(v) : same(v, cfg.ans); this.inp.readOnly = true; this.inp.classList.add(ok ? 'lp-ok' : 'lp-no');
        var note = cfg.note || '';
        if (ok && cfg.ans.match(/[äöüß]/i) && !/[äöüß]/i.test(v) && fold(v) !== fold(cfg.ans)) note = 'Husk prikkene: ' + cfg.ans;
        return { ok: ok, ans: cfg.ans, note: note };
      }
    };
  }
  function pattern(s) { return s.split(' ').map(function (w) { return w.charAt(0) + new Array(w.length).join('_'); }).join(' '); }
  function fTypeDe(cx, tid, review) {
    var c = C(cx, tid);
    return exType({ w: cx.w, lesson: cx.lesson, tid: tid, uses: [tid], skill: 'schreiben', review: review, level: cx.level, q: 'Skriv på tysk: «' + c.no + '»', big: c.nw ? c.no + ' (' + c.nw + ')' : '', ans: c.de, pattern: pattern(c.de), make: function () { return fTypeDe(cx, tid, review); } });
  }
  function fDictate(cx, tid, review) {
    var c = C(cx, tid), uid = tid;
    return exType({ w: cx.w, lesson: cx.lesson, tid: tid, uses: [tid], skill: 'hoeren', review: review, level: cx.level, q: 'Hør etter og skriv det du hører', hear: sayOf(c), sayId: uid, ans: c.de, pattern: pattern(c.de), note: c.no, make: function () { return fDictate(cx, tid, review); } });
  }
  function fDictNum(cx, seq, uid) {
    var ans = seq.map(function (id) { return C(cx, id).no; }).join(''), say = seq.map(function (id) { return C(cx, id).de; }).join(', ');
    return exType({ w: cx.w, lesson: cx.lesson, tid: null, tids: seq, uses: seq.slice(), skill: 'hoeren', level: cx.level, q: 'Hør etter og skriv tallene med siffer', hear: say, sayId: uid, ans: ans, placeholder: 'Skriv sifrene …', note: say,
      accept: function (v) { return v.replace(/[^0-9]/g, '') === ans; }, pattern: new Array(ans.length + 1).join('_ ').trim(), make: function () { return fDictNum(cx, seq, uid); } });
  }
  function fTypeSent(cx, no, de) {
    return exType({ w: cx.w, lesson: cx.lesson, uses: [], skill: 'schreiben', level: cx.level, q: 'Skriv på tysk', big: no, ans: de, pattern: pattern(de.replace(/[.,!?]/g, '')), make: function () { return fTypeSent(cx, no, de); }, sents: [de] });
  }
  function fSpell(cx, item, uid) {
    return exType({ w: cx.w, lesson: cx.lesson, uses: [], skill: 'hoeren', level: cx.level, q: 'Hør bokstavene og skriv navnet', hear: item.say, sayId: uid, ans: item.name, pattern: pattern(item.name), make: function () { return fSpell(cx, item, uid); } });
  }

  /* setningsbygger */
  function fBuild(cx, de, no, uid) {
    var toksO = words(de), ansF = toksO.map(fold);
    var pool = [];
    Object.keys(cx.K).forEach(function (id) { words(C(cx, id).de.replace(/…/g, '')).forEach(function (w) { var f = fold(w); if (w.length >= 2 && ansF.indexOf(f) < 0 && pool.indexOf(w) < 0 && w === w.toLowerCase()) pool.push(w); }); });
    var nx = cx.level === 'basis' ? 0 : (cx.level === 'std' ? 1 : 2);
    var extra = shuffle(pool).slice(0, nx);
    return {
      type: 'build', skill: 'schreiben', tid: null, uses: [], tokens: toksO.concat(extra), lesson: cx.lesson, make: function () { return fBuild(cx, de, no, uid); }, solution: toksO.join(' '), tip: 'build', sents: [de],
      render: function (body, api) {
        var self = this; self.ans = []; self.locked = false;
        var tiles = shuffle(toksO.concat(extra).map(function (t, i) { return { t: t, id: i }; }));
        var h = '<div class="lp-q">Sett sammen setningen på tysk</div><div class="lp-bigword lr-build-no"><span>' + esc(no) + '</span></div><div class="lp-ans" id="lr-ans" aria-label="Din setning"></div><div class="lp-bank" id="lr-bank"></div><button class="lr-hintbtn" id="lr-hint" type="button">💡 Hint</button>';
        body.innerHTML = h; var ansEl = $('lr-ans'), bank = $('lr-bank'); self.tileEls = [];
        function redraw() { api.ready(self.ans.length > 0); }
        tiles.forEach(function (tl) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'lp-tile'; b.textContent = tl.t; var inAns = false; self.tileEls.push({ el: b, t: tl.t });
          b.addEventListener('click', function () {
            if (self.locked || inAns) return; inAns = true; self.ans.push(tl); var c = document.createElement('button'); c.type = 'button'; c.className = 'lp-tile'; c.textContent = tl.t;
            c.addEventListener('click', function () { if (self.locked) return; inAns = false; self.ans = self.ans.filter(function (x) { return x !== tl; }); c.remove(); b.classList.remove('lp-used'); redraw(); });
            ansEl.appendChild(c); b.classList.add('lp-used'); redraw();
          });
          bank.appendChild(b);
        });
        $('lr-hint').onclick = function () {
          var n = self.ans.length, want = toksO[n]; if (want === undefined || self.locked) return;
          var t = self.tileEls.filter(function (x) { return x.t === want && !x.el.classList.contains('lp-used'); })[0]; if (t) { t.el.classList.add('lr-glow'); setTimeout(function () { t.el.classList.remove('lr-glow'); }, 1800); }
        };
      },
      check: function () {
        this.locked = true; var got = this.ans.map(function (x) { return x.t; }).join(' '), ok = fold(got) === fold(toksO.join(' '));
        $('lr-ans').style.background = ok ? '#e6f4e7' : '#fdeaea'; return { ok: ok, ans: de, note: '' };
      }
    };
  }

  /* samtale (Entdecken) */
  function fScene(cx, L) {
    return {
      type: 'scene', unscored: true, noCheck: true, cont: 'Fortsett', tip: 'scene', uses: [], lesson: cx.lesson,
      render: function (body, api) {
        var w = cx.w, show = cx.level === 'basis';
        var h = '<div class="lp-q">Hør samtalen</div><p class="lp-hint">' + esc(L.intro) + '</p><div class="lr-scenebtns"><button class="lr-pill" id="lr-playall">▶ Spill av samtalen</button><button class="lr-pill" id="lr-togno" aria-pressed="' + show + '">🇳🇴 ' + (show ? 'Skjul norsk' : 'Vis norsk') + '</button></div><div class="lr-scene">';
        L.scene.forEach(function (ln, i) {
          h += '<div class="lr-bub lr-b' + (i % 2) + '"><div class="lr-av" aria-hidden="true">' + ln.em + '</div><div><div class="lr-who">' + esc(ln.who) + '</div><div class="lr-de">' + glossHTML(ln.de, w) + ' <button class="lp-say" data-i="' + i + '" aria-label="Hør linjen">🔊</button></div><div class="lr-no"' + (show ? '' : ' hidden') + '>' + esc(ln.no) + '</div></div></div>';
        });
        h += '</div><p class="lp-hint">Trykk på et tysk ord for å se hva det betyr.</p>';
        body.innerHTML = h;
        var pitch = { 'Lea': 1.25, 'Max': .9, 'Tom': 1.05, 'Herr Weber': .75, 'Mama': 1.15, 'Mia': 1.3 };
        function say(i, cb) { var ln = L.scene[i]; playUnit(L.id + '_s' + (i + 1), ln.de, { rate: .85, pitch: pitch[ln.who] || 1, onend: cb }); }
        Array.prototype.forEach.call(body.querySelectorAll('.lp-say'), function (b) { b.onclick = function () { say(+b.getAttribute('data-i')); }; });
        $('lr-playall').onclick = function () { var i = 0; (function nx() { if (i >= L.scene.length) return; say(i++, function () { setTimeout(nx, 350); }); })(); };
        $('lr-togno').onclick = function () { var on = this.getAttribute('aria-pressed') !== 'true'; this.setAttribute('aria-pressed', on); this.textContent = '🇳🇴 ' + (on ? 'Skjul norsk' : 'Vis norsk'); Array.prototype.forEach.call(body.querySelectorAll('.lr-no'), function (e) { e.hidden = !on; }); };
        api.cont('Fortsett');
      }
    };
  }
  /* lær-kort for 1–3 uttrykk. Når eleven går videre, regnes uttrykkene som innført. */
  function fLearn(cx, ids) {
    return {
      type: 'learn', unscored: true, noCheck: true, learn: ids.slice(), tip: 'learn', uses: ids.slice(), lesson: cx.lesson,
      render: function (body, api) {
        var h = '<div class="lp-q">Lær disse uttrykkene</div><div class="lr-cards">';
        ids.forEach(function (id) {
          var c = C(cx, id);
          h += '<div class="lr-card"><div class="lr-cem" aria-hidden="true">' + (c.em && !c.nw ? c.em : (c.nw ? esc(c.no) : c.em)) + '</div><div class="lr-cde">' + esc(c.de) + ' <button class="lp-say" data-id="' + id + '" aria-label="Hør ' + esc(sayOf(c)) + '">🔊</button></div><div class="lr-cno">' + esc(c.nw ? c.nw : c.no) + '</div>' + (c.hint ? '<div class="lr-chint">' + esc(c.hint) + '</div>' : '') + '</div>';
        });
        h += '</div>';
        body.innerHTML = h;
        Array.prototype.forEach.call(body.querySelectorAll('.lp-say'), function (b) { b.onclick = function () { var id = b.getAttribute('data-id'); playUnit(id, sayOf(C(cx, id)), { rate: .8 }); }; });
        setTimeout(function () { var i = 0; (function nx() { if (i >= ids.length) return; var id = ids[i++]; playUnit(id, sayOf(C(cx, id)), { rate: .8, onend: function () { setTimeout(nx, 250); } }); })(); }, 350);
        api.cont('Jeg har lest dem');
      }
    };
  }

  /* tale: hør modellen, si det høyt, ta eventuelt opp deg selv og vurder selv */
  function fSpeak(cx, item, uid) {
    return {
      type: 'speak', skill: 'sprechen', unscored: true, noCheck: true, uses: [], tip: 'speak', lesson: cx.lesson, sents: [item.de], make: null,
      render: function (body, api) {
        var h = '<div class="lp-q">Si det høyt</div><div class="lr-sit"><span aria-hidden="true">🎤</span> Hør først, og si så setningen selv. Opptaket blir bare på denne enheten.</div>';
        h += '<div class="lp-bigword"><span>' + esc(item.de) + '</span><button class="lp-say" id="lr-model" aria-label="Hør modellen">🔊</button></div><p class="lp-hint">' + esc(item.no) + '</p>';
        h += '<div class="lr-recrow"><button class="lr-pill" id="lr-rec">🎙️ Ta opp</button><button class="lr-pill" id="lr-play2" hidden>▶ Hør deg selv</button><button class="lr-pill" id="lr-norec">Si det uten opptak</button></div><div class="lr-recmsg" id="lr-recmsg" role="status"></div>';
        h += '<div class="lr-assess" id="lr-assess" hidden><p>Hvordan gikk det?</p><button class="lp-btn" id="lr-good">Jeg sa det riktig</button><button class="lp-btn lp-ghost" id="lr-retry">Jeg vil prøve igjen</button></div>';
        body.innerHTML = h; var recording = false, tries = 0;
        var say = function () { playUnit(uid, item.say || sayOf({ de: item.de }), { rate: .85 }); };
        $('lr-model').onclick = say; setTimeout(say, 300);
        function showAssess() { $('lr-assess').hidden = false; }
        $('lr-norec').onclick = function () { $('lr-recmsg').textContent = 'Si setningen høyt nå, og vurder deg selv.'; showAssess(); };
        $('lr-rec').onclick = function () {
          if (!recSupported()) { $('lr-recmsg').textContent = 'Opptak støttes ikke her. Si setningen høyt uten opptak, og vurder deg selv.'; showAssess(); return; }
          if (recording) { recStop(); return; }
          recording = true; this.textContent = '⏹ Stopp'; this.classList.add('lr-live'); $('lr-recmsg').textContent = 'Tar opp …';
          recStart(function (url) { recording = false; $('lr-rec').textContent = '🎙️ Ta opp igjen'; $('lr-rec').classList.remove('lr-live'); $('lr-recmsg').textContent = 'Hør deg selv og sammenlign med modellen.'; $('lr-play2').hidden = false; $('lr-play2').onclick = function () { var a = new Audio(url); a.play(); }; showAssess(); },
            function () { recording = false; $('lr-rec').textContent = '🎙️ Ta opp'; $('lr-rec').classList.remove('lr-live'); $('lr-recmsg').textContent = 'Nettleseren fikk ikke bruke mikrofonen. Si setningen høyt uten opptak, og vurder deg selv.'; showAssess(); });
        };
        $('lr-good').onclick = function () { recRelease(); api.speakDone(true, this); };
        $('lr-retry').onclick = function () { tries++; $('lr-assess').hidden = true; $('lr-recmsg').textContent = tries >= 2 ? 'Du kan prøve en gang til, eller gå videre når du er klar.' : ''; if (tries >= 2) { $('lr-assess').hidden = false; $('lr-retry').textContent = 'Gå videre uansett'; $('lr-retry').onclick = function () { recRelease(); api.speakDone(false, this); }; } };
      }
    };
  }
  /* mini-oppdrag: velg riktig svar i en situasjon */
  function fReply(cx, t, uid) {
    var opts = shuffle([{ t: t.ok, ok: true }].concat(t.bad.map(function (b) { return { t: b, ok: false }; })));
    return exMC({ w: cx.w, lesson: cx.lesson, type: 'reply', skill: 'sprechen', q: 'Hva sier du?', situation: t.sit, situationEm: t.em, npc: t.npc, npcWho: t.who, npcEm: t.pem, npcNo: t.npcno, sayId: uid, pitch: 1.1, options: opts, ans: t.ok, note: t.why, uses: [], noHint: false, tip: 'reply', sents: [t.npc, t.ok].concat(t.bad), make: function () { return fReply(cx, t, uid); } });
  }
  /* kort lesetekst + spørsmål */
  function fRead(cx, rd, qi) {
    var q = rd.qs[qi], opts = shuffle([{ t: q.ok, ok: true }].concat(q.bad.map(function (b) { return { t: b, ok: false }; })));
    var pre = '<div class="lr-text" aria-label="Teksten"><div class="lr-texttitle">' + esc(rd.title) + '</div>' + rd.lines.map(function (l) { return '<p><b>' + esc(l[0]) + ':</b> ' + glossHTML(l[1], cx.w) + '</p>'; }).join('') + '</div>';
    return exMC({ w: cx.w, lesson: cx.lesson, skill: 'lesen', q: q.q, pre: pre, options: opts, ans: q.ok, uses: [], sents: rd.lines.map(function (l) { return l[1]; }), tip: 'read', make: function () { return fRead(cx, rd, qi); } });
  }
  /* «Kan jeg det nå?» */
  function fCan(cx, L) {
    return {
      type: 'can', unscored: true, noCheck: true, tip: 'can', uses: [], lesson: cx.lesson, can: true,
      render: function (body, api) {
        var h = '<div class="lp-q">Kan jeg det nå?</div><p class="lp-hint">Vær ærlig. Det er bare du som ser svaret.</p>';
        L.can.forEach(function (s, i) { h += '<div class="lr-can" role="group" aria-label="' + esc(s) + '"><div class="lr-canq">' + esc(s) + '</div><div class="lr-canb"><button data-i="' + i + '" data-v="2">Ja</button><button data-i="' + i + '" data-v="1">Litt usikker</button><button data-i="' + i + '" data-v="0">Ikke ennå</button></div></div>'; });
        body.innerHTML = h; var ans = {};
        Array.prototype.forEach.call(body.querySelectorAll('.lr-canb button'), function (b) {
          b.onclick = function () { var i = b.getAttribute('data-i'); ans[i] = +b.getAttribute('data-v'); Array.prototype.forEach.call(b.parentNode.children, function (x) { x.classList.remove('lr-on'); x.setAttribute('aria-pressed', 'false'); }); b.classList.add('lr-on'); b.setAttribute('aria-pressed', 'true'); if (Object.keys(ans).length === L.can.length) api.cont('Ferdig', function () { api.setCan(L.can.map(function (_, k) { return ans[k]; })); }); };
        });
      }
    };
  }

  /* ================= sammensetning av leksjoner ================= */
  function lessonChunks(w, L) { var o = []; (L.groups || []).forEach(function (g) { g.forEach(function (id) { o.push(id); }); }); return o; }
  function knownBefore(w, idx) { var K = {}; for (var i = 0; i < idx; i++) { var n = w.lessons[i]; if (n.t === 'lesson') lessonChunks(w, n).forEach(function (id) { K[id] = 1; }); } return K; }
  function snap(w, K, level, lessonId) { var k = {}; for (var x in K) k[x] = 1; return { w: w, K: k, level: level, lesson: lessonId }; }
  function dueList(w, exclude, n) {
    var ids = Object.keys(S.words).filter(function (id) { return w.V[id] && !exclude[id]; });
    ids.sort(function (a, b) { var A = S.words[a], B = S.words[b], da = A.due <= today() ? 0 : 1, db = B.due <= today() ? 0 : 1; return da - db || A.box - B.box || (Math.random() - .5); });
    return ids.slice(0, n);
  }

  function assembleLesson(w, idx, level, trace) {
    var L = w.lessons[idx], K = knownBefore(w, idx), steps = [], earlier = Object.keys(K);
    function push(ex, part, cx) { if (!ex) return; ex.part = part; steps.push(ex); if (trace) trace.push({ ex: ex, K: Object.keys(K), part: part }); }
    var cx0 = snap(w, K, level, L.id);
    push(fScene(cx0, L), 'laer', cx0);
    var chunks = lessonChunks(w, L), first = true;
    L.groups.forEach(function (g, gi) {
      var cxg = snap(w, K, level, L.id);
      /* Gjett: nye uttrykk gjettes ved utelukkelse mot uttrykk eleven allerede kan */
      g.slice(0, 2).forEach(function (id) { if (Object.keys(K).length >= 2) { var ex = fGuess(cxg, id); if (ex) { ex.targetNew = id; push(ex, 'laer', cxg); } } });
      push(fLearn(cxg, g), 'laer', cxg);
      g.forEach(function (id) { K[id] = 1; });
      var cx = snap(w, K, level, L.id), drills = [], long = L.groups.length > 3;
      if (g.length >= 3) {
        drills.push(fHear(cx, pick(g)));
        var pairs = g.slice(); var oldp = earlier.filter(function (id) { return !w.V[id].avoid || true; }); if (oldp.length) pairs.push(pick(oldp));
        drills.push(fMatch(cx, uniq(pairs).slice(0, 4)));
      } else if (g.length === 2) {
        drills.push(fDeNo(cx, g[0])); if (!long) drills.push(level === 'hard' && typeable(w.V[g[1]]) ? fTypeDe(cx, g[1]) : fNoDe(cx, g[1]));
      } else { drills.push(fDeNo(cx, g[0])); if (!long) drills.push(fHear(cx, g[0])); }
      drills.forEach(function (ex) { push(ex, 'oev', cx); });
    });
    var cxAll = snap(w, K, level, L.id), mine = chunks.slice();
    /* en blandet runde */
    var mixN = L.groups.length > 3 ? 0 : 1;
    shuffle(mine).slice(0, mixN).forEach(function (id, i) { push(i % 2 ? fHear(cxAll, id) : fNoDe(cxAll, id), 'oev', cxAll); });
    /* bygg setninger */
    var bn = level === 'hard' ? 3 : 2;
    shuffle(L.builds || []).slice(0, bn).forEach(function (b) { push(fBuild(cxAll, b[0], b[1]), 'oev', cxAll); });
    /* Erinnerung: uttrykk fra tidligere leksjoner som er klare for repetisjon */
    if (earlier.length) {
      var ex0 = {}; mine.forEach(function (id) { ex0[id] = 1; });
      var due = dueList(w, ex0, 99).filter(function (id) { return K[id] && !ex0[id]; }).slice(0, 2);
      if (due.length < 2) { var more = shuffle(earlier).filter(function (id) { return due.indexOf(id) < 0; }).slice(0, 2 - due.length); due = due.concat(more); }
      due.forEach(function (id, i) { push(i % 2 ? fHear(cxAll, id, true) : fDeNo(cxAll, id, true), 'oev', cxAll); });
    }
    /* Bruk: hovedferdighet + liten tale + mini-oppdrag */
    var sk = L.skill, bruk = [];
    if (L.listen) L.listen.forEach(function (it, i) { bruk.push(fHearSent(cxAll, it, L.id + '_h' + (i + 1))); });
    if (L.dict_ids) L.dict_ids.forEach(function (id) { bruk.push(fDictate(cxAll, id)); });
    if (L.spell) L.spell.forEach(function (it, i) { bruk.push(fSpell(cxAll, it, L.id + '_sp' + (i + 1))); });
    if (L.numseq) shuffle(L.numseq).slice(0, sk === 'hoeren' ? 2 : 1).forEach(function (sq) { bruk.push(fDictNum(cxAll, sq, L.id + '_n' + (L.numseq.indexOf(sq) + 1))); });
    if (L.numwrite) L.numwrite.forEach(function (id) { bruk.push(fTypeDe(cxAll, id)); });
    if (L.writes) L.writes.forEach(function (p) { bruk.push(fTypeSent(cxAll, p[0], p[1])); });
    if (L.read) L.read.qs.forEach(function (q, qi) { bruk.push(fRead(cxAll, L.read, qi)); });
    if (sk === 'hoeren' && !bruk.length) shuffle(mine).slice(0, 3).forEach(function (id) { bruk.push(fHearDe(cxAll, id)); });
    if (bruk.length > 4) bruk = bruk.slice(0, 4);
    bruk.forEach(function (ex) { push(ex, 'bruk', cxAll); });
    var sp = (L.speak || []).slice(0, sk === 'sprechen' ? 3 : 1);
    sp.forEach(function (it, i) { push(fSpeak(cxAll, it, L.id + '_m' + (i + 1)), 'bruk', cxAll); });
    (L.mission ? L.mission.turns.slice(0, 2) : []).forEach(function (t, i) { push(fReply(cxAll, t, L.id + '_r' + (i + 1)), 'bruk', cxAll); });
    push(fCan(cxAll, L), 'bruk', cxAll);
    return steps;
  }

  /* hjelpere for repetisjon og prøve */
  function chunksOfLessons(w, ids) { var o = []; w.lessons.forEach(function (n) { if (n.t === 'lesson' && ids.indexOf(n.id) >= 0) lessonChunks(w, n).forEach(function (id) { o.push({ id: id, lesson: n.id }); }); }); return o; }
  function allKnown(w) { var K = {}; w.lessons.forEach(function (n) { if (n.t === 'lesson') lessonChunks(w, n).forEach(function (id) { K[id] = 1; }); }); return K; }
  function weightSort(list) { return list.slice().sort(function (a, b) { var A = S.words[a.id], B = S.words[b.id]; return ((A ? A.box : 0) + Math.random() * 1.8) - ((B ? B.box : 0) + Math.random() * 1.8); }); }
  function lessonOf(w, id) { var r = ''; w.lessons.forEach(function (n) { if (n.t === 'lesson' && lessonChunks(w, n).indexOf(id) >= 0) r = n.id; }); return r; }
  function lessonsById(w, ids) { return w.lessons.filter(function (n) { return n.t === 'lesson' && ids.indexOf(n.id) >= 0; }); }
  function typeable(c) { return c.de.indexOf('…') < 0; }

  function assembleReview(w, node, level) {
    var K = {}, from = node.from; var pool = chunksOfLessons(w, from);
    var lessonsIn = lessonsById(w, from);
    /* alt eleven har møtt til nå er kjent (inkl. tidligere leksjoner) */
    var idx = w.lessons.indexOf(node), K0 = knownBefore(w, idx); Object.keys(K0).forEach(function (id) { K[id] = 1; });
    var cx = snap(w, K, level, node.id), list = weightSort(pool), steps = [];
    var take = function (n, f) { list.slice(0, n).forEach(function (o) { var ex = f(cx, o.id); if (ex) { ex.lesson = o.lesson; steps.push(ex); } }); list = list.slice(n).concat(list.slice(0, n)); };
    take(3, function (c, id) { return fHear(c, id); });
    take(2, function (c, id) { return fDeNo(c, id); });
    take(2, function (c, id) { return fNoDe(c, id); });
    var typ = list.filter(function (o) { return typeable(w.V[o.id]); }); typ.slice(0, 2).forEach(function (o) { var ex = fTypeDe(cx, o.id); ex.lesson = o.lesson; steps.push(ex); });
    var mt = uniq(list.slice(0, 4).map(function (o) { return o.id; })); if (mt.length >= 3) steps.push(fMatch(cx, mt.slice(0, 4)));
    var bl = []; lessonsIn.forEach(function (n) { (n.builds || []).forEach(function (b) { bl.push({ b: b, l: n.id }); }); });
    shuffle(bl).slice(0, 2).forEach(function (o) { var ex = fBuild(cx, o.b[0], o.b[1]); ex.lesson = o.l; steps.push(ex); });
    var nl = lessonsIn.filter(function (n) { return n.numseq; })[0]; if (nl) { var sq0 = pick(nl.numseq), ex = fDictNum(cx, sq0, nl.id + '_n' + (nl.numseq.indexOf(sq0) + 1)); ex.lesson = nl.id; steps.push(ex); }
    var tl = []; lessonsIn.forEach(function (n) { if (n.mission) n.mission.turns.forEach(function (t, i) { tl.push({ t: t, l: n.id, i: i }); }); });
    if (tl.length) { var o = pick(tl); var ex2 = fReply(cx, o.t, o.l + '_r' + (o.i + 1)); ex2.lesson = o.l; steps.push(ex2); }
    var rl = lessonsIn.filter(function (n) { return n.read; })[0]; if (rl) { var ex3 = fRead(cx, rl.read, 0); ex3.lesson = rl.id; steps.push(ex3); }
    steps = shuffle(steps); var spl = lessonsIn.filter(function (n) { return n.speak; }); if (spl.length) { var s0 = pick(spl), sp = fSpeak(cx, s0.speak[0], s0.id + '_m1'); sp.lesson = s0.id; steps.push(sp); }
    steps.forEach(function (e) { e.part = 'oev'; });
    return steps;
  }
  function assembleTest(w, node, level) {
    var K = allKnown(w), cx = snap(w, K, level, node.id), steps = [], all = []; w.lessons.forEach(function (n) { if (n.t === 'lesson') lessonChunks(w, n).forEach(function (id) { all.push({ id: id, lesson: n.id }); }); });
    var list = shuffle(all), used = {};
    function one(f, filter) { var o = list.filter(function (x) { return !used[x.id] && (!filter || filter(w.V[x.id], x)); })[0]; if (!o) o = list.filter(function (x) { return !filter || filter(w.V[x.id], x); })[0]; if (!o) return; used[o.id] = 1; var ex = f(cx, o.id); if (ex) { ex.lesson = o.lesson; steps.push(ex); } }
    var lessonsAll = w.lessons.filter(function (n) { return n.t === 'lesson'; });
    var hs = []; lessonsAll.forEach(function (n) { (n.listen || []).forEach(function (it, i) { hs.push({ it: it, l: n.id, i: i }); }); });
    shuffle(hs).slice(0, 2).forEach(function (o) { var ex = fHearSent(cx, o.it, o.l + '_h' + (o.i + 1)); ex.lesson = o.l; steps.push(ex); });
    one(fHearNo, function (c) { return c.cat === 'zahl'; }); one(fHearDe, function (c) { return c.cat !== 'zahl'; });
    one(fDeNo); one(fDeNo); one(fNoDe);
    var rl = lessonsAll.filter(function (n) { return n.read; })[0]; if (rl) { var e1 = fRead(cx, rl.read, 0), e2 = fRead(cx, rl.read, 1); e1.lesson = e2.lesson = rl.id; steps.push(e1, e2); }
    one(fTypeDe, function (c) { return typeable(c) && c.cat !== 'zahl'; }); one(fTypeDe, function (c) { return typeable(c) && c.cat === 'zahl'; });
    var bl = []; lessonsAll.forEach(function (n) { (n.builds || []).forEach(function (b) { bl.push({ b: b, l: n.id }); }); });
    shuffle(bl).slice(0, 2).forEach(function (o) { var ex = fBuild(cx, o.b[0], o.b[1]); ex.lesson = o.l; steps.push(ex); });
    one(function (c, id) { return fHearEmoji(c, id); }, function (c) { return c.pic; });
    var mt = shuffle(all).slice(0, 5).map(function (o) { return o.id; }); steps.push(fMatch(cx, uniq(mt)));
    steps = shuffle(steps);
    var nl = lessonsAll.filter(function (n) { return n.numseq; })[0]; if (nl) { var sq0 = pick(nl.numseq), ex = fDictNum(cx, sq0, nl.id + '_n' + (nl.numseq.indexOf(sq0) + 1)); ex.lesson = nl.id; steps.push(ex); }
    steps.forEach(function (e) { e.part = 'oev'; });
    var miss = w.mission.turns.map(function (t, i) { var e = fReply(cx, t, 'w1_m' + (i + 1)); e.part = 'bruk'; e.lesson = 'w1l1'; return e; });
    var sp1 = w.lessons[0].speak[0], s1 = fSpeak(cx, sp1, 'w1l1_m1'); s1.part = 'bruk'; s1.lesson = 'w1l1';
    var s2 = fSpeak(cx, w.lessons[1].speak[0], 'w1l2_m1'); s2.part = 'bruk'; s2.lesson = 'w1l2';
    return steps.concat([s1, s2]).concat(miss);
  }
  function assembleDaily(w, level, focus) {
    var ids = focus ? lessonChunks(w, w.lessons.filter(function (n) { return n.id === focus; })[0]) : dueList(w, {}, 8), K = allKnown(w);
    ids = ids.filter(function (id) { return S.words[id] || focus; }); if (!ids.length) return [];
    var cx = snap(w, K, level, 'daily'), steps = [];
    shuffle(ids).slice(0, 8).forEach(function (id, i) { var f = [fDeNo, fHear, fNoDe, fHearNo][i % 4]; var ex = f(cx, id, !focus); if (ex) { ex.lesson = lessonOf(w, id); steps.push(ex); } });
    steps.forEach(function (e) { e.part = 'oev'; });
    return steps;
  }

  /* ================= lesson-løper ================= */
  var ls = $('lr-ls'), ov = $('lr-ov'), sheet = $('lr-sheet'), L = null, lastFocus = null;
  function openSheet(html) { lastFocus = document.activeElement; sheet.innerHTML = html; ov.classList.add('lp-open'); document.body.style.overflow = 'hidden'; var f = sheet.querySelector('button.lp-btn,button,input,textarea'); if (f) f.focus(); }
  function closeSheet() { ov.classList.remove('lp-open'); sheet.innerHTML = ''; if (!ls.classList.contains('lp-open')) document.body.style.overflow = ''; if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus(); }
  $('lr-dim').addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('lp-open')) closeSheet(); });

  var TIPS = {
    scene: 'Hør samtalen først. Du trenger ikke forstå alt ennå. Trykk på et tysk ord for å se hva det betyr.',
    guess: 'Du har ikke lært dette ordet ennå, men du kan gjette. Se på alternativene du kjenner fra før, og velg det som blir igjen.',
    learn: 'Her ser du ordene sammen med norsk og lyd. Trykk 🔊 for å høre dem.',
    mc: 'Velg det riktige svaret. Trykk 💡 Hint hvis du står fast. Hintet koster ingenting.',
    match: 'Trykk på et tysk uttrykk og så på det norske som passer.',
    type: 'Skriv svaret på tysk. Bruk knappene ä, ö, ü og ß ved behov. Små og store bokstaver spiller ingen rolle.',
    build: 'Trykk på ordene i riktig rekkefølge. Trykk på et ord i svaret for å ta det bort igjen.',
    speak: 'Hør modellen, si setningen høyt og vurder deg selv. Opptaket sendes ikke noe sted.',
    reply: 'Se på situasjonen og velg det du ville sagt på tysk.',
    read: 'Les teksten og velg riktig svar. Trykk på et tysk ord hvis du vil se hva det betyr.',
    can: 'Kryss av for det du kan nå. Det hjelper deg å se hva du bør øve mer på.'
  };
  function partsBar(part) {
    var P = [['laer', 'Lær'], ['oev', 'Øv'], ['bruk', 'Bruk']];
    return P.map(function (p) { return '<span class="lr-part' + (p[0] === part ? ' lr-on' : '') + '"' + (p[0] === part ? ' aria-current="step"' : '') + '>' + p[1] + '</span>'; }).join('');
  }
  function setHearts() { var h = $('lr-hearts'); if (!h) return; h.hidden = !(S.hearts && L.mode === 'lesson'); h.textContent = '❤️ ' + L.hearts; }
  function setProg() { $('lr-prog-i').style.width = Math.round(L.done / L.total * 100) + '%'; }
  function startRun(w, mode, node, level, steps) {
    if (!steps.length) { toast('Ikke nok uttrykk å repetere ennå.'); return; }
    L = { w: w, mode: mode, node: node, level: level, queue: steps, idx: 0, total: steps.length, done: 0, hearts: 5, mistakes: 0, first: 0, scored: 0, touched: {}, known: {}, bySkill: {}, wrong: {}, canRes: null, t0: Date.now() };
    steps.forEach(function (e) { if (e.type !== 'scene' && (!e.unscored || e.type === 'speak')) L.scored++; });
    ls.style.setProperty('--c', w.color || '#9c1329');
    ls.innerHTML = '<div class="lp-lesson" role="dialog" aria-modal="true" aria-label="Leksjon"><div class="lp-ltop"><button class="lp-x" id="lr-quit" aria-label="Avslutt leksjonen">✕</button><div class="lp-prog" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i id="lr-prog-i"></i></div><div class="lp-hearts" id="lr-hearts"></div></div><div class="lr-parts" id="lr-parts"></div><div class="lp-lbody" id="lr-body"></div><div class="lp-fb" id="lr-fb"><div class="lp-fb-in" id="lr-bar"></div></div></div>';
    ls.classList.add('lp-open'); document.body.style.overflow = 'hidden';
    $('lr-quit').onclick = function () {
      openSheet('<h3>Avslutte?</h3><p>Du mister fremgangen i denne runden.</p><button class="lp-btn" id="lr-stay">Fortsett</button><button class="lp-btn lp-bad" id="lr-leave">Avslutt</button>');
      $('lr-stay').onclick = closeSheet; $('lr-leave').onclick = function () { closeSheet(); endRun(); };
    };
    setHearts(); setProg(); next();
  }
  function endRun() { recRelease(); ls.classList.remove('lp-open'); ls.innerHTML = ''; document.body.style.overflow = ''; L = null; try { au.pause(); speechSynthesis.cancel(); } catch (e) { } renderHome(); window.scrollTo(0, 0); }
  var API = {
    ready: function (b) { var c = $('lr-check'); if (c) c.disabled = !b; },
    primary: function () { var b = $('lr-check') || $('lr-next'); if (b && !b.disabled) b.click(); },
    lose: function (ids) { L.mistakes++; if (S.hearts && L.mode === 'lesson') { L.hearts--; setHearts(); } sfx('bad'); (ids || []).forEach(function (id) { leit(id, false, L); }); if (S.hearts && L.mode === 'lesson' && L.hearts <= 0) setTimeout(failRun, 700); },
    cont: function (label, fn) { var fb = $('lr-fb'); fb.className = 'lp-fb'; $('lr-bar').innerHTML = '<button class="lp-btn" id="lr-next">' + esc(label) + '</button>'; $('lr-next').onclick = function () { if (fn) fn(); advance(); }; },
    setCan: function (arr) { L.canRes = arr; },
    matchDone: function (flawed) {
      if (!L) return; var ex = L.cur; L.done++; if (!flawed) L.first++; setProg();
      (ex.tids || []).forEach(function (id) { if (!flawed) leit(id, true, L); }); skillHit('lesen', !flawed); noteSkill('lesen', !flawed);
      if (flawed && ex.lesson) L.wrong[ex.lesson] = (L.wrong[ex.lesson] || 0) + 1;
      var fb = $('lr-fb'); fb.className = 'lp-fb lp-good'; $('lr-bar').innerHTML = '<p class="lp-fb-t">' + (flawed ? 'Ferdig!' : pick(PRAISE)) + '</p><button class="lp-btn" id="lr-next">Fortsett</button>';
      if (!flawed) sfx('ok'); $('lr-next').onclick = advance; $('lr-next').focus();
    },
    speakDone: function (ok) { if (ok) { L.first++; } skillHit('sprechen', ok); noteSkill('sprechen', ok); L.done++; setProg(); if (ok) sfx('ok'); advance(); }
  };
  function noteSkill(k, ok) { if (!k) return; var s = L.bySkill[k] || (L.bySkill[k] = { ok: 0, n: 0 }); s.n++; if (ok) s.ok++; }
  function advance() { L.idx++; next(); }
  function next() {
    if (S.hearts && L.mode === 'lesson' && L.hearts <= 0) { failRun(); return; }
    if (L.idx >= L.queue.length) { finishRun(); return; }
    var ex = L.queue[L.idx]; L.cur = ex; L.checked = false;
    var body = $('lr-body'), fb = $('lr-fb'); fb.className = 'lp-fb';
    $('lr-parts').innerHTML = L.mode === 'lesson' ? partsBar(ex.part) : '<span class="lr-part lr-on">' + (L.mode === 'test' ? 'Weltprüfung' : (L.mode === 'daily' ? 'Dagens repetisjon' : 'Wiederholung')) + '</span>';
    $('lr-bar').innerHTML = ex.noCheck ? '' : '<button class="lp-btn" id="lr-check" disabled>Sjekk</button>';
    body.scrollTop = 0; ex.render(body, API);
    if (ex.tip && !S.tips[ex.tip] && TIPS[ex.tip]) { var t = document.createElement('div'); t.className = 'lr-tip'; t.innerHTML = '<b>Slik gjør du:</b> ' + esc(TIPS[ex.tip]) + ' <button class="lr-linkbtn" id="lr-tipx">Skjønner</button>'; body.insertBefore(t, body.firstChild); $('lr-tipx').onclick = function () { S.tips[ex.tip] = 1; save(); t.remove(); }; S.tips[ex.tip] = 1; save(); }
    if ($('lr-check')) $('lr-check').onclick = check;
    if (ex.type === 'learn') { ex.learn.forEach(function (id) { L.known[id] = 1; if (!S.words[id]) S.words[id] = { box: 1, due: today(), ok: 0, bad: 0 }; }); }
  }
  function check() {
    var ex = L.cur; if (L.checked) return; L.checked = true;
    var r = ex.check(), fb = $('lr-fb'), retryOK = L.mode === 'lesson';
    if (ex.unscored) {
      fb.className = 'lp-fb ' + (r.ok ? 'lp-good' : 'lp-soft'); sfx(r.ok ? 'ok' : 'bad');
      $('lr-bar').innerHTML = '<p class="lp-fb-t" role="status">' + (r.ok ? 'Bra gjettet!' : 'Nesten!') + '</p><p class="lp-fb-d">' + esc(r.ans || '') + '</p><p class="lp-fb-d">' + (r.ok ? 'Du kom frem til det ved å utelukke.' : 'Det var en vanskelig en. Nå vet du det.') + '</p><button class="lp-btn' + (r.ok ? '' : ' lr-soft') + '" id="lr-next">Fortsett</button>';
      L.done++; setProg(); skillHit(ex.skill, r.ok); noteSkill(ex.skill, r.ok); $('lr-next').onclick = advance; $('lr-next').focus(); return;
    }
    var ids = ex.tid ? [ex.tid] : (ex.tids || []);
    skillHit(ex.skill, r.ok && !ex.retry); if (!ex.retry) noteSkill(ex.skill, r.ok);
    if (r.ok) {
      sfx('ok'); fb.className = 'lp-fb lp-good'; if (!ex.retry) L.first++; L.done++; setProg(); ids.forEach(function (id) { leit(id, true, L); });
      $('lr-bar').innerHTML = '<p class="lp-fb-t" role="status">' + pick(PRAISE) + '</p>' + (r.note ? '<p class="lp-fb-d">' + esc(r.note) + '</p>' : '') + (r.ans && ex.type !== 'mc' ? '<p class="lp-fb-d">' + esc(r.ans) + '</p>' : '') + '<button class="lp-btn" id="lr-next">Fortsett</button>';
    } else {
      L.mistakes++; if (S.hearts && L.mode === 'lesson') { L.hearts--; setHearts(); } sfx('bad'); fb.className = 'lp-fb lp-bad'; ids.forEach(function (id) { leit(id, false, L); });
      if (ex.lesson) L.wrong[ex.lesson] = (L.wrong[ex.lesson] || 0) + 1;
      $('lr-bar').innerHTML = '<p class="lp-fb-t" role="alert">Ikke helt …</p><p class="lp-fb-d"><b>Riktig svar:</b> ' + esc(r.ans || '') + '</p>' + (r.note ? '<p class="lp-fb-d">' + esc(r.note) + '</p>' : '') + '<button class="lp-btn lp-bad" id="lr-next">Fortsett</button>';
      if (retryOK && ex.make && L.queue.length < L.total + 12 && !ex.retry) { var c = ex.make(); if (c) { c.retry = true; c.part = ex.part; L.queue.push(c); L.total++; } }
      if (!retryOK && !ex.retry) L.done++;
      if (!retryOK) setProg();
    }
    $('lr-next').onclick = advance; $('lr-next').focus();
    if (S.hearts && L.mode === 'lesson' && L.hearts <= 0) { $('lr-next').onclick = failRun; }
  }
  function failRun() {
    if (!L) return; var node = L.node, w = L.w, lv = L.level; $('lr-fb').className = 'lp-fb'; $('lr-bar').innerHTML = '';
    $('lr-body').innerHTML = '<div class="lp-result"><div style="font-size:3.4rem">💔</div><h2>Tom for hjerter</h2><p>Det er helt greit å bomme. Prøv igjen, så går det bedre!</p><button class="lp-btn" id="lr-again">Prøv igjen</button><button class="lp-btn lp-ghost" id="lr-back">Tilbake</button></div>';
    $('lr-again').onclick = function () { ls.classList.remove('lp-open'); ls.innerHTML = ''; startNode(w, node, lv); }; $('lr-back').onclick = endRun;
  }
  function stars(n) { var s = ''; for (var i = 1; i <= 3; i++) s += '<span class="' + (i <= n ? 'lp-star-on' : 'lp-star-off') + '">★</span>'; return s; }
  function medalOf(p) { return p >= 90 ? 'gull' : (p >= 75 ? 'solv' : (p >= 50 ? 'bronse' : '')); }
  var MEDAL = { gull: ['🥇', 'Gull', 'Sehr gut! Helt fantastisk.'], solv: ['🥈', 'Sølv', 'Sehr gut! Det er veldig bra.'], bronse: ['🥉', 'Bronse', 'Gut. Du er på god vei.'], '': ['🌱', 'Ikke helt ennå', 'Noch nicht sicher. Repeter noen leksjoner og prøv igjen.'] };
  function skillBreak() {
    var h = '<div class="lr-brk">'; Object.keys(SK).forEach(function (k) { var s = L.bySkill[k]; if (s && s.n) { var p = Math.round(s.ok / s.n * 100); h += '<div class="lr-brkrow"><span>' + SKI[k] + ' ' + SK[k] + '</span><div class="lr-brkbar"><i style="width:' + p + '%"></i></div><b>' + p + ' %</b></div>'; } }); return h + '</div>';
  }
  function finishRun() {
    var w = L.w, node = L.node, m = L.mistakes, mode = L.mode, acc = Math.round(L.first / Math.max(1, L.scored) * 100), st, gain, rec;
    recRelease(); bumpStreak();
    if (mode === 'lesson') {
      st = m === 0 ? 3 : (m <= 2 ? 2 : 1); gain = L.first * 5 + st * 5; rec = S.les[node.id] || { done: false, stars: 0, pct: 0, medal: '', can: [] };
      rec.done = true; rec.stars = Math.max(rec.stars, st); rec.can = L.canRes || rec.can || []; S.les[node.id] = rec;
    } else if (mode === 'review') {
      st = acc >= 90 ? 3 : (acc >= 70 ? 2 : 1); gain = L.first * 3 + st * 5; rec = S.les[node.id] || { done: false, stars: 0, pct: 0, medal: '', can: [] }; rec.done = true; rec.stars = Math.max(rec.stars, st); rec.pct = Math.max(rec.pct, acc); S.les[node.id] = rec;
    } else if (mode === 'test') {
      gain = L.first * 3 + 20; rec = S.les[node.id] || { done: false, stars: 0, pct: 0, medal: '', can: [] }; var md = medalOf(acc); rec.pct = Math.max(rec.pct, acc);
      var best = medalOf(rec.pct); rec.medal = best; rec.done = rec.done || !!md; S.les[node.id] = rec; st = md;
    } else { gain = L.first * 2 + 5; }
    S.xp += gain; save(); sfx('done'); var good = mode === 'test' ? acc >= 75 : (st >= 2 || mode === 'daily'); if (good) confetti();
    $('lr-fb').className = 'lp-fb'; $('lr-bar').innerHTML = ''; $('lr-prog-i').style.width = '100%'; $('lr-parts').innerHTML = '';
    var h = '<div class="lp-result">';
    if (mode === 'lesson') {
      var learned = Object.keys(L.known).length;
      h += '<div style="font-size:3rem">' + (st === 3 ? '🏆' : '🎉') + '</div><h2>Leksjon fullført!</h2><div class="lp-bigstars" aria-label="' + st + ' av 3 stjerner">' + stars(st) + '</div>';
      if (L.canRes) { var yes = L.node.can.filter(function (_, i) { return L.canRes[i] === 2; }); if (yes.length) h += '<div class="lr-didnow"><b>Dette kan du nå:</b><ul>' + yes.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>'; }
      h += '<div class="lp-res-stats"><div class="lp-res-stat"><small>Nye uttrykk</small><b>' + learned + '</b></div><div class="lp-res-stat"><small>Treff</small><b>' + acc + '%</b></div><div class="lp-res-stat"><small>🔥 Serie</small><b>' + curStreak() + '</b></div></div>';
      h += '<p>' + (st === 3 ? 'Helt uten feil. Fantastisk!' : 'Prøv igjen senere for å få alle tre stjernene.') + '</p>';
    } else if (mode === 'review') {
      h += '<div style="font-size:3rem">🔁</div><h2>Wiederholung ferdig!</h2><div class="lp-bigstars">' + stars(st) + '</div><p>Du klarte ' + acc + ' % på første forsøk.</p>' + skillBreak();
      var weak = Object.keys(L.wrong).filter(function (k) { return L.wrong[k] > 0 && w.lessons.some(function (x) { return x.id === k && x.t === 'lesson'; }); }); if (weak.length) h += '<p class="lr-rec">Du kan øve litt mer på: ' + weak.map(function (id) { var n = w.lessons.filter(function (x) { return x.id === id; })[0]; return '<b>' + esc(n ? n.title : id) + '</b>'; }).join(', ') + '.</p>';
    } else if (mode === 'test') {
      var M = MEDAL[medalOf(acc)];
      h += '<div style="font-size:3.4rem">' + M[0] + '</div><h2>' + (acc >= 50 ? 'Weltprüfung: ' + M[1] : 'Weltprüfung') + '</h2><div class="lp-res-stats"><div class="lp-res-stat"><small>Resultat</small><b>' + acc + ' %</b></div><div class="lp-res-stat"><small>🥇 Beste</small><b>' + rec.pct + ' %</b></div></div><p>' + M[2] + '</p>' + skillBreak();
      var weak2 = Object.keys(L.wrong).filter(function (k) { return L.wrong[k] > 0 && w.lessons.some(function (x) { return x.id === k && x.t === 'lesson'; }); });
      if (acc < 90 && weak2.length) h += '<p class="lr-rec">Dette kan du øve mer på: ' + weak2.map(function (id) { var n = w.lessons.filter(function (x) { return x.id === id; })[0]; return '<b>' + esc(n ? n.title : id) + '</b>'; }).join(', ') + '. Du kan ta prøven på nytt når som helst.</p>';
      if (acc >= 50) h += '<div class="lr-badgebox"><span aria-hidden="true">🎖️</span><div><b>' + esc(w.badge) + '</b><br><small>Ich-kann-merke for Welt 1</small></div></div>';
    } else {
      h += '<div style="font-size:3rem">🔁</div><h2>Bra repetert!</h2><p>Du klarte ' + acc + ' % på første forsøk. Ordene du svarte riktig på kommer tilbake senere.</p>';
    }
    h += '<div class="lp-res-stats"><div class="lp-res-stat"><small>XP</small><b>+' + gain + '</b></div></div><button class="lp-btn" id="lr-fin">Fortsett</button></div>';
    $('lr-body').innerHTML = h; $('lr-fin').onclick = endRun; $('lr-fin').focus();
  }

  /* ================= start av noder ================= */
  function startNode(w, node, level) {
    var idx = w.lessons.indexOf(node), steps;
    if (node.t === 'lesson') { steps = assembleLesson(w, idx, level); startRun(w, 'lesson', node, level, steps); }
    else if (node.t === 'review') { steps = assembleReview(w, node, level); startRun(w, 'review', node, level, steps); }
    else { steps = assembleTest(w, node, level); startRun(w, 'test', node, level, steps); }
  }
  function startDaily(w, focus) { var steps = assembleDaily(w, S.level, focus); startRun(w, 'daily', { id: 'daily' }, S.level, steps); }

  /* ================= dashbord ================= */
  function done(id) { return !!(S.les[id] && S.les[id].done); }
  function nodeOpen(w, i) {
    if (S.teacher) return true; var n = w.lessons[i];
    for (var j = 0; j < i; j++) { var m = w.lessons[j]; if (m.t === 'lesson' && !done(m.id)) return false; }
    return true;
  }
  function nodeLockWhy(w, i) { for (var j = 0; j < i; j++) { var m = w.lessons[j]; if (m.t === 'lesson' && !done(m.id)) return 'Fullfør «' + m.title + '» først.'; } return ''; }
  function nextIdx(w) { for (var i = 0; i < w.lessons.length; i++) if (!done(w.lessons[i].id)) return i; return -1; }
  function dueCount(w) { return Object.keys(S.words).filter(function (id) { return w.V[id] && S.words[id].due <= today() && S.words[id].box < 5 && lessonDone(w, id); }).length; }
  function lessonDone(w, id) { var l = lessonOf(w, id); return l && done(l); }
  function knownCount(w) { return Object.keys(S.words).filter(function (id) { return w.V[id] && S.words[id].box >= 2; }).length; }
  function totalChunks(w) { return Object.keys(allKnown(w)).length; }
  function worldDone(w) { return w.lessons.every(function (n) { return n.t !== 'lesson' || done(n.id); }) && done('test'); }

  function renderHome() {
    var w = D.W[1], h = '', ni = nextIdx(w), nn = ni >= 0 ? w.lessons[ni] : null, dc = dueCount(w);
    var learnedL = w.lessons.filter(function (n) { return n.t === 'lesson' && done(n.id); }).length, totalL = w.lessons.filter(function (n) { return n.t === 'lesson'; }).length;
    $('lr-s-streak').textContent = curStreak(); $('lr-s-words').textContent = knownCount(w); $('lr-s-xp').textContent = S.xp;
    /* neste steg */
    if (nn) {
      var typeLabel = nn.t === 'lesson' ? 'Leksjon ' + nn.n + ' av ' + totalL : (nn.t === 'review' ? 'Repetisjon' : 'Verdensprøve');
      h += '<section class="lr-next" aria-label="Neste steg"><div class="lr-next-top"><span class="lr-wicon" aria-hidden="true">' + w.icon + '</span><div><small>Welt ' + w.n + ' · ' + esc(w.title) + '</small><h2>' + (learnedL === 0 && nn.t === 'lesson' ? 'Start her' : 'Fortsett') + ': ' + esc(nn.title) + '</h2></div></div><p class="lr-goal">' + esc(nn.goal) + '</p><div class="lr-meta"><span>' + typeLabel + '</span><span>⏱ ca. ' + nn.min + ' min</span>' + (nn.skill ? '<span>' + SKI[nn.skill] + ' ' + SK[nn.skill] + '</span>' : '') + '</div><button class="lp-btn lr-go" id="lr-go-next" data-i="' + ni + '">' + (learnedL === 0 ? 'Start Lernreise' : 'Fortsett') + '</button></section>';
    } else {
      h += '<section class="lr-next lr-fin" aria-label="Welt 1 fullført"><div class="lr-next-top"><span class="lr-wicon">🎖️</span><div><small>Welt 1 · ' + esc(w.title) + '</small><h2>Du har fullført Welt 1!</h2></div></div><p class="lr-goal">Ich kann grüßen und mich vorstellen. Neste verden (Welt 2) kommer snart. Imens kan du repetere eller ta Weltprüfung på nytt for en bedre medalje.</p></section>';
    }
    /* dagens repetisjon */
    if (learnedL > 0) {
      h += '<section class="lr-rep"><div><b>🔁 Dagens repetisjon</b><p>' + (dc >= 4 ? dc + ' uttrykk er klare for repetisjon. Det tar ca. 5 minutter og teller mot serien din.' : 'Ingen uttrykk må repeteres akkurat nå. Du kan likevel øve ekstra på de svakeste.') + '</p></div><button class="lp-btn lr-small" id="lr-go-daily">' + (dc >= 4 ? 'Start' : 'Øv ekstra') + '</button></section>';
    }
    /* ferdigheter */
    h += '<section class="lr-skills" aria-label="Ferdigheter"><h3>Dette kan jeg <small>Trinn 1 (Welt 1–3)</small></h3><div class="lr-sk">';
    Object.keys(SK).forEach(function (k) { var s = S.skills[k] || { ok: 0, n: 0 }, p = Math.min(100, Math.round(s.ok / SKT[k] * 100)); h += '<div class="lr-skrow"><span>' + SKI[k] + ' ' + SK[k] + '</span><div class="lr-skbar" role="progressbar" aria-label="' + SK[k] + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + p + '"><i style="width:' + p + '%"></i></div><b>' + p + ' %</b></div>'; });
    h += '</div></section>';
    /* verdener */
    h += '<h3 class="lr-h3">Verdener</h3><div class="lr-worlds">';
    D.worlds.forEach(function (m) {
      if (m.built) { h += renderWorld(w, m); }
      else { h += '<div class="lr-world lr-wl"><div class="lr-whead"><span class="lr-wnum" style="--c:' + m.color + '">' + m.n + '</span><div><b>' + esc(m.title) + '</b><small>' + m.stage + ' · ' + m.cefr + ' · ' + esc(m.theme) + '</small></div><span class="lr-badge">Kommer</span></div></div>'; }
    });
    h += '</div>';
    /* utforsk */
    var wd = worldDone(w);
    h += '<section class="lr-explore"><h3>Utforsk mer ' + (wd ? '<span class="lr-new">Nytt!</span>' : '') + '</h3><p class="lp-hint">Resten av Deutschwelt er alltid åpen. Dette passer til det du har lært i Welt 1.</p><div class="lr-expl">';
    w.explore.forEach(function (e) { var nw = wd && !S.seen[e.href]; h += '<a class="lr-exp" href="' + esc(e.href) + '" data-h="' + esc(e.href) + '"><span aria-hidden="true">' + e.em + '</span><div><b>' + esc(e.t) + (nw ? ' <span class="lr-new">Nytt!</span>' : '') + '</b><small>' + esc(e.d) + '</small></div></a>'; });
    h += '</div></section>';
    $('lr-home').innerHTML = h;
    var g = $('lr-go-next'); if (g) g.onclick = function () { openIntro(w, +g.getAttribute('data-i')); };
    var gd = $('lr-go-daily'); if (gd) gd.onclick = function () { startDaily(w, null); };
    Array.prototype.forEach.call(document.querySelectorAll('.lr-row'), function (b) { b.addEventListener('click', function () { openIntro(w, +b.getAttribute('data-i')); }); });
    Array.prototype.forEach.call(document.querySelectorAll('.lr-exp'), function (a) { a.addEventListener('click', function () { S.seen[a.getAttribute('data-h')] = 1; save(); }); });
    Array.prototype.forEach.call(document.querySelectorAll('.lr-canpractice'), function (b) { b.addEventListener('click', function () { startDaily(w, b.getAttribute('data-l')); }); });
  }
  function renderWorld(w, m) {
    var ni = nextIdx(w), h = '<div class="lr-world lr-open" style="--c:' + m.color + '"><div class="lr-whead"><span class="lr-wnum" style="--c:' + m.color + '">' + m.n + '</span><div><b>' + esc(m.title) + '</b><small>' + m.stage + ' · ' + m.cefr + ' · ' + esc(w.blurb) + '</small></div></div><ol class="lr-list">';
    w.lessons.forEach(function (n, i) {
      var open = nodeOpen(w, i), rec = S.les[n.id], isD = !!(rec && rec.done), cur = i === ni;
      var st = isD ? (n.t === 'test' ? (rec.medal ? MEDAL[rec.medal][0] : '✓') : stars(rec.stars)) : '';
      var kind = n.t === 'lesson' ? 'Leksjon ' + n.n : (n.t === 'review' ? 'Repetisjon' : 'Prøve');
      h += '<li class="lr-li' + (cur ? ' lr-cur' : '') + (isD ? ' lr-isdone' : '') + (!open ? ' lr-locked' : '') + (n.t !== 'lesson' ? ' lr-aside' : '') + '"><button class="lr-row" data-i="' + i + '" aria-label="' + esc(kind + ': ' + n.title + (isD ? ', fullført' : (open ? '' : ', låst'))) + '"><span class="lr-ic" aria-hidden="true">' + (open ? (isD ? '✓' : n.icon) : '🔒') + '</span><span class="lr-txt"><small>' + kind + (n.skill ? ' · ' + SKI[n.skill] + ' ' + SK[n.skill] : '') + '</small><b>' + esc(n.title) + '</b>' + (n.learn && open && (cur || !isD) ? '<em>Du lærer: ' + esc(n.learn) + '</em>' : '') + (!open ? '<em>' + esc(nodeLockWhy(w, i)) + '</em>' : '') + '</span><span class="lr-st" aria-hidden="true">' + st + (cur ? '<span class="lr-start">Start</span>' : '') + '</span></button>';
      /* Ich kann-status */
      if (isD && n.t === 'lesson' && rec.can && rec.can.length) {
        var weak = rec.can.some(function (v) { return v < 2; });
        h += '<div class="lr-cansum">' + n.can.map(function (s, k) { var v = rec.can[k]; return '<span class="lr-cs lr-cs' + v + '" title="' + esc(s) + '">' + (v === 2 ? '✓' : (v === 1 ? '◐' : '○')) + ' ' + esc(s.replace(/^Jeg kan /, 'Jeg kan ')) + '</span>'; }).join('') + (weak ? '<button class="lr-linkbtn lr-canpractice" data-l="' + n.id + '">Øv litt mer på dette</button>' : '') + '</div>';
      }
      h += '</li>';
    });
    h += '</ol>';
    if (worldDone(w)) h += '<div class="lr-badgebox"><span aria-hidden="true">🎖️</span><div><b>' + esc(w.badge) + '</b><br><small>Ich-kann-merke for Welt 1</small></div></div>';
    return h + '</div>';
  }

  function openIntro(w, i) {
    var n = w.lessons[i], open = nodeOpen(w, i), rec = S.les[n.id];
    var h = '<h3>' + n.icon + ' ' + esc(n.title) + '</h3>';
    if (!open) { h += '<p>' + esc(nodeLockWhy(w, i)) + ' Du kan åpne alt under ⚙️ Innstillinger → Lærermodus.</p><button class="lp-btn lp-ghost" id="lr-close">Lukk</button>'; openSheet(h); $('lr-close').onclick = closeSheet; return; }
    h += '<p class="lr-goal">' + esc(n.goal) + '</p>';
    if (n.t === 'lesson') {
      h += '<div class="lr-learnbox"><b>Du lærer:</b> ' + esc(n.learn) + '</div>';
      h += '<p class="lr-mini">⏱ ca. ' + n.min + ' min · ' + (n.skill ? SKI[n.skill] + ' ' + SK[n.skill] + ' · ' : '') + 'Mønster: ' + esc(n.grammar) + '</p>';
    } else if (n.t === 'review') {
      h += '<p class="lr-mini">Ca. 13 oppgaver fra leksjonene du nettopp har tatt, pluss ord du bør repetere. Ingenting stopper deg hvis det går dårlig.</p>';
    } else {
      h += '<p class="lr-mini">Ca. 25 oppgaver: Hören, Lesen, Schreiben, Sprechen og avsluttende oppdrag «' + esc(w.mission.title) + '». Bronse 50 %, Sølv 75 %, Gull 90 %. Du beholder beste resultat. Prøven stopper deg ikke i å gå videre.</p>';
      var notDone = w.lessons.some(function (x) { return x.t === 'lesson' && !done(x.id); });
      if (notDone) h += '<div class="lp-note">Du har ikke tatt alle leksjonene ennå. Prøven blir lettere hvis du tar dem først.</div>';
    }
    if (rec && rec.done) h += '<p><b>Beste resultat:</b> ' + (n.t === 'test' ? (rec.medal ? MEDAL[rec.medal][0] + ' ' + MEDAL[rec.medal][1] + ' (' + rec.pct + ' %)' : rec.pct + ' %') : '<span aria-hidden="true">' + stars(rec.stars) + '</span> ' + rec.stars + ' av 3 stjerner') + '</p>';
    h += '<div class="lr-lv" role="radiogroup" aria-label="Nivå">' + Object.keys(LEVELS).map(function (k) { var d = k === 'basis' ? 'Norsk hjelp, færre valg' : (k === 'std' ? 'Passer for de fleste' : 'Mer skriving, mindre hjelp'); return '<button class="lr-lvb' + (S.level === k ? ' lr-on' : '') + '" data-lv="' + k + '" role="radio" aria-checked="' + (S.level === k) + '"><b>' + LEVELS[k] + '</b><small>' + d + '</small></button>'; }).join('') + '</div>';
    if (S.teacher && n.teacher) h += '<div class="lr-teacher"><b>Lærernotat</b><p>' + esc(n.teacher) + '</p>' + (n.builds ? '<p><b>Fasit, setninger:</b> ' + n.builds.map(function (b) { return esc(b[0]) + ' = ' + esc(b[1]); }).join(' · ') + '</p>' : '') + '<p><b>Uttrykk:</b> ' + lessonChunks(w, n).map(function (id) { return esc(w.V[id].de) + ' = ' + esc(w.V[id].no); }).join(' · ') + '</p></div>';
    h += '<button class="lp-btn" id="lr-go">Start</button><button class="lp-btn lp-ghost" id="lr-close">Avbryt</button>';
    openSheet(h);
    Array.prototype.forEach.call(sheet.querySelectorAll('.lr-lvb'), function (b) { b.onclick = function () { S.level = b.getAttribute('data-lv'); save(); Array.prototype.forEach.call(sheet.querySelectorAll('.lr-lvb'), function (x) { x.classList.toggle('lr-on', x === b); x.setAttribute('aria-checked', x === b); }); }; });
    $('lr-close').onclick = closeSheet; $('lr-go').onclick = function () { closeSheet(); startNode(w, n, S.level); };
  }

  /* ================= innstillinger ================= */
  function openSettings() {
    var h = '<h3>⚙️ Innstillinger</h3>';
    if (!storageOK) h += '<div class="lp-note">Nettleseren din lar ikke siden lagre fremgang. Du kan bruke siden, men fremgangen forsvinner når du lukker den. Bruk «Eksporter» for å ta vare på den.</div>';
    h += '<div class="lr-lv" role="radiogroup" aria-label="Standard nivå">' + Object.keys(LEVELS).map(function (k) { return '<button class="lr-lvb' + (S.level === k ? ' lr-on' : '') + '" data-lv="' + k + '" role="radio" aria-checked="' + (S.level === k) + '"><b>' + LEVELS[k] + '</b></button>'; }).join('') + '</div>';
    h += '<div class="lp-row"><span>Lydeffekter</span><button class="lp-switch" id="lr-sw-snd" role="switch" aria-checked="' + S.sound + '" aria-label="Lydeffekter"></button></div>';
    h += '<div class="lp-row"><span>Hjerter i leksjoner<br><span class="lp-mini">Av som standard. Fem hjerter per leksjon.</span></span><button class="lp-switch" id="lr-sw-hrt" role="switch" aria-checked="' + S.hearts + '" aria-label="Hjerter"></button></div>';
    h += '<div class="lp-row"><span>Lærermodus<br><span class="lp-mini">Åpner alle leksjoner og viser lærernotat og fasit</span></span><button class="lp-switch" id="lr-sw-tch" role="switch" aria-checked="' + S.teacher + '" aria-label="Lærermodus"></button></div>';
    h += '<p class="lp-mini" style="margin-top:12px">Fremgangen lagres bare i denne nettleseren, på denne enheten. Det lagres ingen personopplysninger, og opptak av stemmen din forlater aldri enheten. Skal du bytte enhet, kan du flytte fremgangen med en kode:</p>';
    h += '<button class="lp-btn lp-ghost" id="lr-exp">Eksporter fremgang (kopier kode)</button><textarea class="lp-field" id="lr-code" rows="3" placeholder="Lim inn koden her for å importere" aria-label="Kode for fremgang"></textarea><button class="lp-btn lp-ghost" id="lr-imp">Importer kode</button>';
    h += '<button class="lp-btn lp-bad" id="lr-reset">Nullstill all fremgang</button><button class="lp-btn lp-ghost" id="lr-close">Lukk</button>';
    openSheet(h); $('lr-close').onclick = closeSheet;
    Array.prototype.forEach.call(sheet.querySelectorAll('.lr-lvb'), function (b) { b.onclick = function () { S.level = b.getAttribute('data-lv'); save(); Array.prototype.forEach.call(sheet.querySelectorAll('.lr-lvb'), function (x) { x.classList.toggle('lr-on', x === b); x.setAttribute('aria-checked', x === b); }); }; });
    function sw(id, key) { $(id).onclick = function () { S[key] = !S[key]; this.setAttribute('aria-checked', S[key]); save(); renderHome(); }; }
    sw('lr-sw-snd', 'sound'); sw('lr-sw-hrt', 'hearts'); sw('lr-sw-tch', 'teacher');
    $('lr-exp').onclick = function () { var code = 'DWLR1:' + btoa(unescape(encodeURIComponent(JSON.stringify(S)))); $('lr-code').value = code; try { navigator.clipboard.writeText(code).then(function () { toast('Koden er kopiert.'); }, function () { toast('Marker og kopier koden i feltet.'); }); } catch (e) { toast('Marker og kopier koden i feltet.'); } };
    $('lr-imp').onclick = function () { var v = $('lr-code').value.trim(); try { if (v.indexOf('DWLR1:') !== 0) throw 0; adopt(JSON.parse(decodeURIComponent(escape(atob(v.slice(6)))))); save(); renderHome(); closeSheet(); toast('Fremgangen er importert.'); } catch (e) { toast('Koden er ugyldig.'); } };
    $('lr-reset').onclick = function () {
      openSheet('<h3>Nullstille alt?</h3><p>All fremgang, XP og serie slettes fra denne nettleseren. Dette kan ikke angres.</p><button class="lp-btn lp-bad" id="lr-yes">Ja, nullstill</button><button class="lp-btn lp-ghost" id="lr-no">Avbryt</button>');
      $('lr-no').onclick = closeSheet; $('lr-yes').onclick = function () { var lvl = S.level; S = { xp: 0, streak: 0, last: '', level: lvl, hearts: false, sound: true, teacher: false, les: {}, words: {}, skills: {}, seen: {}, tips: {} }; save(); renderHome(); closeSheet(); toast('Fremgangen er nullstilt.'); };
    };
  }
  $('lr-gear').addEventListener('click', openSettings);
  document.addEventListener('keydown', function (e) {
    if (!L || !ls.classList.contains('lp-open') || ov.classList.contains('lp-open')) return;
    var tag = (e.target && e.target.tagName) || '';
    if (e.key === 'Enter' && tag !== 'BUTTON' && tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); API.primary(); }
    else if (/^[1-9]$/.test(e.key) && tag !== 'INPUT' && tag !== 'TEXTAREA' && L.cur && L.cur.pickKey && !L.checked) { if (L.cur.pickKey(+e.key)) e.preventDefault(); }
  });

  /* ---------- for tester og kvalitetskontroll ---------- */
  D.debug = function () { return L; };
  D.state = function () { return S; };
  D.setState = function (o) { adopt(o); save(); renderHome(); };
  D.assemble = function (wn, idx, level, trace) { var w = D.W[wn], n = w.lessons[idx]; return n.t === 'lesson' ? assembleLesson(w, idx, level, trace) : (n.t === 'review' ? assembleReview(w, n, level) : assembleTest(w, n, level)); };
  D.startNodeById = function (id, level) { var w = D.W[1], n = w.lessons.filter(function (x) { return x.id === id; })[0]; startNode(w, n, level || S.level); };
  D.tokensOf = toks; D.fold = fold;

  load(); renderHome();
  loadVoices(); try { if (window.speechSynthesis) speechSynthesis.onvoiceschanged = loadVoices; } catch (e) { }
})();
