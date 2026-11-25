/* Deutschwelt — Dame: brett og visning. Avhenger av rules.js (DWDame), ../brettspill/two.js (DWTwo), grid.js (DWGrid) og ui.js. */
(function () {
  'use strict';
  var D = window.DWDame, U = window.DWTwo.uiParts(D.def), sq = window.DWGrid.sq;
  var board = window.DWGrid.make({ dark: D.isDark, pieces: function (v) { return v.x.st.pcs; } });

  function mustCapture(v, side) { try { return D.steps(v.x.st, side).some(function (m) { return !!m.cap; }); } catch (e) { return false; } }
  window.DWBoardUI.run({
    key: 'dame', title: 'Dame', rules: D.rules, maxPlayers: 8, die: false,
    board: board,
    pickHead: function (v) { return v.x && v.x.st.chain ? 'Du må slå videre med samme brikke' : 'Velg trekk'; },
    extra: U.extra, lobbyRow: U.lobbyRow, lobbyNote: U.lobbyNote, turnTag: U.turnTag, role: U.role, playerStat: U.playerStat, summaryExtra: U.summaryExtra, endTitle: U.endTitle,
    noneTitle: 'Ingen lovlige trekk',
    goHtml: function (v, p, control, ui) {
      var s = U.sideOfPub(v, p);
      if (control) return { html: '<button class="btn prim big yourturn" id="b-go">♟ Ta en oppgave og flytt</button>' + '<div class="muted" style="margin-top:6px">' + U.SI[s] + ' ' + U.SN[s] + (mustCapture(v, s) ? ' · <b>Slagtvang:</b> du må slå hvis du kan.' : '') + (v.settings.opp === 'ai' ? ' Svarer du feil, mister dere turen – og datamaskinen flytter likevel.' : '') + '</div>', bind: function (root) { var b = root.querySelector('#b-go'); b.addEventListener('click', function () { b.disabled = true; ui.act('go'); }); } };
      return { html: '<span class="muted">Venter på at ' + ui.esc(p.name) + ' skal ta oppgaven …</span>' };
    },
    meta: function (v, c, p, ui) {
      var s = U.sideOfPub(v, p);
      return '<b>' + U.SI[s] + ' ' + U.SN[s] + '</b> <span class="muted">– riktig svar gir ett trekk.' + (mustCapture(v, s) ? ' <b>Slagtvang!</b>' : '') + '</span>';
    },
    pickText: function (v, p, m, ui) { return (m.cap ? '⚔ ' : '') + sq(m.from.r, m.from.c) + ' → ' + sq(m.to.r, m.to.c) + (m.cap ? ' (slår ' + sq(m.cap.r, m.cap.c) + ')' : ''); },
    resultExtra: function (v, L, c, ui) {
      var end = U.resultLine(v), ai = L.aiMoved ? '<br>🤖 Datamaskinen flytter …' : '';
      return { ok: ai + end, bad: '<br><span class="muted">Dere mister turen.' + (L.aiMoved ? ' 🤖 Datamaskinen flytter likevel.' : ' Motstanderen er på tur.') + '</span>' + end };
    }
  });
})();
