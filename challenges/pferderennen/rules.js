/* Deutschwelt — Hesteveddeløpet (Pferderennen): regelpakke for ../brettspill/core.js
   En bane med 60 felt. Spilleren velger selv tempo: 🐢 Trav (lett oppgave, 2 felt), 🐎 Galopp (vanlig oppgave, 3 felt) eller 🏇 Full fart (vanskelig oppgave, 5 felt).
   Riktig svar = hesten går. Feil svar = hesten blir stående. Spesialfelt (som i spillsamlingen): 10 hinder (tilbake 3), 20 hoppet (fram 3),
   30 grøfta (kast på nytt = ekstra tur), 40 styrt (stå over en runde), 50 sluttspurt (fram 5). Målfeltet 60 må ikke treffes nøyaktig – overskytende felt forfaller. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DWPferde = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var GOAL = 60;
  var TIERS = {
    lett: { steps: 2, label: 'Trav', icon: '🐢', desc: 'lett oppgave', set: { level: 'A1', answerMode: 'velg' } },
    middels: { steps: 3, label: 'Galopp', icon: '🐎', desc: 'vanlig oppgave', set: {} },
    vanskelig: { steps: 5, label: 'Full fart', icon: '🏇', desc: 'vanskelig oppgave', set: { level: 'B1', answerMode: 'skriv' } }
  };
  var FIELDS = {
    10: { icon: '🚧', title: 'Hinderet', de: 'Das Pferd traut sich nicht über das Hindernis: drei Felder zurück.', no: 'Hesten tør ikke hoppe over hinderet: tre felt tilbake.' },
    20: { icon: '🚀', title: 'Det store hoppet', de: 'Super Sprung! Du darfst drei Felder vorziehen.', no: 'Supert hopp! Du går tre felt fram.' },
    30: { icon: '💦', title: 'Grøfta', de: 'Das Pferd fällt in den Graben, aber du darfst noch einmal.', no: 'Hesten faller i grøfta, men du får en ekstra tur.' },
    40: { icon: '🤕', title: 'Styrten', de: 'Das Pferd ist gestürzt: Du setzt eine Runde aus.', no: 'Hesten har falt: du står over en runde.' },
    50: { icon: '🔥', title: 'Sluttspurten', de: 'Endspurt! Du darfst fünf Felder vorziehen.', no: 'Sluttspurt! Du går fem felt fram.' }
  };
  var TIER_SET = {}; Object.keys(TIERS).forEach(function (k) { TIER_SET[k] = TIERS[k].set; });

  var R = {
    id: 'pferde', maxPlayers: 6, tiers: TIER_SET,
    minPlayers: function () { return 1; },
    initPlayer: function (p) { p.pos = 0; },
    pubPlayer: function (p) { return { pos: p.pos }; },
    view: function () { return {}; },

    begin: function (H, p, arg) {
      var t = TIERS[arg]; if (!t) return null;
      return { tier: arg, info: { steps: t.steps, tier: arg, from: p.pos, to: Math.min(GOAL, p.pos + t.steps) }, events: [{ k: 'go', pid: p.id, tier: arg }] };
    },
    onCorrect: function (H, p, c) {
      var steps = TIERS[c.tier].steps, from = p.pos, to = Math.min(GOAL, from + steps), ev = [], path = [], f, extra = false, fields = [];
      for (f = from + 1; f <= to; f++) path.push(f);
      ev.push({ k: 'move', pid: p.id, path: path }); p.pos = to;
      if (to >= GOAL) { H.win(p); fields.push({ f: GOAL, kind: 'goal' }); }
      else if (FIELDS[to]) {
        fields.push({ f: to, kind: String(to) }); ev.push({ k: 'field', pid: p.id, f: to });
        var d = 0;
        if (to === 10) d = -3; else if (to === 20) d = 3; else if (to === 50) d = 5;
        else if (to === 30) extra = true; else if (to === 40) p.skip = 1;
        if (d) { ev.push({ k: 'warp', pid: p.id, from: to, to: to + d, kind: String(to) }); p.pos = to + d; }
        H.log(p.name + ': ' + FIELDS[to].title + ' (felt ' + to + ')', 'sys');
      }
      return { events: ev, extra: extra, ms: fields.length && fields[0].kind !== 'goal' ? 1700 : 0, last: { fields: fields, from: from, to: p.pos, steps: steps } };
    },
    onWrong: function (H, p, c) { return { last: { from: p.pos, to: p.pos, steps: TIERS[c.tier].steps } }; },
    rank: function (H) {
      return H.G.players.slice().sort(function (a, b) {
        if (!!a.finished !== !!b.finished) return a.finished ? -1 : 1;
        if (b.pos !== a.pos) return b.pos - a.pos;
        return b.right - a.right;
      });
    },
    score: function (H, p) { return p.finished ? '🏆 i mål' : 'felt ' + p.pos; }
  };
  return { rules: R, TIERS: TIERS, FIELDS: FIELDS, GOAL: GOAL };
});
