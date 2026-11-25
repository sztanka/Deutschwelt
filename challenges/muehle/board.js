/* Deutschwelt — Mølle: brett og visning (SVG, 24 punkter). Avhenger av rules.js (DWMuehle), ../brettspill/two.js og ui.js. */
(function () {
  'use strict';
  var M = window.DWMuehle, U = window.DWTwo.uiParts(M.def);
  var RING = [[6, 50, 94], [22, 50, 78], [38, 50, 62]];
  function pxy(i) {
    var k = Math.floor(i / 8), p = i % 8, a = RING[k][0], m = RING[k][1], b = RING[k][2];
    return [[a, a], [m, a], [b, a], [b, m], [b, b], [m, b], [a, b], [a, m]][p];
  }
  function name(i) { return 'ABC'.charAt(Math.floor(i / 8)) + (i % 8 + 1); }
  var disp = null, sel = null, lastTid = -1;

  var board = {
    build: function (ui) {
      var h = '<svg viewBox="0 0 100 100" class="msvg" preserveAspectRatio="none">';
      h += '<rect width="100" height="100" fill="#ead8a6"/>';
      [0, 1, 2].forEach(function (k) { var a = RING[k][0], b = RING[k][2]; h += '<rect x="' + a + '" y="' + a + '" width="' + (b - a) + '" height="' + (b - a) + '" fill="none" stroke="#6e4f2c" stroke-width="1.1"/>'; });
      [[50, 6, 50, 38], [50, 62, 50, 94], [6, 50, 38, 50], [62, 50, 94, 50]].forEach(function (l) { h += '<line x1="' + l[0] + '" y1="' + l[1] + '" x2="' + l[2] + '" y2="' + l[3] + '" stroke="#6e4f2c" stroke-width="1.1"/>'; });
      for (var i = 0; i < 24; i++) {
        var q = pxy(i);
        h += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="1.5" fill="#6e4f2c"/>';
        h += '<text x="' + (q[0] + 1.8) + '" y="' + (q[1] + 4.2) + '" text-anchor="start" font-size="2.7" fill="#7a5d2e" opacity=".85">' + name(i) + '</text>';
      }
      h += '</svg><div class="btoks" id="toks"></div>';
      ui.$('#bd').innerHTML = h; disp = null; sel = null;
    },
    setDisp: function (v) { if (v.x) disp = v.x.st.b.slice(); },
    render: function (v, ui, ctx) {
      var toks = ui.$('#toks'); if (!toks || !v.x) return; if (!disp) board.setDisp(v);
      var pick = ctx.pick || [], alive = {}, st = v.x.st, side = ctx.cp ? U.sideOfPub(v, ctx.cp) : 0;
      if (v.cur && v.cur.tid !== lastTid) { lastTid = v.cur.tid; sel = null; }
      if (v.stage !== 'pick') sel = null;
      var places = pick.filter(function (m) { return m.from == null && m.rem == null; }), moves = pick.filter(function (m) { return m.from != null; }), rems = {};
      pick.forEach(function (m) { if (m.rem != null) rems[m.rem] = m; });
      var movers = {}; moves.forEach(function (m) { movers[m.from] = 1; });
      if (sel != null && !movers[sel]) sel = null;
      ui.$$('.btgt', toks).forEach(function (t) { t.remove(); });
      for (var i = 0; i < 24; i++) {
        if (disp[i] < 0) continue;
        var key = 'pt' + i, el = toks.querySelector('.btok[data-k="' + key + '"]');
        if (!el) { el = document.createElement('div'); el.className = 'btok'; el.setAttribute('data-k', key); toks.appendChild(el); }
        var q = pxy(i); el.style.left = q[0] + '%'; el.style.top = q[1] + '%';
        var slow = el.classList.contains('slow'), mill = el.classList.contains('mill');
        el.className = 'btok dp' + disp[i] + (movers[i] ? ' pick' : '') + (rems[i] ? ' pick rem' : '') + (sel === i ? ' sel' : '') + (slow ? ' slow' : '') + (mill ? ' mill' : '');
        el.title = (disp[i] === 0 ? 'Hvit ' : 'Svart ') + name(i);
        el._pk = i;
        if (!el._h) { el._h = 1; (function (e) { e.addEventListener('click', function () { var pi = e._pk; if (!e.classList.contains('pick')) return; if (e.classList.contains('rem')) { var mm = e._rem; if (mm) ui.act('pick', mm.id); } else { sel = pi; ui.render(); } }); })(el); }
        el._rem = rems[i] || null;
        alive[key] = 1;
      }
      ui.$$('.btok', toks).forEach(function (el) { if (!alive[el.getAttribute('data-k')]) el.remove(); });
      function target(m, pos) { var q = pxy(pos), t = document.createElement('div'); t.className = 'btgt'; t.style.left = q[0] + '%'; t.style.top = q[1] + '%'; t.title = name(pos); t.addEventListener('click', function () { ui.act('pick', m.id); }); toks.appendChild(t); }
      places.forEach(function (m) { target(m, m.to); });
      if (sel != null) moves.forEach(function (m) { if (m.from === sel) target(m, m.to); });
      var hd = ui.$('#mhands');
      if (hd) hd.innerHTML = '<span><i class="sw dp0"></i> Hvit: <b>' + M.cnt(st, 0) + '</b> på brettet' + (st.hand[0] ? ', <b>' + st.hand[0] + '</b> igjen å sette' : '') + '</span><span><i class="sw dp1"></i> Svart: <b>' + M.cnt(st, 1) + '</b> på brettet' + (st.hand[1] ? ', <b>' + st.hand[1] + '</b> igjen å sette' : '') + '</span>';
    },
    event: async function (e, s, ui) {
      if (!disp) return;
      var toks = ui.$('#toks'), ctx = { cp: ui.curP(s), pick: [] };
      if (e.ai) await ui.sleep(350);
      if (e.k === 'mplace') { disp[e.to] = e.side; board.render(s, ui, ctx); ui.Snd.tick(); await ui.sleep(380); }
      else if (e.k === 'mmove') {
        var el = toks.querySelector('.btok[data-k="pt' + e.from + '"]');
        if (el) { el.setAttribute('data-k', 'pt' + e.to); el.classList.add('slow'); }
        disp[e.to] = disp[e.from]; disp[e.from] = -1; board.render(s, ui, ctx); ui.Snd.tick(); await ui.sleep(620);
        if (el) el.classList.remove('slow');
      } else if (e.k === 'mmill') {
        var els = e.pts.map(function (i) { return toks.querySelector('.btok[data-k="pt' + i + '"]'); });
        els.forEach(function (x) { if (x) x.classList.add('mill'); }); ui.Snd.special(); await ui.sleep(900);
        els.forEach(function (x) { if (x) x.classList.remove('mill'); });
      } else if (e.k === 'mrem') {
        var rx = toks.querySelector('.btok[data-k="pt' + e.at + '"]'); if (rx) { rx.style.opacity = 0; rx.style.transform = 'scale(.4)'; ui.Snd.down(); }
        await ui.sleep(380); disp[e.at] = -1; board.render(s, ui, ctx);
      }
    }
  };

  function phaseText(v, side) {
    var st = v.x.st;
    if (st.chain) return '🎉 Mølle! Ta bort en av motstanderens brikker.';
    if (st.hand[side] > 0) return 'Sett ut en brikke (' + st.hand[side] + ' igjen)';
    if (M.cnt(st, side) === 3) return '🕊 Du har tre brikker igjen – du kan fly til hvilket som helst tomt punkt';
    return 'Flytt en brikke til et nabopunkt';
  }
  window.DWBoardUI.run({
    key: 'muehle', title: 'Mølle', rules: M.rules, maxPlayers: 8, die: false,
    board: board,
    pickHead: function (v) { var st = v.x && v.x.st; return st && st.chain ? 'Mølle! Velg en brikke å ta' : 'Velg trekk'; },
    extra: U.extra, lobbyRow: U.lobbyRow, lobbyNote: U.lobbyNote, turnTag: U.turnTag, role: U.role, playerStat: U.playerStat, summaryExtra: U.summaryExtra, endTitle: U.endTitle,
    noneTitle: 'Ingen lovlige trekk',
    goHtml: function (v, p, control, ui) {
      var s = U.sideOfPub(v, p);
      if (control) return { html: '<button class="btn prim big yourturn" id="b-go">⚪ Ta en oppgave og flytt</button><div class="muted" style="margin-top:6px">' + U.SI[s] + ' ' + U.SN[s] + ' · ' + phaseText(v, s) + (v.settings.opp === 'ai' ? '. Svarer du feil, mister dere turen – og datamaskinen flytter likevel.' : '') + '</div>', bind: function (root) { var b = root.querySelector('#b-go'); b.textContent = U.SI[s] + ' Ta en oppgave og flytt'; b.addEventListener('click', function () { b.disabled = true; ui.act('go'); }); } };
      return { html: '<span class="muted">Venter på at ' + ui.esc(p.name) + ' skal ta oppgaven …</span>' };
    },
    meta: function (v, c, p, ui) { var s = U.sideOfPub(v, p); return '<b>' + U.SI[s] + ' ' + U.SN[s] + '</b> <span class="muted">– ' + phaseText(v, s) + '</span>'; },
    pickText: function (v, p, m, ui) { return m.rem != null ? '✕ Ta ' + name(m.rem) : m.from != null ? name(m.from) + ' → ' + name(m.to) : 'Sett på ' + name(m.to); },
    resultExtra: function (v, L, c, ui) {
      var end = U.resultLine(v), ai = L.aiMoved ? '<br>🤖 Datamaskinen flytter …' : '';
      return { ok: ai + end, bad: '<br><span class="muted">Dere mister turen.' + (L.aiMoved ? ' 🤖 Datamaskinen flytter likevel.' : ' Motstanderen er på tur.') + '</span>' + end };
    }
  });
})();
