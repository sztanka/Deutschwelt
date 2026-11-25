/* Deutschwelt — Ulv og sauer: brett og visning (8 × 8, mørke ruter). Avhenger av rules.js (DWWolf) og ../brettspill/ui.js. */
(function () {
  'use strict';
  var W = window.DWWolf, N = 8, disp = null, sel = null, lastTid = -1;
  var LET = 'abcdefgh';
  function sq(r, c) { return LET.charAt(c) + (N - r); }
  function px(c) { return ((c + .5) / N * 100) + '%'; }

  var board = {
    build: function (ui) {
      var h = '';
      for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
        var dark = W.isDark(r, c);
        h += '<div class="wc ' + (dark ? 'dk' : 'lt') + '" style="grid-column:' + (c + 1) + ';grid-row:' + (r + 1) + '">' + (c === 0 ? '<i class="co l">' + (N - r) + '</i>' : '') + (r === N - 1 ? '<i class="co b">' + LET.charAt(c) + '</i>' : '') + '</div>';
      }
      ui.$('#bd').innerHTML = '<div class="wcells">' + h + '</div><div class="btoks" id="toks"></div>';
      disp = null; sel = null;
    },
    setDisp: function (v) { if (v.x) disp = { sheep: v.x.sheep.map(function (s) { return { r: s.r, c: s.c }; }), wolf: { r: v.x.wolf.r, c: v.x.wolf.c } }; },
    render: function (v, ui, ctx) {
      var toks = ui.$('#toks'); if (!toks || !v.x) return; if (!disp) board.setDisp(v);
      var cp = ctx.cp, pick = ctx.pick || [], alive = {}, wolfRole = cp && cp.role === 'wolf';
      if (v.cur && v.cur.tid !== lastTid) { lastTid = v.cur.tid; sel = null; }
      if (v.stage !== 'pick') sel = null;
      var movers = {}; pick.forEach(function (m) { if (m.i != null) movers[m.i] = 1; });
      var mk = Object.keys(movers);
      if (!wolfRole && sel == null && mk.length === 1) sel = parseInt(mk[0], 10);
      ui.$$('.btgt', toks).forEach(function (t) { t.remove(); });
      function put(key, cls, rc, emoji, extra) {
        var el = toks.querySelector('.btok[data-k="' + key + '"]');
        if (!el) { el = document.createElement('div'); el.className = 'btok'; el.setAttribute('data-k', key); toks.appendChild(el); }
        if (el._e !== emoji) { el.innerHTML = emoji; el._e = emoji; }
        el.style.left = px(rc.c); el.style.top = px(rc.r);
        el.className = 'btok ' + cls + (extra || ''); alive[key] = 1; return el;
      }
      disp.sheep.forEach(function (s, i) {
        var can = !wolfRole && movers[i], el = put('s' + i, 'sheep', s, '🐑', (can ? ' pick' : '') + (sel === i ? ' sel' : '') + (cp && !wolfRole && v.stage !== 'idle' ? ' cur' : ''));
        el.style.setProperty('--pc', '#7b8794'); el.title = 'Sau ' + (i + 1) + ' (' + sq(s.r, s.c) + ')';
        if (can && !el._h) { el._h = 1; el.addEventListener('click', function () { if (el.classList.contains('pick')) { sel = i; ui.render(); } }); }
      });
      var wel = put('w', 'wolf', disp.wolf, '🐺', (cp && wolfRole ? ' cur' : ''));
      wel.style.setProperty('--pc', '#222'); wel.title = 'Ulven (' + sq(disp.wolf.r, disp.wolf.c) + ')';
      ui.$$('.btok', toks).forEach(function (el) { if (!alive[el.getAttribute('data-k')]) el.remove(); });
      if (pick.length) pick.forEach(function (m) {
        if (!wolfRole && m.i !== sel) return;
        var t = document.createElement('div'); t.className = 'btgt'; t.style.left = px(m.to.c); t.style.top = px(m.to.r);
        t.title = 'Flytt til ' + sq(m.to.r, m.to.c); t.addEventListener('click', function () { ui.act('pick', m.id); }); toks.appendChild(t);
      });
    },
    event: async function (e, s, ui) {
      if (!disp) return;
      if (e.k === 'smove') {
        var el = ui.$('.btok[data-k="s' + e.i + '"]'); if (el) el.classList.add('slow');
        disp.sheep[e.i] = { r: e.to.r, c: e.to.c }; board.render(s, ui, { cp: ui.curP(s), pick: [] }); ui.Snd.tick(); await ui.sleep(650);
        if (el) el.classList.remove('slow');
      } else if (e.k === 'wmove') {
        var w = ui.$('.btok[data-k="w"]'); if (w) w.classList.add('slow');
        if (e.ai) await ui.sleep(350);
        disp.wolf = { r: e.to.r, c: e.to.c }; board.render(s, ui, { cp: ui.curP(s), pick: [] }); ui.Snd.down(); await ui.sleep(750);
        if (w) w.classList.remove('slow');
      } else if (e.k === 'trap') { ui.Snd.special(); await ui.sleep(500); }
    }
  };

  function roleOf(v, p) { return p && p.role === 'wolf' ? 'wolf' : 'sheep'; }
  window.DWBoardUI.run({
    key: 'wolf', title: 'Ulv og sauer', rules: W.rules, maxPlayers: 8, die: false,
    board: board,
    pickHead: 'Velg hvor du vil flytte',
    extra: [
      { key: 'wolf', label: 'Hvem er ulven?', type: 'seg', opts: [['ai', 'Datamaskinen (alle er sauer)'], ['player', 'En av spillerne']], note: 'Er ulven en spiller, trykk på 🐺 ved navnet i spillerlisten. Ulven må også svare riktig for å flytte.' },
      { key: 'wolfLevel', label: 'Hvor smart er datamaskin-ulven?', type: 'seg', opts: [['1', 'Snill'], ['2', 'Vanlig'], ['3', 'Lur']], show: function (st) { return st.wolf === 'ai'; } }
    ],
    lobbyRow: function (li, p, v, host, ui) {
      if (!host || v.settings.wolf !== 'player') return;
      var idx = v.players.indexOf(p), isW = v.settings.wolfPid ? v.settings.wolfPid === p.id : idx === 0;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (isW ? ' on' : ''); b.textContent = isW ? '🐺 Ulv' : '🐑 Sau'; b.title = 'Gjør til ulv';
      b.addEventListener('click', function () { ui.S.engine.setSettings({ wolfPid: p.id }); ui.S.push(); }); li.appendChild(b);
    },
    lobbyNote: function (v) { return v.settings.wolf === 'player' ? 'Én spiller er ulv, de andre er sauer og spiller på lag. Minst to spillere.' : 'Datamaskinen er ulven. Spillerne er sauene og spiller på lag.'; },
    turnTag: function (v, p) { return v.settings.wolf === 'player' ? (p.role === 'wolf' ? 'ulv' : 'sau') : 'sau'; },
    role: function (v, mine, ui, host) {
      if (host) return mine.length ? 'Vert · ' + mine.map(function (x) { return x.icon; }).join(' ') : 'Vert (lærervisning)';
      var m = mine[0]; return m ? 'Du er ' + m.icon + ' ' + m.name + (v.settings.wolf === 'player' ? (m.role === 'wolf' ? ' – 🐺 ulven' : ' – 🐑 sau') : ' – 🐑 sau') : '';
    },
    goHtml: function (v, p, control, ui) {
      var wolf = roleOf(v, p) === 'wolf';
      if (control) return { html: '<button class="btn prim big yourturn" id="b-go">' + (wolf ? '🐺 Ta en oppgave og flytt ulven' : '🐑 Ta en oppgave og flytt en sau') + '</button>' + (v.settings.wolf === 'ai' ? '<div class="muted" style="margin-top:6px">Svarer du feil, mister dere turen – og ulven flytter likevel.</div>' : ''), bind: function (root) { var b = root.querySelector('#b-go'); b.addEventListener('click', function () { b.disabled = true; ui.act('go'); }); } };
      return { html: '<span class="muted">Venter på at ' + ui.esc(p.name) + ' skal ta oppgaven …</span>' };
    },
    meta: function (v, c, p, ui) {
      var wolf = roleOf(v, p) === 'wolf';
      return wolf ? '<span class="muted"><b>🐺 Ulven:</b> riktig svar gir ett skritt skrått – i alle retninger.</span>' : '<span class="muted"><b>🐑 Sauene:</b> riktig svar gir ett skritt skrått <b>oppover</b> med én sau.' + (v.settings.wolf === 'ai' ? ' Feil svar: ulven flytter likevel.' : '') + '</span>';
    },
    pickText: function (v, p, m, ui) {
      return (m.i != null ? '🐑 Sau ' + (m.i + 1) + ': ' : '🐺 Ulven: ') + sq(m.from.r, m.from.c) + ' → ' + sq(m.to.r, m.to.c);
    },
    resultExtra: function (v, L, c, ui) {
      var x = v.x || {}, end = x.result === 'sheep' ? '<br>🐑 <b>Sauene fanget ulven!</b> 🎉' : x.result === 'wolf' ? '<br>🐺 <b>Ulven slapp unna!</b>' : '';
      return {
        ok: (L.wolfMoved ? '<br>🐺 Ulven flytter …' : '') + end,
        bad: (L.passed ? '<br><span class="muted">Dere mister turen.' + (L.wolfMoved ? ' 🐺 Ulven flytter likevel.' : '') + '</span>' : '') + end
      };
    },
    noneTitle: 'Ingen trekk',
    playerStat: function (x) { return x.role === 'wolf' ? '🐺' : '🐑'; },
    summaryExtra: function (s) { return s.wolf === 'ai' ? 'Ulv: <b>datamaskinen (' + ['snill', 'vanlig', 'lur'][s.wolfLevel - 1] + ')</b>' : 'Ulv: <b>en av spillerne</b>'; },
    endTitle: function (v, sm, win) { return sm.note || (sm.why === 'time' ? '⏱ Tiden er ute' : '🏁 Spillet er avsluttet'); }
  });
})();
