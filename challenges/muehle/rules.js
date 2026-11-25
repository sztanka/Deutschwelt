/* Deutschwelt — Mølle (Mühle): regelpakke for ../brettspill/two.js (+ core.js)
   Regler som i «Spielesammlung» (nr. 9): 24 punkter på tre kvadrater. Hver side har 9 brikker: først setter man dem ut ett og ett, deretter flytter man til et nabopunkt.
   Tre på rad (en «mølle») gir rett til å ta bort en motstanderbrikke – ikke fra en lukket mølle, med mindre alle er i møller. Har man bare tre brikker igjen, kan man «fly» til et hvilket som helst tomt punkt.
   Taper: den som har færre enn tre brikker, eller ikke kan flytte.
   Punktene: ring 0 (ytterst), 1, 2 (innerst), posisjon 0–7 fra øvre venstre hjørne med klokka (0 hj.v.ø, 1 midt øverst, 2 hj.h.ø, 3 midt høyre, 4 hj.h.n, 5 midt nederst, 6 hj.v.n, 7 midt venstre). Indeks = ring*8 + posisjon. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../brettspill/two.js'));
  else root.DWMuehle = factory(root.DWTwo);
})(typeof self !== 'undefined' ? self : this, function (T) {
  'use strict';
  var NB = [], MILLS = [], k, p;
  for (k = 0; k < 3; k++) for (p = 0; p < 8; p++) {
    var n = [k * 8 + (p + 1) % 8, k * 8 + (p + 7) % 8];
    if (p % 2 === 1) { if (k > 0) n.push((k - 1) * 8 + p); if (k < 2) n.push((k + 1) * 8 + p); }
    NB[k * 8 + p] = n;
  }
  for (k = 0; k < 3; k++) for (p = 0; p < 8; p += 2) MILLS.push([k * 8 + p, k * 8 + p + 1, k * 8 + (p + 2) % 8]);
  for (p = 1; p < 8; p += 2) MILLS.push([p, 8 + p, 16 + p]);
  var MILLS_AT = []; for (k = 0; k < 24; k++) MILLS_AT[k] = MILLS.filter(function (m) { return m.indexOf(k) >= 0; });

  function cloneSt(st) { return { b: st.b.slice(), hand: st.hand.slice(), chain: st.chain ? { rem: true } : null, quiet: st.quiet }; }
  function init() { var b = []; for (var i = 0; i < 24; i++) b.push(-1); return { b: b, hand: [9, 9], chain: null, quiet: 0 }; }
  function cnt(st, s) { var c = 0; for (var i = 0; i < 24; i++) if (st.b[i] === s) c++; return c; }
  function total(st, s) { return cnt(st, s) + st.hand[s]; }
  function inMill(st, i) { var s = st.b[i]; return s >= 0 && MILLS_AT[i].some(function (m) { return st.b[m[0]] === s && st.b[m[1]] === s && st.b[m[2]] === s; }); }
  function millOf(st, i) { var s = st.b[i], r = null; MILLS_AT[i].forEach(function (m) { if (st.b[m[0]] === s && st.b[m[1]] === s && st.b[m[2]] === s) r = m; }); return r; }

  function steps(st, side) {
    var out = [], i, j, opp = 1 - side;
    if (st.chain) {
      var all = [], free = [];
      for (i = 0; i < 24; i++) if (st.b[i] === opp) { all.push(i); if (!inMill(st, i)) free.push(i); }
      (free.length ? free : all).forEach(function (x) { out.push({ rem: x }); });
    } else if (st.hand[side] > 0) {
      for (i = 0; i < 24; i++) if (st.b[i] < 0) out.push({ to: i });
    } else if (cnt(st, side) === 3) {
      for (i = 0; i < 24; i++) if (st.b[i] === side) for (j = 0; j < 24; j++) if (st.b[j] < 0) out.push({ from: i, to: j });
    } else {
      for (i = 0; i < 24; i++) if (st.b[i] === side) NB[i].forEach(function (j2) { if (st.b[j2] < 0) out.push({ from: i, to: j2 }); });
    }
    out.forEach(function (m, x) { m.id = x; });
    return out;
  }
  function step(st, side, mv) {
    var ev = [];
    if (mv.rem != null) {
      st.b[mv.rem] = -1; ev.push({ k: 'mrem', at: mv.rem, side: 1 - side }); st.chain = null; st.quiet = 0; return { events: ev, done: true };
    }
    if (mv.from != null) { st.b[mv.from] = -1; st.b[mv.to] = side; ev.push({ k: 'mmove', from: mv.from, to: mv.to, side: side }); st.quiet++; }
    else { st.b[mv.to] = side; st.hand[side]--; ev.push({ k: 'mplace', to: mv.to, side: side }); st.quiet = 0; }
    var m = millOf(st, mv.to);
    if (m) { ev.push({ k: 'mmill', pts: m.slice(), side: side }); st.chain = { rem: true }; return { events: ev, done: false }; }
    return { events: ev, done: true };
  }
  function over(st, side, X) {
    var opp = 1 - side;
    if (total(st, opp) < 3) return { win: side, note: 'Taperen har færre enn tre brikker.' };
    if (st.quiet >= 40) return { win: -1, note: 'ingen har fått en mølle på lenge.' };
    if (X && X.steps >= 400) return { win: -1, note: 'spillet har gått veldig lenge.' };
    return null;
  }

  /* ----- datamaskin ----- */
  function turns(st, side) {
    var res = [];
    function dfs(s0, seq) {
      var mv = steps(s0, side);
      mv.forEach(function (m) {
        var s1 = cloneSt(s0), r = step(s1, side, m), seq1 = seq.concat([m]);
        if (r.done) res.push({ seq: seq1, st: s1 }); else dfs(s1, seq1);
      });
    }
    dfs(st, []); return res;
  }
  function mobility(st, s) { var c = 0, i; if (st.hand[s] > 0) return 0; for (i = 0; i < 24; i++) if (st.b[i] === s) NB[i].forEach(function (j) { if (st.b[j] < 0) c++; }); return c; }
  function twos(st, s) { var c = 0; MILLS.forEach(function (m) { var a = 0, e = 0; m.forEach(function (x) { if (st.b[x] === s) a++; else if (st.b[x] < 0) e++; }); if (a === 2 && e === 1) c++; }); return c; }
  function evalSt(st) {
    var v = (total(st, 1) - total(st, 0)) * 14;
    v += (mobility(st, 1) - mobility(st, 0)) * 1.4 + (twos(st, 1) - twos(st, 0)) * 4;
    var i, m1 = 0, m0 = 0; for (i = 0; i < 24; i++) if (st.b[i] >= 0 && inMill(st, i)) { if (st.b[i] === 1) m1++; else m0++; }
    return v + (m1 - m0) * 1.5;
  }
  function search(st, side, depth, alpha, beta) {
    if (total(st, 1) < 3) return -100000 - depth;
    if (total(st, 0) < 3) return 100000 + depth;
    var ts = turns(st, side);
    if (!ts.length) return side === 1 ? -100000 - depth : 100000 + depth;
    if (depth <= 0) return evalSt(st);
    var best = side === 1 ? -1e9 : 1e9, i, v;
    for (i = 0; i < ts.length; i++) {
      v = search(ts[i].st, 1 - side, depth - 1, alpha, beta);
      if (side === 1) { if (v > best) best = v; if (best > alpha) alpha = best; } else { if (v < best) best = v; if (best < beta) beta = best; }
      if (alpha >= beta) break;
    }
    return best;
  }
  function ai(st, side, level, rnd) {
    var ts = turns(st, side); if (!ts.length) return [];
    if (level <= 1 && rnd() < .3) return ts[Math.floor(rnd() * ts.length)].seq;
    var depth = level <= 1 ? 1 : level === 2 ? 2 : 3, best = -1e9, bm = [];
    ts.forEach(function (t) {
      var v = search(t.st, 1 - side, depth - 1, -1e9, 1e9) + rnd() * .4;
      if (v > best + 1e-9) { best = v; bm = [t]; } else if (Math.abs(v - best) < 1e-9) bm.push(t);
    });
    return bm[Math.floor(rnd() * bm.length)].seq;
  }

  var def = {
    id: 'muehle', maxPlayers: 8, sideNames: ['Hvit', 'Svart'], sideIcons: ['⚪', '⚫'],
    init: init, steps: steps, step: step, over: over, ai: ai,
    timeNote: function (st) { return 'Tiden er ute. Hvit ' + total(st, 0) + ' brikker – svart ' + total(st, 1) + '.'; }
  };
  return { rules: T.make(def), def: def, NB: NB, MILLS: MILLS, init: init, steps: steps, step: step, over: over, ai: ai, turns: turns, total: total, cnt: cnt, inMill: inMill };
});
