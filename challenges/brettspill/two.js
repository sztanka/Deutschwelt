/* Deutschwelt — felles regelmal for brettspill med to sider (Dame, Mølle, Hopp-løp): lag mot lag, eller spillerne mot datamaskinen.
   DWTwo.make(def) → regelpakke (R) for ./core.js.  Hver spill leverer bare «def»:
     id, sideNames:['Hvit','Svart'], sideIcons:['⚪','⚫'], defaults() (valgfritt), setExtra(t,s) (valgfritt)
     init(settings, rnd) → tilstand (ren JSON)
     steps(st, side)      → liste over lovlige neste skritt [{id,…}] (unike id-er). Midt i et flertrinns-trekk (kjedehopp, fjerne stein) ligger info i st.chain.
     step(st, side, mv, rnd) → {events:[…], done:boolean}   (muterer st; done=true når turen er ferdig)
     over(st, side, X)    → null | {win: sideNr | -1 (uavgjort), note}   (kalles når «side» har fullført en tur; X.steps = antall skritt)
     ai(st, side, level, rnd) → liste av skritt (hele turen) for datamaskinen
   Innstillinger: opp:'ai'|'player', aiLevel:1–3, sides:{spillerId:0|1}.
   Svarer en spiller feil, mister laget turen (og datamaskinen flytter likevel). Hvert trekk «kjøpes» med ett riktig svar. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DWTwo = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function usable(q) { return q && !q.gone && (q.conn || q.local); }
  function idxOf(G, pid) { for (var i = 0; i < G.players.length; i++) if (G.players[i].id === pid) return i; return -1; }

  function make(def) {
    var SN = def.sideNames || ['Hvit', 'Svart'];
    function defSide(settings, p, idx) { var v = settings.sides && settings.sides[p.id]; return v === 0 || v === 1 ? v : idx % 2; }
    function sideOf(H, p) {
      var G = H.G; if (G.settings.opp !== 'player') return 0;
      if (G.X && G.X.sides && G.X.sides[p.id] != null) return G.X.sides[p.id];
      return defSide(G.settings, p, idxOf(G, p.id));
    }
    function membersOf(H, side) { return H.G.players.map(function (p, i) { return { p: p, i: i }; }).filter(function (o) { return sideOf(H, o.p) === side; }); }

    /* datamaskinens tur */
    function aiPlay(H, evs) {
      var X = H.G.X, st = X.st, list = def.ai(st, 1, H.G.settings.aiLevel, H.rnd) || [];
      list.forEach(function (mv) { var r = def.step(st, 1, mv, H.rnd); X.steps++; (r.events || []).forEach(function (e) { e.ai = true; evs.push(e); }); });
      return list.length > 0;
    }
    function conclude(H, p, res, evs) {
      var G = H.G, X = G.X, ai = G.settings.opp === 'ai';
      X.result = res;
      if (res.win === -1) { H.stop(); return; }
      var members = membersOf(H, res.win);
      if (ai && res.win === 1) { G.winner = 'ai'; evs.push({ k: 'lose' }); return; }
      members.forEach(function (o) { o.p.finished = true; });
      var rep = (p && sideOf(H, p) === res.win) ? p : (members[0] && members[0].p);
      if (rep) { G.winner = rep.id; evs.push({ k: 'win', pid: rep.id }); } else H.stop();
    }
    function finishTurn(H, p, evs, extra) {
      var G = H.G, X = G.X, side = sideOf(H, p), ai = G.settings.opp === 'ai', st = X.st, res = def.over(st, side, X), played = false;
      if (!res) {
        var other = 1 - side;
        if (ai) {
          if (!def.steps(st, 1).length) res = { win: 0, note: 'Datamaskinen kan ikke flytte.' };
          else { played = aiPlay(H, evs); res = def.over(st, 1, X); if (!res && !def.steps(st, 0).length) res = { win: 1, note: 'Dere kan ikke flytte.' }; }
          X.turnSide = 0;
        } else {
          if (!def.steps(st, other).length) res = { win: side, note: SN[other] + ' kan ikke flytte.' };
          X.turnSide = other;
        }
      }
      if (res) conclude(H, p, res, evs);
      var out = { events: evs, last: { aiMoved: played }, ms: played ? 900 : 0 };
      if (extra) Object.assign(out.last, extra);
      return out;
    }
    /* utfør skrittet mv (eller start ved null) til et valg trengs eller turen er ferdig */
    function run(H, p, mv, evs) {
      var G = H.G, X = G.X, st = X.st, side = sideOf(H, p);
      for (var guard = 0; guard < 80; guard++) {
        if (mv) {
          var r = def.step(st, side, mv, H.rnd); X.steps++; (r.events || []).forEach(function (e) { evs.push(e); }); mv = null;
          if (r.done) return finishTurn(H, p, evs);
        }
        var moves = def.steps(st, side);
        if (!moves.length) return finishTurn(H, p, evs);
        if (moves.length === 1) { mv = moves[0]; continue; }
        return { events: evs, pick: moves };
      }
      return finishTurn(H, p, evs);
    }

    var R = {
      id: def.id, maxPlayers: def.maxPlayers || 8,
      minPlayers: function (st) { return st.opp === 'player' ? 2 : 1; },
      defaults: function () { return Object.assign({ opp: 'ai', aiLevel: 2, sides: {} }, def.defaults ? def.defaults() : {}); },
      setExtra: function (t, s) {
        if (s.opp === 'ai' || s.opp === 'player') t.opp = s.opp;
        if (s.aiLevel != null) t.aiLevel = Math.max(1, Math.min(3, parseInt(s.aiLevel, 10) || 2));
        if (s.sideOf && s.sideOf.pid) { t.sides = Object.assign({}, t.sides); t.sides[s.sideOf.pid] = s.sideOf.side === 1 ? 1 : 0; }
        if (def.setExtra) def.setExtra(t, s);
      },
      check: function (H) {
        var G = H.G; if (G.settings.opp !== 'player') return '';
        var c = [0, 0]; G.players.forEach(function (p, i) { c[defSide(G.settings, p, i)]++; });
        if (!c[0] || !c[1]) return 'Begge lagene trenger minst én spiller – bruk knappene ⚪/⚫ ved navnene.';
        return '';
      },
      initPlayer: function (p) { },
      start: function (H) {
        var G = H.G, sides = {};
        G.players.forEach(function (p, i) { sides[p.id] = G.settings.opp === 'player' ? defSide(G.settings, p, i) : 0; });
        G.X = { st: def.init(G.settings, H.rnd), sides: sides, turnSide: 0, rot: [-1, -1], result: null, steps: 0 };
        H.log(G.settings.opp === 'ai' ? '🤖 Datamaskinen spiller mot dere. Svar riktig for å flytte!' : SN[0] + ' mot ' + SN[1] + ' – svar riktig for å flytte!', 'sys');
      },
      firstTurn: function (H) { var m = membersOf(H, 0); H.G.X.rot[0] = m.length ? m[0].i : 0; return m.length ? m[0].i : 0; },
      next: function (H) {
        var G = H.G, X = G.X; if (!X) return null;
        var side = G.settings.opp === 'player' ? X.turnSide : 0, m = membersOf(H, side); if (!m.length) return null;
        var last = X.rot[side], n = m.length, k, start = 0;
        for (k = 0; k < n; k++) if (m[k].i === last) { start = k + 1; break; }
        for (k = 0; k < n; k++) { var o = m[(start + k) % n]; if (usable(o.p)) { X.rot[side] = o.i; return o.i; } }
        return null;
      },
      pubPlayer: function (p, H) { var G = H.G; return { side: G.X ? sideOf(H, p) : null }; },
      view: function (H) { var X = H.G.X; return X ? { st: X.st, sides: X.sides, turnSide: X.turnSide, result: X.result, steps: X.steps } : null; },
      begin: function (H, p) {
        var X = H.G.X, side = sideOf(H, p), mv = def.steps(X.st, side);
        if (!mv.length) { var evs = []; conclude(H, p, { win: 1 - side, note: 'Ingen lovlige trekk.' }, evs); return { none: true, msg: 'Ingen lovlige trekk.', events: evs }; }
        return { info: { side: side }, events: [] };
      },
      onCorrect: function (H, p, c) { return run(H, p, null, []); },
      pick: function (H, p, c, mv) { return run(H, p, mv, []); },
      onWrong: function (H, p, c) {
        var G = H.G, X = G.X, side = sideOf(H, p), evs = [], played = false, res = null;
        if (G.settings.opp === 'ai') {
          if (!def.steps(X.st, 1).length) res = { win: 0, note: 'Datamaskinen kan ikke flytte.' };
          else { played = aiPlay(H, evs); res = def.over(X.st, 1, X); if (!res && !def.steps(X.st, 0).length) res = { win: 1, note: 'Dere kan ikke flytte.' }; }
          X.turnSide = 0;
        } else X.turnSide = 1 - side;
        if (res) conclude(H, p, res, evs);
        return { events: evs, last: { passed: true, aiMoved: played }, ms: played ? 900 : 0 };
      },
      autoPick: function (H, cur) { return cur.moves[Math.floor(H.rnd() * cur.moves.length)]; },
      rank: function (H) {
        return H.G.players.slice().sort(function (a, b) { if (!!a.finished !== !!b.finished) return a.finished ? -1 : 1; return b.right - a.right || a.wrong - b.wrong; });
      },
      score: function (H, p) {
        var G = H.G, ai = G.settings.opp === 'ai', side = sideOf(H, p);
        return (ai ? 'laget' : (def.sideIcons ? def.sideIcons[side] + ' ' : '') + SN[side].toLowerCase()) + (p.finished ? ' · vant' : '');
      },
      endNote: function (H, why) {
        var G = H.G, r = G.X && G.X.result, ai = G.settings.opp === 'ai';
        if (r) {
          if (r.win === -1) return '🤝 Uavgjort' + (r.note ? ' – ' + r.note : '');
          return (ai ? (r.win === 0 ? '🎉 Dere vant mot datamaskinen!' : '🤖 Datamaskinen vant.') : '🏆 ' + SN[r.win] + ' vant!') + (r.note ? ' ' + r.note : '');
        }
        if (why === 'time' && def.timeNote) return def.timeNote(G.X.st, ai);
        return '';
      }
    };
    return R;
  }

  /* ---------- hjelpere for brukergrensesnittet (kun i nettleser) ---------- */
  function uiParts(def) {
    var SN = def.sideNames || ['Hvit', 'Svart'], SI = def.sideIcons || ['⚪', '⚫'];
    function sideOfPub(v, p) { if (v.settings.opp !== 'player') return 0; if (p.side != null) return p.side; var s = v.settings.sides && v.settings.sides[p.id]; return s === 0 || s === 1 ? s : v.players.indexOf(p) % 2; }
    return {
      sideOfPub: sideOfPub,
      extra: [
        { key: 'opp', label: 'Hvem spiller mot hvem?', type: 'seg', opts: [['ai', 'Alle mot datamaskinen'], ['player', 'Lag mot lag']], note: 'Ved «lag mot lag» deler du spillerne i to lag med knappene ' + SI[0] + '/' + SI[1] + ' ved navnene. Lagene spiller om å flytte, og alle må svare riktig for å få flytte.' },
        { key: 'aiLevel', label: 'Hvor smart er datamaskinen?', type: 'seg', opts: [['1', 'Snill'], ['2', 'Vanlig'], ['3', 'Lur']], show: function (st) { return st.opp === 'ai'; } }
      ],
      lobbyRow: function (li, p, v, host, ui) {
        if (v.settings.opp !== 'player') return;
        var s = sideOfPub(v, p), b = document.createElement('button'); b.type = 'button'; b.className = 'chip on'; b.textContent = SI[s] + ' ' + SN[s]; b.title = host ? 'Bytt lag' : '';
        if (host) b.addEventListener('click', function () { ui.S.engine.setSettings({ sideOf: { pid: p.id, side: 1 - s } }); ui.S.push(); }); else b.disabled = true;
        li.appendChild(b);
      },
      lobbyNote: function (v) { return v.settings.opp === 'player' ? 'Lag mot lag: del spillerne i ' + SN[0].toLowerCase() + ' og ' + SN[1].toLowerCase() + ' (minst én på hvert lag).' : 'Alle spillerne er ett lag mot datamaskinen. Svar riktig for å flytte!'; },
      turnTag: function (v, p) { return v.settings.opp === 'player' ? SN[sideOfPub(v, p)].toLowerCase() : SN[0].toLowerCase(); },
      role: function (v, mine, ui, host) {
        if (host) return mine.length ? 'Vert · ' + mine.map(function (x) { return x.icon; }).join(' ') : 'Vert (lærervisning)';
        var m = mine[0]; if (!m) return '';
        return 'Du er ' + m.icon + ' ' + m.name + (v.settings.opp === 'player' ? ' – ' + SI[sideOfPub(v, m)] + ' ' + SN[sideOfPub(v, m)].toLowerCase() : '');
      },
      playerStat: function (x, v) { return v.settings.opp === 'player' ? SI[sideOfPub(v, x)] : ''; },
      summaryExtra: function (s) { return s.opp === 'ai' ? 'Motstander: <b>datamaskinen (' + ['snill', 'vanlig', 'lur'][s.aiLevel - 1] + ')</b>' : 'Lag mot lag'; },
      endTitle: function (v, sm, win) { return sm.note || (sm.why === 'time' ? '⏱ Tiden er ute' : '🏁 Spillet er avsluttet'); },
      resultLine: function (v) {
        var r = v.x && v.x.result; if (!r) return '';
        if (r.win === -1) return '<br>🤝 <b>Uavgjort</b>' + (r.note ? ' – ' + r.note : '');
        return '<br>' + (v.settings.opp === 'ai' ? (r.win === 0 ? '🎉 <b>Dere vant mot datamaskinen!</b>' : '🤖 <b>Datamaskinen vant.</b>') : '🏆 <b>' + SI[r.win] + ' ' + SN[r.win] + ' vant!</b>') + (r.note ? ' <span class="muted">' + r.note + '</span>' : '');
      },
      SN: SN, SI: SI
    };
  }
  return { make: make, uiParts: uiParts };
});
