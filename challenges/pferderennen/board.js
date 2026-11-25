/* Deutschwelt — Hesteveddeløpet: brett og visning (oval bane med baner/«lanes», 60 felt). Avhenger av rules.js (DWPferde) og ../brettspill/ui.js. */
(function () {
  'use strict';
  var P = window.DWPferde, T = P.TIERS, F = P.FIELDS, GOAL = P.GOAL;
  var VW = 220, VH = 140, CX1 = 70, CX2 = 150, CY = 70, R = 32, STR = CX2 - CX1, ARC = Math.PI * R, LEN = 2 * STR + 2 * ARC, SLOTS = 62, D = LEN / SLOTS, S0 = 25;
  var nLanes = 2, laneW = 7, disp = {};

  /* punkt på banen: s = buelengde, o = sidelengs forskyvning (positiv = utover) */
  function pt(s, o) {
    s = ((s % LEN) + LEN) % LEN;
    if (s < STR) return [CX1 + s, CY + R + o];
    s -= STR;
    if (s < ARC) { var a = s / R; return [CX2 + (R + o) * Math.sin(a), CY + (R + o) * Math.cos(a)]; }
    s -= ARC;
    if (s < STR) return [CX2 - s, CY - R - o];
    s -= STR; var b = s / R; return [CX1 - (R + o) * Math.sin(b), CY - (R + o) * Math.cos(b)];
  }
  function stadium(o) {
    var r = R + o;
    return 'M' + CX1 + ' ' + (CY + r) + ' H' + CX2 + ' A' + r + ' ' + r + ' 0 0 0 ' + CX2 + ' ' + (CY - r) + ' H' + CX1 + ' A' + r + ' ' + r + ' 0 0 0 ' + CX1 + ' ' + (CY + r) + ' Z';
  }
  function slot(p) { return S0 + p * D; }
  function laneOff(i) { return (i - (nLanes - 1) / 2) * laneW; }
  function xy(p, lane) { return pt(slot(p), laneOff(lane)); }
  function fx(n) { return (n / VW * 100) + '%'; }
  function fy(n) { return (n / VH * 100) + '%'; }

  var board = {
    build: function (ui) {
      var $ = ui.$, v = ui.S.view; nLanes = Math.max(2, v ? v.players.length : 2); laneW = nLanes > 4 ? 6 : 7;
      var W = nLanes * laneW + 4, h = '';
      h += '<svg viewBox="0 0 ' + VW + ' ' + VH + '" class="rsvg" preserveAspectRatio="none">';
      h += '<rect width="' + VW + '" height="' + VH + '" fill="#8cc77a"/>';
      h += '<path d="' + stadium(0) + '" fill="none" stroke="#6e4f2c" stroke-width="' + (W + 3) + '" stroke-linejoin="round"/>';
      h += '<path d="' + stadium(0) + '" fill="none" stroke="#d9b77c" stroke-width="' + W + '"/>';
      for (var i = 1; i < nLanes; i++) h += '<path d="' + stadium(laneOff(i) - laneW / 2) + '" fill="none" stroke="rgba(255,255,255,.55)" stroke-width=".5" stroke-dasharray="2 2"/>';
      h += '<text x="' + ((CX1 + CX2) / 2) + '" y="' + (CY - 2) + '" text-anchor="middle" font-size="9" font-weight="800" fill="#2f6a2a">Pferderennen</text>';
      h += '<text x="' + ((CX1 + CX2) / 2) + '" y="' + (CY + 9) + '" text-anchor="middle" font-size="5.2" fill="#2f6a2a">60 felt · mot klokka</text>';
      // spesialfelt
      [10, 20, 30, 40, 50].forEach(function (f) {
        var a = pt(slot(f), -W / 2), b = pt(slot(f), W / 2), ic = pt(slot(f), W / 2 + 6.5), nm = pt(slot(f), -W / 2 - 5);
        h += '<g data-m="' + f + '" class="mk"><line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#a9442f" stroke-width="1.3"/>';
        h += '<text x="' + ic[0] + '" y="' + (ic[1] + 3) + '" text-anchor="middle" font-size="9">' + F[f].icon + '</text>';
        h += '<text x="' + nm[0] + '" y="' + (nm[1] + 1.8) + '" text-anchor="middle" font-size="4.4" font-weight="800" fill="#4a3a1a">' + f + '</text></g>';
      });
      // start og mål
      var s1 = pt(slot(0), -W / 2), s2 = pt(slot(0), W / 2), g1 = pt(slot(GOAL), -W / 2), g2 = pt(slot(GOAL), W / 2), gi = pt(slot(GOAL), W / 2 + 6.5), si = pt(slot(0) + 4, -W / 2 - 4.5);
      h += '<line x1="' + s1[0] + '" y1="' + s1[1] + '" x2="' + s2[0] + '" y2="' + s2[1] + '" stroke="#fff" stroke-width="1.6"/>';
      h += '<text x="' + si[0] + '" y="' + (si[1] + 1.8) + '" text-anchor="middle" font-size="4.6" font-weight="800" fill="#fff">START</text>';
      h += '<line x1="' + g1[0] + '" y1="' + g1[1] + '" x2="' + g2[0] + '" y2="' + g2[1] + '" stroke="#111" stroke-width="2.2"/><line x1="' + g1[0] + '" y1="' + g1[1] + '" x2="' + g2[0] + '" y2="' + g2[1] + '" stroke="#fff" stroke-width="2.2" stroke-dasharray="1.8 1.8"/>';
      h += '<text x="' + gi[0] + '" y="' + (gi[1] + 3.2) + '" text-anchor="middle" font-size="9">🏆</text>';
      h += '</svg><div class="btoks" id="toks"></div>';
      $('#bd').innerHTML = h; disp = {};
      var lg = $('#bd-legend');
      if (lg) lg.innerHTML = '<h3 style="margin:14px 0 4px;width:100%">Slik velger du tempo og spesialfelt</h3><div class="evlist">' +
        ['lett', 'middels', 'vanskelig'].map(function (k) { return '<div><b><span class="ic">' + T[k].icon + '</span>' + T[k].label + '</b> – ' + T[k].steps + ' felt (' + T[k].desc + ')</div>'; }).join('') +
        [10, 20, 30, 40, 50].map(function (f) { return '<div><b><span class="ic">' + F[f].icon + '</span>' + F[f].title + ' <span class="muted">(felt ' + f + ')</span></b><br>' + ui.esc(F[f].no) + '</div>'; }).join('') + '</div>';
    },
    setDisp: function (v) { disp = {}; v.players.forEach(function (p) { disp[p.id] = p.pos; }); },
    render: function (v, ui, ctx) {
      var toks = ui.$('#toks'); if (!toks) return; var cp = ctx.cp, alive = {};
      v.players.forEach(function (p, pi) {
        var f = disp[p.id] != null ? disp[p.id] : p.pos, pos = xy(f, pi);
        var el = toks.querySelector('.btok[data-k="' + p.id + '"]');
        if (!el) { el = document.createElement('div'); el.className = 'btok'; el.setAttribute('data-k', p.id); toks.appendChild(el); }
        if (el._ic !== p.icon) { el.innerHTML = p.icon + '<span class="bd2"></span>'; el._ic = p.icon; }
        el.style.setProperty('--pc', ui.pcolor(p, pi)); el.title = p.name + ' – felt ' + f;
        el.style.left = fx(pos[0]); el.style.top = fy(pos[1]);
        el.classList.toggle('cur', !!(cp && cp.id === p.id));
        var b = el.querySelector('.bd2'); if (b) b.textContent = p.skip ? '💤' : '';
        alive[p.id] = 1;
      });
      ui.$$('.btok', toks).forEach(function (el) { if (!alive[el.getAttribute('data-k')]) el.remove(); });
    },
    event: async function (e, s, ui) {
      if (e.k === 'go') { ui.Snd.up(); await ui.sleep(250); }
      else if (e.k === 'move') {
        for (var i = 0; i < e.path.length; i++) { disp[e.pid] = e.path[i]; board.render(s, ui, { cp: ui.curP(s) }); ui.Snd.tick(); await ui.sleep(230); }
        await ui.sleep(150);
      } else if (e.k === 'field') {
        var m = ui.$('.mk[data-m="' + e.f + '"]'); if (m) m.classList.add('flash');
        ui.Snd.special(); await ui.sleep(1000); if (m) m.classList.remove('flash');
      } else if (e.k === 'warp') {
        var tk = ui.$('.btok[data-k="' + e.pid + '"]'); if (tk) tk.classList.add('slow');
        disp[e.pid] = e.to; board.render(s, ui, { cp: ui.curP(s) }); if (e.to > e.from) ui.Snd.up(); else ui.Snd.down();
        await ui.sleep(900); if (tk) tk.classList.remove('slow');
      }
    }
  };

  function fieldsHtml(L, ui) {
    if (!L.fields || !L.fields.length) return '';
    return L.fields.filter(function (x) { return F[x.f]; }).map(function (x) {
      var f = F[x.f]; return '<div class="fieldinfo"><span class="ic">' + f.icon + '</span><span class="de">' + ui.esc(f.de) + '</span><br><span class="no">' + ui.esc(f.no) + '</span></div>';
    }).join('');
  }

  window.DWBoardUI.run({
    key: 'pferde', title: 'Hesteveddeløpet', rules: P.rules, maxPlayers: 6, die: false,
    board: board,
    goHtml: function (v, p, control, ui) {
      if (!control) return { html: '<span class="muted">Venter på at ' + ui.esc(p.name) + ' skal velge tempo …</span>' };
      var h = '<div class="muted"><b>Velg tempo</b> – jo vanskeligere oppgave, jo lenger går hesten:</div><div class="tierbtns">' +
        ['lett', 'middels', 'vanskelig'].map(function (k) { return '<button type="button" class="t-' + k + '" data-v="' + k + '"><span class="ti2">' + T[k].icon + '</span>' + T[k].label + '<small>' + T[k].desc + '</small><small><b>' + T[k].steps + ' felt</b></small></button>'; }).join('') + '</div>';
      return { html: h, bind: function (root) { ui.$$('.tierbtns button', root).forEach(function (b) { b.addEventListener('click', function () { ui.$$('.tierbtns button', root).forEach(function (x) { x.disabled = true; }); ui.act('go', b.getAttribute('data-v')); }); }); } };
    },
    meta: function (v, c, p, ui) {
      var t = T[c.tier] || {}, info = c.info || {};
      return '<b>' + (t.icon || '') + ' ' + ui.esc(t.label || '') + '</b> <span class="muted">(' + ui.esc(t.desc || '') + ')</span><br><span class="muted">' + (info.steps ? info.steps + ' felt fram hvis du svarer riktig: felt ' + info.from + ' → <b>' + info.to + '</b>' : '') + '</span>';
    },
    resultExtra: function (v, L, c, ui) {
      var mv = (L.from != null && L.to != null && L.to !== L.from) ? '<br><span class="muted">Felt ' + L.from + ' → <b>' + L.to + '</b></span>' : '';
      var win = (v.winner && v.winner === c.pid) ? '<br>🏆 <b>Du vant løpet!</b>' : '';
      var again = L.again && !v.winner ? '<br>🐎 <b>Du får en ekstra tur!</b>' : '';
      return { ok: mv + win + again, bad: '<br><span class="muted">Hesten blir stående på felt ' + (L.from != null ? L.from : '') + '.</span>', after: L.ok ? fieldsHtml(L, ui) : '' };
    },
    playerStat: function (x) { return '<b>felt ' + x.pos + '</b>' + (x.skip ? ' 💤' : ''); },
    summaryExtra: function () { return 'Mål: <b>felt 60</b>'; },
    lobbyNote: function () { return 'Fra 1 til 6 spillere. Hver spiller får sin egen bane.'; }
  });
})();
