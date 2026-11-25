/* Deutschwelt — «Wer ist es?» spillmotor (kjører hos verten; ren JS, testes i node).
   Moduser:
     duell  – to spillere, hver med en hemmelig person; de spør vekselvis, motstanderen svarer ja/nein.
     klasse – læreren (verten) har en hemmelig person, elevene spør etter tur (alle ser samme brett). Læreren svarer (eller svar automatisk).
              Solo = klasse med verten som eneste elev og automatisk svar.
   Meldinger inn:  pick{id}  ask{q}  answer{yes}  dim{id}  guess{id}  endturn
   Alle metodene returnerer  {ok:true}  eller  {err:'tekst'}. snapshot(key) lager en personlig utgave av tilstanden (hemmelig info følger rollen). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data.js'));
  else root.DWWerEngine = factory(root.DWWerData);
})(typeof self !== 'undefined' ? self : this, function (D) {
  'use strict';
  function rnd(n) { return Math.floor(Math.random() * n); }
  function create(cfg) {
    var S = {
      phase: 'lobby', mode: 'duell', set: 'look', level: 'A1', dimHelp: 'knapp', guessRule: 'turn', maxQ: 20, lives: 3, auto: false, solo: false,
      players: [], turn: 0, q: null, asked: false, qCount: 0, secret: null, dim: [], log: [], result: null, seq: 0, round: 0
    };
    var G = { S: S };
    if (cfg) Object.keys(cfg).forEach(function (k) { S[k] = cfg[k]; });
    function bump() { S.seq++; }
    function chars() { return D.chars(S.set); }
    function find(key) { for (var i = 0; i < S.players.length; i++) if (S.players[i].key === key) return S.players[i]; return null; }
    function log(text, kind) { S.log.push({ t: text, k: kind || '' }); if (S.log.length > 40) S.log.shift(); }
    function cur() { return S.players[S.turn] || null; }
    function opp() { return S.mode === 'duell' ? S.players[1 - S.turn] : null; }

    G.addPlayer = function (key, name, icon, isHost) {
      var p = find(key);
      if (p) { p.online = true; if (name) p.name = name; if (icon) p.icon = icon; bump(); return p; }
      if (S.phase !== 'lobby' && S.mode === 'duell') return null;
      var max = S.mode === 'duell' ? 2 : 30; if (S.players.length >= max) return null;
      p = { key: key, name: name || 'Spiller', icon: icon || '🙂', online: true, secret: null, host: !!isHost };
      S.players.push(p); bump(); return p;
    };
    G.removePlayer = function (key) { if (S.phase !== 'lobby') { var p = find(key); if (p) { p.online = false; bump(); } return; } S.players = S.players.filter(function (p) { return p.key !== key; }); bump(); };
    G.setOnline = function (key, on) { var p = find(key); if (p) { p.online = on; bump(); } };
    G.configure = function (o) { if (S.phase !== 'lobby') return; ['mode', 'set', 'level', 'dimHelp', 'guessRule', 'maxQ', 'lives', 'auto'].forEach(function (k) { if (o[k] !== undefined) S[k] = o[k]; }); if (S.mode === 'duell' && S.players.length > 2) S.players = S.players.slice(0, 2); bump(); };
    G.check = function () {
      if (S.mode === 'duell' && S.players.length !== 2) return 'Duellen trenger nøyaktig to spillere.';
      if (S.mode === 'klasse' && !S.solo && S.players.length < 1) return 'Vent til minst én elev har gått inn.';
      return '';
    };
    G.start = function () {
      var e = G.check(); if (e) return { err: e };
      S.round++; S.q = null; S.asked = false; S.qCount = 0; S.dim = []; S.log = []; S.result = null; S.livesLeft = S.lives; S.hostAnswers = false;
      S.players.forEach(function (p) { p.secret = null; });
      if (S.mode === 'duell') { S.phase = 'pick'; S.turn = rnd(2); log('Velg din hemmelige person.', 'sys'); }
      else {
        S.turn = 0;
        if (S.solo || S.auto) { S.secret = rnd(chars().length); S.phase = 'play'; log('Datamaskinen har valgt en hemmelig person. Still ja/nein-spørsmål!', 'sys'); }
        else { S.secret = null; S.phase = 'pick'; log('Læreren velger en hemmelig person.', 'sys'); }
      }
      bump(); return { ok: true };
    };
    G.pick = function (key, id) {
      if (S.phase !== 'pick') return { err: 'Ikke i valgfasen.' };
      id = parseInt(id, 10); if (!(id >= 0 && id < chars().length)) return { err: 'Ugyldig valg.' };
      if (S.mode === 'duell') {
        var p = find(key); if (!p) return { err: 'Ukjent spiller.' }; p.secret = id;
        if (S.players.every(function (x) { return x.secret != null; })) { S.phase = 'play'; log(cur().name + ' begynner.', 'sys'); }
      } else { if (key !== 'host') return { err: 'Bare læreren velger.' }; S.secret = id; S.phase = 'play'; log('Den hemmelige personen er valgt. ' + (cur() ? cur().name + ' spør først.' : ''), 'sys'); }
      bump(); return { ok: true };
    };
    G.randomSecret = function () { if (S.mode === 'klasse' && S.phase === 'pick') return G.pick('host', rnd(chars().length)); return { err: 'Ikke nå.' }; };
    function answererKey() { return S.mode === 'duell' ? (opp() && opp().key) : 'host'; }
    function secretOfAnswerer() { return S.mode === 'duell' ? chars()[opp().secret] : chars()[S.secret]; }
    G.ask = function (key, q) {
      if (S.phase !== 'play') return { err: 'Spillet pågår ikke.' };
      var me = cur(); if (!me || me.key !== key) return { err: 'Det er ikke din tur.' };
      if (S.asked) return { err: 'Du har allerede stilt et spørsmål denne turen.' };
      if (S.mode === 'klasse' && S.qCount >= S.maxQ) return { err: 'Alle spørsmålene er brukt opp – nå kan du bare gjette.' };
      if (!D.valid(S.set, q)) return { err: 'Ugyldig spørsmål.' };
      var human = S.mode === 'duell' || !(S.solo || S.auto);
      if (q.free != null && !human) return { err: 'Egne spørsmål kan bare brukes når et menneske svarer.' };
      var rec = { from: key, fromName: me.name, a: q.a || null, op: q.op || null, free: q.free != null ? q.free.trim() : null, text: D.text(S.set, q), status: 'wait', yes: null, sentence: '', corrected: false };
      if (q.free == null) rec.truth = D.evalQ(S.set, q, secretOfAnswerer());
      S.q = rec; S.asked = true; S.qCount++;
      log(me.name + ': ' + rec.text, 'q');
      if (!human) { finishAnswer(rec.truth, false); }
      bump(); return { ok: true };
    };
    function finishAnswer(yes, corrected) {
      var q = S.q, secret = secretOfAnswerer();
      q.status = 'answered'; q.yes = !!yes; q.corrected = !!corrected;
      q.sentence = D.sentence(S.set, q.free != null ? { free: q.free } : { a: q.a, op: q.op }, secret, yes);
      log('→ ' + q.sentence + (corrected ? ' (rettet)' : ''), yes ? 'ok' : 'no');
      if (S.dimHelp === 'auto' && q.free == null) {
        var all = chars().filter(function (c) { return D.evalQ(S.set, { a: q.a, op: q.op }, c) !== q.yes; }).map(function (c) { return c.id; });
        all.forEach(function (id) { if (S.dim.indexOf(id) < 0) S.dim.push(id); });
      }
    }
    G.answer = function (key, yes) {
      if (S.phase !== 'play' || !S.q || S.q.status !== 'wait') return { err: 'Ingen spørsmål venter.' };
      if (key !== answererKey()) return { err: 'Det er ikke du som skal svare.' };
      var corrected = false;
      if (S.q.free == null && !!yes !== S.q.truth) { corrected = true; yes = S.q.truth; }
      finishAnswer(!!yes, corrected); bump(); return { ok: true, corrected: corrected };
    };
    G.dim = function (key, id) {
      if (S.mode !== 'klasse') return { err: 'Dimming er privat i duellen.' };
      var me = cur(); if (key !== 'host' && (!me || me.key !== key)) return { err: 'Bare den som spør, kan dimme.' };
      id = parseInt(id, 10); var i = S.dim.indexOf(id); if (i >= 0) S.dim.splice(i, 1); else S.dim.push(id); bump(); return { ok: true };
    };
    G.dimMany = function (key, ids, on) { if (S.mode !== 'klasse') return { err: 'Privat i duellen.' }; ids.forEach(function (id) { var i = S.dim.indexOf(id); if (on && i < 0) S.dim.push(id); if (!on && i >= 0) S.dim.splice(i, 1); }); bump(); return { ok: true }; };
    G.guess = function (key, id) {
      if (S.phase !== 'play') return { err: 'Spillet pågår ikke.' };
      var me = cur(); if (!me || me.key !== key) return { err: 'Det er ikke din tur.' };
      if (S.q && S.q.status === 'wait') return { err: 'Vent på svaret først.' };
      id = parseInt(id, 10); if (!(id >= 0 && id < chars().length)) return { err: 'Ugyldig valg.' };
      var target = S.mode === 'duell' ? opp().secret : S.secret, ch = chars()[id];
      if (id === target) {
        S.phase = 'end'; S.result = { win: key, winName: me.name, guess: id, questions: S.qCount, secret: target };
        log('🎉 ' + me.name + ' gjettet riktig: ' + ch.name + '!', 'ok');
      } else {
        log('❌ ' + me.name + ' gjettet ' + ch.name + ' – feil.', 'no');
        if (S.mode === 'duell') {
          if (S.guessRule === 'lose') { S.phase = 'end'; S.result = { win: opp().key, winName: opp().name, lostBy: key, guess: id, secret: target, questions: S.qCount }; }
          else nextTurn(true);
        } else {
          S.livesLeft--; if (S.dim.indexOf(id) < 0) S.dim.push(id);
          if (S.livesLeft <= 0) { S.phase = 'end'; S.result = { win: null, secret: target, questions: S.qCount, lostLives: true }; log('Ingen liv igjen. Den hemmelige personen var ' + chars()[target].name + '.', 'no'); }
          else nextTurn(true);
        }
      }
      bump(); return { ok: true, correct: id === target };
    };
    function nextTurn(keepQ) {
      S.turn = S.mode === 'duell' ? 1 - S.turn : (S.turn + 1) % S.players.length; S.asked = false;
      if (!keepQ) S.q = null;
      var tries = 0; while (S.mode === 'klasse' && !S.solo && S.players[S.turn] && !S.players[S.turn].online && tries++ < S.players.length) S.turn = (S.turn + 1) % S.players.length;
      if (cur()) log(cur().name + ' sin tur.', 'sys');
    }
    G.endTurn = function (key) {
      if (S.phase !== 'play') return { err: 'Spillet pågår ikke.' };
      var me = cur(); if (!me || me.key !== key) return { err: 'Det er ikke din tur.' };
      if (S.q && S.q.status === 'wait') return { err: 'Vent på svaret.' };
      nextTurn(false); bump(); return { ok: true };
    };
    G.skipTurn = function () { if (S.phase === 'play' && !(S.q && S.q.status === 'wait')) { nextTurn(false); bump(); } };
    G.hostEnd = function () { if (S.phase === 'play' || S.phase === 'pick') { S.phase = 'end'; S.result = { win: null, aborted: true, secret: S.mode === 'klasse' ? S.secret : null, questions: S.qCount }; bump(); } };
    G.toLobby = function () { S.phase = 'lobby'; S.q = null; S.result = null; S.log = []; S.players.forEach(function (p) { p.secret = null; }); S.players = S.players.filter(function (p) { return p.online || p.host; }); bump(); };

    /* ---- personlig utgave ---- */
    G.snapshot = function (key) {
      var me = find(key), isHost = key === 'host';
      var teacher = S.mode === 'klasse' && isHost && !S.solo;
      var role = 'watcher';
      if (S.phase === 'play') {
        var c = cur();
        if (S.mode === 'duell') {
          if (c && c.key === key) role = S.q && S.q.status === 'wait' ? 'waitAnswer' : 'asker';
          else if (me) role = S.q && S.q.status === 'wait' ? 'answerer' : 'waitTurn';
        } else {
          if (c && c.key === key) role = S.q && S.q.status === 'wait' ? 'waitAnswer' : 'asker';
          else if (teacher) role = S.q && S.q.status === 'wait' ? 'answerer' : 'teacher';
        }
      }
      var q = null;
      if (S.q) { q = { from: S.q.from, fromName: S.q.fromName, a: S.q.a, op: S.q.op, free: S.q.free, text: S.q.text, status: S.q.status, yes: S.q.yes, sentence: S.q.sentence, corrected: S.q.corrected }; if (teacher || (S.mode === 'duell' && role === 'answerer')) q.truth = S.q.truth; }
      var secret = null;
      if (S.mode === 'duell' && me) secret = me.secret; else if (teacher) secret = S.secret;
      var end = S.phase === 'end';
      return {
        seq: S.seq, phase: S.phase, mode: S.mode, set: S.set, level: S.level, dimHelp: S.dimHelp, guessRule: S.guessRule, maxQ: S.maxQ, lives: S.lives, livesLeft: S.livesLeft, auto: S.auto, solo: S.solo, round: S.round,
        players: S.players.map(function (p) { return { key: p.key, name: p.name, icon: p.icon, online: p.online, ready: S.mode === 'duell' ? p.secret != null : true, host: !!p.host, secret: end && S.mode === 'duell' ? p.secret : undefined }; }),
        turnKey: cur() ? cur().key : null, q: q, asked: S.asked, qCount: S.qCount, dim: S.mode === 'klasse' ? S.dim.slice() : null, log: S.log.slice(-14), result: S.result,
        me: { key: key, role: role, teacher: teacher, secret: secret },
        secret: end ? (S.mode === 'klasse' ? S.secret : null) : undefined
      };
    };
    return G;
  }
  return { create: create };
});
