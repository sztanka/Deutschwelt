/* Deutschwelt — Ludo lagspill: brett og visning (samme kryssbrett som ../aergere-dich-nicht/). Avhenger av rules.js (DWLudoLag), ../aergere-dich-nicht/engine.js (DWLudo) og ../brettspill/ui.js. */
(function () {
  'use strict';
  var LL = window.DWLudoLag, L = window.DWLudo, SEATS = L.SEATS, PRON = window.DWBoard.PRON;
  var YLAB = [[9.15, 3.45], [9.15, 7.55], [1.85, 7.55], [1.85, 3.45]];
  var disp = null;
  function coord(seat, d, i) {
    if (d < 0) { var y = L.YARD[seat][i]; return [y[0], y[1]]; }
    if (d <= 39) { var c = L.RING[(L.START[seat] + d) % 40]; return [c[0] + .5, c[1] + .5]; }
    var l = L.LANE[seat][d - 40]; return [l[0] + .5, l[1] + .5];
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function seatName(v, t) { return SEATS[v.x.teams[t].seat].name; }

  var board = {
    build: function (ui) {
      var h = '', fill = {};
      L.START.forEach(function (s, seat) { fill[L.RING[s].join(',')] = seat; });
      L.LANE.forEach(function (lane, seat) { lane.forEach(function (c) { fill[c.join(',')] = seat; }); });
      h += '<rect x=".14" y=".14" width="10.72" height="10.72" fill="none" stroke="#1d1d1d" stroke-width=".05" rx=".25"/>';
      L.RING.forEach(function (c) { var sd = fill[c.join(',')]; h += '<circle cx="' + (c[0] + .5) + '" cy="' + (c[1] + .5) + '" r=".41" fill="' + (sd != null ? SEATS[sd].col : '#fff') + '" stroke="#1d1d1d" stroke-width=".06"/>'; });
      L.LANE.forEach(function (lane, seat) { lane.forEach(function (c) { h += '<circle cx="' + (c[0] + .5) + '" cy="' + (c[1] + .5) + '" r=".41" fill="' + SEATS[seat].col + '" stroke="#1d1d1d" stroke-width=".06"/>'; }); });
      L.START.forEach(function (s, seat) { var c = L.RING[s]; h += '<circle cx="' + (c[0] + .5) + '" cy="' + (c[1] + .5) + '" r=".27" fill="none" stroke="#fff" stroke-width=".07" opacity=".85"/>'; });
      L.YARD.forEach(function (ys, seat) { ys.forEach(function (y) { h += '<circle cx="' + y[0] + '" cy="' + y[1] + '" r=".46" fill="' + SEATS[seat].col + '" stroke="#1d1d1d" stroke-width=".06"/>'; }); });
      var cx = 5.5, cy = 5.5, cols = SEATS.map(function (x) { return x.col; });
      h += '<polygon points="' + cx + ',' + cy + ' ' + (cx - .42) + ',' + (cy - .42) + ' ' + (cx + .42) + ',' + (cy - .42) + '" fill="' + cols[0] + '"/><polygon points="' + cx + ',' + cy + ' ' + (cx + .42) + ',' + (cy - .42) + ' ' + (cx + .42) + ',' + (cy + .42) + '" fill="' + cols[1] + '"/><polygon points="' + cx + ',' + cy + ' ' + (cx + .42) + ',' + (cy + .42) + ' ' + (cx - .42) + ',' + (cy + .42) + '" fill="' + cols[2] + '"/><polygon points="' + cx + ',' + cy + ' ' + (cx - .42) + ',' + (cy + .42) + ' ' + (cx - .42) + ',' + (cy - .42) + '" fill="' + cols[3] + '"/>';
      [[7.45, 1.7, 'M7.2 1.3 L7.7 1.3 L7.45 1.95 Z'], [1.7, 3.55, 'M1.3 3.3 L1.3 3.8 L1.95 3.55 Z'], [9.3, 7.45, 'M9.7 7.2 L9.7 7.7 L9.05 7.45 Z'], [3.55, 9.3, 'M3.3 9.7 L3.8 9.7 L3.55 9.05 Z']].forEach(function (a) { h += '<path d="' + a[2] + '" fill="#1d1d1d" opacity=".55"/>'; });
      ui.$('#bd').innerHTML = '<svg class="bg" viewBox="0 0 11 11" preserveAspectRatio="none">' + h + '</svg><div id="ylabs"></div><div class="btoks" id="toks"></div>';
      disp = null;
    },
    setDisp: function (v) { if (v.x) { disp = {}; v.x.teams.forEach(function (T, t) { disp[t] = T.pieces.slice(); }); } },
    render: function (v, ui, ctx) {
      var toks = ui.$('#toks'); if (!toks || !v.x) return; if (!disp) board.setDisp(v);
      var cp = ctx.cp, pick = ctx.pick || [], cpTeam = cp && cp.team != null ? cp.team : -1, alive = {};
      ui.$$('.ltgt', toks).forEach(function (t) { t.remove(); });
      v.x.teams.forEach(function (T, t) {
        var arr = disp[t] || T.pieces;
        T.pieces.forEach(function (real, i) {
          var d = arr[i] != null ? arr[i] : real, xy = coord(T.seat, d, i), key = 't' + t + ':' + i, el = toks.querySelector('.ltok[data-k="' + key + '"]');
          if (!el) { el = document.createElement('div'); el.className = 'ltok'; el.setAttribute('data-k', key); toks.appendChild(el); el.addEventListener('click', function () { if (el.classList.contains('pick')) ui.act('pick', parseInt(el.getAttribute('data-i'), 10)); }); }
          el.setAttribute('data-i', i); if (el._n !== i) { el.textContent = i + 1; el._n = i; }
          el.style.setProperty('--pc', SEATS[T.seat].col); el.title = 'Lag ' + SEATS[T.seat].name.toLowerCase() + ' – brikke ' + (i + 1);
          el.style.left = (xy[0] / 11 * 100) + '%'; el.style.top = (xy[1] / 11 * 100) + '%';
          el.classList.toggle('cur', t === cpTeam && !pick.length && v.phase === 'play');
          el.classList.toggle('pick', t === cpTeam && pick.some(function (m) { return m.i === i; })); alive[key] = 1;
        });
      });
      ui.$$('.ltok', toks).forEach(function (el) { if (!alive[el.getAttribute('data-k')]) el.remove(); });
      if (pick.length && cpTeam >= 0) pick.forEach(function (m) {
        var xy = coord(v.x.teams[cpTeam].seat, m.to, m.i), t = document.createElement('div'); t.className = 'ltgt'; t.style.setProperty('--pc', SEATS[v.x.teams[cpTeam].seat].col);
        t.style.left = (xy[0] / 11 * 100) + '%'; t.style.top = (xy[1] / 11 * 100) + '%'; t.addEventListener('click', function () { ui.act('pick', m.i); }); toks.appendChild(t);
      });
      var box = ui.$('#ylabs'), h = '';
      v.x.teams.forEach(function (T, t) {
        var pos = YLAB[T.seat], ms = T.members.map(function (id) { var p = ui.findP(v, id); return p ? p.icon : ''; }).join(' ');
        h += '<div class="ylab' + (t === cpTeam && v.phase === 'play' ? ' cur' : '') + '" style="--pc:' + SEATS[T.seat].col + ';left:' + (pos[0] / 11 * 100) + '%;top:' + (pos[1] / 11 * 100) + '%">Lag ' + esc(SEATS[T.seat].name.toLowerCase()) + '<br><span class="ms">' + ms + '</span></div>';
      });
      box.innerHTML = h;
    },
    event: async function (e, s, ui) {
      if (!disp) return;
      if (e.k === 'move') {
        var arr = disp[e.team] || (disp[e.team] = []);
        for (var k = 0; k < e.path.length; k++) { arr[e.i] = e.path[k]; board.render(s, ui, { cp: ui.curP(s), pick: [] }); ui.Snd.tick(); await ui.sleep(160); }
        await ui.sleep(120);
      } else if (e.k === 'capture') {
        var el = ui.$('.ltok[data-k="t' + e.team + ':' + e.i + '"]'); if (el) el.classList.add('kick'); ui.Snd.down(); await ui.sleep(450);
        if (disp[e.team]) disp[e.team][e.i] = -1; board.render(s, ui, { cp: ui.curP(s), pick: [] }); await ui.sleep(300);
      } else if (e.k === 'home') { ui.Snd.special(); await ui.sleep(500); }
    }
  };

  window.DWBoardUI.run({
    key: 'ludolag', title: 'Ludo lagspill', rules: LL.rules, maxPlayers: 12, die: true,
    board: board, noneTitle: 'Ingen brikke kan flyttes',
    pcolor: function (p, idx) { return p && p.seat != null && p.seat >= 0 && SEATS[p.seat] ? SEATS[p.seat].col : '#888'; },
    pickHead: 'Velg brikke',
    extra: [
      { key: 'nTeams', label: 'Antall lag', type: 'seg', opts: [['2', '2 lag'], ['3', '3 lag'], ['4', '4 lag']], note: 'Del spillerne i lag med knappene ved navnene. Lagene spiller etter tur, og innen laget er det neste spiller som får terningen og oppgaven.' },
      { key: 'pieces', label: 'Brikker per lag', type: 'seg', opts: [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']] },
      { key: 'start', label: 'Start', type: 'seg', opts: [['one', 'Rask start'], ['six', 'Klassisk (6)']] }
    ],
    lobbyRow: function (li, p, v, host, ui) {
      var st = v.settings, idx = v.players.indexOf(p), t = LL.defTeam(st, p, idx), seat = LL.seatsFor(st.nTeams)[t];
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip on'; b.textContent = 'Lag ' + SEATS[seat].name.toLowerCase(); b.style.borderColor = SEATS[seat].col; b.style.background = SEATS[seat].col; b.style.color = seat === 3 ? '#222' : '#fff';
      if (host) { b.title = 'Bytt lag'; b.addEventListener('click', function () { ui.S.engine.setSettings({ teamOf: { pid: p.id, team: (t + 1) % st.nTeams } }); ui.S.push(); }); } else b.disabled = true;
      li.appendChild(b);
    },
    lobbyNote: function (v) { return 'Del spillerne i ' + v.settings.nTeams + ' lag (minst én på hvert lag). Spillere som ikke har valgt lag, fordeles automatisk.'; },
    turnTag: function (v, p) { return 'lag ' + (p.seat != null && SEATS[p.seat] ? SEATS[p.seat].name.toLowerCase() : ''); },
    role: function (v, mine, ui, host) {
      if (host) return mine.length ? 'Vert · ' + mine.map(function (x) { return x.icon; }).join(' ') : 'Vert (lærervisning)';
      var m = mine[0]; return m ? 'Du er ' + m.icon + ' ' + m.name + (m.seat != null && SEATS[m.seat] ? ' – lag ' + SEATS[m.seat].name.toLowerCase() : '') : '';
    },
    goHtml: function (v, p, control, ui) {
      if (control) return { html: '<button class="btn prim big yourturn" id="b-go">🎲 Kast terningen</button><div class="muted" style="margin-top:6px">Lag ' + esc(SEATS[p.seat].name.toLowerCase()) + ' – riktig svar lar laget flytte en brikke. 6 gir ekstra kast.</div>', bind: function (root) { var b = root.querySelector('#b-go'); b.addEventListener('click', function () { b.disabled = true; ui.act('go'); }); } };
      return { html: '<span class="muted">Venter på at ' + ui.esc(p.name) + ' skal kaste …</span>' };
    },
    meta: function (v, c, p, ui) { var verb = c.task && c.task.k === 'verb'; return '<b>' + c.die + '</b>' + (verb ? ' → <b>' + PRON[c.person] + '</b>' : '') + '<br><span class="muted">Riktig svar: lag ' + esc(SEATS[p.seat].name.toLowerCase()) + ' flytter en brikke ' + c.die + ' felt.</span>'; },
    pickText: function (v, p, m, ui) { return m.from === -1 ? 'Brikke ' + (m.i + 1) + ': ut på start' : 'Brikke ' + (m.i + 1) + ': ' + (m.to >= 40 ? 'inn i hus' : 'felt ' + (m.from + 1) + ' → ' + (m.to + 1)); },
    resultExtra: function (v, L2, c, ui) {
      var mv = L2.moved ? '<br><span class="muted">Brikke ' + (L2.moved.i + 1) + (L2.moved.to >= 40 ? ' er på vei i hus!' : ' flyttes.') + '</span>' : '';
      var cap = L2.cap ? '<br>😤 <b>Lag ' + esc(seatName(v, L2.cap.team).toLowerCase()) + ' fikk en brikke slått ut!</b>' : '';
      var win = v.winner ? '<br>🏆 <b>Alle brikkene i hus – laget vant!</b>' : '';
      var again = L2.again && !v.winner ? '<br>🎲 <b>6! Ny kasting!</b>' : '';
      return { ok: mv + cap + win + again, bad: '<br><span class="muted">Laget mister turen.</span>' };
    },
    playerStat: function (x) { return '<b>' + (x.home != null ? x.home + '/' + x.total + ' i hus' : '') + '</b>'; },
    summaryExtra: function (s) { return 'Lag: <b>' + s.nTeams + '</b> · Brikker: <b>' + s.pieces + '</b> · Start: <b>' + (s.start === 'one' ? 'rask' : 'klassisk (6)') + '</b>'; },
    endTitle: function (v, sm) { return sm.note || (sm.why === 'time' ? '⏱ Tiden er ute' : '🏁 Spillet er avsluttet'); }
  });
})();
