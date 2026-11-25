/* Deutschwelt — Dame: regelpakke for ../brettspill/two.js (+ core.js)
   Regler som i «Spielesammlung» (nr. 4): 8 × 8, de mørke rutene, 12 brikker hver. Vanlige brikker går ett skritt skrått FRAM og slår kun framover (hopper over en motstanderbrikke
   til en tom rute bak). Slagtvang. Kjedeslag må fullføres. Når en brikke når motstanderens bakerste rad, blir den dame: den går og slår skrått både fram og tilbake, så langt den vil
   langs tomme ruter, og må slå alle brikker på linjen. Egne brikker kan aldri hoppes over. Vinner: den som tar alle brikkene eller stenger motstanderen inne.
   Side 0 (hvit) står nederst og går oppover (rad 7 → 0). Side 1 (svart) står øverst. Rad 0 er øverst, kolonne 0 til venstre. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../brettspill/two.js'));
  else root.DWDame = factory(root.DWTwo);
})(typeof self !== 'undefined' ? self : this, function (T) {
  'use strict';
  var N = 8, DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  function inb(r, c) { return r >= 0 && r < N && c >= 0 && c < N; }
  function isDark(r, c) { return (r + c) % 2 === 1; }
  function fwd(side) { return side === 0 ? -1 : 1; }
  function lastRow(side) { return side === 0 ? 0 : N - 1; }
  function cloneSt(st) { return { pcs: st.pcs.map(function (p) { return { id: p.id, s: p.s, r: p.r, c: p.c, k: p.k }; }), nid: st.nid, chain: st.chain ? { pid: st.chain.pid } : null, quiet: st.quiet }; }
  function at(st, r, c) { var a = st.pcs; for (var i = 0; i < a.length; i++) if (a[i].r === r && a[i].c === c) return a[i]; return null; }
  function byId(st, id) { var a = st.pcs; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function count(st, side) { var n = 0; st.pcs.forEach(function (p) { if (p.s === side) n++; }); return n; }

  function init() {
    var pcs = [], id = 1, r, c;
    for (r = 0; r < 3; r++) for (c = 0; c < N; c++) if (isDark(r, c)) pcs.push({ id: id++, s: 1, r: r, c: c, k: 0 });
    for (r = 5; r < N; r++) for (c = 0; c < N; c++) if (isDark(r, c)) pcs.push({ id: id++, s: 0, r: r, c: c, k: 0 });
    return { pcs: pcs, nid: id, chain: null, quiet: 0 };
  }
  function captures(st, p) {
    var out = [];
    if (!p.k) {
      var dr = fwd(p.s);
      [-1, 1].forEach(function (dc) {
        var e = at(st, p.r + dr, p.c + dc), lr = p.r + 2 * dr, lc = p.c + 2 * dc;
        if (e && e.s !== p.s && inb(lr, lc) && !at(st, lr, lc)) out.push({ pid: p.id, from: { r: p.r, c: p.c }, to: { r: lr, c: lc }, cap: { pid: e.id, r: e.r, c: e.c } });
      });
    } else {
      DIRS.forEach(function (d) {
        var r = p.r + d[0], c = p.c + d[1];
        while (inb(r, c) && !at(st, r, c)) { r += d[0]; c += d[1]; }
        if (!inb(r, c)) return;
        var e = at(st, r, c); if (e.s === p.s) return;
        var lr = r + d[0], lc = c + d[1];
        while (inb(lr, lc) && !at(st, lr, lc)) { out.push({ pid: p.id, from: { r: p.r, c: p.c }, to: { r: lr, c: lc }, cap: { pid: e.id, r: e.r, c: e.c } }); lr += d[0]; lc += d[1]; }
      });
    }
    return out;
  }
  function plain(st, p) {
    var out = [];
    if (!p.k) { var dr = fwd(p.s); [-1, 1].forEach(function (dc) { var r = p.r + dr, c = p.c + dc; if (inb(r, c) && !at(st, r, c)) out.push({ pid: p.id, from: { r: p.r, c: p.c }, to: { r: r, c: c }, cap: null }); }); }
    else DIRS.forEach(function (d) { var r = p.r + d[0], c = p.c + d[1]; while (inb(r, c) && !at(st, r, c)) { out.push({ pid: p.id, from: { r: p.r, c: p.c }, to: { r: r, c: c }, cap: null }); r += d[0]; c += d[1]; } });
    return out;
  }
  function steps(st, side) {
    var out = [], i;
    if (st.chain) { var cp = byId(st, st.chain.pid); out = cp ? captures(st, cp) : []; }
    else {
      for (i = 0; i < st.pcs.length; i++) if (st.pcs[i].s === side) out = out.concat(captures(st, st.pcs[i]));
      if (!out.length) for (i = 0; i < st.pcs.length; i++) if (st.pcs[i].s === side) out = out.concat(plain(st, st.pcs[i]));
    }
    out.forEach(function (m, k) { m.id = k; });
    return out;
  }
  function step(st, side, mv) {
    var p = byId(st, mv.pid), ev = [], promoted = false;
    p.r = mv.to.r; p.c = mv.to.c;
    var e = { k: 'dmove', pid: p.id, to: { r: mv.to.r, c: mv.to.c }, side: side };
    if (mv.cap) { e.cap = mv.cap.pid; st.pcs = st.pcs.filter(function (q) { return q.id !== mv.cap.pid; }); }
    ev.push(e);
    if (!p.k && p.r === lastRow(p.s)) { p.k = 1; promoted = true; ev.push({ k: 'dking', pid: p.id }); }
    if (mv.cap || !mv.from) st.quiet = 0; else st.quiet = p.k && !promoted && !mv.cap ? st.quiet + 1 : 0;
    if (mv.cap && !promoted && captures(st, p).length) { st.chain = { pid: p.id }; return { events: ev, done: false }; }
    st.chain = null; return { events: ev, done: true };
  }
  function over(st, side, X) {
    if (!count(st, 1 - side)) return { win: side, note: 'Alle brikkene er tatt.' };
    if (st.quiet >= 40) return { win: -1, note: 'ingen har slått eller flyttet en vanlig brikke på lenge.' };
    if (X && X.steps >= 400) return { win: -1, note: 'spillet har gått veldig lenge.' };
    return null;
  }

  /* ----- datamaskin ----- */
  function turns(st, side) {
    var res = [];
    function dfs(s0, seq) {
      var mv = steps(s0, side);
      if (!mv.length) { if (seq.length) res.push({ seq: seq, st: s0 }); return; }
      mv.forEach(function (m) {
        var s1 = cloneSt(s0), r = step(s1, side, m);
        var seq1 = seq.concat([{ pid: m.pid, from: m.from, to: m.to, cap: m.cap }]);
        if (r.done) res.push({ seq: seq1, st: s1 }); else dfs(s1, seq1);
      });
    }
    dfs(st, []); return res;
  }
  function evalSt(st) {
    var v = 0;
    st.pcs.forEach(function (p) {
      var x = p.k ? 320 : 100, adv = p.s === 1 ? p.r : (N - 1 - p.r);
      if (!p.k) x += adv * 6 + (p.r === (p.s === 1 ? 0 : N - 1) ? 8 : 0);
      var cc = Math.abs(p.c - 3.5); x += (3.5 - cc) * 1.2;
      v += p.s === 1 ? x : -x;
    });
    return v;
  }
  function search(st, side, depth, alpha, beta) {
    var ts = turns(st, side);
    if (!ts.length) return side === 1 ? -100000 - depth : 100000 + depth;
    if (!count(st, 1 - side)) return 0;
    if (depth <= 0) return evalSt(st);
    var best = side === 1 ? -1e9 : 1e9, i, v;
    for (i = 0; i < ts.length; i++) {
      if (!count(ts[i].st, 1 - side)) { v = side === 1 ? 100000 + depth : -100000 - depth; }
      else v = search(ts[i].st, 1 - side, depth - 1, alpha, beta);
      if (side === 1) { if (v > best) best = v; if (best > alpha) alpha = best; } else { if (v < best) best = v; if (best < beta) beta = best; }
      if (alpha >= beta) break;
    }
    return best;
  }
  function ai(st, side, level, rnd) {
    var ts = turns(st, side); if (!ts.length) return [];
    if (level <= 1 && rnd() < .3) return ts[Math.floor(rnd() * ts.length)].seq;
    var depth = level <= 1 ? 1 : level === 2 ? 3 : 5, best = -1e9, bm = [];
    ts.forEach(function (t) {
      var v = !count(t.st, 1 - side) ? 100000 : search(t.st, 1 - side, depth - 1, -1e9, 1e9);
      v += rnd() * .5; if (v > best + 1e-9) { best = v; bm = [t]; } else if (Math.abs(v - best) < 1e-9) bm.push(t);
    });
    return bm[Math.floor(rnd() * bm.length)].seq;
  }

  var def = {
    id: 'dame', maxPlayers: 8, sideNames: ['Hvit', 'Svart'], sideIcons: ['⚪', '⚫'],
    init: init, steps: steps, step: step, over: over, ai: ai,
    timeNote: function (st, aiMode) { return 'Tiden er ute. Hvit ' + count(st, 0) + ' brikker – svart ' + count(st, 1) + '.'; }
  };
  return { rules: T.make(def), def: def, N: N, isDark: isDark, init: init, steps: steps, step: step, over: over, ai: ai, turns: turns, count: count, cloneSt: cloneSt };
});
