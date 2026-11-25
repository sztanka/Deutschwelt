/* Deutschwelt — Gåsespillet (Gänsespiel): regelpakke for ../brettspill/core.js
   Spiralbrett med 63 felt (9 × 7 ruter). Kast terningen, svar riktig på oppgaven – og gå like mange felt framover.
   Hendelsesfelt (fra spillsamlingens regler): gås (gå like langt en gang til), 3 Bocksprung, 6 Brücke, 15 Vogelkäfig, 19 Hotel,
   26 Würfelfeld, 31 Brunnen, 39 Treppe, 42 Labyrinth, 52 Gefängnis, 58 Grab. Feltet 63 er målet (nås eller passeres = seier). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DWGoose = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var N = 63, COLS = 9, ROWS = 7;
  var GEESE = [5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59];

  function spiral(cols, rows) {
    var out = [], top = 0, bot = rows - 1, left = 0, right = cols - 1, c, r;
    while (top <= bot && left <= right) {
      for (c = left; c <= right; c++) out.push([c, top]); top++;
      for (r = top; r <= bot; r++) out.push([right, r]); right--;
      if (top <= bot) { for (c = right; c >= left; c--) out.push([c, bot]); bot--; }
      if (left <= right) { for (r = bot; r >= top; r--) out.push([left, r]); left++; }
    }
    return out;
  }
  var CELLS = [null].concat(spiral(COLS, ROWS));      // CELLS[felt] = [kolonne, rad]

  /* hendelsesfelt: kind, ikon, tittel (tysk), forklaring (tysk), norsk */
  var INFO = {
    goose: { icon: 'goose', title: 'Gans', de: 'Gans! Du gehst noch einmal so weit.', no: 'Gås! Du går like langt en gang til.' },
    bock: { icon: '🐐', title: 'Bocksprung', de: 'Bocksprung: Du springst auf das Feld vor dem nächsten Spieler.', no: 'Bukkehopp: Du hopper fram til feltet rett foran neste spiller.' },
    bridge: { icon: '🌉', title: 'Brücke', de: 'Die Brücke: Du gehst weiter bis Feld 12.', no: 'Broen: Du går videre til felt 12.' },
    cage: { icon: '🐦', title: 'Vogelkäfig', de: 'Vogelkäfig: Du gehst zurück auf Feld 11.', no: 'Fuglebur: Du går tilbake til felt 11.' },
    hotel: { icon: '🏨', title: 'Hotel', de: 'Hotel: Du setzt einmal aus.', no: 'Hotell: Du står over én gang.' },
    dice: { icon: '🎲', title: 'Würfelfeld', de: 'Würfelfeld: Bei einer 3 oder 6 darfst du noch einmal würfeln.', no: 'Terningfelt: Med 3 eller 6 får du kaste en gang til.' },
    well: { icon: '⛲', title: 'Brunnen', de: 'Brunnen: Du sitzt fest, bis du eine 6 würfelst – oder jemand anderes kommt.', no: 'Brønnen: Du sitter fast til du kaster 6 – eller til en annen spiller kommer hit.' },
    stairs: { icon: '⤵️', title: 'Treppe', de: 'Treppe: Du fällst zurück auf Feld 33.', no: 'Trappen: Du faller tilbake til felt 33.' },
    maze: { icon: '🌀', title: 'Labyrinth', de: 'Labyrinth: Du verirrst dich und gehst zurück auf Feld 30.', no: 'Labyrint: Du går deg vill og må tilbake til felt 30.' },
    jail: { icon: '🔒', title: 'Gefängnis', de: 'Gefängnis: Du setzt zweimal aus.', no: 'Fengsel: Du står over to ganger.' },
    grave: { icon: '⚰️', title: 'Grab', de: 'Grab: Du beginnst wieder bei Feld 1.', no: 'Graven: Du må begynne på nytt, tilbake til felt 1.' },
    goal: { icon: '🌅', title: 'Ziel', de: 'Sonnenaufgang! Du hast das Ziel erreicht.', no: 'Soloppgang! Du er i mål.' }
  };
  var KIND = { 3: 'bock', 6: 'bridge', 15: 'cage', 19: 'hotel', 26: 'dice', 31: 'well', 39: 'stairs', 42: 'maze', 52: 'jail', 58: 'grave', 63: 'goal' };
  GEESE.forEach(function (g) { KIND[g] = 'goose'; });
  function kindAt(f) { return KIND[f] || ''; }

  var R = {
    id: 'goose', maxPlayers: 6,
    minPlayers: function () { return 1; },
    initPlayer: function (p) { p.pos = 0; p.well = false; },
    pubPlayer: function (p) { return { pos: p.pos, well: !!p.well }; },
    view: function () { return {}; },

    begin: function (H, p) {
      var die = 1 + H.rint(6), ev = [{ k: 'roll', pid: p.id, die: die }];
      if (p.well) {
        if (die !== 6) return { die: die, none: true, events: ev, msg: 'Du sitter fast i brønnen og trenger en 6. (Du kastet ' + die + '.)', log: p.name + ' kastet ' + die + ' – sitter fast i brønnen' };
        p.well = false; H.log(p.name + ' kastet 6 og kom opp av brønnen', 'sys');
      }
      return { die: die, events: ev, info: { from: p.pos, to: Math.min(N, p.pos + die) } };
    },

    onCorrect: function (H, p, c) {
      var ev = [], fields = [], extra = false, from = p.pos, tgt = Math.min(N, from + c.die), path = [], f, guard = 0;
      for (f = from + 1; f <= tgt; f++) path.push(f);
      ev.push({ k: 'move', pid: p.id, path: path }); p.pos = tgt;
      while (guard++ < 10) {
        f = p.pos;
        if (f >= N) { H.win(p); fields.push({ f: N, kind: 'goal' }); ev.push({ k: 'field', pid: p.id, f: N, kind: 'goal' }); break; }
        var kind = kindAt(f); if (!kind) break;
        var to = null;
        if (kind === 'goose') {
          to = Math.min(N, f + c.die); var pth = []; for (var q = f + 1; q <= to; q++) pth.push(q);
          fields.push({ f: f, kind: kind }); ev.push({ k: 'field', pid: p.id, f: f, kind: kind }); ev.push({ k: 'move', pid: p.id, path: pth, goose: true }); p.pos = to; continue;
        }
        if (kind === 'bock') {
          var ahead = H.G.players.filter(function (o) { return o.id !== p.id && !o.gone && o.pos > f; }).map(function (o) { return o.pos; });
          fields.push({ f: f, kind: kind, none: !ahead.length });
          ev.push({ k: 'field', pid: p.id, f: f, kind: kind });
          if (ahead.length) { to = Math.min.apply(null, ahead) - 1; if (to > f) { ev.push({ k: 'warp', pid: p.id, from: f, to: to, kind: kind }); p.pos = to; continue; } }
          break;
        }
        fields.push({ f: f, kind: kind }); ev.push({ k: 'field', pid: p.id, f: f, kind: kind });
        if (kind === 'bridge') to = 12; else if (kind === 'cage') to = 11; else if (kind === 'stairs') to = 33; else if (kind === 'maze') to = 30; else if (kind === 'grave') to = 1;
        else if (kind === 'hotel') p.skip = 1;
        else if (kind === 'jail') p.skip = 2;
        else if (kind === 'dice') { if (c.die === 3 || c.die === 6) extra = true; else fields[fields.length - 1].none = true; }
        else if (kind === 'well') {
          p.well = true;
          H.G.players.forEach(function (o) { if (o.id !== p.id && o.well) { o.well = false; H.log(o.name + ' slapp ut av brønnen (' + p.name + ' kom)', 'sys'); fields.push({ f: f, kind: 'well', freed: o.name }); } });
        }
        if (to != null) { ev.push({ k: 'warp', pid: p.id, from: f, to: to, kind: kind }); p.pos = to; continue; }
        break;
      }
      if (fields.length) H.log(p.name + ': ' + fields.map(function (x) { return INFO[x.kind].title + (x.f ? ' (' + x.f + ')' : ''); }).join(' → '), 'sys');
      return { events: ev, extra: extra, ms: fields.length ? 1200 + fields.length * 500 : 0, last: { fields: fields, from: from, to: p.pos } };
    },
    onWrong: function (H, p, c) { return { last: { from: p.pos, to: p.pos } }; },

    rank: function (H) {
      return H.G.players.slice().sort(function (a, b) {
        if (!!a.finished !== !!b.finished) return a.finished ? -1 : 1;
        if (b.pos !== a.pos) return b.pos - a.pos;
        return b.right - a.right;
      });
    },
    score: function (H, p) { return p.finished ? '🌅 i mål' : 'felt ' + p.pos; }
  };

  return { rules: R, CELLS: CELLS, INFO: INFO, KIND: KIND, GEESE: GEESE, N: N, COLS: COLS, ROWS: ROWS, kindAt: kindAt };
});
