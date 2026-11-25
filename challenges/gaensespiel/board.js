/* Deutschwelt — Gåsespillet: brett og visning (spiral 9 × 7 med startstripe øverst). Avhenger av rules.js (DWGoose) og ../brettspill/ui.js. */
(function () {
  'use strict';
  var G = window.DWGoose, I = G.INFO, CELLS = G.CELLS, COLS = G.COLS, ROWS = G.ROWS + 1;   // +1: startstripe øverst
  var GOOSE_SVG = '<svg viewBox="0 0 32 32" class="gsv" aria-hidden="true"><path d="M5 25c0-5 3-8 8-8h4c2 0 3-1 3-3V9a5 5 0 1 1 9 0v2c0 1 0 2-1 3 1 1 1 2 1 4 0 4-3 7-8 7H9c-2 0-4-.2-4-.5z" fill="#fff" stroke="#3a3a3a" stroke-width="1.6" stroke-linejoin="round"/><path d="M27 9l4 1.6-4 1.4z" fill="#f5a623" stroke="#b97b10" stroke-width=".8"/><circle cx="25" cy="8.4" r="1" fill="#222"/></svg>';
  var disp = {};
  var OFF = [[-.24, -.2], [.24, -.2], [-.24, .22], [.24, .22], [0, 0], [0, .38], [0, -.38]];
  var legendDone = false;

  function xy(f, k, n) {
    var c, r;
    if (f <= 0) { c = .8 + (k || 0) * .95; r = .5; return [c, r]; }       // startstripe (rad 0)
    var cell = CELLS[Math.min(f, 63)]; c = cell[0] + .5; r = cell[1] + 1 + .5;
    var o = OFF[n > 1 ? (k % OFF.length) : 4] || [0, 0];
    return [c + o[0], r + o[1]];
  }
  function iconHtml(kind) { return kind === 'goose' ? GOOSE_SVG : (I[kind] ? '<span>' + I[kind].icon + '</span>' : ''); }

  var board = {
    build: function (ui) {
      var $ = ui.$, h = '';
      h += '<div class="gstart"><span>START</span></div>';
      var spiral = '';
      for (var f = 1; f <= 63; f++) {
        var cell = CELLS[f], kind = G.kindAt(f), cls = 'gc' + (kind ? ' k-' + kind : '') + (f === 63 ? ' goalc' : '');
        h += '<div class="' + cls + '" data-f="' + f + '" style="grid-column:' + (cell[0] + 1) + ';grid-row:' + (cell[1] + 2) + '"><i class="n">' + f + '</i>' + (kind ? '<em class="ic">' + iconHtml(kind) + '</em>' : '') + '</div>';
        spiral += (f === 1 ? 'M' : 'L') + (cell[0] + .5) + ' ' + (cell[1] + 1.5) + ' ';
      }
      $('#bd').innerHTML = '<svg class="gpath" viewBox="0 0 ' + COLS + ' ' + ROWS + '" preserveAspectRatio="none"><path d="' + spiral + '" fill="none" stroke="rgba(120,90,30,.35)" stroke-width=".07" stroke-dasharray=".14 .14"/></svg><div class="gcells">' + h + '</div><div class="btoks" id="toks"></div>';
      disp = {};
      if (!legendDone) {
        var lg = $('#bd-legend');
        if (lg) lg.innerHTML = '<h3 style="margin:14px 0 4px;width:100%">Hendelsesfelt</h3><div class="evlist">' + ['goose', 'bock', 'bridge', 'cage', 'hotel', 'dice', 'well', 'stairs', 'maze', 'jail', 'grave', 'goal'].map(function (k) {
          var nums = k === 'goose' ? G.GEESE.join(', ') : Object.keys(G.KIND).filter(function (n) { return G.KIND[n] === k; }).join(', ');
          return '<div><b><span class="ic">' + iconHtml(k) + '</span>' + I[k].title + ' <span class="muted">(felt ' + nums + ')</span></b><br>' + ui.esc(I[k].no) + '</div>';
        }).join('') + '</div>';
        legendDone = true;
      }
    },
    setDisp: function (v) { disp = {}; v.players.forEach(function (p) { disp[p.id] = p.pos; }); },
    render: function (v, ui, ctx) {
      var toks = ui.$('#toks'); if (!toks) return;
      // grupper per felt for plassering
      var byF = {}; v.players.forEach(function (p) { var f = disp[p.id] != null ? disp[p.id] : p.pos; (byF[f] = byF[f] || []).push(p.id); });
      var alive = {}, cp = ctx.cp;
      v.players.forEach(function (p, pi) {
        var f = disp[p.id] != null ? disp[p.id] : p.pos, grp = byF[f], k = grp.indexOf(p.id), pos = xy(f, k, grp.length);
        var el = toks.querySelector('.btok[data-k="' + p.id + '"]');
        if (!el) { el = document.createElement('div'); el.className = 'btok'; el.setAttribute('data-k', p.id); toks.appendChild(el); }
        if (el._ic !== p.icon) { el.innerHTML = p.icon + '<span class="bd2"></span>'; el._ic = p.icon; }
        el.style.setProperty('--pc', ui.pcolor(p, pi)); el.title = p.name + ' – felt ' + f;
        el.style.left = (pos[0] / COLS * 100) + '%'; el.style.top = (pos[1] / ROWS * 100) + '%';
        el.classList.toggle('cur', !!(cp && cp.id === p.id));
        el.classList.toggle('big', grp.length > 3);
        var b = el.querySelector('.bd2'); if (b) b.textContent = p.well ? '⛲' : (p.skip ? '💤' : '');
        alive[p.id] = 1;
      });
      ui.$$('.btok', toks).forEach(function (el) { if (!alive[el.getAttribute('data-k')]) el.remove(); });
    },
    event: async function (e, s, ui) {
      var self = board;
      if (e.k === 'move') {
        for (var i = 0; i < e.path.length; i++) { disp[e.pid] = e.path[i]; self.render(s, ui, { cp: ui.curP(s) }); ui.Snd.tick(); await ui.sleep(e.goose ? 230 : 200); }
        await ui.sleep(150);
      } else if (e.k === 'field') {
        var el = ui.$('.gc[data-f="' + e.f + '"]'); if (el) el.classList.add('flash');
        ui.Snd.special(); await ui.sleep(900); if (el) el.classList.remove('flash');
      } else if (e.k === 'warp') {
        var tk = ui.$('.btok[data-k="' + e.pid + '"]'); if (tk) tk.classList.add('slow');
        disp[e.pid] = e.to; self.render(s, ui, { cp: ui.curP(s) }); if (e.to > e.from) ui.Snd.up(); else ui.Snd.down();
        await ui.sleep(900); if (tk) tk.classList.remove('slow');
      }
    }
  };

  /* ---------- tekster ---------- */
  var PRON = window.DWBoard.PRON;
  function fieldsHtml(v, L, ui) {
    if (!L.fields || !L.fields.length) return '';
    return L.fields.map(function (x) {
      var inf = I[x.kind], de = inf.de, no = inf.no;
      if (x.kind === 'bock' && x.none) { de = 'Bocksprung: Niemand ist vor dir – du bleibst hier.'; no = 'Bukkehopp: Ingen er foran deg – du blir stående.'; }
      if (x.kind === 'dice' && x.none) { de = 'Würfelfeld: Du hast keine 3 oder 6 gewürfelt – kein Extrawurf.'; no = 'Terningfelt: Du kastet ikke 3 eller 6 – ingen ekstra kast.'; }
      if (x.freed) { no += ' ' + x.freed + ' slapp ut av brønnen.'; }
      return '<div class="fieldinfo"><span class="ic">' + (x.kind === 'goose' ? '<span style="display:inline-block;width:1.4em;vertical-align:-.3em">' + GOOSE_SVG + '</span>' : inf.icon) + '</span><span class="de">' + ui.esc(de) + '</span><br><span class="no">' + ui.esc(no) + '</span></div>';
    }).join('');
  }

  window.DWBoardUI.run({
    key: 'goose', title: 'Gåsespillet', rules: G.rules, maxPlayers: 6, die: true,
    board: board,
    noneTitle: 'Du sitter fast!',
    goHtml: function (v, p, control, ui) {
      if (control) return { html: '<button class="btn prim big yourturn" id="b-go">🎲 Kast terningen</button>' + (p.well ? '<div class="muted" style="margin-top:6px">⛲ Du sitter i brønnen – du må kaste 6.</div>' : ''), bind: function (root) { var b = root.querySelector('#b-go'); b.addEventListener('click', function () { b.disabled = true; ui.act('go'); }); } };
      return { html: '<span class="muted">Venter på at ' + ui.esc(p.name) + ' skal kaste …</span>' };
    },
    meta: function (v, c, p, ui) {
      var verb = c.task && c.task.k === 'verb', info = c.info || {};
      return '<b>' + c.die + '</b>' + (verb ? ' → <b>' + PRON[c.person] + '</b>' : '') + '<br><span class="muted">' + (info.from != null ? 'felt ' + info.from + ' → <b>' + info.to + '</b> hvis du svarer riktig' : '') + '</span>';
    },
    resultExtra: function (v, L, c, ui) {
      var fh = fieldsHtml(v, L, ui);
      var mv = (L.from != null && L.to != null && L.to !== L.from) ? '<br><span class="muted">Felt ' + L.from + ' → <b>' + L.to + '</b></span>' : '';
      var win = (v.winner && v.winner === c.pid) ? '<br>🌅 <b>Du er i mål!</b>' : '';
      var again = L.again && !v.winner ? '<br>🎲 <b>Du får kaste en gang til!</b>' : '';
      return { ok: mv + win + again, bad: '<br><span class="muted">Brikken blir stående på felt ' + (L.from != null ? L.from : '') + '.</span>', after: L.ok ? fh : '' };
    },
    noneExtra: function (v, L, c, ui) { return fieldsHtml(v, { fields: [{ kind: 'well' }] }, ui); },
    playerStat: function (x) { return '<b>felt ' + x.pos + '</b>' + (x.well ? ' ⛲' : '') + (x.skip ? ' 💤' + x.skip : ''); },
    endCols: [],
    summaryExtra: function () { return 'Mål: <b>felt 63</b>'; },
    lobbyNote: function (v) { return 'Fra 1 til 6 spillere. Hver spiller får sin farge.'; }
  });
})();
