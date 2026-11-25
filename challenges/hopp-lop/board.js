/* Deutschwelt — Hopp-løp: brett og visning. Avhenger av rules.js (DWHopp), ../brettspill/two.js, grid.js og ui.js. */
(function () {
  'use strict';
  var D = window.DWHopp, U = window.DWTwo.uiParts(D.def), sq = window.DWGrid.sq;
  var board = window.DWGrid.make({
    dark: D.isDark, pieces: function (v) { return v.x.st.pcs; },
    camp: function (r, c) { return D.inCamp(0, r, c) ? '0' : D.inCamp(1, r, c) ? '1' : ''; }
  });
  window.DWBoardUI.run({
    key: 'hopp', title: 'Hopp-løp', rules: D.rules, maxPlayers: 8, die: false,
    board: board,
    pickHead: function (v) { return v.x && v.x.st.chain ? 'Hopp videre – eller stopp' : 'Velg trekk'; },
    extra: U.extra, lobbyRow: U.lobbyRow, lobbyNote: U.lobbyNote, turnTag: U.turnTag, role: U.role, playerStat: U.playerStat, summaryExtra: U.summaryExtra, endTitle: U.endTitle,
    noneTitle: 'Ingen lovlige trekk',
    goHtml: function (v, p, control, ui) {
      var s = U.sideOfPub(v, p);
      if (control) return { html: '<button class="btn prim big yourturn" id="b-go">🦘 Ta en oppgave og flytt</button><div class="muted" style="margin-top:6px">' + U.SI[s] + ' ' + U.SN[s] + ' · inn i det ' + (s === 0 ? 'røde' : 'blå') + ' hjørnet' + (v.settings.opp === 'ai' ? '. Svarer du feil, mister dere turen – og datamaskinen flytter likevel.' : '.') + '</div>', bind: function (root) { var b = root.querySelector('#b-go'); b.addEventListener('click', function () { b.disabled = true; ui.act('go'); }); } };
      return { html: '<span class="muted">Venter på at ' + ui.esc(p.name) + ' skal ta oppgaven …</span>' };
    },
    meta: function (v, c, p, ui) {
      var s = U.sideOfPub(v, p), g0 = D.goalCount(v.x.st, 0).own, g1 = D.goalCount(v.x.st, 1).own;
      return '<b>' + U.SI[s] + ' ' + U.SN[s] + '</b> <span class="muted">– riktig svar gir ett trekk. I mål: ⚪ ' + g0 + '/9 · ⚫ ' + g1 + '/9</span>';
    },
    pickText: function (v, p, m, ui) { return m.stop ? '✋ Stopp her' : (m.hop ? '🦘 ' : '') + sq(m.from.r, m.from.c) + ' → ' + sq(m.to.r, m.to.c); },
    resultExtra: function (v, L, c, ui) {
      var end = U.resultLine(v), ai = L.aiMoved ? '<br>🤖 Datamaskinen flytter …' : '';
      return { ok: ai + end, bad: '<br><span class="muted">Dere mister turen.' + (L.aiMoved ? ' 🤖 Datamaskinen flytter likevel.' : ' Motstanderen er på tur.') + '</span>' + end };
    }
  });
})();
