/* Deutschwelt — Quiz-Arena: spillmotor (kjører hos læreren/verten; ren JS, testes i node).
   Et spørsmålssett er en liste av spørsmål:
     {t:'mc',  q:'Tekst', n:'hint (valgfritt)', o:['alt A','alt B',…], c:indeks til riktig svar, sh:false (valgfritt: ikke bland alternativene)}
     {t:'tf',  q:'Tekst', c:true|false}                       (Wahr / Falsch)
     {t:'type',q:'Tekst', a:['godkjent svar','annet godkjent svar'], n:'hint'}
   Hver elev spiller i eget tempo og får sin egen rekkefølge. Tre moduser (egne regler):
     gold   – «Schatzsuche»: riktig svar gir tre kister å velge mellom (mynter, tyv, storm …). Flest mynter ved slutt vinner.
     race   – «Rennen»: riktig svar flytter deg ett felt (to ved tre riktige på rad). Først i mål vinner.
     castle – «Burgverteidigung»: hele klassen forsvarer en borg mot monstre som kommer i bølger. Riktig svar skader monsteret.
   Tid sendes inn som parameter (now, ms) slik at alt kan testes. Svaret er aldri med i det som sendes til elevene før de har svart. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DWQuizEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function rint(n) { return Math.floor(Math.random() * n); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rint(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function fold(s) {
    return String(s == null ? '' : s).trim().toLowerCase().replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/[.!?¿¡]+$/g, '').replace(/[«»"“”„']/g, '').replace(/\s+/g, ' ').trim();
  }
  function typedOk(q, text) { var g = fold(text); if (!g) return false; return (q.a || []).some(function (a) { return fold(a) === g; }); }
  function cleanSet(set) {
    var qs = (set.qs || []).filter(function (q) { return q && q.q; }).map(function (q) {
      if (q.t === 'tf') return { t: 'tf', q: String(q.q), c: !!q.c, n: q.n ? String(q.n) : '' };
      if (q.t === 'type') return { t: 'type', q: String(q.q), a: (q.a || []).map(String).filter(Boolean), n: q.n ? String(q.n) : '' };
      var o = (q.o || []).map(String).filter(function (x) { return x.length; });
      return { t: 'mc', q: String(q.q), o: o, c: Math.max(0, Math.min(o.length - 1, q.c | 0)), n: q.n ? String(q.n) : '', sh: q.sh !== false };
    }).filter(function (q) { return q.t !== 'mc' || q.o.length >= 2; }).filter(function (q) { return q.t !== 'type' || q.a.length; });
    return { title: String(set.title || 'Quiz'), qs: qs };
  }
  var CHEST = [['c1', 24], ['c3', 22], ['c5', 14], ['c10', 5], ['thief', 15], ['storm', 9], ['double', 3], ['empty', 8]];
  function rollChest() { var t = 0; CHEST.forEach(function (c) { t += c[1]; }); var r = rint(t); for (var i = 0; i < CHEST.length; i++) { r -= CHEST[i][1]; if (r < 0) return CHEST[i][0]; } return 'c1'; }

  function create(setIn, opts) {
    var SET = cleanSet(setIn);
    var S = {
      phase: 'lobby', mode: 'gold', order: 'random', timeLimit: 20, duration: 8, goal: 20, waves: 6, difficulty: 'normal', hp: 20,
      players: [], startAt: 0, endAt: 0, castle: null, finish: [], feed: [], seq: 0, round: 0, result: null,
      qstats: SET.qs.map(function () { return { asked: 0, correct: 0, ms: 0 }; })
    };
    if (opts) Object.keys(opts).forEach(function (k) { S[k] = opts[k]; });
    var G = { S: S, set: SET };
    function bump() { S.seq++; }
    function find(key) { for (var i = 0; i < S.players.length; i++) if (S.players[i].key === key) return S.players[i]; return null; }
    function feed(t, k) { S.feed.push({ t: t, k: k || '' }); if (S.feed.length > 30) S.feed.shift(); }
    function active() { return S.players.filter(function (p) { return p.online; }).length || 1; }

    G.configure = function (o) { if (S.phase !== 'lobby') return; ['mode', 'order', 'timeLimit', 'duration', 'goal', 'waves', 'difficulty', 'hp'].forEach(function (k) { if (o[k] !== undefined) S[k] = o[k]; }); bump(); };
    G.addPlayer = function (key, name, icon) {
      var p = find(key);
      if (p) { p.online = true; if (name) p.name = name; if (icon) p.icon = icon; bump(); return p; }
      if (S.players.length >= 60) return null;
      var base = String(name || 'Elev').slice(0, 14), nm = base, n = 2; while (S.players.some(function (x) { return x.name === nm; })) nm = base + ' ' + (n++);
      p = { key: key, name: nm, icon: icon || '🙂', online: true, queue: [], cur: null, score: 0, pos: 0, fin: 0, streak: 0, best: 0, answered: 0, correct: 0, wrong: 0, notes: [], hist: [] };
      S.players.push(p); bump();
      if (S.phase === 'play') present(p, Date.now());
      return p;
    };
    G.setOnline = function (key, on) { var p = find(key); if (p) { p.online = on; bump(); } };
    G.removePlayer = function (key) { S.players = S.players.filter(function (p) { return p.key !== key; }); bump(); };
    G.check = function () { if (!SET.qs.length) return 'Settet har ingen spørsmål.'; if (!S.players.length) return 'Vent til minst én elev har gått inn.'; return ''; };

    function nextIndex(p) {
      if (!p.queue.length) { var all = SET.qs.map(function (q, i) { return i; }); p.queue = S.order === 'seq' ? all : shuffle(all); if (S.order !== 'seq' && p.last != null && p.queue.length > 1 && p.queue[0] === p.last) { var t = p.queue.shift(); p.queue.push(t); } }
      var qi = p.queue.shift(); p.last = qi; return qi;
    }
    function present(p, now) {
      if (S.phase !== 'play') return;
      if (S.mode === 'race' && p.fin) { p.cur = null; return; }
      var qi = nextIndex(p), q = SET.qs[qi], perm = null;
      if (q.t === 'mc') { perm = q.o.map(function (x, i) { return i; }); if (q.sh) perm = shuffle(perm); }
      p.cur = { qi: qi, perm: perm, at: now, deadline: S.timeLimit ? now + S.timeLimit * 1000 : 0, status: 'open', result: null, bonus: null };
    }
    G.start = function (now) {
      var e = G.check(); if (e) return { err: e };
      now = now == null ? Date.now() : now; S.phase = 'play'; S.round++; S.startAt = now; S.endAt = S.duration && S.mode !== 'castle' ? now + S.duration * 60000 : 0; S.finish = []; S.feed = []; S.result = null;
      S.qstats = SET.qs.map(function () { return { asked: 0, correct: 0, ms: 0 }; });
      S.players.forEach(function (p) { p.queue = []; p.cur = null; p.score = 0; p.pos = 0; p.fin = 0; p.streak = 0; p.best = 0; p.answered = 0; p.correct = 0; p.wrong = 0; p.notes = []; p.hist = []; });
      if (S.mode === 'castle') { var diff = { lett: 0.7, normal: 1, vanskelig: 1.4 }[S.difficulty] || 1; S.castle = { hp: S.hp, max: S.hp, wave: 1, waves: S.waves, diff: diff, mon: null, nextHit: 0, hits: 0, killed: 0, won: null }; spawn(now); }
      S.players.forEach(function (p) { present(p, now); });
      feed('Spillet startet!', 'sys'); bump(); return { ok: true };
    };
    function spawn(now) {
      var c = S.castle, hp = Math.max(6, Math.round(active() * (2 + c.wave * 1.0) * c.diff)); c.mon = { hp: hp, max: hp }; c.nextHit = now + hitEvery() ;
    }
    function hitEvery() { var c = S.castle; return Math.max(9000, (20000 - c.wave * 800) / c.diff); }

    function resolve(p, q, ok, now, given, timeout) {
      var cur = p.cur; cur.status = 'done'; cur.result = { ok: ok, given: given, timeout: !!timeout };
      var st = S.qstats[cur.qi]; st.asked++; if (ok) st.correct++; st.ms += Math.min(120000, now - cur.at);
      p.answered++; p.hist.push({ qi: cur.qi, ok: ok });
      if (ok) { p.correct++; p.streak++; p.best = Math.max(p.best, p.streak); } else { p.wrong++; p.streak = 0; }
      if (!ok) return;
      if (S.mode === 'gold') { cur.bonus = { state: 'pick', chests: [rollChest(), rollChest(), rollChest()] }; }
      else if (S.mode === 'race') {
        var step = 1 + (p.streak >= 3 ? 1 : 0); p.pos = Math.min(S.goal, p.pos + step); cur.gain = step;
        if (p.pos >= S.goal && !p.fin) { S.finish.push(p.key); p.fin = S.finish.length; feed(p.name + ' kom i mål som nr. ' + p.fin + '!', 'ok'); }
      } else if (S.mode === 'castle') {
        var dmg = 1 + (p.streak >= 3 ? 1 : 0); p.score += dmg; cur.gain = dmg; var c = S.castle;
        if (c.mon && !c.won) {
          c.mon.hp -= dmg;
          if (c.mon.hp <= 0) { c.killed++; feed('Monster ' + c.wave + ' er beseiret!', 'ok'); c.wave++; if (c.wave > c.waves) { c.won = true; finish(now, 'won'); } else { spawn(now); } }
        }
      }
    }
    G.answer = function (key, pl, now) {
      var p = find(key); now = now == null ? Date.now() : now;
      if (S.phase !== 'play' || !p || !p.cur || p.cur.status !== 'open') return { err: 'Ingen åpent spørsmål.' };
      var cur = p.cur, q = SET.qs[cur.qi], ok = false, given = '';
      if (cur.deadline && now > cur.deadline + 2500) { resolve(p, q, false, now, '', true); bump(); return { ok: true }; }
      if (q.t === 'mc') { var i = parseInt(pl && pl.i, 10); if (!(i >= 0 && i < cur.perm.length)) return { err: 'Ugyldig svar.' }; var real = cur.perm[i]; ok = real === q.c; given = q.o[real]; }
      else if (q.t === 'tf') { var b = pl && (pl.i === 0 || pl.i === 1 || pl.i === '0' || pl.i === '1') ? parseInt(pl.i, 10) : -1; if (b < 0) return { err: 'Ugyldig svar.' }; ok = (b === 0) === q.c; given = b === 0 ? 'Wahr' : 'Falsch'; }
      else { given = String((pl && pl.text) || '').slice(0, 80); if (!given.trim()) return { err: 'Skriv et svar.' }; ok = typedOk(q, given); }
      resolve(p, q, ok, now, given, false); bump(); return { ok: true };
    };
    G.timeout = function (key, now) { var p = find(key); now = now == null ? Date.now() : now; if (p && p.cur && p.cur.status === 'open' && p.cur.deadline && now >= p.cur.deadline - 100) { resolve(p, SET.qs[p.cur.qi], false, now, '', true); bump(); return { ok: true }; } return { err: 'Ikke ute for tid.' }; };
    G.chest = function (key, i, now) {
      var p = find(key); i = parseInt(i, 10);
      if (S.phase !== 'play' || !p || !p.cur || !p.cur.bonus || p.cur.bonus.state !== 'pick' || !(i >= 0 && i < 3)) return { err: 'Ingen kiste å åpne.' };
      var kind = p.cur.bonus.chests[i], res = { kind: kind, text: '', amount: 0 };
      if (kind === 'c1' || kind === 'c3' || kind === 'c5' || kind === 'c10') { res.amount = parseInt(kind.slice(1), 10); p.score += res.amount; res.text = '+' + res.amount + ' mynter'; }
      else if (kind === 'double') { res.amount = Math.min(20, p.score); p.score += res.amount; res.text = 'Dobbelt opp! +' + res.amount + ' mynter'; }
      else if (kind === 'storm') { res.amount = -Math.min(3, p.score); p.score += res.amount; res.text = 'Storm! ' + res.amount + ' mynter'; }
      else if (kind === 'thief') {
        var vs = S.players.filter(function (o) { return o.key !== p.key && o.score > 0; });
        if (!vs.length) { res.text = 'Tyven fant ingen å rane – ingenting skjer.'; res.kind = 'empty'; }
        else { var v = vs[rint(vs.length)], amt = Math.min(3, v.score); v.score -= amt; p.score += amt; res.amount = amt; res.victim = v.name; res.text = 'Du stjal ' + amt + ' mynter fra ' + v.name + '!'; v.notes.push(p.name + ' stjal ' + amt + ' mynter fra deg!'); feed(p.name + ' stjal fra ' + v.name, 'sys'); }
      } else res.text = 'Tom kiste …';
      p.cur.bonus = { state: 'done', chests: p.cur.bonus.chests, picked: i, result: res }; bump(); return { ok: true };
    };
    G.next = function (key, now) {
      var p = find(key); now = now == null ? Date.now() : now;
      if (S.phase !== 'play' || !p || !p.cur || p.cur.status !== 'done') return { err: 'Ikke nå.' };
      if (p.cur.bonus && p.cur.bonus.state === 'pick') return { err: 'Åpne en kiste først.' };
      present(p, now); bump(); return { ok: true };
    };
    function ranking() {
      var arr = S.players.slice();
      arr.sort(function (a, b) {
        if (S.mode === 'race') { if (!!a.fin !== !!b.fin) return a.fin ? -1 : 1; if (a.fin && b.fin) return a.fin - b.fin; if (b.pos !== a.pos) return b.pos - a.pos; }
        if (b.score !== a.score) return b.score - a.score; if (b.correct !== a.correct) return b.correct - a.correct; return a.name < b.name ? -1 : 1;
      });
      return arr;
    }
    function finish(now, why) {
      if (S.phase !== 'play') return; S.phase = 'end';
      S.players.forEach(function (p) { if (p.cur && p.cur.status === 'open') p.cur.status = 'closed'; });
      S.result = { why: why, castle: S.castle ? { won: !!S.castle.won, hp: S.castle.hp, wave: Math.min(S.castle.wave, S.castle.waves), waves: S.castle.waves } : null, at: now };
      bump();
    }
    G.tick = function (now) {
      now = now == null ? Date.now() : now; if (S.phase !== 'play') return;
      var changed = false;
      S.players.forEach(function (p) { if (p.cur && p.cur.status === 'open' && p.cur.deadline && now > p.cur.deadline + 3000) { resolve(p, SET.qs[p.cur.qi], false, now, '', true); changed = true; } });
      if (S.endAt && now >= S.endAt) { finish(now, 'time'); return; }
      if (S.mode === 'castle' && S.castle && !S.castle.won && S.castle.mon) {
        var c = S.castle;
        while (now >= c.nextHit && c.hp > 0) { c.hp--; c.hits++; c.nextHit += hitEvery(); feed('Monsteret slo mot borgen! (' + Math.max(0, c.hp) + ' igjen)', 'bad'); changed = true; }
        if (c.hp <= 0) { c.won = false; finish(now, 'lost'); return; }
      }
      if (S.mode === 'race' && S.players.length && S.players.filter(function (p) { return p.online; }).every(function (p) { return p.fin; })) { finish(now, 'all'); return; }
      if (changed) bump();
    };
    G.hostEnd = function (now) { finish(now || Date.now(), 'host'); };
    G.toLobby = function () { S.phase = 'lobby'; S.castle = null; S.result = null; S.players = S.players.filter(function (p) { return p.online; }); S.players.forEach(function (p) { p.cur = null; }); bump(); };

    function qView(p, now) {
      var cur = p.cur; if (!cur) return null; var q = SET.qs[cur.qi], v = { n: q.n || '', text: q.q, t: q.t, status: cur.status, left: cur.deadline ? Math.max(0, cur.deadline - now) : 0, total: S.timeLimit * 1000, idx: p.answered + (cur.status === 'open' ? 1 : 0) };
      if (q.t === 'mc') v.opts = cur.perm.map(function (i) { return q.o[i]; });
      if (q.t === 'tf') v.opts = ['Wahr', 'Falsch'];
      if (cur.status !== 'open') {
        var sol = q.t === 'mc' ? q.o[q.c] : q.t === 'tf' ? (q.c ? 'Wahr' : 'Falsch') : q.a[0];
        v.result = { ok: cur.result.ok, given: cur.result.given, timeout: cur.result.timeout, solution: sol, gain: cur.gain || 0 };
        if (q.t === 'mc') v.result.solIdx = cur.perm.indexOf(q.c);
        if (q.t === 'tf') v.result.solIdx = q.c ? 0 : 1;
        if (cur.bonus) v.bonus = cur.bonus.state === 'pick' ? { state: 'pick' } : { state: 'done', picked: cur.bonus.picked, result: cur.bonus.result, chests: cur.bonus.chests };
      }
      return v;
    }
    function board(forKey) {
      var r = ranking(), out = r.slice(0, 8).map(function (p, i) { return { rank: i + 1, name: p.name, icon: p.icon, score: p.score, pos: p.pos, fin: p.fin, me: p.key === forKey }; });
      if (forKey && !out.some(function (x) { return x.me; })) { var i = r.findIndex(function (p) { return p.key === forKey; }); if (i >= 0) out.push({ rank: i + 1, name: r[i].name, icon: r[i].icon, score: r[i].score, pos: r[i].pos, fin: r[i].fin, me: true }); }
      return out;
    }
    function castleView() { var c = S.castle; return c ? { hp: c.hp, max: c.max, wave: Math.min(c.wave, c.waves), waves: c.waves, mon: c.mon ? { hp: Math.max(0, c.mon.hp), max: c.mon.max } : null, killed: c.killed } : null; }
    function common(now) { return { seq: S.seq, phase: S.phase, mode: S.mode, title: SET.title, goal: S.goal, left: S.endAt ? Math.max(0, S.endAt - now) : 0, castle: castleView(), count: S.players.length, round: S.round, why: S.result ? S.result.why : null }; }
    G.snapshot = function (key, now) {
      now = now == null ? Date.now() : now; var p = find(key), s = common(now);
      if (!p) { s.me = null; return s; }
      var r = ranking(), rank = r.indexOf(p) + 1;
      s.me = { name: p.name, icon: p.icon, score: p.score, pos: p.pos, fin: p.fin, streak: p.streak, correct: p.correct, answered: p.answered, rank: rank };
      s.q = S.phase === 'play' ? qView(p, now) : null; s.board = board(key); s.notes = p.notes.splice(0, 3); s.feed = S.feed.slice(-6);
      if (S.phase === 'end') s.final = { rank: rank, of: r.length, correct: p.correct, wrong: p.wrong, best: p.best, acc: p.answered ? Math.round(100 * p.correct / p.answered) : 0 };
      return s;
    };
    G.hostView = function (now) {
      now = now == null ? Date.now() : now; var s = common(now), r = ranking();
      s.players = r.map(function (p, i) { return { key: p.key, rank: i + 1, name: p.name, icon: p.icon, online: p.online, score: p.score, pos: p.pos, fin: p.fin, answered: p.answered, correct: p.correct, wrong: p.wrong, streak: p.streak, best: p.best, acc: p.answered ? Math.round(100 * p.correct / p.answered) : null }; });
      s.feed = S.feed.slice(-12); s.timeLimit = S.timeLimit; s.duration = S.duration; s.order = S.order; s.setSize = SET.qs.length; s.waves = S.waves; s.difficulty = S.difficulty; s.hp = S.hp; s.result = S.result;
      return s;
    };
    G.report = function () {
      var r = ranking();
      return {
        title: SET.title, mode: S.mode, players: r.map(function (p, i) { return { rank: i + 1, name: p.name, answered: p.answered, correct: p.correct, acc: p.answered ? Math.round(100 * p.correct / p.answered) : 0, score: p.score, pos: p.pos, fin: p.fin, best: p.best }; }),
        questions: SET.qs.map(function (q, i) { var st = S.qstats[i]; return { i: i, q: q.q, asked: st.asked, correct: st.correct, pct: st.asked ? Math.round(100 * st.correct / st.asked) : null, sol: q.t === 'mc' ? q.o[q.c] : q.t === 'tf' ? (q.c ? 'Wahr' : 'Falsch') : q.a[0], avg: st.asked ? Math.round(st.ms / st.asked / 1000) : null }; }),
        result: S.result, duration: S.endAt ? S.duration : null
      };
    };
    return G;
  }
  return { create: create, cleanSet: cleanSet, fold: fold, typedOk: typedOk };
});
