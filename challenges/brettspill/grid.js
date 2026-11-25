/* Deutschwelt — felles 8 × 8-brett med brikker (Dame og Hopp-løp). DWGrid.make(opts) → brett-objekt for DWBoardUI.run({board}).
   opts: { dark(r,c), camp(r,c) → '' | '0' | '1' (tonet startområde), pieces(v) → [{id,s,r,c,k}] }
   Hendelser fra regelpakken: {k:'dmove', pid, to:{r,c}, cap?:pid, ai?} og {k:'dking', pid}. Trekkene i pick-listen har {id, pid, from:{r,c}, to:{r,c}} (eller {stop:true}). */
(function () {
  'use strict';
  var N = 8, LET = 'abcdefgh';
  function sq(r, c) { return LET.charAt(c) + (N - r); }
  function px(c) { return ((c + .5) / N * 100) + '%'; }
  function make(opts) {
    var disp = null, sel = null, lastTid = -1;
    function clonePcs(v) { return (opts.pieces(v) || []).map(function (p) { return { id: p.id, s: p.s, r: p.r, c: p.c, k: p.k ? 1 : 0 }; }); }
    var board = {
      build: function (ui) {
        var h = '';
        for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
          var dk = opts.dark(r, c), cm = dk && opts.camp ? opts.camp(r, c) : '';
          h += '<div class="wc ' + (dk ? 'dk' : 'lt') + (cm ? ' camp' + cm : '') + '" style="grid-column:' + (c + 1) + ';grid-row:' + (r + 1) + '">' + (c === 0 ? '<i class="co l">' + (N - r) + '</i>' : '') + (r === N - 1 ? '<i class="co b">' + LET.charAt(c) + '</i>' : '') + '</div>';
        }
        ui.$('#bd').innerHTML = '<div class="wcells">' + h + '</div><div class="btoks" id="toks"></div>';
        disp = null; sel = null;
      },
      setDisp: function (v) { if (v.x) disp = clonePcs(v); },
      render: function (v, ui, ctx) {
        var toks = ui.$('#toks'); if (!toks || !v.x) return; if (!disp) board.setDisp(v);
        var pick = (ctx.pick || []).filter(function (m) { return m.to; }), alive = {};
        if (v.cur && v.cur.tid !== lastTid) { lastTid = v.cur.tid; sel = null; }
        if (v.stage !== 'pick') sel = null;
        var movers = {}; pick.forEach(function (m) { movers[m.pid] = 1; });
        var mk = Object.keys(movers);
        if (sel == null && mk.length === 1) sel = parseInt(mk[0], 10);
        if (sel != null && !movers[sel]) sel = null;
        ui.$$('.btgt', toks).forEach(function (t) { t.remove(); });
        disp.forEach(function (p) {
          var key = 'p' + p.id, el = toks.querySelector('.btok[data-k="' + key + '"]');
          if (!el) { el = document.createElement('div'); el.className = 'btok'; el.setAttribute('data-k', key); toks.appendChild(el); }
          var html = p.k ? '<span class="crown">♛</span>' : ''; if (el._h !== html) { el.innerHTML = html; el._h = html; }
          el.style.left = px(p.c); el.style.top = px(p.r);
          var can = !!movers[p.id], slow = el.classList.contains('slow');
          el.className = 'btok dp' + p.s + (p.k ? ' king' : '') + (can ? ' pick' : '') + (sel === p.id ? ' sel' : '') + (slow ? ' slow' : '');
          el.title = (p.k ? 'Dame ' : 'Brikke ') + sq(p.r, p.c);
          if (can && !el._h2) { el._h2 = 1; el.addEventListener('click', function () { if (el.classList.contains('pick')) { sel = p.id; ui.render(); } }); }
          alive[key] = 1;
        });
        ui.$$('.btok', toks).forEach(function (el) { if (!alive[el.getAttribute('data-k')]) el.remove(); });
        pick.forEach(function (m) {
          if (m.pid !== sel) return;
          var t = document.createElement('div'); t.className = 'btgt'; t.style.left = px(m.to.c); t.style.top = px(m.to.r);
          t.title = 'Flytt til ' + sq(m.to.r, m.to.c) + (m.cap ? ' (slår)' : ''); t.addEventListener('click', function () { ui.act('pick', m.id); }); toks.appendChild(t);
        });
      },
      event: async function (e, s, ui) {
        if (!disp) return;
        var p = null; disp.forEach(function (x) { if (x.id === e.pid) p = x; });
        if (e.k === 'dmove' && p) {
          if (e.ai) await ui.sleep(350);
          var el = ui.$('.btok[data-k="p' + p.id + '"]'); if (el) el.classList.add('slow');
          p.r = e.to.r; p.c = e.to.c; board.render(s, ui, { cp: ui.curP(s), pick: [] }); ui.Snd.tick(); await ui.sleep(520);
          if (e.cap != null) {
            var ce = ui.$('.btok[data-k="p' + e.cap + '"]'); if (ce) { ce.style.opacity = 0; ce.style.transform = 'scale(.4)'; ui.Snd.down(); }
            await ui.sleep(260); disp = disp.filter(function (x) { return x.id !== e.cap; }); board.render(s, ui, { cp: ui.curP(s), pick: [] });
          }
          if (el) el.classList.remove('slow');
        } else if (e.k === 'dking' && p) { p.k = 1; board.render(s, ui, { cp: ui.curP(s), pick: [] }); ui.Snd.special(); await ui.sleep(700); }
      }
    };
    return board;
  }
  window.DWGrid = { make: make, sq: sq };
})();
