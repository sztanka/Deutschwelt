/* Deutschwelt — felles brukergrensesnitt for brettspill med tyskoppgaver (rom, lobby, oppgavekort, resultater)
   Brukes av Gåsespillet, Hesteveddeløpet og Ulv og sauer:  DWBoardUI.run(cfg)  – cfg beskriver spillet (regelpakke, brett, tekster).
   Avhenger av: core.js (DWBoard), ../aergere-dich-nicht/engine.js (DWLudo), ../stigespill/engine.js (DWStige), ../stigespill/net.js (DWNet), ../../assets/peerjs.min.js (Peer), dwVerben.
   Verten kjører spillmotoren og sender «snapshots» til alle; gjester sender bare {t:'go',v}, {t:'answer',text} og {t:'pick',id}.
   Alle (også verten) viser tilstanden gjennom samme kø: onState → play (animasjon av hendelser) → render.

   cfg: { rules, key, title, maxPlayers, die:bool, extra:[{key,label,type:'seg'|'chip',opts:[[verdi,tekst]],show(st)}],
          board:{build(ui), setDisp(v), render(v,ui,x), event(e,s,ui) → Promise, hide()}, goHtml(v,p,control,ui) → {html,bind(root)},
          meta(v,c,p,ui), pickText(v,p,m,ui), resultExtra(v,L,c,ui), playerStat(x,v), role(v,mine,ui), endCols:[{h,f(r)}], endTitle(v,sm), summaryExtra(st), lobbyRow(li,p,v,host,ui), lobbyNote(v) } */
