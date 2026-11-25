/* Deutschwelt — Ludo lagspill («Ärgere dich nicht» for hele klassen): regelpakke for ../brettspill/core.js
   Samme brett og regler som i ../aergere-dich-nicht/ (kryssbrett, 40 felt rundt, 4 felt i hus, slå ut andres brikker, ekstra kast på 6),
   men spillerne deler seg i 2–4 LAG (farger). Lagene spiller etter tur, og innen hvert lag er det neste spiller som får terningen og oppgaven.
   Riktig svar = laget får flytte en brikke. Feil svar = laget mister turen. Først med alle brikkene i hus vinner (hele laget).
   Innstillinger: nTeams (2–4), pieces (1–4), start ('one' = rask start, 'six' = klassisk 6), teams {spillerId: lagnr}. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../aergere-dich-nicht/engine.js'));
  else root.DWLudoLag = factory(root.DWLudo);
})(typeof self !== 'undefined' ? self : this, function (L) {
  'use strict';
  var HOME_D = 40, LAST_D = 43, SEATS = L.SEATS;
  function usable(q) { return q && !q.gone && (q.conn || q.local); }
  function seatsFor(n) { return n === 2 ? [0, 2] : n === 3 ? [0, 1, 2] : [0, 1, 2, 3]; }
  function ringAt(seat, d) { return (L.START[seat] + d) % 40; }
  function defTeam(st, p, idx) { var v = st.teams && st.teams[p.id]; return (v != null && v < st.nTeams) ? v : idx % st.nTeams; }
  function teamOf(H, p) { var G = H.G; if (G.X && G.X.teamOf && G.X.teamOf[p.id] != null) return G.X.teamOf[p.id]; return defTeam(G.settings, p, G.players.indexOf(p)); }
  function members(H, t) { return H.G.players.filter(function (q) { return teamOf(H, q) === t; }); }
  function ownAt(T, d, except) { for (var i = 0; i < T.pieces.length; i++) if (i !== except && T.pieces[i] === d) return true; return false; }
  function allIn(T) { return T.pieces.every(function (d) { return d === -1; }); }
  function legal(st, T, die) {
    var out = [], yardDone = false;
    T.pieces.forEach(function (d, i) {
      if (d === -1) {
        if (yardDone) return;
        if (die === 6 || (st.start === 'one' && allIn(T))) { yardDone = true; if (!ownAt(T, 0, i)) out.push({ id: i, i: i, from: -1, to: 0 }); }
      } else if (d < HOME_D + 4) { var to = d + die; if (to <= LAST_D && !ownAt(T, to, i)) out.push({ id: i, i: i, from: d, to: to }); }
    });
    return out;
  }
  function homeN(T) { return T.pieces.filter(function (d) { return d >= HOME_D; }).length; }
  function progress(T) { var s = 0; T.pieces.forEach(function (d) { if (d >= 0) s += d + 1; }); return s; }

  function applyMove(H, p, t, mv) {
    var G = H.G, X = G.X, T = X.teams[t], path = [], cap = null;
    if (mv.from === -1) path.push(0); else for (var d = mv.from + 1; d <= mv.to; d++) path.push(d);
    T.pieces[mv.i] = mv.to; H.ev({ k: 'move', team: t, i: mv.i, path: path });
    if (mv.to <= 39) {
      var r = ringAt(T.seat, mv.to);
      X.teams.forEach(function (Q, qt) {
        if (qt === t) return;
        Q.pieces.forEach(function (dd, j) { if (dd >= 0 && dd <= 39 && ringAt(Q.seat, dd) === r) { Q.pieces[j] = -1; X.caps[t]++; X.kicked[qt]++; cap = { team: qt, i: j }; H.ev({ k: 'capture', team: qt, i: j }); } });
      });
    }
    if (mv.to >= HOME_D) H.ev({ k: 'home', team: t, i: mv.i });
    if (T.pieces.every(function (dd) { return dd >= HOME_D; })) {
      X.result = { win: t };
      var ms = members(H, t); ms.forEach(function (q) { q.finished = true; });
      G.winner = (ms.indexOf(p) >= 0 ? p : ms[0]).id; H.ev({ k: 'win', pid: G.winner });
    }
    return cap;
  }

  var R = {
    id: 'ludolag', maxPlayers: 12,
    minPlayers: function (st) { return st.nTeams; },
    defaults: function () { return { nTeams: 2, pieces: 2, start: 'one', teams: {} }; },
    setExtra: function (t, s) {
      if (s.nTeams != null) t.nTeams = Math.max(2, Math.min(4, parseInt(s.nTeams, 10) || 2));
      if (s.pieces != null) t.pieces = Math.max(1, Math.min(4, parseInt(s.pieces, 10) || 2));
      if (s.start === 'one' || s.start === 'six') t.start = s.start;
      if (s.teamOf && s.teamOf.pid) { t.teams = Object.assign({}, t.teams); t.teams[s.teamOf.pid] = parseInt(s.teamOf.team, 10) || 0; }
    },
    check: function (H) {
      var G = H.G, st = G.settings, c = [], i;
      for (i = 0; i < st.nTeams; i++) c.push(0);
      G.players.forEach(function (p, k) { c[defTeam(st, p, k)]++; });
      for (i = 0; i < st.nTeams; i++) if (!c[i]) return 'Hvert lag trenger minst én spiller – bruk knappene ved navnene for å velge lag (eller færre lag).';
      return '';
    },
    initPlayer: function (p) { },
    start: function (H) {
      var G = H.G, st = G.settings, seats = seatsFor(st.nTeams), teamOfMap = {}, teams = [], i;
      G.players.forEach(function (p, k) { teamOfMap[p.id] = defTeam(st, p, k); });
      for (i = 0; i < st.nTeams; i++) { var pcs = []; for (var k2 = 0; k2 < st.pieces; k2++) pcs.push(-1); if (st.start === 'one') pcs[0] = 0; teams.push({ seat: seats[i], pieces: pcs }); }
      var zero = []; for (i = 0; i < st.nTeams; i++) zero.push(0);
      G.X = { teams: teams, teamOf: teamOfMap, rot: zero.map(function () { return -1; }), tries: zero.slice(), caps: zero.slice(), kicked: zero.slice(), result: null };
      H.log('Spillet er i gang! ' + st.nTeams + ' lag. Kast terningen, svar riktig – og flytt en brikke.', 'sys');
    },
    firstTurn: function (H) { var m = members(H, 0); var q = m[0]; H.G.X.rot[0] = H.G.players.indexOf(q); return H.G.players.indexOf(q); },
    next: function (H) {
      var G = H.G, X = G.X, n = X.teams.length, cur = G.players[G.turn], t0 = cur ? teamOf(H, cur) : 0, k;
      for (k = 1; k <= n; k++) {
        var t = (t0 + k) % n, ms = members(H, t).filter(usable); if (!ms.length) continue;
        var all = members(H, t), last = X.rot[t], start = 0, j;
        for (j = 0; j < all.length; j++) if (G.players.indexOf(all[j]) === last) { start = j + 1; break; }
        for (j = 0; j < all.length; j++) { var q = all[(start + j) % all.length]; if (usable(q)) { X.rot[t] = G.players.indexOf(q); return X.rot[t]; } }
      }
      return null;
    },
    pubPlayer: function (p, H) {
      var G = H.G; if (!G.X) return {};
      var t = teamOf(H, p), T = G.X.teams[t];
      return { team: t, seat: T.seat, home: homeN(T), total: T.pieces.length };
    },
    view: function (H) { var X = H.G.X; return X ? { teams: X.teams.map(function (T, t) { return { seat: T.seat, pieces: T.pieces.slice(), members: members(H, t).map(function (q) { return q.id; }) }; }), result: X.result } : null; },
    begin: function (H, p) {
      var G = H.G, X = G.X, t = teamOf(H, p), T = X.teams[t], die = 1 + H.rint(6), moves = legal(G.settings, T, die);
      if (!moves.length) {
        var again = G.settings.start === 'six' && allIn(T) && X.tries[t] < 2;
        if (again) X.tries[t]++; else X.tries[t] = 0;
        return { die: die, none: true, msg: 'Ingen brikke kan flyttes' + (again ? ' – nytt forsøk!' : '.'), extra: again, events: [{ k: 'roll', die: die }, { k: 'nomove' }], info: { team: t } };
      }
      X.tries[t] = 0;
      return { die: die, info: { team: t }, events: [{ k: 'roll', die: die }] };
    },
    onCorrect: function (H, p, c) {
      var G = H.G, t = teamOf(H, p), T = G.X.teams[t], moves = legal(G.settings, T, c.die), extra = c.die === 6;
      if (moves.length === 1) { var cap = applyMove(H, p, t, moves[0]); return { extra: extra, last: { moved: moves[0], cap: cap, team: t }, ms: cap ? 900 : 0 }; }
      return { pick: moves, extra: extra, last: { team: t } };
    },
    pick: function (H, p, c, mv) { var t = teamOf(H, p), cap = applyMove(H, p, t, mv); return { last: { moved: mv, cap: cap, team: t }, ms: cap ? 900 : 0 }; },
    onWrong: function (H, p, c) { return { last: { passed: true } }; },
    autoPick: function (H, cur) { return cur.moves.slice().sort(function (a, b) { return b.to - a.to; })[0]; },
    rank: function (H) {
      var G = H.G, X = G.X;
      return G.players.slice().sort(function (a, b) {
        var ta = X.teams[teamOf(H, a)], tb = X.teams[teamOf(H, b)];
        if (!!a.finished !== !!b.finished) return a.finished ? -1 : 1;
        if (ta !== tb) { if (homeN(tb) !== homeN(ta)) return homeN(tb) - homeN(ta); if (progress(tb) !== progress(ta)) return progress(tb) - progress(ta); return teamOf(H, a) - teamOf(H, b); }
        return b.right - a.right || a.wrong - b.wrong;
      });
    },
    score: function (H, p) { var t = teamOf(H, p), T = H.G.X.teams[t]; return 'Lag ' + SEATS[T.seat].name.toLowerCase() + ' · ' + homeN(T) + '/' + T.pieces.length + ' i hus' + (p.finished ? ' · vant' : ''); },
    endNote: function (H, why) {
      var X = H.G.X; if (X && X.result) return '🏆 Lag ' + SEATS[X.teams[X.result.win].seat].name.toLowerCase() + ' vant!';
      return '';
    }
  };
  return { rules: R, legal: legal, homeN: homeN, progress: progress, seatsFor: seatsFor, defTeam: defTeam, ringAt: ringAt };
});
