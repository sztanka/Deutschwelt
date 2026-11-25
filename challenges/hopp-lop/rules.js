/* Deutschwelt — Hopp-løp (Eckdame): regelpakke for ../brettspill/two.js (+ core.js)
   Regler som i «Spielesammlung» (nr. 7): Brettet ligger «over hjørnet». Hver side har 9 brikker i en trekant i sitt hjørne (1 + 3 + 5 mørke ruter).
   Målet er å få alle ni brikkene inn i motstanderens startområde (hjørnet diagonalt overfor). Man flytter én brikke per tur, ett skritt skrått – bare FRAMOVER eller SIDELENGS, aldri bakover.
   Man kan hoppe over en motstanderbrikke som står rett foran en (skrått) hvis ruta bak er tom, og fortsette å hoppe så lenge man vil (men det er ingen hoppetvang). Ingen brikker slås. Egne brikker kan aldri hoppes over.
   Koordinater: rad 0 øverst, kolonne 0 til venstre, mørke ruter (r + c) oddetall. Hvit (side 0) starter nederst til venstre (rad 7, kol 0) og skal til øverst til høyre; svart (side 1) motsatt.
   Retninger (dc,dr): hvit: (+1,−1) framover, (+1,+1) og (−1,−1) sidelengs. Svart: (−1,+1) framover, (−1,−1) og (+1,+1) sidelengs. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../brettspill/two.js'));
  else root.DWHopp = factory(root.DWTwo);
})(typeof self !== 'undefined' ? self : this, function (T) {
  'use strict';
  var N = 8;
  var DIRS = [[[1, -1], [1, 1], [-1, -1]], [[-1, 1], [-1, -1], [1, 1]]];   // [dc, dr]
  function inb(r, c) { return r >= 0 && r < N && c >= 0 && c < N; }
  function isDark(r, c) { return (r + c) % 2 === 1; }
  function prog(s, r, c) { var x = c, y = N - 1 - r, d = x + y; return s === 0 ? d : 14 - d; }      // 0..14 (framgang mot motstanderhjørnet)
  function inCamp(s, r, c) { return isDark(r, c) && prog(s, r, c) <= 4; }                                // eget startområde (s = eier)
  function inGoal(s, r, c) { return isDark(r, c) && prog(s, r, c) >= 10; }                               // målområde for side s
  function cloneSt(st) { return { pcs: st.pcs.map(function (p) { return { id: p.id, s: p.s, r: p.r, c: p.c }; }), nid: st.nid, chain: st.chain ? { pid: st.chain.pid, seen: st.chain.seen.slice() } : null }; }
  function at(st, r, c) { var a = st.pcs; for (var i = 0; i < a.length; i++) if (a[i].r === r && a[i].c === c) return a[i]; return null; }
  function byId(st, id) { var a = st.pcs; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function init() {
    var pcs = [], id = 1, r, c;
    for (r = 0; r < N; r++) for (c = 0; c < N; c++) if (isDark(r, c)) {
      if (prog(0, r, c) <= 4) pcs.push({ id: id++, s: 0, r: r, c: c });
      else if (prog(1, r, c) <= 4) pcs.push({ id: id++, s: 1, r: r, c: c });
    }
    return { pcs: pcs, nid: id, chain: null };
  }
  function hops(st, p, seen) {
    var out = [];
    DIRS[p.s].forEach(function (d) {
      var e = at(st, p.c + d[0] >= 0 ? p.r + d[1] : -1, p.c + d[0]), lr = p.r + 2 * d[1], lc = p.c + 2 * d[0];
      if (e && e.s !== p.s && inb(lr, lc) && !at(st, lr, lc) && !(seen && seen.indexOf(lr * 8 + lc) >= 0)) out.push({ pid: p.id, from: { r: p.r, c: p.c }, to: { r: lr, c: lc }, hop: { r: e.r, c: e.c } });
    });
    return out;
  }
  function slides(st, p) {
    var out = [];
    DIRS[p.s].forEach(function (d) { var r = p.r + d[1], c = p.c + d[0]; if (inb(r, c) && !at(st, r, c)) out.push({ pid: p.id, from: { r: p.r, c: p.c }, to: { r: r, c: c }, hop: null }); });
    return out;
  }
  function steps(st, side) {
    var out = [], i;
    if (st.chain) { var cp = byId(st, st.chain.pid); out = cp ? hops(st, cp, st.chain.seen) : []; if (out.length) out.push({ stop: true, pid: st.chain.pid }); }
    else for (i = 0; i < st.pcs.length; i++) if (st.pcs[i].s === side) out = out.concat(hops(st, st.pcs[i]), slides(st, st.pcs[i]));
    out.forEach(function (m, k) { m.id = k; });
    return out;
  }
  function step(st, side, mv) {
    if (mv.stop) { st.chain = null; return { events: [], done: true }; }
    var p = byId(st, mv.pid), seen = st.chain ? st.chain.seen : [p.r * 8 + p.c]; p.r = mv.to.r; p.c = mv.to.c; seen = seen.concat([p.r * 8 + p.c]);
    var ev = [{ k: 'dmove', pid: p.id, to: { r: p.r, c: p.c }, side: side, hop: !!mv.hop }];
    if (mv.hop && hops(st, p, seen).length) { st.chain = { pid: p.id, seen: seen }; return { events: ev, done: false }; }
    st.chain = null; return { events: ev, done: true };
  }
  function goalCount(st, s) { var own = 0, other = 0; st.pcs.forEach(function (p) { if (inGoal(s, p.r, p.c)) { if (p.s === s) own++; else other++; } }); return { own: own, other: other }; }
  function over(st, side, X) {
    var g = goalCount(st, side);
    if (g.own === 9 || (g.own + g.other === 9 && g.own >= 7)) return { win: side, note: g.own === 9 ? 'Alle ni brikkene er i mål.' : 'Målområdet er fullt.' };
    if (X && X.steps >= 300) return { win: -1, note: 'spillet har gått veldig lenge.' };
    return null;
  }
  function progress(st, s) { var v = 0, mn = 99; st.pcs.forEach(function (p) { if (p.s === s) { var d = prog(s, p.r, p.c); v += d; if (d < mn) mn = d; } }); return v + mn * 1.5; }

  /* ----- datamaskin ----- */
  function turns(st, side) {
    var res = [];
    function dfs(s0, seq, depth) {
      steps(s0, side).forEach(function (m) {
        var s1 = cloneSt(s0), r = step(s1, side, m), seq1 = seq.concat([{ pid: m.pid, from: m.from, to: m.to, hop: m.hop, stop: m.stop, id: 0 }]);
        if (r.done) res.push({ seq: seq1, st: s1 }); else if (depth < 8) dfs(s1, seq1, depth + 1);
      });
    }
    dfs(st, [], 0);
    var seen = {}, out = []; res.forEach(function (t) { var k = JSON.stringify(t.st.pcs.map(function (p) { return p.r * 8 + p.c + (p.s ? 100 : 0); }).sort()); if (!seen[k]) { seen[k] = 1; out.push(t); } });
    return out;
  }
  function evalSt(st, side) {
    var me = progress(st, side), other = progress(st, 1 - side), g = goalCount(st, side);
    return me - other + g.own * 2;
  }
  function ai(st, side, level, rnd) {
    var ts = turns(st, side); if (!ts.length) return [];
    if (level <= 1 && rnd() < .35) return ts[Math.floor(rnd() * ts.length)].seq;
    var best = -1e9, bm = [];
    ts.forEach(function (t) {
      var v = evalSt(t.st, side);
      if (level >= 3) { var rep = turns(t.st, 1 - side), worst = -1e9; rep.forEach(function (u) { var w = evalSt(u.st, 1 - side) - evalSt(u.st, side) * 0; if (w > worst) worst = w; }); if (rep.length) v -= (worst - progress(t.st, 1 - side) + 0) * .6; }
      v += rnd() * (level <= 1 ? 3 : .6);
      if (v > best + 1e-9) { best = v; bm = [t]; } else if (Math.abs(v - best) < 1e-9) bm.push(t);
    });
    return bm[Math.floor(rnd() * bm.length)].seq;
  }

  var def = {
    id: 'hopp', maxPlayers: 8, sideNames: ['Hvit', 'Svart'], sideIcons: ['⚪', '⚫'],
    init: init, steps: steps, step: step, over: over, ai: ai,
    timeNote: function (st) { var a = goalCount(st, 0).own, b = goalCount(st, 1).own; return 'Tiden er ute. I mål: hvit ' + a + ' – svart ' + b + '.'; }
  };
  return { rules: T.make(def), def: def, N: N, isDark: isDark, inGoal: inGoal, inCamp: inCamp, init: init, steps: steps, step: step, over: over, ai: ai, turns: turns, goalCount: goalCount, progress: progress, cloneSt: cloneSt };
});
