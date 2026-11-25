/* Deutschwelt — Ulv og sauer (Wolf und Schafe): regelpakke for ../brettspill/core.js
   Brett 8 × 8, spilles på de mørke rutene. Fire sauer starter nederst og går ett skritt skrått OPP (fram) per trekk.
   Ulven starter øverst og går skrått i alle fire retninger. Sauene vinner hvis ulven blir innestengt (ingen lovlige trekk).
   Ulven vinner hvis den kommer forbi alle sauene (på samme rad som den bakerste sauen eller lenger ned), eller hvis sauene ikke kan flytte.
   Alle trekk må «kjøpes» med et riktig svar. Ulven er enten datamaskinen (tre styrkenivåer) eller en av spillerne (som også må svare). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DWWolf = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var SIZE = 8;
  var DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  function inb(r, c) { return r >= 0 && r < SIZE && c >= 0 && c < SIZE; }
  function isDark(r, c) { return (r + c) % 2 === 1; }
  function occ(s, r, c) { for (var i = 0; i < s.length; i++) if (s[i].r === r && s[i].c === c) return true; return false; }
  function sheepMoves(s, w) {
    var out = [];
    s.forEach(function (sh, i) {
      [-1, 1].forEach(function (dc) {
        var r = sh.r - 1, c = sh.c + dc;
        if (!inb(r, c) || occ(s, r, c) || (w && w.r === r && w.c === c)) return;
        out.push({ id: i * 2 + (dc < 0 ? 0 : 1), i: i, from: { r: sh.r, c: sh.c }, to: { r: r, c: c } });
      });
    });
    return out;
  }
  function wolfMoves(s, w) {
    var out = [];
    DIRS.forEach(function (d, k) { var r = w.r + d[0], c = w.c + d[1]; if (!inb(r, c) || occ(s, r, c)) return; out.push({ id: k, k: k, from: { r: w.r, c: w.c }, to: { r: r, c: c } }); });
    return out;
  }
  function wolfFree(s, w) { for (var i = 0; i < s.length; i++) if (s[i].r > w.r) return false; return true; }
  function maxRow(s) { var m = 0; s.forEach(function (x) { if (x.r > m) m = x.r; }); return m; }

  /* ----- datamaskin-ulv: minimax ----- */
  function evalState(s, w) { return 10 * (w.r - maxRow(s)) + 5 * wolfMoves(s, w).length; }
  function search(s, w, depth, wolfTurn, alpha, beta) {
    if (wolfFree(s, w)) return 1000 + depth;
    var mv = wolfTurn ? wolfMoves(s, w) : sheepMoves(s, w);
    if (!mv.length) return wolfTurn ? -1000 - depth : 1000 + depth;
    if (depth <= 0) return evalState(s, w);
    var best = wolfTurn ? -1e9 : 1e9, i, v;
    for (i = 0; i < mv.length; i++) {
      var m = mv[i];
      if (wolfTurn) { v = search(s, m.to, depth - 1, false, alpha, beta); if (v > best) best = v; if (best > alpha) alpha = best; }
      else { var s2 = s.map(function (x, j) { return j === m.i ? { r: m.to.r, c: m.to.c } : x; }); v = search(s2, w, depth - 1, true, alpha, beta); if (v < best) best = v; if (best < beta) beta = best; }
      if (alpha >= beta) break;
    }
    return best;
  }
  function aiMove(s, w, level, rnd) {
    var mv = wolfMoves(s, w); if (!mv.length) return null;
    if (level <= 1 && rnd() < .22) return mv[Math.floor(rnd() * mv.length)];
    var depth = level <= 1 ? 1 : level === 2 ? 3 : 5, best = -1e9, bm = [];
    mv.forEach(function (m) { var v = search(s, m.to, depth - 1, false, -1e9, 1e9) + rnd() * .01; if (v > best + 1e-9) { best = v; bm = [m]; } else if (Math.abs(v - best) < 1e-9) bm.push(m); });
    return bm[Math.floor(rnd() * bm.length)];
  }

  function usable(q) { return q && !q.gone && (q.conn || q.local); }
  function idxOf(G, pid) { for (var i = 0; i < G.players.length; i++) if (G.players[i].id === pid) return i; return -1; }
  function isWolfP(G, p) { return G.settings.wolf === 'player' && G.X && G.X.wolfPid === p.id; }

  function sheepWin(H, mover) {
    var G = H.G; G.X.result = 'sheep';
    G.players.forEach(function (q) { if (!isWolfP(G, q)) q.finished = true; });
    mover.finished = false; H.win(mover);
  }
  function wolfWin(H, wp) {
    var G = H.G; G.X.result = 'wolf';
    if (wp) H.win(wp); else { G.winner = 'wolf'; H.ev({ k: 'win', pid: 'wolf' }); }
  }
  /* datamaskin-ulven gjør sitt trekk (etter hver saue-tur) */
  function aiTurn(H, ev, last) {
    var G = H.G, X = G.X;
    var mv = aiMove(X.sheep, X.wolf, G.settings.wolfLevel, H.rnd);
    if (!mv) { return false; }
    ev.push({ k: 'wmove', from: { r: X.wolf.r, c: X.wolf.c }, to: { r: mv.to.r, c: mv.to.c }, ai: true });
    X.wolf = { r: mv.to.r, c: mv.to.c }; last.wolfMoved = true;
    if (wolfFree(X.sheep, X.wolf)) { wolfWin(H, null); return true; }
    if (!sheepMoves(X.sheep, X.wolf).length) { wolfWin(H, null); return true; }
    return true;
  }
  /* utfører et valgt trekk for p; returnerer {events,last} */
  function apply(H, p, mv) {
    var G = H.G, X = G.X, ev = [], last = {};
    if (isWolfP(G, p)) {
      ev.push({ k: 'wmove', from: { r: X.wolf.r, c: X.wolf.c }, to: { r: mv.to.r, c: mv.to.c } });
      X.wolf = { r: mv.to.r, c: mv.to.c }; last.moved = { role: 'wolf', to: mv.to };
      if (wolfFree(X.sheep, X.wolf)) wolfWin(H, p);
      else if (!sheepMoves(X.sheep, X.wolf).length) wolfWin(H, p);
    } else {
      ev.push({ k: 'smove', i: mv.i, from: { r: mv.from.r, c: mv.from.c }, to: { r: mv.to.r, c: mv.to.c } });
      X.sheep[mv.i] = { r: mv.to.r, c: mv.to.c }; last.moved = { role: 'sheep', i: mv.i, to: mv.to };
      if (!wolfMoves(X.sheep, X.wolf).length) { sheepWin(H, p); ev.push({ k: 'trap' }); }
      else if (G.settings.wolf === 'ai') aiTurn(H, ev, last);
    }
    return { events: ev, last: last, ms: last.wolfMoved ? 900 : 0 };
  }

  var R = {
    id: 'wolf', maxPlayers: 8,
    minPlayers: function (st) { return st.wolf === 'player' ? 2 : 1; },
    defaults: function () { return { wolf: 'ai', wolfLevel: 2, wolfPid: '' }; },
    setExtra: function (t, s) {
      if (s.wolf && (s.wolf === 'ai' || s.wolf === 'player')) t.wolf = s.wolf;
      if (s.wolfLevel != null) t.wolfLevel = Math.max(1, Math.min(3, parseInt(s.wolfLevel, 10) || 2));
      if (s.wolfPid !== undefined) t.wolfPid = String(s.wolfPid || '');
    },
    check: function (H) { var st = H.G.settings; if (st.wolf === 'player' && H.G.players.length < 2) return 'Med en spiller som ulv trengs minst to spillere.'; return ''; },
    initPlayer: function (p) { },
    start: function (H) {
      var G = H.G, st = G.settings, cols = [1, 3, 5, 7];
      var X = { sheep: [{ r: 7, c: 0 }, { r: 7, c: 2 }, { r: 7, c: 4 }, { r: 7, c: 6 }], wolf: { r: 0, c: cols[H.rint(4)] }, wolfPid: null, result: '', lastSheep: null };
      if (st.wolf === 'player') { X.wolfPid = (st.wolfPid && idxOf(G, st.wolfPid) >= 0) ? st.wolfPid : G.players[0].id; }
      G.X = X;
      H.log(st.wolf === 'player' ? '🐺 ' + G.players[idxOf(G, X.wolfPid)].name + ' er ulven. De andre er sauer.' : '🐺 Datamaskinen er ulven. Dere er sauene – svar riktig for å flytte!', 'sys');
    },
    firstTurn: function (H) {
      var G = H.G; if (G.settings.wolf !== 'player') return 0;
      for (var i = 0; i < G.players.length; i++) if (G.players[i].id !== G.X.wolfPid) return i;
      return 0;
    },
    next: function (H) {
      var G = H.G, X = G.X; if (G.settings.wolf !== 'player') return null;
      var n = G.players.length, cur = G.players[G.turn], wi = idxOf(G, X.wolfPid), wp = G.players[wi];
      function nextSheep(from) { for (var i = 1; i <= n; i++) { var j = (from + i) % n; if (j !== wi && usable(G.players[j])) return j; } return null; }
      if (cur.id === X.wolfPid) { var s = nextSheep(X.lastSheep != null ? X.lastSheep : G.turn); return s != null ? s : null; }
      X.lastSheep = G.turn;
      if (usable(wp)) return wi;
      return nextSheep(G.turn);
    },
    pubPlayer: function (p, H) { var G = H.G; return { role: (G.X && G.settings.wolf === 'player' && G.X.wolfPid === p.id) ? 'wolf' : 'sheep' }; },
    view: function (H) { var X = H.G.X; return X ? { sheep: X.sheep.map(function (s) { return { r: s.r, c: s.c }; }), wolf: { r: X.wolf.r, c: X.wolf.c }, wolfPid: X.wolfPid, result: X.result } : null; },

    begin: function (H, p) {
      var G = H.G, X = G.X, wolf = isWolfP(G, p), mv = wolf ? wolfMoves(X.sheep, X.wolf) : sheepMoves(X.sheep, X.wolf);
      if (!mv.length) { if (wolf) sheepWin(H, p); else wolfWin(H, null); return { none: true, msg: wolf ? 'Ulven er innestengt!' : 'Sauene kan ikke flytte.', events: [] }; }
      return { info: { role: wolf ? 'wolf' : 'sheep' }, events: [] };
    },
    onCorrect: function (H, p, c) {
      var G = H.G, X = G.X, wolf = isWolfP(G, p), mv = wolf ? wolfMoves(X.sheep, X.wolf) : sheepMoves(X.sheep, X.wolf);
      if (mv.length === 1) return apply(H, p, mv[0]);
      return { pick: mv };
    },
    pick: function (H, p, c, mv) { return apply(H, p, mv); },
    onWrong: function (H, p, c) {
      var G = H.G, X = G.X;
      if (G.settings.wolf === 'ai' && !isWolfP(G, p)) {
        var ev = [], last = { passed: true };
        aiTurn(H, ev, last);
        return { events: ev, last: last, ms: 900 };
      }
      return { last: { passed: true } };
    },
    autoPick: function (H, cur) { return cur.moves[Math.floor(H.rnd() * cur.moves.length)]; },
    rank: function (H) {
      var G = H.G, res = G.X ? G.X.result : '';
      return G.players.slice().sort(function (a, b) {
        if (!!a.finished !== !!b.finished) return a.finished ? -1 : 1;
        return b.right - a.right || a.wrong - b.wrong;
      });
    },
    score: function (H, p) { var G = H.G; var wolf = isWolfP(G, p); return (wolf ? '🐺 ulv' : '🐑 sau') + (p.finished ? ' · vant' : ''); },
    endNote: function (H, why) { var r = H.G.X && H.G.X.result; return r === 'sheep' ? '🐑 Sauene fanget ulven!' : r === 'wolf' ? '🐺 Ulven slapp unna!' : ''; }
  };
  return { rules: R, SIZE: SIZE, sheepMoves: sheepMoves, wolfMoves: wolfMoves, wolfFree: wolfFree, aiMove: aiMove, isDark: isDark };
});
