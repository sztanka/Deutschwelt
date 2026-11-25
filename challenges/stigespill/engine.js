/* Deutschwelt — Verb-Stigespill: spillmotor (kjører kun hos verten)
   Ren logikk uten DOM og uten nettverk, slik at den kan testes i Node (module.exports) og brukes i nettleseren (window.DWStige).
   Verten eier alt: brett, terningkast, retting og turrekkefølge. Alle andre får bare tilstands-«snapshots» (JSON) og sender «rull» / «svar».
   Verbdata: dwVerben fra verben/verben_data.js (p = presens, t = Präteritum, f = Perfekt, seks former hver; ‹ › = uregelmessig). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DWStige = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var COLS = 6;
  var PRON = ['ich', 'du', 'er / sie / es', 'wir', 'ihr', 'sie / Sie'];
  var PRON_ALTS = [['ich'], ['du'], ['er', 'sie', 'es'], ['wir'], ['ihr'], ['sie']];
  var TENSES = { praesens: { f: 'p', label: 'Presens', de: 'Präsens', short: 'Prs' }, praeteritum: { f: 't', label: 'Präteritum', de: 'Präteritum', short: 'Prt' }, perfekt: { f: 'f', label: 'Perfekt', de: 'Perfekt', short: 'Prf' } };
  var MODAL = { 'können': 1, 'dürfen': 1, 'müssen': 1, 'sollen': 1, 'wollen': 1, 'mögen': 1 };
  var HELP = { sein: 1, haben: 1, werden: 1, wissen: 1 };
  var SETS = ['svake', 'sterke', 'modal', 'hjelp', 'trennbare', 'refleksive'];
  var SIZES = { kort: 5, middels: 7, lang: 9 };
  var ICONS = ['🦊', '🐼', '🐸', '🦁', '🐙', '🦄', '🐧', '🐯', '🐳', '🦉', '🐵', '🦖'];
  var RESULT_MS_OK = 2600, RESULT_MS_BAD = 4600, GONE_MS = 9000;

  function strip(s) { return String(s).replace(/[‹›]/g, ''); }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffle(a, rnd) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function norm(s) { return String(s || '').trim().toLowerCase().replace(/[.!?,;]+$/g, '').replace(/\s+/g, ' '); }
  function tl(s) { return s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss'); }

  /* ---------- verbutvalg ---------- */
  function full(v) { return v && v.p && v.t && v.f && v.p.length >= 6 && v.t.length >= 6 && v.f.length >= 6; }
  function isSep(v) { return !v.r && /\s\S+$/.test(strip(v.p[0])); }
  function kindOf(v) {
    if (!full(v)) return null;
    if (v.r) return 'refleksive';
    if (MODAL[v.i]) return 'modal';
    if (HELP[v.i]) return 'hjelp';
    if (isSep(v)) return 'trennbare';
    var irr = v.t[0].indexOf('‹') >= 0 || v.p.some(function (x) { return x.indexOf('‹') >= 0; });
    return irr ? 'sterke' : 'svake';
  }
  function levelOk(l, lv) { return lv === 'A1' ? l === 'A1' : lv === 'A2' ? (l === 'A1' || l === 'A2') : true; }
  function pool(verbs, settings) {
    var sets = settings.sets || [];
    return verbs.filter(function (v) { var k = kindOf(v); return k && sets.indexOf(k) >= 0 && levelOk(v.l, settings.level || 'A2'); });
  }
  function defaults() {
    return { sets: ['svake', 'sterke'], level: 'A2', tenses: ['praesens'], size: 'middels', time: 0, help: true, hostPlays: false };
  }

  /* ---------- brett ---------- */
  function genJumps(n, rnd) {
    var nl = Math.max(2, Math.round(n / 13)), ns = Math.max(2, Math.round(n / 16));
    var used = {}; used[0] = 1; used[n - 1] = 1; used[1] = 1; used[n - 2] = 1;
    var list = [], tries = 0;
    function free(c) { return !used[c] && !used[c - 1] && !used[c + 1]; }
    function rint(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
    var want = [];
    for (var i = 0; i < nl; i++) want.push('ladder');
    for (var j = 0; j < ns; j++) want.push('slide');
    want = shuffle(want, rnd);
    while (want.length && tries++ < 600) {
      var type = want[0], len = rint(Math.max(5, Math.round(n / 9)), Math.max(8, Math.round(n / 3.2))), a, b;
      if (type === 'ladder') { a = rint(2, n - 4 - 5); b = a + len; if (b > n - 3) continue; if (!free(a) || !free(b)) continue; list.push({ type: 'ladder', from: a, to: b }); }
      else { b = rint(7, n - 3); a = b - len; if (a < 2) continue; if (!free(a) || !free(b)) continue; list.push({ type: 'slide', from: b, to: a }); }
      used[a] = used[b] = 1; want.shift();
    }
    return list;
  }
  function buildSquares(n, vpool, tenses, rnd) {
    var out = [null], order = [], last = '', i, tIdx = 0, tOrder = shuffle(tenses.length ? tenses : ['praesens'], rnd);
    while (out.length < n) {
      if (!order.length) order = shuffle(vpool, rnd);
      var v = order.pop();
      if (v.i === last && order.length) { order.unshift(v); v = order.pop(); }
      last = v.i;
      var t = tOrder[tIdx++ % tOrder.length]; if (tIdx % tOrder.length === 0) tOrder = shuffle(tOrder, rnd);
      out.push({ v: v.i, n: v.n || '', t: t, sep: isSep(v) ? 1 : 0, ref: v.r ? 1 : 0, l: v.l });
    }
    return out;
  }

  /* ---------- retting ---------- */
  function solutions(v, tense, person) {
    var key = TENSES[tense].f, raw = v[key][person], base = strip(raw), out = [base], stem;
    if (tense === 'praesens' && person === 0 && !isSep(v) && !v.r && /e[lr]n$/.test(v.i)) {
      stem = v.i.slice(0, -1);
      [stem + 'e', stem.slice(0, -2) + stem.slice(-1) + 'e'].forEach(function (x) { if (out.indexOf(x) < 0) out.push(x); });
    }
    if (tense === 'praeteritum' && person === 1) { var b = base.split(' ')[0]; if (/[sßzx]est$/.test(b)) out.push(base.replace(/est\b/, 't')); }
    return out;
  }
  function grade(v, tense, person, given) {
    var g = norm(given); if (!g) return 'empty';
    var alts = PRON_ALTS[person], sols = solutions(v, tense, person);
    var parts = g.split(' ');
    if (parts.length > 1) {
      var p0 = parts[0], hit = alts.indexOf(p0) >= 0 || (person === 2 && /^(er|sie|es)\/(sie|er|es)(\/(es|er|sie))?$/.test(p0)) || (person === 5 && p0 === 'sie/sie');
      if (hit) g = parts.slice(1).join(' ');
    }
    var i;
    for (i = 0; i < sols.length; i++) if (g === norm(sols[i])) return 'ok';
    for (i = 0; i < sols.length; i++) if (tl(g) === tl(norm(sols[i])) && /[äöüß]/.test(sols[i])) return 'near';
    return 'bad';
  }

  /* ---------- spill ---------- */
  function createGame(verbs, opts) {
    opts = opts || {};
    var byInf = {}; verbs.forEach(function (v) { byInf[v.i] = v; });
    var seed = (opts.seed != null ? opts.seed : Math.floor(Math.random() * 4294967296)) >>> 0;
    var rnd = mulberry(seed);
    var G = {
      code: opts.code || '', seq: 0, phase: 'lobby', settings: Object.assign(defaults(), opts.settings || {}),
      board: null, players: [], turn: 0, stage: 'idle', cur: null, last: null, log: [], events: [], winner: null, summary: null,
      deadline: 0, resultUntil: 0, goneSince: 0, nextPid: 1, tokens: {}, errors: [], round: 0
    };
    var api = {};

    function pl(pid) { for (var i = 0; i < G.players.length; i++) if (G.players[i].id === pid) return G.players[i]; return null; }
    function curP() { return G.players[G.turn] || null; }
    function addLog(txt, cls) { G.log.push({ t: txt, c: cls || '' }); if (G.log.length > 60) G.log.shift(); }
    function bump() { G.seq++; }
    function ev(e) { G.events.push(e); }
    function cleanName(n, fallbackIdx) {
      n = String(n || '').replace(/[<>&"]/g, '').replace(/\s+/g, ' ').trim().slice(0, 14);
      return n || ('Spiller ' + (fallbackIdx + 1));
    }
    function uniqName(n) {
      var base = n, k = 2; while (G.players.some(function (p) { return p.name.toLowerCase() === n.toLowerCase(); })) { n = base + ' ' + k++; if (n.length > 16) n = base.slice(0, 12) + ' ' + (k - 1); }
      return n;
    }
    function pickIcon(want) {
      var taken = G.players.map(function (p) { return p.icon; });
      if (want && ICONS.indexOf(want) >= 0 && taken.indexOf(want) < 0) return want;
      for (var i = 0; i < ICONS.length; i++) if (taken.indexOf(ICONS[i]) < 0) return ICONS[i];
      return ICONS[G.players.length % ICONS.length];
    }

    api.G = G;
    api.poolSize = function (s) { return pool(verbs, Object.assign({}, G.settings, s || {})).length; };
    api.setSettings = function (s) {
      if (G.phase !== 'lobby') return false;
      var t = G.settings;
      if (s.sets) t.sets = s.sets.filter(function (x) { return SETS.indexOf(x) >= 0; });
      if (s.level && ['A1', 'A2', 'B1'].indexOf(s.level) >= 0) t.level = s.level;
      if (s.tenses) t.tenses = s.tenses.filter(function (x) { return TENSES[x]; });
      if (s.size && SIZES[s.size]) t.size = s.size;
      if (s.time != null) t.time = Math.max(0, Math.min(120, parseInt(s.time, 10) || 0));
      if (s.help != null) t.help = !!s.help;
      if (s.hostPlays != null) t.hostPlays = !!s.hostPlays;
      bump(); return true;
    };
    api.addPlayer = function (info) {
      info = info || {};
      if (G.players.length >= 10) return { ok: false, msg: 'Rommet er fullt (maks 10 spillere).' };
      var tok = info.token || ('t' + Math.random().toString(36).slice(2, 10));
      var p = { id: 'p' + (G.nextPid++), name: uniqName(cleanName(info.name, G.players.length)), icon: pickIcon(info.icon), pos: 0, conn: true, local: !!info.local, right: 0, wrong: 0, best: 0, streak: 0, finished: false };
      G.players.push(p); G.tokens[p.id] = tok;
      addLog(p.name + ' ' + p.icon + ' ble med', 'sys');
      if (G.phase === 'play' && G.stage === 'idle') { G.stage = 'roll'; G.turn = G.players.length - 1; }
      bump(); return { ok: true, pid: p.id, token: tok, name: p.name, icon: p.icon };
    };
    api.rejoin = function (token) {
      for (var pid in G.tokens) if (G.tokens[pid] === token) { var p = pl(pid); if (p) { p.conn = true; bump(); return pid; } }
      return null;
    };
    api.setConn = function (pid, on) { var p = pl(pid); if (!p || p.local || p.conn === on) return; p.conn = on; addLog(p.name + (on ? ' er tilbake' : ' mistet kontakten'), 'sys'); bump(); };
    api.removePlayer = function (pid) {
      var i = G.players.findIndex(function (p) { return p.id === pid; }); if (i < 0) return;
      var wasCur = (G.phase === 'play' && i === G.turn);
      var name = G.players[i].name;
      G.players.splice(i, 1); delete G.tokens[pid];
      addLog(name + ' forlot spillet', 'sys');
      if (G.phase === 'play') {
        if (!G.players.length) { G.stage = 'idle'; G.cur = null; }
        else {
          if (i < G.turn) G.turn--;
          if (wasCur) { if (G.turn >= G.players.length) G.turn = 0; G.cur = null; G.stage = 'roll'; markTurn(Date.now()); }
        }
      }
      bump();
    };
    api.start = function () {
      if (G.phase !== 'lobby') return { ok: false, msg: 'Spillet er allerede i gang.' };
      if (!G.players.length) return { ok: false, msg: 'Det trengs minst én spiller.' };
      var vp = pool(verbs, G.settings);
      if (vp.length < 4) return { ok: false, msg: 'For få verb med disse valgene (' + vp.length + '). Velg flere verbgrupper eller et høyere nivå.' };
      if (!G.settings.tenses.length) return { ok: false, msg: 'Velg minst én tid.' };
      var rows = SIZES[G.settings.size] || 7, n = rows * COLS;
      var brnd = mulberry(seed + G.round * 977 + 13);
      G.board = { rows: rows, cols: COLS, n: n, squares: buildSquares(n, vp, G.settings.tenses, brnd), jumps: genJumps(n, brnd) };
      G.players.forEach(function (p) { p.pos = 0; p.right = p.wrong = p.best = p.streak = 0; p.finished = false; });
      G.phase = 'play'; G.stage = 'roll'; G.turn = 0; G.cur = null; G.last = null; G.winner = null; G.summary = null; G.errors = []; G.log = [];
      addLog('Spillet er i gang! Terningen bestemmer personen: 1 = ich, 2 = du, 3 = er/sie/es, 4 = wir, 5 = ihr, 6 = sie/Sie.', 'sys');
      G.events = []; ev({ k: 'start' });
      markTurn(Date.now()); bump(); return { ok: true };
    };
    function markTurn(now) { G.goneSince = 0; G.deadline = 0; G.cur = null; var p = curP(); if (p && !p.conn) G.goneSince = now; }

    api.roll = function (pid, now) {
      now = now || Date.now();
      var p = curP();
      if (G.phase !== 'play' || G.stage !== 'roll' || !p || p.id !== pid) return { ok: false };
      var die = 1 + Math.floor(rnd() * 6), from = p.pos, target = Math.min(from + die, G.board.n - 1);
      var sq = G.board.squares[target];
      var path = []; for (var c = from + 1; c <= target; c++) path.push(c);
      G.events = [{ k: 'roll', pid: pid, die: die }, { k: 'move', pid: pid, path: path }];
      G.cur = { pid: pid, die: die, person: die - 1, from: from, target: target, v: sq.v, n: sq.n, t: sq.t, sep: sq.sep, ref: sq.ref };
      p.pos = target; G.stage = 'answer';
      G.deadline = G.settings.time ? now + G.settings.time * 1000 : 0;
      bump(); return { ok: true };
    };
    api.answer = function (pid, text, now, timedOut) {
      now = now || Date.now();
      var p = curP();
      if (G.phase !== 'play' || G.stage !== 'answer' || !p || p.id !== pid) return { ok: false };
      var c = G.cur, v = byInf[c.v], g = timedOut ? 'empty' : grade(v, c.t, c.person, text);
      var ok = (g === 'ok' || g === 'near'), sol = solutions(v, c.t, c.person)[0];
      var prev = c.from, finalPos = c.target, jump = null;
      G.events = [];
      if (ok) {
        p.right++; p.streak++; if (p.streak > p.best) p.best = p.streak;
        G.board.jumps.forEach(function (j) { if (j.from === c.target) jump = j; });
        if (jump) { finalPos = jump.to; }
        p.pos = finalPos;
        ev({ k: 'result', pid: pid, ok: true });
        if (jump) ev({ k: 'jump', pid: pid, from: jump.from, to: jump.to, type: jump.type });
        if (finalPos >= G.board.n - 1) { p.finished = true; G.winner = p.id; ev({ k: 'win', pid: pid }); }
      } else {
        p.wrong++; p.streak = 0; p.pos = prev;
        var back = []; for (var k = c.target - 1; k >= prev; k--) back.push(k);
        ev({ k: 'result', pid: pid, ok: false }); ev({ k: 'back', pid: pid, path: back });
        G.errors.push({ pid: pid, name: p.name, v: c.v, n: c.n, t: c.t, person: c.person, given: timedOut ? '' : String(text || '').trim().slice(0, 40), sol: sol });
      }
      var pr = PRON[c.person], tl_ = TENSES[c.t].label;
      G.last = { pid: pid, ok: ok, near: g === 'near', timeout: !!timedOut, given: timedOut ? '' : String(text || '').trim().slice(0, 40), sol: sol, v: c.v, n: c.n, t: c.t, person: c.person, die: c.die, from: prev, to: p.pos, jump: jump ? jump.type : '' };
      addLog(p.name + ': ' + c.v + ' (' + tl_ + ') – ' + pr + (ok ? ' ✓ ' : ' ✗ ') + (ok ? sol : (timedOut ? '(tiden gikk ut) → ' + sol : (G.last.given || '–') + ' → ' + sol)) + (jump ? (jump.type === 'ladder' ? ' 🪜' : ' 🛝') : ''), ok ? 'ok' : 'bad');
      G.stage = 'result'; G.deadline = 0; G.resultUntil = now + (ok ? RESULT_MS_OK : RESULT_MS_BAD) + (jump ? 1200 : 0);
      bump(); return { ok: true, good: ok };
    };
    function advance(now) {
      if (G.winner) { finish('win'); return; }
      if (!G.players.length) { G.stage = 'idle'; return; }
      // neste tilkoblede (eller lokale) spiller
      var n = G.players.length, i, idx = G.turn;
      for (i = 1; i <= n; i++) { var j = (G.turn + i) % n; if (G.players[j].conn || G.players[j].local) { idx = j; break; } }
      if (i > n) idx = (G.turn + 1) % n;
      G.turn = idx; G.stage = 'roll'; G.events = [{ k: 'turn', pid: G.players[idx].id }]; markTurn(now);
      bump();
    }
    function finish(why) {
      G.phase = 'end'; G.stage = 'idle'; G.cur = null; G.events = [{ k: 'end' }];
      var rank = G.players.slice().sort(function (a, b) {
        if (a.finished !== b.finished) return a.finished ? -1 : 1;
        if (b.pos !== a.pos) return b.pos - a.pos;
        return b.right - a.right;
      }).map(function (p, i) { return { pid: p.id, name: p.name, icon: p.icon, pos: p.pos, right: p.right, wrong: p.wrong, best: p.best, finished: p.finished, rank: i + 1 }; });
      var agg = {};
      G.errors.forEach(function (e) { var k = e.v + '|' + e.t; (agg[k] = agg[k] || { v: e.v, n: e.n, t: e.t, count: 0, items: [] }); agg[k].count++; agg[k].items.push({ name: e.name, person: e.person, given: e.given, sol: e.sol }); });
      var hard = Object.keys(agg).map(function (k) { return agg[k]; }).sort(function (a, b) { return b.count - a.count; });
      G.summary = { why: why, rank: rank, hard: hard, errors: G.errors.slice() };
      addLog(why === 'win' ? '🏆 ' + (pl(G.winner) ? pl(G.winner).name : '') + ' kom først i mål!' : 'Spillet ble avsluttet.', 'sys');
      bump();
    }
    api.tick = function (now) {
      now = now || Date.now(); var changed = false, p = curP();
      if (G.phase !== 'play') return false;
      if (G.stage === 'answer' && G.deadline && now >= G.deadline && p) { api.answer(p.id, '', now, true); return true; }
      if (G.stage === 'result' && now >= G.resultUntil) { advance(now); return true; }
      if (G.stage === 'roll' && p && !p.conn && !p.local) {
        if (!G.goneSince) G.goneSince = now;
        else if (now - G.goneSince >= GONE_MS) { addLog(p.name + ' var borte – turen hoppes over', 'sys'); advance(now); return true; }
      }
      return changed;
    };
    api.skip = function (now) {
      if (G.phase !== 'play' || !curP() || G.stage === 'result') return false;
      addLog(curP().name + ' ble hoppet over', 'sys');
      if (G.stage === 'answer') { var c = G.cur, p = curP(); p.pos = c.from; }
      advance(now || Date.now()); return true;
    };
    api.endGame = function () { if (G.phase === 'play') { finish('ended'); return true; } return false; };
    api.toLobby = function () {
      G.phase = 'lobby'; G.stage = 'idle'; G.board = null; G.cur = null; G.last = null; G.winner = null; G.summary = null; G.errors = []; G.events = []; G.log = []; G.round++;
      G.players = G.players.filter(function (p) { return p.local || p.conn; });
      G.players.forEach(function (p) { p.pos = 0; p.right = p.wrong = p.best = p.streak = 0; p.finished = false; });
      Object.keys(G.tokens).forEach(function (k) { if (!pl(k)) delete G.tokens[k]; });
      bump();
    };
    api.snapshot = function (now) {
      now = now || Date.now();
      var cur = G.cur ? Object.assign({}, G.cur) : null;
      if (cur) cur.remaining = (G.stage === 'answer' && G.deadline) ? Math.max(0, G.deadline - now) : null;
      return {
        v: 1, code: G.code, seq: G.seq, phase: G.phase, stage: G.stage, settings: G.settings, board: G.board,
        players: G.players.map(function (p) { return { id: p.id, name: p.name, icon: p.icon, pos: p.pos, conn: p.conn, local: p.local, right: p.right, wrong: p.wrong, best: p.best, finished: p.finished }; }),
        turn: G.turn, cur: cur, last: G.last, log: G.log.slice(-30), events: G.events, winner: G.winner, summary: G.summary,
        resultMs: (G.stage === 'result') ? Math.max(0, G.resultUntil - now) : 0
      };
    };
    api.clearEvents = function () { G.events = []; };
    api.hasToken = function (tok) { for (var k in G.tokens) if (G.tokens[k] === tok) return k; return null; };
    api.serialize = function () { return JSON.stringify({ seed: seed, G: G }); };
    return api;
  }
  function restore(verbs, json) {
    var o = JSON.parse(json), g = createGame(verbs, { seed: o.seed, code: o.G.code });
    Object.keys(o.G).forEach(function (k) { g.G[k] = o.G[k]; });
    g.G.players.forEach(function (p) { if (!p.local) p.conn = false; });
    return g;
  }

  return { createGame: createGame, restore: restore, kindOf: kindOf, pool: pool, defaults: defaults, grade: grade, solutions: solutions, PRON: PRON, TENSES: TENSES, SETS: SETS, SIZES: SIZES, ICONS: ICONS, COLS: COLS };
});