(function () {
  'use strict';
  var B = window.DWBoard, N = window.DWNet, V = window.dwVerben || [];
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var PRON = B.PRON, COLORS = B.COLORS;
  var KIND_LABEL = { oversett: 'Oversettelse', artikkel: 'Artikkel', pronomen: 'Pronomen', verb: 'Verb' };
  var TASK_CHIP = { oversett: '🌍 Oversettelse', artikkel: '📘 Artikler (der/die/das)', pronomen: '👤 Pronomen og eiendomsord', verb: '🔧 Verbbøying' };
  var THEME_LABEL = { n: 'Mat, dyr og natur', s: 'Skole, hverdag og reise', g: 'Allmenne ord (verb, adjektiv …)', o: 'Byer, land og geografi' };
  var SET_LABEL = { svake: 'Svake verb', sterke: 'Sterke verb', modal: 'Modalverb', hjelp: 'sein / haben / werden / wissen', trennbare: 'Trennbare verb', refleksive: 'Refleksive verb' };
  var TENSE_LABEL = { praesens: 'Presens', praeteritum: 'Präteritum', perfekt: 'Perfekt' };

  function run(cfg) {
    var KEY_H = 'dw-' + cfg.key + '-host', KEY_G = 'dw-' + cfg.key + '-guest', KEY_SND = 'dw-' + cfg.key + '-snd', KEY_NAME = 'dw-board-name';
    var S = {
      mode: null, engine: null, host: null, guest: null, code: '', myPid: null, view: null, lastSeq: 0, q: [], busy: false,
      conn2pid: {}, pid2conn: {}, seen: {}, tickT: null, hbT: null, timerT: null, clockT: null, endAt: 0, promptKey: '', boardBuilt: false, dieVal: 0,
      guestSession: null, joined: false, sound: true, status: 'ok', icon: '', alIcon: '', screen: 'home'
    };
    try { S.sound = localStorage.getItem(KEY_SND) !== '0'; } catch (e) { }
    var ui = { S: S, esc: esc, sleep: sleep, $: $, $$: $$, COLORS: COLORS, PRON: PRON };

    /* ---------- små hjelpere ---------- */
    function toast(msg, ms) { var t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, ms || 2600); }
    function findP(v, id) { for (var i = 0; i < v.players.length; i++) if (v.players[i].id === id) return v.players[i]; return null; }
    function iControl(v, pid) { var p = findP(v, pid); if (!p) return false; return S.mode === 'host' ? !!p.local : pid === S.myPid; }
    function curP(v) { return v && v.players[v.turn] || null; }
    function pcolor(p, idx) { if (cfg.pcolor) return cfg.pcolor(p, idx); var s = p && p.seat != null && p.seat >= 0 ? p.seat : (idx || 0); return COLORS[s % COLORS.length].col; }
    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
    function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { } }
    function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
    function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } }
    function ssDel(k) { try { sessionStorage.removeItem(k); } catch (e) { } }
    ui.toast = toast; ui.findP = findP; ui.iControl = iControl; ui.curP = curP; ui.pcolor = pcolor;

    /* ---------- lyd ---------- */
    var Snd = {
      ctx: null,
      init: function () { if (!this.ctx) { var C = window.AudioContext || window.webkitAudioContext; if (C) { try { this.ctx = new C(); } catch (e) { } } } if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
      tone: function (f, d, type, vol, when, f2) {
        if (!S.sound || !this.ctx) return; var c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime + (when || 0);
        o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
        g.gain.setValueAtTime(vol || .1, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .02);
      },
      tick: function () { this.tone(560, .05, 'square', .035); },
      roll: function () { for (var i = 0; i < 9; i++) this.tone(180 + Math.random() * 380, .05, 'square', .03, i * .075); },
      ok: function () { var s = this; [523, 659, 784, 1047].forEach(function (f, i) { s.tone(f, .16, 'triangle', .11, i * .09); }); },
      bad: function () { this.tone(220, .4, 'sawtooth', .08, 0, 110); },
      up: function () { this.tone(400, .3, 'triangle', .1, 0, 900); },
      down: function () { this.tone(700, .35, 'sawtooth', .08, 0, 180); },
      special: function () { this.tone(660, .1, 'sine', .1); this.tone(880, .1, 'sine', .1, .1); this.tone(1100, .16, 'sine', .1, .2); },
      turn: function () { this.tone(880, .09, 'sine', .1); this.tone(1175, .14, 'sine', .1, .1); },
      win: function () { var s = this; [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { s.tone(f, .22, 'triangle', .12, i * .13); }); }
    };
    ui.Snd = Snd;
    document.addEventListener('click', function () { Snd.init(); }, true);
    document.addEventListener('keydown', function () { Snd.init(); }, true);

    /* ---------- skjermer ---------- */
    function show(name) {
      ['home', 'lobby', 'game', 'end'].forEach(function (n) { $('#scr-' + n).hidden = (n !== name); });
      $('#hdr').hidden = (name !== 'home');
      document.body.classList.toggle('in-game', name === 'game' || name === 'end');
      S.screen = name; window.scrollTo(0, 0);
    }
    function setStatus(st) {
      S.status = st;
      var txt = st === 'ok' ? '● Tilkoblet' : st === 'connecting' ? '… Kobler til' : '● Mistet kontakt – prøver igjen';
      ['#l-status', '#g-status'].forEach(function (id) { var e = $(id); if (e) { e.textContent = txt; e.className = 'pill ' + (st === 'ok' ? 'ok' : st === 'down' ? 'down' : ''); } });
    }
    function iconPicker(host, getTaken, onPick, initial) {
      host.innerHTML = '';
      B.ICONS.forEach(function (ic) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'ico'; b.textContent = ic; b.setAttribute('aria-label', 'Figur ' + ic);
        b.addEventListener('click', function () { if (b.disabled) return; onPick(ic); host._cur = ic; mark(); });
        host.appendChild(b);
      });
      function mark(cur) { var t = getTaken(); $$('.ico', host).forEach(function (b) { b.disabled = t.indexOf(b.textContent) >= 0; b.classList.toggle('on', b.textContent === (cur || host._cur)); }); }
      host._mark = function (c) { host._cur = c; mark(c); };
      host._mark(initial);
    }

    /* =====================================================================
       HJEM
       ===================================================================== */
    function initHome() {
      var noPeer = (typeof window.Peer === 'undefined');
      if (noPeer) $('#h-nopeer').hidden = false;
      $('#j-name').value = lsGet(KEY_NAME) || '';
      S.icon = B.ICONS[Math.floor(Math.random() * B.ICONS.length)];
      iconPicker($('#j-icons'), function () { return []; }, function (ic) { S.icon = ic; }, S.icon);
      var m = /[?&]kode=([A-Za-z0-9]+)/.exec(location.search);
      if (m) { $('#j-code').value = N.cleanCode(m[1]); setTimeout(function () { $('#j-name').focus(); }, 50); }
      $('#j-code').addEventListener('input', function () { this.value = N.cleanCode(this.value); });
      $('#h-create').addEventListener('click', function () { if (noPeer) return; startHost(null); });
      $('#j-go').addEventListener('click', function () { if (noPeer) return; joinFromForm(); });
      $('#j-name').addEventListener('keydown', function (e) { if (e.key === 'Enter') joinFromForm(); });
      $('#j-code').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#j-name').focus(); });
      var saved = lsGet(KEY_H);
      if (saved) {
        try {
          var o = JSON.parse(saved);
          if (o && o.code && o.data && Date.now() - o.ts < 8 * 3600 * 1000) {
            var g = JSON.parse(o.data).G, n = g.players ? g.players.length : 0, box = $('#resume-host');
            box.innerHTML = '<div class="tip blue"><b>Du har et rom som ikke er avsluttet</b> (kode <b>' + esc(o.code) + '</b>, ' + n + ' spiller' + (n === 1 ? '' : 'e') + ').<br><button class="btn sm prim" id="rh-go" style="margin-top:6px">Fortsett rommet</button> <button class="btn sm" id="rh-del" style="margin-top:6px">Slett</button></div>';
            $('#rh-go').addEventListener('click', function () { if (noPeer) return; startHost(o); });
            $('#rh-del').addEventListener('click', function () { lsDel(KEY_H); box.innerHTML = ''; });
          } else lsDel(KEY_H);
        } catch (e) { lsDel(KEY_H); }
      }
      var gs = ssGet(KEY_G);
      if (gs && !noPeer) { try { var s = JSON.parse(gs); if (s && s.code && s.token) { S.guestSession = s; startGuest(s.code, s.name, s.icon, s.token, true); } } catch (e) { ssDel(KEY_G); } }
    }

    /* =====================================================================
       VERT
       ===================================================================== */
    function startHost(resume) {
      S.mode = 'host';
      S.engine = resume ? B.restore(V, cfg.rules, resume.data) : B.createGame(V, cfg.rules, {});
      S.host = new N.Host({
        onReady: function (code) {
          S.code = code; S.engine.G.code = code; setStatus('ok');
          if (!resume) S.engine.G.players.length = 0;
          hostPush(true); startHostLoops();
        },
        onError: function (msg) { toast(msg, 5000); backHome(); },
        onStatus: function (st) { setStatus(st === 'ok' ? 'ok' : 'down'); },
        onJoin: function () { },
        onData: hostData,
        onClose: function (id) { var pid = S.conn2pid[id]; delete S.conn2pid[id]; if (pid) { delete S.pid2conn[pid]; S.engine.setConn(pid, false); hostPush(); } }
      });
      S.host.start(resume ? resume.code : null);
      setStatus('connecting');
      show('lobby'); $('#l-code').textContent = resume ? resume.code : '----';
    }
    function startHostLoops() {
      clearInterval(S.tickT); clearInterval(S.hbT);
      S.tickT = setInterval(function () {
        var now = Date.now(), ch = false;
        for (var id in S.seen) { if (now - S.seen[id] > 22000 && S.conn2pid[id]) { S.engine.setConn(S.conn2pid[id], false); ch = true; delete S.seen[id]; } }
        if (S.engine.tick(now)) ch = true;
        if (ch) hostPush();
      }, 300);
      S.hbT = setInterval(function () { S.host.broadcast({ t: 'hb', seq: S.engine.G.seq }); }, 5000);
    }
    function hostPush() {
      var e = S.engine, snap = e.snapshot(Date.now());
      S.host.broadcast({ t: 'state', s: snap });
      onState(snap); e.clearEvents();
      try { lsSet(KEY_H, JSON.stringify({ code: S.code, ts: Date.now(), data: e.serialize() })); } catch (x) { }
    }
    function hostData(connId, m) {
      if (!m || typeof m !== 'object') return;
      S.seen[connId] = Date.now();
      var e = S.engine, pid = S.conn2pid[connId];
      switch (m.t) {
        case 'join': {
          var tok = String(m.token || '').slice(0, 40), r, existing = tok ? e.rejoin(tok) : null;
          if (existing) {
            pid = existing; var old = S.pid2conn[pid]; if (old && old !== connId) delete S.conn2pid[old];
            S.conn2pid[connId] = pid; S.pid2conn[pid] = connId;
            var pp = e.G.players.filter(function (p) { return p.id === pid; })[0];
            S.host.send(connId, { t: 'welcome', pid: pid, token: tok, name: pp.name, icon: pp.icon });
          } else {
            r = e.addPlayer({ name: m.name, icon: m.icon, token: tok || undefined });
            if (!r.ok) { S.host.send(connId, { t: 'err', msg: r.msg }); return; }
            S.conn2pid[connId] = r.pid; S.pid2conn[r.pid] = connId;
            S.host.send(connId, { t: 'welcome', pid: r.pid, token: r.token, name: r.name, icon: r.icon });
          }
          hostPush(); break;
        }
        case 'go': if (pid && e.go(pid, m.v == null ? undefined : String(m.v).slice(0, 20), Date.now()).ok) hostPush(); break;
        case 'answer': if (pid && e.answer(pid, String(m.text || '').slice(0, 60), Date.now()).ok) hostPush(); break;
        case 'pick': if (pid && e.pick(pid, parseInt(m.id, 10), Date.now()).ok) hostPush(); break;
        case 'leave': if (pid) { e.removePlayer(pid); delete S.conn2pid[connId]; delete S.pid2conn[pid]; hostPush(); } break;
        case 'sync': { var sn = e.snapshot(Date.now()); sn.events = []; S.host.send(connId, { t: 'state', s: sn }); break; }
        case 'ping': S.host.send(connId, { t: 'pong' }); break;
      }
    }
    function hostAction(type, arg) {
      var e = S.engine, p = e.G.players[e.G.turn];
      if (!p || !p.local) return;
      var r = type === 'go' ? e.go(p.id, arg, Date.now()) : type === 'pick' ? e.pick(p.id, arg, Date.now()) : e.answer(p.id, arg, Date.now());
      if (r.ok) hostPush();
    }

    /* =====================================================================
       GJEST
       ===================================================================== */
    function joinFromForm() {
      var code = N.cleanCode($('#j-code').value), name = $('#j-name').value.trim(), err = $('#j-err'); err.textContent = '';
      if (code.length !== 4) { err.textContent = 'Skriv inn romkoden (fire tegn).'; return; }
      if (!name) { err.textContent = 'Skriv inn navnet ditt.'; return; }
      lsSet(KEY_NAME, name); startGuest(code, name, S.icon, null, false);
    }
    function startGuest(code, name, icon, token) {
      S.mode = 'guest'; S.code = code; S.joined = false;
      var err = $('#j-err'); err.style.color = 'var(--dw-muted)'; err.textContent = 'Kobler til rom ' + code + ' …';
      $('#j-go').disabled = true;
      var tok = token || ('g' + Math.random().toString(36).slice(2, 12));
      S.guestSession = { code: code, token: tok, name: name, icon: icon };
      S.guest = new N.Guest(code, {
        onOpen: function () { S.guest.send({ t: 'join', name: name, icon: icon, token: tok }); },
        onData: guestData, onClose: function () { },
        onStatus: function (st) { setStatus(st); },
        onError: function (msg) {
          if (!S.joined) { err.style.color = 'var(--dw-bad)'; err.textContent = msg; $('#j-go').disabled = false; if (S.guest) S.guest.close(); S.guest = null; ssDel(KEY_G); S.mode = null; if (S.screen !== 'home') backHome(); }
          else toast(msg, 3500);
        }
      });
      S.guest.start();
    }
    function guestData(m) {
      if (!m || typeof m !== 'object') return;
      switch (m.t) {
        case 'welcome': S.joined = true; S.myPid = m.pid; S.guestSession.token = m.token; S.guestSession.name = m.name; S.guestSession.icon = m.icon; ssSet(KEY_G, JSON.stringify(S.guestSession)); $('#j-go').disabled = false; $('#j-err').textContent = ''; setStatus('ok'); break;
        case 'state': onState(m.s); break;
        case 'hb': if (S.view && m.seq !== S.view.seq && S.q.length === 0 && !S.busy) S.guest.send({ t: 'sync' }); break;
        case 'err': toast(m.msg, 5000); if (!S.joined) { $('#j-err').style.color = 'var(--dw-bad)'; $('#j-err').textContent = m.msg; $('#j-go').disabled = false; if (S.guest) S.guest.close(); S.guest = null; S.mode = null; ssDel(KEY_G); } break;
        case 'kick': toast('Du ble fjernet fra rommet.', 4000); leave(true); break;
        case 'closed': toast('Læreren avsluttet rommet.', 4000); leave(true); break;
      }
    }
    function guestAction(type, arg) {
      if (!S.guest) return;
      var msg = type === 'go' ? { t: 'go', v: arg } : type === 'pick' ? { t: 'pick', id: arg } : { t: 'answer', text: arg };
      if (!S.guest.send(msg)) toast('Ingen kontakt med rommet akkurat nå …', 2500);
    }
    function act(type, arg) { if (S.mode === 'host') hostAction(type, arg); else guestAction(type, arg); }
    ui.act = act;

    function leave(silent) {
      if (S.mode === 'host') {
        if (!silent && !confirm('Avslutte rommet for alle?')) return;
        var hh = S.host; try { hh.broadcast({ t: 'closed' }); } catch (e) { }
        setTimeout(function () { try { hh.close(); } catch (e) { } }, 250); lsDel(KEY_H);
      } else if (S.guest) {
        try { S.guest.send({ t: 'leave' }); } catch (e) { }
        var g = S.guest; setTimeout(function () { g.close(); }, 200); ssDel(KEY_G);
      }
      backHome();
    }
    function backHome() {
      clearInterval(S.tickT); clearInterval(S.hbT); clearInterval(S.timerT); clearInterval(S.clockT); S.timerT = null; S.clockT = null;
      S.mode = null; S.engine = null; S.host = null; S.guest = null; S.view = null; S.lastSeq = 0; S.q = []; S.busy = false; S.conn2pid = {}; S.pid2conn = {}; S.joined = false; S.myPid = null; S.promptKey = ''; S.seen = {};
      S.boardBuilt = false;
      $('#j-go').disabled = false; show('home'); $('#resume-host').innerHTML = '';
    }

    /* =====================================================================
       TILSTAND → ANIMASJON → VISNING
       ===================================================================== */
    function onState(s) {
      if (!s) return;
      s._rx = performance.now();
      if (S.view && s.seq < S.lastSeq && s.phase === S.view.phase) return;
      if (s.seq === S.lastSeq && S.lastSeq > 0 && S.q.length === 0) { if (!S.busy) { S.view = s; renderAll(s); } return; }
      S.lastSeq = s.seq; S.q.push(s); pump();
    }
    function pump() {
      if (S.busy) return; S.busy = true;
      (function next() {
        var s = S.q.shift();
        if (!s) { S.busy = false; return; }
        play(s).then(next, function (e) { try { console.error(e); } catch (x) { } S.view = s; cfg.board.setDisp(s); renderAll(s); next(); });
      })();
    }
    async function play(s) {
      var prev = S.view, ph = s.phase, scr = ph === 'lobby' ? 'lobby' : ph === 'play' ? 'game' : 'end';
      if (S.screen !== scr) {
        if (scr === 'game') { buildBoardOnce(); cfg.board.setDisp(s); S.dieVal = 0; S.promptKey = ''; }
        show(scr);
      }
      var evs = (s.events || []);
      if (ph === 'play' && prev && prev.phase === 'play') {
        for (var i = 0; i < evs.length; i++) await playEvent(evs[i], s);
      } else if (ph === 'end') {
        if (evs.some(function (x) { return x.k === 'end'; }) && s.winner && findP(s, s.winner)) { Snd.win(); confetti(); }
      }
      S.view = s; cfg.board.setDisp(s); renderAll(s);
    }
    async function playEvent(e, s) {
      switch (e.k) {
        case 'roll': Snd.roll(); setDieRolling(true); await sleep(850); setDieRolling(false); setDie(e.die); await sleep(300); break;
        case 'result': if (e.ok) Snd.ok(); else Snd.bad(); await sleep(350); break;
        case 'win': if (findP(s, e.pid)) { Snd.win(); confetti(); await sleep(500); } break;
        case 'lose': Snd.down(); await sleep(400); break;
        case 'turn': case 'start': case 'end': break;
        default: if (cfg.board.event) await cfg.board.event(e, s, ui);
      }
    }
    function renderAll(v) {
      if (S.screen === 'lobby') renderLobby(v);
      else if (S.screen === 'game') renderGame(v);
      else if (S.screen === 'end') renderEnd(v);
      $('#g-code').textContent = v.code; $('#e-code').textContent = v.code; $('#l-code').textContent = v.code || '----';
    }
    function buildBoardOnce() { if (!S.boardBuilt) { cfg.board.build(ui); S.boardBuilt = true; } }
    ui.render = function () { if (S.view) cfg.board.render(S.view, ui, boardCtx(S.view)); };
    function boardCtx(v) {
      var cp = (v.phase === 'play' && v.stage !== 'idle') ? curP(v) : null;
      var control = !!(cp && iControl(v, cp.id));
      return { cp: cp, control: control, pick: (v.stage === 'pick' && control && v.cur) ? v.cur.moves : [], stage: v.stage };
    }

    /* =====================================================================
       LOBBY
       ===================================================================== */
    var lobbyBuilt = false;
    function chipList(sel, labels, key, minOne) {
      var box = $(sel);
      Object.keys(labels).forEach(function (k) { var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.setAttribute('data-k', k); b.innerHTML = esc(labels[k]) + ' <small></small>'; box.appendChild(b); });
      box.addEventListener('click', function (ev) {
        var b = ev.target.closest('.chip'); if (!b || !S.engine) return;
        var cur = S.engine.G.settings[key].slice(), k = b.getAttribute('data-k'), i = cur.indexOf(k);
        if (i >= 0) { if (cur.length === 1 && minOne) return; cur.splice(i, 1); } else cur.push(k);
        var o = {}; o[key] = cur; S.engine.setSettings(o); hostPush();
      });
    }
    function buildExtras() {
      var box = $('#s-extra'); if (!box) return;
      (cfg.extra || []).forEach(function (x) {
        var wrap = document.createElement('div'); wrap.setAttribute('data-x', x.key);
        if (x.type === 'chip') {
          wrap.innerHTML = '<label class="lab">' + esc(x.label) + '</label><div class="chips"><button class="chip" type="button" data-x-chip="' + x.key + '">' + esc(x.text) + '</button></div>';
          wrap.querySelector('button').addEventListener('click', function () { if (!S.engine) return; var o = {}; o[x.key] = !S.engine.G.settings[x.key]; S.engine.setSettings(o); hostPush(); });
        } else {
          wrap.innerHTML = '<label class="lab">' + esc(x.label) + '</label><div class="seg" data-x-seg="' + x.key + '">' + x.opts.map(function (o) { return '<button type="button" data-v="' + esc(o[0]) + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>' + (x.note ? '<div class="muted" style="margin-top:4px">' + x.note + '</div>' : '');
          wrap.querySelector('.seg').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b || !S.engine) return; var o = {}; o[x.key] = b.getAttribute('data-v'); S.engine.setSettings(o); hostPush(); });
        }
        box.appendChild(wrap);
      });
    }
    function buildLobbyOnce() {
      if (lobbyBuilt) return; lobbyBuilt = true;
      chipList('#s-tasks', TASK_CHIP, 'tasks', true);
      chipList('#s-themes', THEME_LABEL, 'themes', true);
      chipList('#s-sets', SET_LABEL, 'sets', true);
      chipList('#s-tenses', TENSE_LABEL, 'tenses', true);
      [['#s-level', 'level'], ['#s-dir', 'transDir'], ['#s-mode', 'answerMode'], ['#s-time', 'time'], ['#s-minutes', 'minutes']].forEach(function (x) {
        $(x[0]).addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b || !S.engine) return; var o = {}; o[x[1]] = b.getAttribute('data-v'); S.engine.setSettings(o); hostPush(); });
      });
      buildExtras();
      $('#s-help').addEventListener('click', function () { if (S.engine) { S.engine.setSettings({ help: !S.engine.G.settings.help }); hostPush(); } });
      $('#s-reqart').addEventListener('click', function () { if (S.engine) { S.engine.setSettings({ reqArt: !S.engine.G.settings.reqArt }); hostPush(); } });
      $('#b-start').addEventListener('click', function () { var r = S.engine.start(Date.now()); if (!r.ok) { $('#s-err').textContent = r.msg; return; } $('#s-err').textContent = ''; hostPush(); });
      $('#l-leave').addEventListener('click', function () { leave(false); });
      $('#l-copy').addEventListener('click', function () {
        var url = location.origin + location.pathname + '?kode=' + S.code;
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { toast('Lenken er kopiert'); }, function () { prompt('Kopier lenken:', url); });
        else prompt('Kopier lenken:', url);
      });
      $('#al-go').addEventListener('click', addLocal);
      $('#al-name').addEventListener('keydown', function (e) { if (e.key === 'Enter') addLocal(); });
      iconPicker($('#al-icons'), function () { return S.engine ? S.engine.G.players.map(function (p) { return p.icon; }) : []; }, function (ic) { S.alIcon = ic; }, '');
    }
    function addLocal() {
      var name = $('#al-name').value.trim(); if (!name) { $('#al-name').focus(); return; }
      var r = S.engine.addPlayer({ name: name, icon: S.alIcon, local: true, token: 'local-' + Math.random().toString(36).slice(2, 8) });
      if (!r.ok) { toast(r.msg); return; }
      $('#al-name').value = ''; S.alIcon = ''; hostPush(); $('#al-name').focus();
    }
    function setSummary(s) {
      var out = [];
      out.push('Oppgaver: <b>' + s.tasks.map(function (k) { return esc(KIND_LABEL[k]); }).join(', ') + '</b>');
      if (s.tasks.indexOf('oversett') >= 0 || s.tasks.indexOf('artikkel') >= 0) out.push('Temaer: <b>' + s.themes.map(function (k) { return esc(THEME_LABEL[k]); }).join(', ') + '</b>');
      if (s.tasks.indexOf('verb') >= 0) out.push('Verb: <b>' + s.sets.map(function (k) { return esc(SET_LABEL[k]); }).join(', ') + '</b> · Tider: <b>' + s.tenses.map(function (k) { return TENSE_LABEL[k]; }).join(', ') + '</b>');
      out.push('Nivå: <b>' + esc(s.level) + '</b>' + (cfg.summaryExtra ? ' · ' + cfg.summaryExtra(s) : ''));
      out.push('Svartid: <b>' + (s.time ? s.time + ' sekunder' : 'ingen grense') + '</b> · Spilletid: <b>' + (s.minutes ? s.minutes + ' minutter' : 'ingen grense') + '</b>');
      return '<p>' + out.join('<br>') + '</p>';
    }
    function renderLobby(v) {
      buildLobbyOnce();
      var host = S.mode === 'host', n = v.players.length, max = cfg.maxPlayers;
      $('#l-count').textContent = n;
      $('#settings-card').hidden = !host; $('#summary-card').hidden = host; $('#addlocal').hidden = !host || n >= max;
      $('#l-linkline').textContent = host ? 'Elevene går til denne siden (Deutschwelt → Challenges → ' + cfg.title + ') og velger «Jeg skal være med».' : 'Du er med i rommet.';
      $('#l-copy').hidden = !host;
      $('#l-colnote').innerHTML = cfg.lobbyNote ? cfg.lobbyNote(v) : 'Hver spiller får sin farge.';
      var ul = $('#plist'); ul.innerHTML = '';
      v.players.forEach(function (p, idx) {
        var li = document.createElement('li'); li.style.setProperty('--pc', pcolor(p, idx));
        var me = (host ? p.local : p.id === S.myPid);
        li.innerHTML = '<span class="pcol" title="' + esc(COLORS[idx % COLORS.length].name) + '"></span><span class="pi">' + p.icon + '</span><span class="pn">' + esc(p.name) + (me ? '<small>' + (host ? '(denne maskinen)' : '(deg)') + '</small>' : '') + '</span>' + (p.local ? '' : '<span class="dot ' + (p.conn ? 'on' : 'off') + '" title="' + (p.conn ? 'Tilkoblet' : 'Frakoblet') + '"></span>');
        if (cfg.lobbyRow) cfg.lobbyRow(li, p, v, host, ui);
        if (host) { var x = document.createElement('button'); x.className = 'xbtn'; x.type = 'button'; x.title = 'Fjern spiller'; x.textContent = '✕'; x.addEventListener('click', function () { var cid = S.pid2conn[p.id]; S.engine.removePlayer(p.id); if (cid) { S.host.kick(cid); delete S.conn2pid[cid]; delete S.pid2conn[p.id]; } hostPush(); }); li.appendChild(x); }
        ul.appendChild(li);
      });
      if (!n) ul.innerHTML = '<li class="muted" style="display:block">Ingen spillere ennå – elevene kan bli med med koden, eller du kan legge til spillere på denne maskinen.</li>';
      if (host) {
        var st = v.settings, pools = S.engine.pools();
        function on(sel, key) { $$(sel + ' .chip').forEach(function (b) { b.classList.toggle('on', st[key].indexOf(b.getAttribute('data-k')) >= 0); }); }
        function seg(sel, val) { $$(sel + ' button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === String(val)); }); }
        on('#s-tasks', 'tasks'); on('#s-themes', 'themes'); on('#s-sets', 'sets'); on('#s-tenses', 'tenses');
        seg('#s-level', st.level); seg('#s-dir', st.transDir); seg('#s-mode', st.answerMode); seg('#s-time', st.time); seg('#s-minutes', st.minutes);
        (cfg.extra || []).forEach(function (x) {
          var w = $('[data-x="' + x.key + '"]'); if (!w) return;
          w.hidden = x.show ? !x.show(st) : false;
          if (x.type === 'chip') $('[data-x-chip]', w).classList.toggle('on', !!st[x.key]); else seg('[data-x-seg="' + x.key + '"]', st[x.key]);
        });
        $('#s-help').classList.toggle('on', !!st.help); $('#s-reqart').classList.toggle('on', !!st.reqArt);
        var hasT = function (k) { return st.tasks.indexOf(k) >= 0; };
        $('#sub-words').hidden = !(hasT('oversett') || hasT('artikkel')); $('#sub-trans').hidden = !(hasT('oversett') || hasT('pronomen')); $('#s-reqart').hidden = !hasT('oversett'); $('#sub-verbs').hidden = !hasT('verb');
        $$('#s-themes .chip').forEach(function (b) { b.querySelector('small').textContent = '(' + S.engine.pools({ themes: [b.getAttribute('data-k')] }).words + ')'; });
        $$('#s-sets .chip').forEach(function (b) { b.querySelector('small').textContent = '(' + S.engine.pools({ sets: [b.getAttribute('data-k')] }).verbs + ')'; });
        $$('#s-tasks .chip small, #s-tenses .chip small').forEach(function (s) { s.remove(); });
        var bad = S.engine.check(), info = $('#s-pool'), parts = [];
        if (hasT('oversett') || hasT('artikkel')) parts.push('Ord: ' + pools.words + ' (substantiv: ' + pools.nouns + ')');
        if (hasT('verb')) parts.push('Verb: ' + pools.verbs);
        info.textContent = parts.join(' · ') + (bad ? (parts.length ? ' – ' : '') + bad : '');
        info.className = 'poolinfo' + (bad ? ' bad' : '');
        var minP = cfg.rules.minPlayers ? cfg.rules.minPlayers(st) : 1;
        $('#b-start').disabled = n < minP || !!bad;
        $('#s-err').textContent = (n && n < minP) ? 'Det trengs minst ' + minP + ' spillere med disse valgene.' : '';
        var ai = $('#al-icons'); if (ai._mark) ai._mark(S.alIcon);
      } else $('#s-summary').innerHTML = setSummary(v.settings);
    }

    /* =====================================================================
       SPILLSKJERM
       ===================================================================== */
    var PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
    function setDie(n) {
      S.dieVal = n; var d = $('#die'); if (!d) return; d.innerHTML = '';
      if (!n) { var q = document.createElement('i'); q.className = 'q'; q.textContent = '?'; d.appendChild(q); d.style.opacity = .5; return; }
      for (var i = 0; i < 9; i++) { var e = document.createElement('i'); if (PIPS[n].indexOf(i) >= 0) e.className = 'p'; d.appendChild(e); }
      d.style.opacity = 1;
    }
    var dieTimer = null;
    function setDieRolling(on) {
      var d = $('#die'); if (!d) return; clearInterval(dieTimer); d.classList.toggle('rolling', on);
      if (on) dieTimer = setInterval(function () { var n = 1 + Math.floor(Math.random() * 6); d.innerHTML = ''; for (var i = 0; i < 9; i++) { var e = document.createElement('i'); if (PIPS[n].indexOf(i) >= 0) e.className = 'p'; d.appendChild(e); } d.style.opacity = 1; }, 80);
    }
    ui.setDie = setDie;
    var gameBuilt = false;
    function buildGameOnce() {
      if (gameBuilt) return; gameBuilt = true;
      $('#c-turn').innerHTML = '<div class="turn" id="t-banner"></div><div style="margin-top:10px" id="t-body"></div>';
      $('#g-sound').addEventListener('click', function () { S.sound = !S.sound; lsSet(KEY_SND, S.sound ? '1' : '0'); $('#g-sound').textContent = S.sound ? '🔊' : '🔇'; Snd.init(); });
      $('#g-leave').addEventListener('click', function () { if (S.mode === 'host') leave(false); else if (confirm('Forlate spillet?')) leave(true); });
      $('#g-skip').addEventListener('click', function () { if (S.engine && S.engine.skip(Date.now())) hostPush(); });
      $('#g-end').addEventListener('click', function () { if (S.engine && confirm('Avslutte spillet og vise resultatet?')) { S.engine.endGame(); hostPush(); } });
      $('#e-leave').addEventListener('click', function () { if (S.mode === 'host') leave(false); else leave(true); });
      $('#e-again').addEventListener('click', function () { S.engine.toLobby(); S.boardBuilt = false; hostPush(); });
      $('#e-copy').addEventListener('click', copyResult);
      $('#e-print').addEventListener('click', function () { window.print(); });
      $('#g-sound').textContent = S.sound ? '🔊' : '🔇';
    }
    function ensureTimers() {
      if (!S.timerT) S.timerT = setInterval(updateTimer, 200);
      if (!S.clockT) S.clockT = setInterval(updateClock, 1000);
    }
    function updateTimer() {
      var bar = $('#tbar i'); if (!bar || !S.view || !S.view.cur || S.view.cur.remaining == null || S.view.stage !== 'answer') return;
      var total = (S.view.settings.time || 1) * 1000, left = Math.max(0, S.endAt - performance.now());
      bar.style.width = (left / total * 100) + '%'; bar.style.background = left < total * .25 ? 'var(--dw-bad)' : left < total * .5 ? 'var(--dw-accent)' : 'var(--dw-good)';
      var t = $('#tleft'); if (t) t.textContent = Math.ceil(left / 1000) + ' s';
    }
    function updateClock() {
      var v = S.view, box = $('#g-clock'); if (!box) return;
      if (!v || v.phase !== 'play' || v.clockMs == null) { box.hidden = true; return; }
      var left = Math.max(0, v.clockMs - (performance.now() - v._rx)), m = Math.floor(left / 60000), s = Math.floor(left / 1000) % 60;
      box.hidden = false; $('#g-clockv').textContent = left <= 0 ? 'siste tur' : m + ':' + (s < 10 ? '0' : '') + s; box.classList.toggle('low', left < 60000);
    }
    var lastTurnKey = '';
    function renderGame(v) {
      buildGameOnce(); ensureTimers(); buildBoardOnce();
      var host = S.mode === 'host', p = curP(v);
      $('#g-skip').hidden = !host; $('#g-end').hidden = !host;
      $('#g-leave').textContent = host ? 'Avslutt rommet' : 'Forlat';
      var mine = v.players.filter(function (x) { return host ? x.local : x.id === S.myPid; });
      $('#g-role').textContent = cfg.role ? cfg.role(v, mine, ui, host) : (host ? (mine.length ? 'Vert · ' + mine.map(function (x) { return x.icon; }).join(' ') : 'Vert (lærervisning)') : (mine[0] ? 'Du er ' + mine[0].icon + ' ' + mine[0].name : ''));
      var ctx = boardCtx(v);
      cfg.board.render(v, ui, ctx); updateClock();
      var control = ctx.control, stage = v.stage, banner = $('#t-banner'), body = $('#t-body');
      if (v.phase === 'play' && p) {
        banner.className = 'turn' + (control ? ' me' : '');
        var pi = v.players.indexOf(p);
        banner.innerHTML = '<span class="ti">' + p.icon + '</span><span>' + (control ? (host && !(mine.length === 1) ? esc(p.name) + ' – din tur!' : 'Din tur!') : esc(p.name) + ' sin tur') + ' <small class="muted" style="font-size:.7em">(' + esc(cfg.turnTag ? cfg.turnTag(v, p) : COLORS[(p.seat || pi) % COLORS.length].name.toLowerCase()) + ')</small></span>';
        var tk = (v.cur ? v.cur.tid : 0) + ':' + p.id + ':' + stage + ':' + v.turn;
        if (stage === 'roll' && control && lastTurnKey !== tk) Snd.turn();
        lastTurnKey = tk;
        var html = '';
        if (cfg.die) html += '<div class="diebox"><div class="die" id="die" aria-label="Terning"></div><div class="diemeta" id="t-meta"></div></div>'; else html += '<div id="t-meta"></div>';
        // bytt kun innhold når fasen endrer seg (ellers mister vi knappetrykk)
        var bk = tk + ':' + (stage === 'roll' ? 'r' : 'x');
        if (body._k !== bk) { body.innerHTML = html; body._k = bk; if (cfg.die) setDie(S.dieVal && stage !== 'roll' ? S.dieVal : 0); }
        var meta = $('#t-meta');
        if (stage === 'roll') {
          if (cfg.die && S.dieVal) setDie(0);
          var g = cfg.goHtml(v, p, control, ui);
          meta.innerHTML = g.html; if (control && g.bind) g.bind(meta);
        } else if (v.cur) {
          meta.innerHTML = cfg.meta ? cfg.meta(v, v.cur, p, ui) : '';
          if (cfg.die && v.cur.die) setDie(v.cur.die);
        }
      }
      renderPrompt(v, control);
      var pl = $('#pl'); pl.innerHTML = '';
      v.players.forEach(function (x, xi) {
        var d = document.createElement('div'); d.className = 'p' + (p && x.id === p.id && v.phase === 'play' ? ' cur' : ''); d.style.setProperty('--pc', pcolor(x, xi));
        d.innerHTML = '<span class="pc2"></span><span class="pi" style="border-color:' + pcolor(x, xi) + '">' + x.icon + '</span><span class="pn">' + esc(x.name) + (!x.conn && !x.local ? ' <small class="muted">(borte)</small>' : '') + '</span><span class="st">' + (cfg.playerStat ? (cfg.playerStat(x, v) ? cfg.playerStat(x, v) + ' · ' : '') : '') + '<b class="g">' + x.right + '✓</b> <b class="r">' + x.wrong + '✗</b></span>';
        pl.appendChild(d);
      });
      $('#log').innerHTML = v.log.slice(-10).reverse().map(function (l) { return '<div class="' + esc(l.c) + '">' + esc(l.t) + '</div>'; }).join('');
    }
    function sentenceHtml(main) { return esc(main).replace(/___/g, '<u>&nbsp;&nbsp;&nbsp;&nbsp;</u>'); }
    function speak(t) { try { if (!window.speechSynthesis || !t) return; speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'de-DE'; u.rate = .85; speechSynthesis.speak(u); } catch (e) { } }
    function speakText(L2) {
      var t = L2.task; if (!t) return '';
      if (t.k === 'verb') return (t.pr || '').replace(/ \/ /g, ' ').split(' ')[0] + ' ' + L2.sol;
      if (t.k === 'pron') return /[a-zäöüß]/i.test(L2.label || '') && (L2.label || '').indexOf(' ') > 0 ? (L2.label || '').replace(/[«»]/g, '') : L2.sol;
      if (t.k === 'trans') return t.head.indexOf('norsk') >= 0 ? t.main : L2.sol;
      return L2.sol;
    }
    function renderPrompt(v, control) {
      var card = $('#c-prompt'), c = v.cur, p = curP(v);
      if (v.phase !== 'play' || !c || (v.stage !== 'answer' && v.stage !== 'result' && v.stage !== 'pick') || (!c.task && !(v.last && v.last.none))) { card.hidden = true; S.promptKey = ''; return; }
      card.hidden = false;
      var key = c.tid + ':' + c.pid + ':' + v.stage + ':' + (v.stage === 'answer' ? '' : v.seq);
      if (key === S.promptKey) { if (v.stage === 'answer' && c.remaining != null) S.endAt = v._rx + c.remaining; return; }
      S.promptKey = key;
      var who = findP(v, c.pid), t = c.task;
      if (v.last && v.last.none) {
        var L0 = v.last;
        card.innerHTML = '<div class="res bad"><b class="big">' + esc(cfg.noneTitle || 'Ingen oppgave denne gangen') + '</b><br>' + (who ? who.icon + ' ' + esc(who.name) + ': ' : '') + esc(L0.msg || '') + (cfg.noneExtra ? cfg.noneExtra(v, L0, c, ui) : '') + '</div>';
        return;
      }
      var tag = '<span class="tag k-' + t.k.replace('trans', 'oversett').replace('art', 'artikkel').replace('pron', 'pronomen') + '">' + (t.k === 'verb' ? 'Verb · ' + esc(t.tenseLabel) : { trans: 'Oversettelse', art: 'Artikkel', pron: 'Pronomen' }[t.k]) + '</span>';
      var mainCls = (t.main || '').indexOf('___') >= 0 ? 'mn sent' : 'mn';
      var head = '<div class="row" style="justify-content:space-between">' + tag + '<span class="muted">' + esc(t.head) + '</span></div><div class="' + mainCls + '" style="margin-top:6px">' + sentenceHtml(t.main) + '</div>' + (t.sub ? '<div class="no">' + esc(t.sub) + '</div>' : '<div style="height:8px"></div>');
      if (v.stage === 'answer') {
        var timer = c.remaining != null ? '<div class="tbar" id="tbar"><i></i></div><div class="muted" style="text-align:right"><span id="tleft"></span></div>' : '';
        if (c.remaining != null) S.endAt = v._rx + c.remaining;
        var hints = (t.hints || []).map(function (x) { return '<div class="hint">' + esc(x) + '</div>'; }).join('');
        if (control) {
          if (t.mode === 'choice') {
            card.innerHTML = head + '<div class="opts' + (t.optStyle === 'art' ? ' art' : '') + '">' + t.opts.map(function (o) { return '<button type="button" data-v="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div>' + timer;
            $$('.opts button', card).forEach(function (b) { b.addEventListener('click', function () { $$('.opts button', card).forEach(function (x) { x.disabled = true; }); act('answer', b.getAttribute('data-v')); }); });
          } else {
            var keys = t.keys === 'no' ? ['æ', 'ø', 'å'] : ['ä', 'ö', 'ü', 'ß'];
            card.innerHTML = head + '<div class="ans">' + (t.pr ? '<span class="pr">' + esc(t.pr) + '</span>' : '') + '<input type="text" id="a-in" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Svar"><button class="btn prim" id="a-ok">OK</button></div><div class="keys">Tegn: ' + keys.map(function (k) { return '<button type="button">' + k + '</button>'; }).join('') + '</div>' + hints + timer;
            var inp = $('#a-in'), ok = $('#a-ok');
            var send = function () { var tx = inp.value.trim(); if (!tx) { inp.focus(); return; } inp.disabled = true; ok.disabled = true; act('answer', tx); };
            ok.addEventListener('click', send); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); send(); } });
            $$('.keys button', card).forEach(function (b) { b.addEventListener('mousedown', function (e) { e.preventDefault(); }); b.addEventListener('click', function () { var s0 = inp.selectionStart == null ? inp.value.length : inp.selectionStart, e2 = inp.selectionEnd == null ? s0 : inp.selectionEnd; inp.value = inp.value.slice(0, s0) + b.textContent + inp.value.slice(e2); inp.selectionStart = inp.selectionEnd = s0 + 1; inp.focus(); }); });
            setTimeout(function () { inp.focus(); }, 30);
          }
        } else {
          card.innerHTML = head + '<div class="ans"><span class="muted" style="font-size:1.1rem">… ' + (who ? who.icon + ' ' + esc(who.name) : '') + ' tenker</span></div>' + timer;
        }
      } else if (v.stage === 'pick') {
        var L2 = v.last || {};
        var res = '<div class="res ok"><b class="big">✓ Riktig!</b> <span class="sol">' + esc((t.pr ? t.pr + ' ' : '') + (L2.sol || '')) + '</span></div>';
        if (control && p) {
          card.innerHTML = head + res + '<div class="muted" style="margin-top:8px"><b>' + esc(typeof cfg.pickHead === 'function' ? cfg.pickHead(v, p, c) : (cfg.pickHead || 'Velg trekk')) + '</b> (klikk på brettet eller her):</div><div class="pbtns">' + c.moves.map(function (m) { return '<button type="button" data-id="' + m.id + '" style="--pc:' + pcolor(p) + '">' + esc(cfg.pickText(v, p, m, ui)) + '</button>'; }).join('') + '</div>';
          $$('.pbtns button', card).forEach(function (b) { b.addEventListener('click', function () { act('pick', parseInt(b.getAttribute('data-id'), 10)); }); });
        } else card.innerHTML = head + res + '<div class="muted" style="margin-top:8px">' + (who ? who.icon + ' ' + esc(who.name) : '') + ' velger trekk …</div>';
      } else {
        var L3 = v.last || {}, extra = cfg.resultExtra ? cfg.resultExtra(v, L3, c, ui) : '';
        var solLine = esc((t.pr ? t.pr + ' ' : '') + L3.sol) + (L3.solNo && t.k !== 'verb' ? ' <span class="muted" style="font-weight:600">· ' + esc(L3.solNo) + '</span>' : '');
        var body;
        if (L3.ok) body = '<b class="big">✓ Riktig!</b> <span class="sol">' + solLine + '</span>' + (L3.near ? '<br><span class="muted">Husk å skrive ä/ö/ü/ß (æ/ø/å) riktig.</span>' : '') + (extra.ok || '');
        else body = '<b class="big">✗ ' + (L3.timeout ? 'Tiden gikk ut' : 'Ikke helt') + '</b><br>' + (L3.given ? 'Svar: <s>' + esc((t.pr ? t.pr + ' ' : '') + L3.given) + '</s><br>' : '') + 'Riktig: <span class="sol">' + solLine + '</span>' + (extra.bad || '');
        card.innerHTML = head + '<div class="muted" style="margin-bottom:6px">' + (who ? who.icon + ' ' + esc(who.name) : '') + '</div><div class="res ' + (L3.ok ? 'ok' : 'bad') + '">' + body + '</div>' + (extra.after || '') + '<div style="margin-top:8px"><button class="btn sm" id="r-say" title="Hør tysk uttale">🔊 Hør</button></div>';
        var sb = $('#r-say'); if (sb) sb.addEventListener('click', function () { speak(speakText(L3)); });
      }
    }

    /* =====================================================================
       SLUTT
       ===================================================================== */
    function hardItem(h) {
      var items = h.items.slice(0, 4).map(function (it) {
        return (h.kind === 'verb' && it.person != null ? esc(PRON[it.person]) + ': ' : '') + (it.given ? '<s>' + esc(it.given) + '</s> → ' : '') + '<b>' + esc(it.sol) + '</b> <span class="muted">(' + esc(it.name) + ')</span>';
      }).join('<br>');
      return '<div class="h"><b>' + esc(h.label) + '</b> <span class="muted">' + esc(h.ctx) + ' · ' + h.count + ' feil</span><br>' + items + '</div>';
    }
    function renderEnd(v) {
      buildGameOnce();
      var host = S.mode === 'host', sm = v.summary; if (!sm) return;
      var win = findP(v, v.winner);
      $('#e-title').textContent = cfg.endTitle ? cfg.endTitle(v, sm, win) : (sm.why === 'win' ? '🏆 ' + (win ? win.name : '') + ' vant!' : sm.why === 'time' ? '⏱ Tiden er ute' : '🏁 Spillet er avsluttet');
      var med = ['🥇', '🥈', '🥉', '4.', '5.', '6.', '7.', '8.'];
      $('#e-podium').innerHTML = sm.rank.slice(0, 4).map(function (r, i) { return '<div class="pp' + (i === 0 ? ' first' : '') + '" style="border-color:' + (i === 0 ? '' : pcolor(r)) + '"><div class="big">' + r.icon + '</div><div style="font-weight:800">' + med[i] + ' ' + esc(r.name) + '</div><div class="muted">' + esc(r.score || '') + '</div></div>'; }).join('');
      var cols = cfg.endCols || [];
      $('#e-table').innerHTML = '<tr><th>#</th><th>Spiller</th><th>Resultat</th>' + cols.map(function (c) { return '<th>' + esc(c.h) + '</th>'; }).join('') + '<th>Riktige</th><th>Feil</th><th>Treff</th><th>Beste rekke</th></tr>' + sm.rank.map(function (r) { var t = r.right + r.wrong; return '<tr><td>' + r.rank + '</td><td>' + r.icon + ' ' + esc(r.name) + '</td><td>' + esc(r.score || '') + '</td>' + cols.map(function (c) { return '<td>' + esc(c.f(r)) + '</td>'; }).join('') + '<td>' + r.right + '</td><td>' + r.wrong + '</td><td>' + (t ? Math.round(r.right / t * 100) + ' %' : '–') + '</td><td>' + r.best + '</td></tr>'; }).join('');
      $('#e-hard').innerHTML = sm.hard.length ? sm.hard.slice(0, 14).map(hardItem).join('') : '<p class="muted">Ingen feil – imponerende! 🎉</p>';
      $('#e-again').hidden = !host; $('#e-wait').hidden = host; $('#e-leave').textContent = host ? 'Avslutt rommet' : 'Forlat';
    }
    function copyResult() {
      var v = S.view; if (!v || !v.summary) return; var sm = v.summary, out = cfg.title + ' – resultat\n\n';
      if (sm.note) out += sm.note + '\n\n';
      sm.rank.forEach(function (r) { out += r.rank + '. ' + r.name + ' ' + r.icon + ' – ' + (r.score || '') + ', ' + r.right + ' riktige / ' + r.wrong + ' feil\n'; });
      if (sm.hard.length) { out += '\nÅ øve mer på:\n'; sm.hard.slice(0, 14).forEach(function (h) { out += '• ' + h.label + ' (' + h.ctx + ') – ' + h.count + ' feil\n'; }); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out).then(function () { toast('Resultatet er kopiert'); }, function () { prompt('Kopier:', out); });
      else prompt('Kopier:', out);
    }
    function confetti() {
      var c = $('#confetti'), cols = ['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#d9a91c'];
      for (var i = 0; i < 90; i++) { var e = document.createElement('i'); e.style.left = Math.random() * 100 + '%'; e.style.background = cols[i % cols.length]; e.style.animationDuration = (2.4 + Math.random() * 2.2) + 's'; e.style.animationDelay = Math.random() * .8 + 's'; e.style.transform = 'rotate(' + Math.random() * 360 + 'deg)'; c.appendChild(e); }
      setTimeout(function () { c.innerHTML = ''; }, 6000);
    }

    S.screen = 'home';
    initHome();
    S.push = function () { if (S.engine) hostPush(); };
    window.__bs = S; // for feilsøking
    return ui;
  }

  window.DWBoardUI = { run: run, esc: esc };
})();
