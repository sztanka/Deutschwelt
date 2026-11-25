/* Deutschwelt — felles spillkjerne for brettspill med tyskoppgaver (kjører kun hos verten)
   Brukes av Gåsespillet, Hesteveddeløpet og Ulv og sauer. Selve spillreglene ligger i en «regelpakke» (rules) per spill;
   denne filen tar seg av spillere, turrekkefølge, oppgaver, retting, tidsgrenser, resultatliste og «snapshots» til alle klienter.
   Ren logikk uten DOM og nettverk, slik at den kan testes i Node (module.exports) og brukes i nettleseren (window.DWBoard).
   Oppgavene lages av oppgavemotoren i ../aergere-dich-nicht/engine.js (DWLudo): oversettelse, artikler, pronomen/eiendomsord og verbbøying.
   Fasiten (priv) sendes aldri til gjestene før oppgaven er besvart.

   Regelpakke (rules) – funksjoner som kalles med H (hjelpeobjekt: H.G, H.rnd, H.rint, H.ev, H.log, H.pl, H.win) :
     id, minPlayers(settings), maxPlayers, tiers (valgfritt: {navn:{level:'A1',answerMode:'velg'}} – egne oppgavegeneratorer)
     defaults(), setExtra(settings, s), initPlayer(p), check(H) → feilmelding eller ''
     start(H)                  – lag brett/tilstand (H.G.X) når spillet starter
     begin(H,p,arg)            – spilleren starter turen («go»). Returnerer {die,tier,info,events,none,msg,extra} eller null hvis ugyldig
     onCorrect(H,p,cur)        – riktig svar. Returnerer {events,extra,pick:[{id,…}],last,ms}
     onWrong(H,p,cur)          – feil svar. Returnerer {events,last,ms}
     pick(H,p,cur,move)        – spilleren valgte ett av trekkene i pick. Returnerer {events,extra,last,ms}
     next(H)                   – (valgfri) indeks til neste spiller. Ellers vanlig runde (med skip-tellere)
     rank(H) → spillere sortert (beste først) · score(H,p) → tekst · view(H) → offentlig brettstatus · pubPlayer(p,H) → ekstra felt */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../aergere-dich-nicht/engine.js'));
  else root.DWBoard = factory(root.DWLudo);
})(typeof self !== 'undefined' ? self : this, function (L) {
  'use strict';

  var TASK_KEYS = ['tasks', 'themes', 'level', 'transDir', 'answerMode', 'reqArt', 'sets', 'tenses', 'help'];
  var COLORS = [{ name: 'Rød', col: '#e53935' }, { name: 'Blå', col: '#1e88e5' }, { name: 'Grønn', col: '#43a047' }, { name: 'Oransje', col: '#fb8c00' },
    { name: 'Lilla', col: '#8e24aa' }, { name: 'Turkis', col: '#00acc1' }, { name: 'Brun', col: '#6d4c41' }, { name: 'Rosa', col: '#d81b60' }];
  var RESULT_OK = 2400, RESULT_BAD = 4800, RESULT_NONE = 2200, GONE_MS = 9000, PICK_MS = 30000;

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
  function cpy(v) { return Array.isArray(v) ? v.slice() : v; }

  function createGame(verbs, R, opts) {
    opts = opts || {};
    var byInf = {}; verbs.forEach(function (v) { byInf[v.i] = v; });
    var seed = (opts.seed != null ? opts.seed : Math.floor(Math.random() * 4294967296)) >>> 0;
    var rnd = mulberry(seed);
    var MAXP = R.maxPlayers || 4;
    var G = {
      code: opts.code || '', seq: 0, phase: 'lobby', stage: 'idle', settings: null, players: [], turn: 0, cur: null, last: null, log: [], events: [],
      winner: null, over: false, summary: null, deadline: 0, resultUntil: 0, pickUntil: 0, goneSince: 0, nextPid: 1, tokens: {}, errors: [], round: 0, endAt: 0, extra: false, tid: 0, X: null
    };
    var d0 = L.defaults(), base = {};
    TASK_KEYS.forEach(function (k) { base[k] = cpy(d0[k]); });
    G.settings = Object.assign(base, { time: 0, minutes: 0, hostPlays: false }, R.defaults ? R.defaults() : {});
    var api = {};

    /* ----- oppgavegeneratorer (én vanlig + én per vanskelighetsgrad) ----- */
    var gens = { base: L.createGame(verbs, { seed: seed + 1 }) };
    Object.keys(R.tiers || {}).forEach(function (k) { gens[k] = L.createGame(verbs, { seed: seed + 7 + hash(k) }); });
    function syncGens() {
      var st = {}; TASK_KEYS.forEach(function (k) { st[k] = cpy(G.settings[k]); });
      gens.base.setSettings(st);
      Object.keys(R.tiers || {}).forEach(function (k) {
        gens[k].setSettings(Object.assign({}, st, R.tiers[k]));
        if (gens[k].check()) gens[k].setSettings(st);   // for få ord/verb med denne graden → bruk vanlige valg
      });
    }
    syncGens();
    function pickTask(tier, die) { var g = gens[tier] || gens.base; return g._pickTask(die || (1 + Math.floor(rnd() * 6))); }

    function pl(pid) { for (var i = 0; i < G.players.length; i++) if (G.players[i].id === pid) return G.players[i]; return null; }
    function curP() { return G.players[G.turn] || null; }
    function addLog(txt, cls) { G.log.push({ t: txt, c: cls || '' }); if (G.log.length > 60) G.log.shift(); }
    function bump() { G.seq++; }
    function ev(e) { G.events.push(e); }
    function rint(n) { return Math.floor(rnd() * n); }
    function usable(p) { return p && !p.gone && (p.conn || p.local); }
    var H = {
      G: G, rnd: rnd, rint: rint, ev: ev, log: addLog, pl: pl, cur: curP,
      stop: function () { G.over = true; },
      win: function (p) { if (!p.finished) { p.finished = true; if (!G.winner) G.winner = p.id; ev({ k: 'win', pid: p.id }); } }
    };
    function cleanName(n, idx) { n = String(n || '').replace(/[<>&"]/g, '').replace(/\s+/g, ' ').trim().slice(0, 14); return n || ('Spiller ' + (idx + 1)); }
    function uniqName(n) { var base = n, k = 2; while (G.players.some(function (p) { return p.name.toLowerCase() === n.toLowerCase(); })) { n = base + ' ' + k++; if (n.length > 16) n = base.slice(0, 12) + ' ' + (k - 1); } return n; }
    function pickIcon(want) {
      var icons = L.ICONS, taken = G.players.map(function (p) { return p.icon; });
      if (want && icons.indexOf(want) >= 0 && taken.indexOf(want) < 0) return want;
      for (var i = 0; i < icons.length; i++) if (taken.indexOf(icons[i]) < 0) return icons[i];
      return icons[G.players.length % icons.length];
    }
    function reseat() { G.players.forEach(function (p, i) { p.seat = i; }); }

    api.G = G; api.sync = syncGens; api.gens = gens;
    api.pools = function (s) { return gens.base.pools(s); };
    api.check = function () { return gens.base.check(); };
    api.setSettings = function (s) {
      if (G.phase !== 'lobby') return false;
      var sub = {}; TASK_KEYS.forEach(function (k) { if (s[k] != null) sub[k] = s[k]; });
      gens.base.setSettings(sub);
      TASK_KEYS.forEach(function (k) { G.settings[k] = cpy(gens.base.G.settings[k]); });
      var t = G.settings;
      if (s.time != null) t.time = Math.max(0, Math.min(120, parseInt(s.time, 10) || 0));
      if (s.minutes != null) t.minutes = Math.max(0, Math.min(90, parseInt(s.minutes, 10) || 0));
      if (s.hostPlays != null) t.hostPlays = !!s.hostPlays;
      if (R.setExtra) R.setExtra(t, s, H);
      syncGens(); bump(); return true;
    };
    api.addPlayer = function (info) {
      info = info || {};
      if (G.players.length >= MAXP) return { ok: false, msg: 'Rommet er fullt (maks ' + MAXP + ' spillere).' };
      if (G.phase !== 'lobby') return { ok: false, msg: 'Spillet er allerede i gang.' };
      var tok = info.token || ('t' + Math.random().toString(36).slice(2, 10));
      var p = { id: 'p' + (G.nextPid++), name: uniqName(cleanName(info.name, G.players.length)), icon: pickIcon(info.icon), seat: G.players.length, conn: true, local: !!info.local, right: 0, wrong: 0, best: 0, streak: 0, finished: false, skip: 0, gone: false };
      if (R.initPlayer) R.initPlayer(p);
      G.players.push(p); G.tokens[p.id] = tok;
      addLog(p.name + ' ' + p.icon + ' ble med', 'sys');
      bump(); return { ok: true, pid: p.id, token: tok, name: p.name, icon: p.icon };
    };
    api.rejoin = function (token) { for (var pid in G.tokens) if (G.tokens[pid] === token) { var p = pl(pid); if (p && !p.gone) { p.conn = true; bump(); return pid; } } return null; };
    api.setConn = function (pid, on) { var p = pl(pid); if (!p || p.local || p.conn === on) return; p.conn = on; addLog(p.name + (on ? ' er tilbake' : ' mistet kontakten'), 'sys'); bump(); };
    api.removePlayer = function (pid) {
      var i = G.players.findIndex(function (p) { return p.id === pid; }); if (i < 0) return;
      var wasCur = (G.phase === 'play' && i === G.turn), name = G.players[i].name;
      if (G.phase === 'play') { G.players[i].conn = false; G.players[i].gone = true; addLog(name + ' forlot spillet', 'sys'); bump(); if (wasCur) { G.extra = false; advance(Date.now()); } return; }
      G.players.splice(i, 1); delete G.tokens[pid]; reseat(); addLog(name + ' forlot spillet', 'sys'); bump();
    };
    api.start = function (now) {
      now = now || Date.now();
      if (G.phase !== 'lobby') return { ok: false, msg: 'Spillet er allerede i gang.' };
      var act = G.players.filter(function (p) { return !p.gone; });
      var minP = R.minPlayers ? R.minPlayers(G.settings) : 1;
      if (!act.length) return { ok: false, msg: 'Det trengs minst én spiller.' };
      if (act.length < minP) return { ok: false, msg: 'Det trengs minst ' + minP + ' spillere med disse valgene.' };
      var bad = api.check(); if (bad) return { ok: false, msg: bad };
      var bad2 = R.check ? R.check(H) : ''; if (bad2) return { ok: false, msg: bad2 };
      G.players = act; reseat();
      G.players.forEach(function (p) { p.right = p.wrong = p.best = p.streak = 0; p.finished = false; p.skip = 0; if (R.initPlayer) R.initPlayer(p); });
      G.phase = 'play'; G.stage = 'roll'; G.turn = 0; G.cur = null; G.last = null; G.winner = null; G.over = false; G.summary = null; G.errors = []; G.log = []; G.extra = false; G.tid = 0;
      G.endAt = G.settings.minutes ? now + G.settings.minutes * 60000 : 0;
      G.events = [{ k: 'start' }]; G.X = {};
      if (R.start) R.start(H);
      if (R.firstTurn) { var f = R.firstTurn(H); if (f != null) G.turn = f; }
      markTurn(now); bump(); return { ok: true };
    };
    function markTurn(now) { G.goneSince = 0; G.deadline = 0; G.pickUntil = 0; G.cur = null; var p = curP(); if (p && !p.conn && !p.local) G.goneSince = now; }

    api.go = function (pid, arg, now) {
      now = now || Date.now();
      var p = curP();
      if (G.phase !== 'play' || G.stage !== 'roll' || !p || p.id !== pid) return { ok: false };
      var b = R.begin(H, p, arg); if (!b) return { ok: false };
      G.events = (b.events || []).slice();
      var die = b.die || 0;
      G.cur = { tid: ++G.tid, pid: pid, die: die, person: die ? die - 1 : 0, moves: [], task: null, priv: null, key: '', label: '', ctx: '', kind: '', info: b.info || null, tier: b.tier || '' };
      if (b.none) {
        G.last = { none: true, pid: pid, die: die, msg: b.msg || '', fields: b.fields || null };
        if (b.log) addLog(b.log, 'sys');
        G.stage = 'result'; G.resultUntil = now + (b.ms || RESULT_NONE); G.extra = !!b.extra;
        bump(); return { ok: true };
      }
      var t = pickTask(b.tier, die || 0);
      G.cur.task = t.pub; G.cur.priv = t.priv; G.cur.key = t.key; G.cur.label = t.label; G.cur.ctx = t.ctx; G.cur.kind = t.kind;
      G.stage = 'answer'; G.deadline = G.settings.time ? now + G.settings.time * 1000 : 0;
      bump(); return { ok: true };
    };
    api.answer = function (pid, text, now, timedOut) {
      now = now || Date.now();
      var p = curP();
      if (G.phase !== 'play' || G.stage !== 'answer' || !p || p.id !== pid) return { ok: false };
      var c = G.cur, given = timedOut ? '' : String(text == null ? '' : text).trim().slice(0, 60);
      var g = timedOut ? 'empty' : L.gradeTyped(c.priv, given, byInf), ok = (g === 'ok' || g === 'near');
      G.events = [{ k: 'result', pid: pid, ok: ok }];
      var info = { pid: pid, ok: ok, near: g === 'near', timeout: !!timedOut, given: given, sol: c.priv.sol, solNo: c.priv.solNo || '', die: c.die, kind: c.kind, label: c.label, task: c.task, again: false };
      G.last = info; G.deadline = 0;
      if (ok) {
        p.right++; p.streak++; if (p.streak > p.best) p.best = p.streak;
        addLog(p.name + ': ' + c.label + ' ✓', 'ok');
        var r = R.onCorrect(H, p, c) || {};
        (r.events || []).forEach(ev); Object.assign(info, r.last || {});
        G.extra = !!r.extra && !G.winner && !G.over; info.again = G.extra;
        if (r.pick && r.pick.length && !G.winner && !G.over) { G.cur.moves = r.pick; G.stage = 'pick'; G.pickUntil = now + PICK_MS; info.picking = true; }
        else { G.stage = 'result'; G.resultUntil = now + RESULT_OK + (r.ms || 0); }
      } else {
        p.wrong++; p.streak = 0; G.extra = false;
        addLog(p.name + ': ' + c.label + ' ✗ ' + (timedOut ? '(tiden gikk ut)' : (given || '–') + ' → ' + c.priv.sol), 'bad');
        G.errors.push({ pid: pid, name: p.name, kind: c.kind, key: c.key, label: c.label, ctx: c.ctx, given: given, sol: c.priv.sol, person: c.person });
        var r2 = (R.onWrong ? R.onWrong(H, p, c) : null) || {};
        (r2.events || []).forEach(ev); Object.assign(info, r2.last || {});
        G.stage = 'result'; G.resultUntil = now + RESULT_BAD + (r2.ms || 0);
      }
      bump(); return { ok: true, good: ok };
    };
    api.pick = function (pid, id, now) {
      now = now || Date.now();
      var p = curP();
      if (G.phase !== 'play' || G.stage !== 'pick' || !p || p.id !== pid) return { ok: false };
      var mv = null; G.cur.moves.forEach(function (m) { if (m.id === id) mv = m; });
      if (!mv) return { ok: false };
      G.events = [];
      var r = R.pick(H, p, G.cur, mv) || {};
      (r.events || []).forEach(ev); Object.assign(G.last, r.last || {});
      if (r.pick && r.pick.length && !G.winner && !G.over) {   // flertrinns-trekk (kjedehopp, fjerne stein): nytt valg uten nytt spørsmål
        G.cur.moves = r.pick; G.pickUntil = now + PICK_MS; G.last.picking = true; bump(); return { ok: true };
      }
      G.last.picking = false;
      if (r.extra !== undefined) G.extra = !!r.extra && !G.winner && !G.over;
      G.last.again = G.extra;
      G.stage = 'result'; G.pickUntil = 0; G.resultUntil = now + 1600 + (r.ms || 0);
      bump(); return { ok: true };
    };
    function advance(now) {
      if (G.winner || G.over) { finish(G.winner ? 'win' : 'draw'); return; }
      if (G.endAt && now >= G.endAt && !G.extra) { finish('time'); return; }
      if (!G.players.length) { G.stage = 'idle'; return; }
      var n = G.players.length, idx = G.turn, i, cp = curP();
      if (G.extra && usable(cp)) { G.extra = false; G.stage = 'roll'; G.events = [{ k: 'turn', pid: cp.id, extra: true }]; markTurn(now); bump(); return; }
      G.extra = false;
      var ni = R.next ? R.next(H) : null;
      if (ni != null) idx = ni;
      else {
        var found = false;
        for (i = 1; i <= n * 3 && !found; i++) {
          var j = (G.turn + i) % n, q = G.players[j];
          if (!usable(q)) continue;
          if (q.skip > 0) { q.skip--; addLog(q.name + ' står over denne runden', 'sys'); continue; }
          idx = j; found = true;
        }
        if (!found) idx = (G.turn + 1) % n;
      }
      G.turn = idx; G.stage = 'roll'; G.events = [{ k: 'turn', pid: G.players[idx].id }]; markTurn(now); bump();
    }
    function finish(why) {
      G.phase = 'end'; G.stage = 'idle'; G.cur = null; G.events = [{ k: 'end' }];
      var ranked = R.rank ? R.rank(H) : G.players.slice();
      var rank = ranked.map(function (p, i) { return { pid: p.id, name: p.name, icon: p.icon, seat: p.seat, right: p.right, wrong: p.wrong, best: p.best, finished: !!p.finished, rank: i + 1, score: R.score ? R.score(H, p) : '', extra: R.rankExtra ? R.rankExtra(H, p) : null }; });
      var agg = {};
      G.errors.forEach(function (e) { var k = e.key; (agg[k] = agg[k] || { key: k, kind: e.kind, label: e.label, ctx: e.ctx, count: 0, items: [] }); agg[k].count++; agg[k].items.push({ name: e.name, given: e.given, sol: e.sol, person: e.person }); });
      var hard = Object.keys(agg).map(function (k) { return agg[k]; }).sort(function (a, b) { return b.count - a.count; });
      G.summary = { why: why, rank: rank, hard: hard, errors: G.errors.slice(), note: R.endNote ? R.endNote(H, why) : '' };
      addLog(why === 'win' ? '🏆 ' + (pl(G.winner) ? pl(G.winner).name : '') + ' vant!' : why === 'time' ? 'Tiden er ute – spillet er avsluttet.' : why === 'draw' ? 'Uavgjort – spillet er over.' : 'Spillet ble avsluttet.', 'sys');
      bump();
    }
    api.tick = function (now) {
      now = now || Date.now(); var p = curP();
      if (G.phase !== 'play') return false;
      if (G.stage === 'answer' && G.deadline && now >= G.deadline && p) { api.answer(p.id, '', now, true); return true; }
      if (G.stage === 'pick' && p && G.pickUntil && now >= G.pickUntil) {
        var mv = R.autoPick ? R.autoPick(H, G.cur) : G.cur.moves[0]; api.pick(p.id, mv.id, now); return true;
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
      G.phase = 'lobby'; G.stage = 'idle'; G.cur = null; G.last = null; G.winner = null; G.over = false; G.summary = null; G.errors = []; G.events = []; G.log = []; G.round++; G.extra = false; G.X = null;
      G.players = G.players.filter(function (p) { return (p.local || p.conn) && !p.gone; });
      reseat();
      G.players.forEach(function (p) { p.right = p.wrong = p.best = p.streak = 0; p.finished = false; p.skip = 0; if (R.initPlayer) R.initPlayer(p); });
      Object.keys(G.tokens).forEach(function (k) { if (!pl(k)) delete G.tokens[k]; });
      bump();
    };
    api.snapshot = function (now) {
      now = now || Date.now();
      var cur = null;
      if (G.cur) {
        cur = { tid: G.cur.tid, pid: G.cur.pid, die: G.cur.die, person: G.cur.person, task: G.cur.task, kind: G.cur.kind || '', tier: G.cur.tier, info: G.cur.info, moves: (G.stage === 'pick' ? G.cur.moves : []),
          remaining: (G.stage === 'answer' && G.deadline) ? Math.max(0, G.deadline - now) : null, pickLeft: (G.stage === 'pick' && G.pickUntil) ? Math.max(0, G.pickUntil - now) : null };
      }
      var last = G.last ? Object.assign({}, G.last) : null;
      return {
        v: 1, game: R.id, code: G.code, seq: G.seq, phase: G.phase, stage: G.stage, settings: G.settings,
        players: G.players.map(function (p) {
          var o = { id: p.id, name: p.name, icon: p.icon, seat: p.seat, conn: p.conn, local: p.local, right: p.right, wrong: p.wrong, best: p.best, finished: p.finished, skip: p.skip || 0 };
          if (R.pubPlayer) Object.assign(o, R.pubPlayer(p, H)); return o;
        }),
        x: (G.phase !== 'lobby' && R.view) ? R.view(H) : null,
        turn: G.turn, cur: cur, last: (G.stage === 'result' || G.stage === 'pick') ? last : null, log: G.log.slice(-30), events: G.events, winner: G.winner, summary: G.summary,
        resultMs: (G.stage === 'result') ? Math.max(0, G.resultUntil - now) : 0, clockMs: (G.phase === 'play' && G.endAt) ? Math.max(0, G.endAt - now) : null
      };
    };
    api.clearEvents = function () { G.events = []; };
    api.hasToken = function (tok) { for (var k in G.tokens) if (G.tokens[k] === tok) return k; return null; };
    api.serialize = function () { return JSON.stringify({ seed: seed, G: G }); };
    api.pickTask = pickTask; api.H = H;
    return api;
  }
  function restore(verbs, R, json) {
    var o = JSON.parse(json), g = createGame(verbs, R, { seed: o.seed, code: o.G.code });
    Object.keys(o.G).forEach(function (k) { g.G[k] = o.G[k]; });
    g.G.players.forEach(function (p) { if (!p.local) p.conn = false; });
    g.sync();
    return g;
  }
  /* utskrift: lag oppgaver uten spill */
  function makeTasks(verbs, settings, n, seed) { return L.makeTasks(verbs, settings, n, seed); }

  return { createGame: createGame, restore: restore, makeTasks: makeTasks, COLORS: COLORS, TASK_KEYS: TASK_KEYS, ICONS: L.ICONS, PRON: L.PRON, TENSES: L.TENSES, SETS: L.SETS, KINDS: L.KINDS, THEMES: L.THEMES };
});
