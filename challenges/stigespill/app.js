/* Deutschwelt — Verb-Stigespill: brukergrensesnitt (app.js)
   Avhenger av: engine.js (DWStige), net.js (DWNet), ../../assets/peerjs.min.js (Peer) og dwVerben.
   Verten kjører spillmotoren og sender «snapshots» til alle; gjester sender bare {t:'roll'} og {t:'answer'}.
   Alle (også verten) viser tilstanden gjennom samme kø: onState → play (animasjon av hendelser) → render. */
(function () {
  'use strict';
  var E = window.DWStige, N = window.DWNet, V = window.dwVerben || [];
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var PC = ['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#00acc1', '#6d4c41', '#d81b60', '#3949ab', '#7cb342'];
  var SET_LABEL = { svake: 'Svake verb', sterke: 'Sterke verb', modal: 'Modalverb', hjelp: 'sein / haben / werden / wissen', trennbare: 'Trennbare verb', refleksive: 'Refleksive verb' };
  var TENSE_LABEL = { praesens: 'Presens', praeteritum: 'Präteritum', perfekt: 'Perfekt' };
  var PRON = E.PRON;
  var KEY_H = 'dw-stige-host', KEY_G = 'dw-stige-guest', KEY_SND = 'dw-stige-snd', KEY_NAME = 'dw-stige-name';

  var S = {
    mode: null, engine: null, host: null, guest: null, code: '', myPid: null, view: null, lastSeq: 0, disp: {}, q: [], busy: false,
    conn2pid: {}, pid2conn: {}, seen: {}, tickT: null, hbT: null, timerT: null, endAt: 0, promptKey: '', boardKey: '', dieVal: 0,
    guestSession: null, joined: false, sound: true, status: 'ok', icon: '', alIcon: ''
  };
  try { S.sound = localStorage.getItem(KEY_SND) !== '0'; } catch (e) { }

  /* ---------- små hjelpere ---------- */
  function toast(msg, ms) { var t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, ms || 2600); }
  function pidNum(id) { return parseInt(String(id).replace(/\D/g, ''), 10) || 1; }
  function pcol(id) { return PC[(pidNum(id) - 1) % PC.length]; }
  function findP(v, id) { for (var i = 0; i < v.players.length; i++) if (v.players[i].id === id) return v.players[i]; return null; }
  function iControl(v, pid) { var p = findP(v, pid); if (!p) return false; return S.mode === 'host' ? !!p.local : pid === S.myPid; }
  function curP(v) { return v && v.players[v.turn] || null; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { } }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } }
  function ssDel(k) { try { sessionStorage.removeItem(k); } catch (e) { } }

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
    up: function () { this.tone(330, .55, 'triangle', .11, 0, 990); },
    down: function () { this.tone(900, .6, 'triangle', .11, 0, 240); },
    turn: function () { this.tone(880, .09, 'sine', .1); this.tone(1175, .14, 'sine', .1, .1); },
    win: function () { var s = this; [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { s.tone(f, .22, 'triangle', .12, i * .13); }); }
  };
  document.addEventListener('click', function () { Snd.init(); }, true);
  document.addEventListener('keydown', function () { Snd.init(); }, true);

  /* ---------- skjermer ---------- */
  function show(name) {
    ['home', 'lobby', 'game', 'end'].forEach(function (n) { $('#scr-' + n).hidden = (n !== name); });
    $('#hdr').hidden = (name !== 'home');
    document.body.classList.toggle('in-game', name === 'game' || name === 'end');
    S.screen = name;
    window.scrollTo(0, 0);
  }
  function setStatus(st) {
    S.status = st;
    var txt = st === 'ok' ? '● Tilkoblet' : st === 'connecting' ? '… Kobler til' : '● Mistet kontakt – prøver igjen';
    ['#l-status', '#g-status'].forEach(function (id) { var e = $(id); if (e) { e.textContent = txt; e.className = 'pill ' + (st === 'ok' ? 'ok' : st === 'down' ? 'down' : ''); } });
  }

  /* ---------- ikonvelger ---------- */
  function iconPicker(host, getTaken, onPick, initial) {
    host.innerHTML = '';
    E.ICONS.forEach(function (ic) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'ico'; b.textContent = ic; b.setAttribute('aria-label', 'Figur ' + ic);
      b.addEventListener('click', function () { if (b.disabled) return; onPick(ic); host._cur = ic; mark(); });
      host.appendChild(b);
    });
    function mark(cur) { var t = getTaken(); $$('.ico', host).forEach(function (b) { b.disabled = t.indexOf(b.textContent) >= 0; });
      $$('.ico', host).forEach(function (b) { b.classList.toggle('on', b.textContent === (cur || host._cur)); }); }
    host._mark = function (c) { host._cur = c; mark(c); };
    host._mark(initial);
  }

  /* =====================================================================
     HJEM
     ===================================================================== */
  function initHome() {
    var noPeer = (typeof window.Peer === 'undefined');
    if (noPeer) { $('#h-nopeer').hidden = false; }
    var nm = lsGet(KEY_NAME) || '';
    $('#j-name').value = nm;
    S.icon = E.ICONS[Math.floor(Math.random() * E.ICONS.length)];
    iconPicker($('#j-icons'), function () { return []; }, function (ic) { S.icon = ic; }, S.icon);
    var m = /[?&]kode=([A-Za-z0-9]+)/.exec(location.search);
    if (m) { $('#j-code').value = N.cleanCode(m[1]); setTimeout(function () { $('#j-name').focus(); }, 50); }
    $('#j-code').addEventListener('input', function () { this.value = N.cleanCode(this.value); });
    $('#h-create').addEventListener('click', function () { if (noPeer) return; startHost(null); });
    $('#j-go').addEventListener('click', function () { if (noPeer) return; joinFromForm(); });
    $('#j-name').addEventListener('keydown', function (e) { if (e.key === 'Enter') joinFromForm(); });
    $('#j-code').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#j-name').focus(); });
    // fortsett som vert?
    var saved = lsGet(KEY_H);
    if (saved) {
      try {
        var o = JSON.parse(saved);
        if (o && o.code && o.data && Date.now() - o.ts < 8 * 3600 * 1000) {
          var g = JSON.parse(o.data).G, n = g.players ? g.players.length : 0;
          var box = $('#resume-host');
          box.innerHTML = '<div class="tip blue"><b>Du har et rom som ikke er avsluttet</b> (kode <b>' + esc(o.code) + '</b>, ' + n + ' spiller' + (n === 1 ? '' : 'e') + ').<br><button class="btn sm prim" id="rh-go" style="margin-top:6px">Fortsett rommet</button> <button class="btn sm" id="rh-del" style="margin-top:6px">Slett</button></div>';
          $('#rh-go').addEventListener('click', function () { if (noPeer) return; startHost(o); });
          $('#rh-del').addEventListener('click', function () { lsDel(KEY_H); box.innerHTML = ''; });
        } else lsDel(KEY_H);
      } catch (e) { lsDel(KEY_H); }
    }
    // fortsett som gjest?
    var gs = ssGet(KEY_G);
    if (gs && !noPeer) { try { var s = JSON.parse(gs); if (s && s.code && s.token) { S.guestSession = s; startGuest(s.code, s.name, s.icon, s.token, true); } } catch (e) { ssDel(KEY_G); } }
  }

  /* =====================================================================
     VERT
     ===================================================================== */
  function startHost(resume) {
    S.mode = 'host';
    S.engine = resume ? E.restore(V, resume.data) : E.createGame(V, {});
    S.host = new N.Host({
      onReady: function (code) {
        S.code = code; S.engine.G.code = code; setStatus('ok');
        if (!resume) { S.engine.G.players.length = 0; }
        hostPush(true);
        startHostLoops();
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
  function hostPush(force) {
    var e = S.engine, snap = e.snapshot(Date.now());
    S.host.broadcast({ t: 'state', s: snap });
    onState(snap);
    e.clearEvents();
    try { lsSet(KEY_H, JSON.stringify({ code: S.code, ts: Date.now(), data: e.serialize() })); } catch (x) { }
  }
  function hostData(connId, m, conn) {
    if (!m || typeof m !== 'object') return;
    S.seen[connId] = Date.now();
    var e = S.engine, pid = S.conn2pid[connId];
    switch (m.t) {
      case 'join': {
        var tok = String(m.token || '').slice(0, 40), r;
        var existing = tok ? e.rejoin(tok) : null;
        if (existing) { pid = existing; var old = S.pid2conn[pid]; if (old && old !== connId) { delete S.conn2pid[old]; } S.conn2pid[connId] = pid; S.pid2conn[pid] = connId;
          var pp = e.G.players.filter(function (p) { return p.id === pid; })[0];
          S.host.send(connId, { t: 'welcome', pid: pid, token: tok, name: pp.name, icon: pp.icon }); }
        else {
          r = e.addPlayer({ name: m.name, icon: m.icon, token: tok || undefined });
          if (!r.ok) { S.host.send(connId, { t: 'err', msg: r.msg }); return; }
          S.conn2pid[connId] = r.pid; S.pid2conn[r.pid] = connId;
          S.host.send(connId, { t: 'welcome', pid: r.pid, token: r.token, name: r.name, icon: r.icon });
        }
        hostPush(); break;
      }
      case 'roll': if (pid && e.roll(pid, Date.now()).ok) hostPush(); break;
      case 'answer': if (pid && e.answer(pid, String(m.text || '').slice(0, 60), Date.now()).ok) hostPush(); break;
      case 'leave': if (pid) { e.removePlayer(pid); delete S.conn2pid[connId]; delete S.pid2conn[pid]; hostPush(); } break;
      case 'sync': { var sn = e.snapshot(Date.now()); sn.events = []; S.host.send(connId, { t: 'state', s: sn }); break; }
      case 'ping': S.host.send(connId, { t: 'pong' }); break;
    }
  }
  function hostAction(type, text) {
    var e = S.engine, p = e.G.players[e.G.turn];
    if (!p || !p.local) return;
    var r = type === 'roll' ? e.roll(p.id, Date.now()) : e.answer(p.id, text, Date.now());
    if (r.ok) hostPush();
  }

  /* =====================================================================
     GJEST
     ===================================================================== */
  function joinFromForm() {
    var code = N.cleanCode($('#j-code').value), name = $('#j-name').value.trim();
    var err = $('#j-err'); err.textContent = '';
    if (code.length !== 4) { err.textContent = 'Skriv inn romkoden (fire tegn).'; return; }
    if (!name) { err.textContent = 'Skriv inn navnet ditt.'; return; }
    lsSet(KEY_NAME, name);
    startGuest(code, name, S.icon, null, false);
  }
  function startGuest(code, name, icon, token, resumed) {
    S.mode = 'guest'; S.code = code; S.joined = false;
    var err = $('#j-err'); err.style.color = 'var(--dw-muted)'; err.textContent = 'Kobler til rom ' + code + ' …';
    $('#j-go').disabled = true;
    var tok = token || ('g' + Math.random().toString(36).slice(2, 12));
    S.guestSession = { code: code, token: tok, name: name, icon: icon };
    S.guest = new N.Guest(code, {
      onOpen: function () { S.guest.send({ t: 'join', name: name, icon: icon, token: tok }); },
      onData: guestData,
      onClose: function () { },
      onStatus: function (st) { setStatus(st); },
      onError: function (msg, retryable) {
        if (!S.joined) { err.style.color = 'var(--dw-bad)'; err.textContent = msg; $('#j-go').disabled = false; if (S.guest) S.guest.close(); S.guest = null; ssDel(KEY_G); S.mode = null; if (S.screen !== 'home') backHome(); }
        else toast(msg, 3500);
      }
    });
    S.guest.start();
  }
  function guestData(m) {
    if (!m || typeof m !== 'object') return;
    switch (m.t) {
      case 'welcome':
        S.joined = true; S.myPid = m.pid; S.guestSession.token = m.token; S.guestSession.name = m.name; S.guestSession.icon = m.icon;
        ssSet(KEY_G, JSON.stringify(S.guestSession)); $('#j-go').disabled = false; $('#j-err').textContent = '';
        setStatus('ok'); break;
      case 'state': onState(m.s); break;
      case 'hb': if (S.view && m.seq !== S.view.seq && S.q.length === 0 && !S.busy) S.guest.send({ t: 'sync' }); break;
      case 'err': toast(m.msg, 5000); if (!S.joined) { $('#j-err').style.color = 'var(--dw-bad)'; $('#j-err').textContent = m.msg; $('#j-go').disabled = false; if (S.guest) S.guest.close(); S.guest = null; S.mode = null; } break;
      case 'kick': toast('Du ble fjernet fra rommet.', 4000); leave(true); break;
      case 'closed': toast('Læreren avsluttet rommet.', 4000); leave(true); break;
    }
  }
  function guestAction(type, text) {
    if (!S.guest) return;
    if (!S.guest.send(type === 'roll' ? { t: 'roll' } : { t: 'answer', text: text })) toast('Ingen kontakt med rommet akkurat nå …', 2500);
  }
  function act(type, text) { if (S.mode === 'host') hostAction(type, text); else guestAction(type, text); }

  function leave(silent) {
    if (S.mode === 'host') {
      if (!silent && !confirm('Avslutte rommet for alle?')) return;
      var hh = S.host; try { hh.broadcast({ t: 'closed' }); } catch (e) { }
      setTimeout(function () { try { hh.close(); } catch (e) { } }, 250);
      lsDel(KEY_H);
    } else if (S.guest) {
      try { S.guest.send({ t: 'leave' }); } catch (e) { }
      var g = S.guest; setTimeout(function () { g.close(); }, 200);
      ssDel(KEY_G);
    }
    backHome();
  }
  function backHome() {
    clearInterval(S.tickT); clearInterval(S.hbT); clearInterval(S.timerT); S.timerT = null;
    S.mode = null; S.engine = null; S.host = null; S.guest = null; S.view = null; S.lastSeq = 0; S.q = []; S.busy = false; S.disp = {}; S.conn2pid = {}; S.pid2conn = {}; S.joined = false; S.myPid = null; S.boardKey = ''; S.promptKey = '';
    $('#j-go').disabled = false;
    show('home');
    $('#resume-host').innerHTML = '';
  }

  /* =====================================================================
     TILSTAND → ANIMASJON → VISNING
     ===================================================================== */
  function onState(s) {
    if (!s) return;
    s._rx = performance.now();
    if (S.view && s.seq < S.lastSeq && s.phase === S.view.phase) return;
    if (s.seq === S.lastSeq && S.lastSeq > 0 && S.q.length === 0) {
      // samme versjon: bare friske opp (f.eks. tilkoblingsstatus)
      if (!S.busy) { S.view = s; renderAll(s, false); }
      return;
    }
    S.lastSeq = s.seq; S.q.push(s); pump();
  }
  function pump() {
    if (S.busy) return; S.busy = true;
    (function next() {
      var s = S.q.shift();
      if (!s) { S.busy = false; return; }
      play(s).then(next, function (e) { try { console.error(e); } catch (x) { } S.view = s; renderAll(s, true); next(); });
    })();
  }
  function setDisp(v) { v.players.forEach(function (p) { S.disp[p.id] = p.pos; }); Object.keys(S.disp).forEach(function (k) { if (!findP(v, k)) delete S.disp[k]; }); }
  async function play(s) {
    var prev = S.view, ph = s.phase;
    // skjermbytte
    var scr = ph === 'lobby' ? 'lobby' : ph === 'play' ? 'game' : 'end';
    if (S.screen !== scr) { if (scr === 'game') { buildBoard(s); S.disp = {}; setDisp(s); S.dieVal = 0; } show(scr); }
    if (ph === 'play' && s.board && S.boardKey !== boardKey(s)) { buildBoard(s); setDisp(s); }
    var evs = (s.events || []);
    if (ph === 'play' && prev && prev.phase === 'play') {
      for (var i = 0; i < evs.length; i++) { await playEvent(evs[i], s); }
    } else if (ph === 'end') {
      var w = evs.filter(function (x) { return x.k === 'end'; });
      if (w.length && s.winner) { Snd.win(); confetti(); }
    }
    S.view = s; setDisp(s);
    renderAll(s, true);
  }
  function boardKey(s) { return s.board ? (s.board.n + ':' + s.board.squares.length + ':' + (s.board.squares[1] ? s.board.squares[1].v : '') + (s.board.squares[s.board.n - 1] ? s.board.squares[s.board.n - 1].v : '') + s.board.jumps.map(function (j) { return j.from + '-' + j.to; }).join(',')) : ''; }
  async function playEvent(e, s) {
    switch (e.k) {
      case 'roll': Snd.roll(); setDieRolling(true); await sleep(850); setDieRolling(false); setDie(e.die); await sleep(250); break;
      case 'move': for (var i = 0; i < e.path.length; i++) { S.disp[e.pid] = e.path[i]; renderTokens(s); Snd.tick(); await sleep(190); } break;
      case 'back': for (var j = 0; j < e.path.length; j++) { S.disp[e.pid] = e.path[j]; renderTokens(s); Snd.tick(); await sleep(110); } break;
      case 'result': if (e.ok) Snd.ok(); else Snd.bad(); await sleep(350); break;
      case 'jump': { var tk = $('.tok[data-pid="' + e.pid + '"]'); if (tk) tk.classList.add('slow'); S.disp[e.pid] = e.to; renderTokens(s); if (e.type === 'ladder') Snd.up(); else Snd.down(); await sleep(800); if (tk) tk.classList.remove('slow'); break; }
      case 'win': Snd.win(); confetti(); await sleep(500); break;
    }
  }
  function renderAll(v, full) {
    if (S.screen === 'lobby') renderLobby(v);
    else if (S.screen === 'game') renderGame(v);
    else if (S.screen === 'end') renderEnd(v);
    $('#g-code').textContent = v.code; $('#e-code').textContent = v.code; $('#l-code').textContent = v.code || '----';
  }

  /* =====================================================================
     LOBBY
     ===================================================================== */
  var lobbyBuilt = false;
  function buildLobbyOnce() {
    if (lobbyBuilt) return; lobbyBuilt = true;
    var sets = $('#s-sets');
    E.SETS.forEach(function (k) { var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.setAttribute('data-k', k); b.innerHTML = esc(SET_LABEL[k]) + ' <small></small>'; sets.appendChild(b); });
    sets.addEventListener('click', function (ev) {
      var b = ev.target.closest('.chip'); if (!b || !S.engine) return;
      var cur = S.engine.G.settings.sets.slice(), k = b.getAttribute('data-k'), i = cur.indexOf(k);
      if (i >= 0) { if (cur.length === 1) return; cur.splice(i, 1); } else cur.push(k);
      S.engine.setSettings({ sets: cur }); hostPush();
    });
    var tn = $('#s-tenses');
    Object.keys(TENSE_LABEL).forEach(function (k) { var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.setAttribute('data-k', k); b.textContent = TENSE_LABEL[k]; tn.appendChild(b); });
    tn.addEventListener('click', function (ev) {
      var b = ev.target.closest('.chip'); if (!b || !S.engine) return;
      var cur = S.engine.G.settings.tenses.slice(), k = b.getAttribute('data-k'), i = cur.indexOf(k);
      if (i >= 0) { if (cur.length === 1) return; cur.splice(i, 1); } else cur.push(k);
      S.engine.setSettings({ tenses: cur }); hostPush();
    });
    [['#s-level', 'level'], ['#s-size', 'size'], ['#s-time', 'time']].forEach(function (x) {
      $(x[0]).addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b || !S.engine) return; var o = {}; o[x[1]] = b.getAttribute('data-v'); S.engine.setSettings(o); hostPush(); });
    });
    $('#s-help').addEventListener('click', function () { if (!S.engine) return; S.engine.setSettings({ help: !S.engine.G.settings.help }); hostPush(); });
    $('#b-start').addEventListener('click', function () { var r = S.engine.start(); if (!r.ok) { $('#s-err').textContent = r.msg; return; } $('#s-err').textContent = ''; hostPush(); });
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
  function renderLobby(v) {
    buildLobbyOnce();
    var host = S.mode === 'host';
    $('#l-count').textContent = v.players.length;
    $('#settings-card').hidden = !host; $('#summary-card').hidden = host; $('#addlocal').hidden = !host;
    $('#l-linkline').textContent = host ? 'Elevene går til denne siden (Deutschwelt → Challenges → Verb-Stigespill) og velger «Jeg skal være med».' : 'Du er med i rommet.';
    $('#l-copy').hidden = !host;
    var ul = $('#plist'); ul.innerHTML = '';
    v.players.forEach(function (p) {
      var li = document.createElement('li'); li.style.setProperty('--pc', pcol(p.id));
      var me = (host ? p.local : p.id === S.myPid);
      li.innerHTML = '<span class="pi">' + p.icon + '</span><span class="pn">' + esc(p.name) + (me ? '<small>' + (host ? '(denne maskinen)' : '(deg)') + '</small>' : '') + '</span>' + (p.local ? '' : '<span class="dot ' + (p.conn ? 'on' : 'off') + '" title="' + (p.conn ? 'Tilkoblet' : 'Frakoblet') + '"></span>');
      if (host) { var x = document.createElement('button'); x.className = 'xbtn'; x.type = 'button'; x.title = 'Fjern spiller'; x.textContent = '✕'; x.addEventListener('click', function () { var cid = S.pid2conn[p.id]; S.engine.removePlayer(p.id); if (cid) { S.host.kick(cid); delete S.conn2pid[cid]; delete S.pid2conn[p.id]; } hostPush(); }); li.appendChild(x); }
      ul.appendChild(li);
    });
    if (!v.players.length) ul.innerHTML = '<li class="muted" style="display:block">Ingen spillere ennå – elevene kan bli med med koden, eller du kan legge til spillere på denne maskinen.</li>';
    if (host) {
      var st = v.settings;
      $$('#s-sets .chip').forEach(function (b) { var k = b.getAttribute('data-k'); b.classList.toggle('on', st.sets.indexOf(k) >= 0); b.querySelector('small').textContent = '(' + S.engine.poolSize({ sets: [k] }) + ')'; });
      $$('#s-tenses .chip').forEach(function (b) { b.classList.toggle('on', st.tenses.indexOf(b.getAttribute('data-k')) >= 0); });
      $$('#s-level button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === st.level); });
      $$('#s-size button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === st.size); });
      $$('#s-time button').forEach(function (b) { b.classList.toggle('on', parseInt(b.getAttribute('data-v'), 10) === st.time); });
      $('#s-help').classList.toggle('on', !!st.help);
      var n = S.engine.poolSize(), info = $('#s-pool');
      info.textContent = 'Verb som kan trekkes med disse valgene: ' + n + (n < 4 ? ' – for få! Velg flere grupper eller høyere nivå.' : '');
      info.className = 'poolinfo' + (n < 4 ? ' bad' : '');
      $('#b-start').disabled = !v.players.length || n < 4;
      var ai = $('#al-icons'); if (ai._mark) ai._mark(S.alIcon);
    } else {
      var s = v.settings;
      $('#s-summary').innerHTML = '<p>Verbgrupper: <b>' + s.sets.map(function (k) { return esc(SET_LABEL[k]); }).join(', ') + '</b><br>Nivå: <b>' + esc(s.level) + '</b> · Tider: <b>' + s.tenses.map(function (k) { return TENSE_LABEL[k]; }).join(', ') + '</b><br>Brett: <b>' + esc(s.size) + '</b> · Svartid: <b>' + (s.time ? s.time + ' sekunder' : 'ingen grense') + '</b></p><p>Når spillet starter, får du terningen når det er din tur.</p>';
    }
  }

  /* =====================================================================
     BRETT
     ===================================================================== */
  function cellXY(i, rows) { var r = Math.floor(i / 6), c = (r % 2 === 0) ? (i % 6) : (5 - i % 6); return { c: c, r: r, x: c + .5, y: rows - 1 - r + .5 }; }
  function buildBoard(v) {
    var b = v.board; if (!b) return;
    S.boardKey = boardKey(v);
    var rows = b.rows, board = $('#board'); board.style.setProperty('--rows', rows);
    var cells = $('#cells'); cells.innerHTML = '';
    var multi = v.settings.tenses.length > 1, jf = {};
    b.jumps.forEach(function (j) { jf[j.from] = j.type; });
    for (var vr = 0; vr < rows; vr++) {
      var r = rows - 1 - vr;
      for (var c = 0; c < 6; c++) {
        var i = r * 6 + ((r % 2 === 0) ? c : 5 - c), d = document.createElement('div');
        d.className = 'cell c' + ((r + c) % 2) + (i === 0 ? ' start' : '') + (i === b.n - 1 ? ' goal' : '') + (jf[i] ? ' jf-' + jf[i] : ''); d.setAttribute('data-i', i);
        if (i === 0) d.innerHTML = '<span class="n"></span><span class="v">START</span><span></span>';
        else { var sq = b.squares[i]; d.innerHTML = '<span class="n">' + (i === b.n - 1 ? '🏁 MÅL' : i) + '</span><span class="v">' + esc(sq.v) + '</span>' + (multi ? '<span class="t ' + sq.t + '"></span>' : ''); }
        cells.appendChild(d);
      }
    }
    // stiger og sklier
    var svg = $('#jumps'); svg.setAttribute('viewBox', '0 0 6 ' + rows); var h = '';
    b.jumps.forEach(function (j) {
      var a = cellXY(j.from, rows), z = cellXY(j.to, rows), dx = z.x - a.x, dy = z.y - a.y, L = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / L, ny = dx / L;
      if (j.type === 'ladder') {
        var o = .15, rails = '', rungs = '', k, steps = Math.max(3, Math.round(L / .34));
        for (k = 0; k <= steps; k++) { var f = k / steps, px = a.x + dx * f, py = a.y + dy * f; rungs += '<line x1="' + (px + nx * o) + '" y1="' + (py + ny * o) + '" x2="' + (px - nx * o) + '" y2="' + (py - ny * o) + '"/>'; }
        rails = '<line x1="' + (a.x + nx * o) + '" y1="' + (a.y + ny * o) + '" x2="' + (z.x + nx * o) + '" y2="' + (z.y + ny * o) + '"/><line x1="' + (a.x - nx * o) + '" y1="' + (a.y - ny * o) + '" x2="' + (z.x - nx * o) + '" y2="' + (z.y - ny * o) + '"/>';
        h += '<g opacity=".7"><g stroke="#fff" stroke-width=".13" stroke-linecap="round">' + rails + rungs + '</g><g stroke="#8b5a2b" stroke-width=".07" stroke-linecap="round">' + rails + '</g><g stroke="#a9743a" stroke-width=".045" stroke-linecap="round">' + rungs + '</g></g>';
      } else {
        var cx = (a.x + z.x) / 2 + nx * L * .22, cy = (a.y + z.y) / 2 + ny * L * .22, path = 'M' + a.x + ' ' + a.y + ' Q' + cx + ' ' + cy + ' ' + z.x + ' ' + z.y;
        h += '<g opacity=".7"><path d="' + path + '" fill="none" stroke="#fff" stroke-width=".3" stroke-linecap="round"/><path d="' + path + '" fill="none" stroke="#e53935" stroke-width=".21" stroke-linecap="round"/><path d="' + path + '" fill="none" stroke="#ffcdd2" stroke-width=".07" stroke-linecap="round" stroke-dasharray=".16 .14"/><circle cx="' + a.x + '" cy="' + a.y + '" r=".16" fill="#b71c1c" stroke="#fff" stroke-width=".04"/><circle cx="' + z.x + '" cy="' + z.y + '" r=".1" fill="#fff" stroke="#e53935" stroke-width=".05"/></g>';
      }
    });
    svg.innerHTML = h; $('#toks').innerHTML = '';
  }
  var OFFS = [[], [[0, 0]], [[-.2, 0], [.2, 0]], [[-.2, -.15], [.2, -.15], [0, .2]], [[-.2, -.18], [.2, -.18], [-.2, .2], [.2, .2]]];
  function renderTokens(v) {
    if (!v.board) return; var rows = v.board.rows, groups = {};
    v.players.forEach(function (p) { var c = (S.disp[p.id] != null) ? S.disp[p.id] : p.pos; (groups[c] = groups[c] || []).push(p); });
    var cp = (v.phase === 'play' && v.stage !== 'idle') ? curP(v) : null, toks = $('#toks'), alive = {};
    Object.keys(groups).forEach(function (c) {
      var list = groups[c], xy = cellXY(+c, rows), offs = OFFS[Math.min(list.length, 4)];
      list.forEach(function (p, k) {
        var o = offs[k] || [((k % 3) - 1) * .22, (Math.floor(k / 3) - .5) * .3], el = toks.querySelector('.tok[data-pid="' + p.id + '"]');
        if (!el) { el = document.createElement('div'); el.className = 'tok'; el.setAttribute('data-pid', p.id); toks.appendChild(el); }
        el.textContent = p.icon; el.style.setProperty('--pc', pcol(p.id)); el.title = p.name;
        el.style.left = ((xy.x + o[0]) / 6 * 100) + '%'; el.style.top = ((xy.y + o[1]) / rows * 100) + '%';
        el.classList.toggle('cur', !!(cp && cp.id === p.id)); alive[p.id] = 1;
      });
    });
    $$('.tok', toks).forEach(function (el) { if (!alive[el.getAttribute('data-pid')]) el.remove(); });
    $$('.cell.hot').forEach(function (c) { c.classList.remove('hot'); });
    if (v.cur && v.stage === 'answer') { var hc = $('.cell[data-i="' + v.cur.target + '"]'); if (hc) hc.classList.add('hot'); }
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
    var d = $('#die'); if (!d) return; clearInterval(dieTimer);
    d.classList.toggle('rolling', on);
    if (on) dieTimer = setInterval(function () { var n = 1 + Math.floor(Math.random() * 6); d.innerHTML = ''; for (var i = 0; i < 9; i++) { var e = document.createElement('i'); if (PIPS[n].indexOf(i) >= 0) e.className = 'p'; d.appendChild(e); } d.style.opacity = 1; }, 80);
  }
  var gameBuilt = false;
  function buildGameOnce() {
    if (gameBuilt) return; gameBuilt = true;
    $('#c-turn').innerHTML = '<div class="turn" id="t-banner"></div><div class="diebox" style="margin-top:10px"><div class="die" id="die" aria-label="Terning"></div><div class="diemeta" id="t-meta"></div></div>';
    setDie(0);
    $('#g-sound').addEventListener('click', function () { S.sound = !S.sound; lsSet(KEY_SND, S.sound ? '1' : '0'); $('#g-sound').textContent = S.sound ? '🔊' : '🔇'; Snd.init(); });
    $('#g-leave').addEventListener('click', function () { if (S.mode === 'host') leave(false); else if (confirm('Forlate spillet?')) leave(true); });
    $('#g-skip').addEventListener('click', function () { if (S.engine && S.engine.skip(Date.now())) hostPush(); });
    $('#g-end').addEventListener('click', function () { if (S.engine && confirm('Avslutte spillet og vise resultatet?')) { S.engine.endGame(); hostPush(); } });
    $('#e-leave').addEventListener('click', function () { if (S.mode === 'host') leave(false); else leave(true); });
    $('#e-again').addEventListener('click', function () { S.engine.toLobby(); hostPush(); });
    $('#e-copy').addEventListener('click', function () { copyResult(); });
    $('#e-print').addEventListener('click', function () { window.print(); });
    $('#g-sound').textContent = S.sound ? '🔊' : '🔇';
  }
  function ensureTimer() { if (!S.timerT) S.timerT = setInterval(updateTimer, 200); }
  function updateTimer() {
    var bar = $('#tbar i'); if (!bar || !S.view || !S.view.cur || S.view.cur.remaining == null || S.view.stage !== 'answer') return;
    var total = (S.view.settings.time || 1) * 1000, left = Math.max(0, S.endAt - performance.now());
    bar.style.width = (left / total * 100) + '%'; bar.style.background = left < total * .25 ? 'var(--dw-bad)' : left < total * .5 ? 'var(--dw-accent)' : 'var(--dw-good)';
    var t = $('#tleft'); if (t) t.textContent = Math.ceil(left / 1000) + ' s';
  }
  var lastTurnKey = '';
  function renderGame(v) {
    buildGameOnce(); ensureTimer();
    var host = S.mode === 'host', p = curP(v);
    $('#g-skip').hidden = !host; $('#g-end').hidden = !host;
    $('#g-leave').textContent = host ? 'Avslutt rommet' : 'Forlat';
    var mine = v.players.filter(function (x) { return host ? x.local : x.id === S.myPid; });
    $('#g-role').textContent = host ? (mine.length ? 'Vert · ' + mine.map(function (x) { return x.icon; }).join(' ') : 'Vert (lærervisning)') : (mine[0] ? 'Du er ' + mine[0].icon + ' ' + mine[0].name : '');
    renderTokens(v);
    var control = !!(p && iControl(v, p.id)), stage = v.stage;
    // tur-banner
    var banner = $('#t-banner'), meta = $('#t-meta');
    if (v.phase === 'play' && p) {
      banner.className = 'turn' + (control ? ' me' : '');
      banner.innerHTML = '<span class="ti">' + p.icon + '</span><span>' + (control ? (host && !(mine.length === 1) ? esc(p.name) + ' – din tur!' : 'Din tur!') : esc(p.name) + ' sin tur') + '</span>';
      var tk = v.seq + ':' + p.id + ':' + stage;
      if (stage === 'roll') { if (S.dieVal) setDie(0); }
      if (stage === 'roll' && control && lastTurnKey !== tk) { Snd.turn(); }
      lastTurnKey = tk;
      if (stage === 'roll') {
        meta.innerHTML = control ? '<button class="btn prim big yourturn" id="b-roll">🎲 Kast terningen</button>' : '<span class="muted">' + (p.conn || p.local ? 'Venter på at ' + esc(p.name) + ' skal kaste …' : esc(p.name) + ' har mistet kontakten – turen hoppes over snart …') + '</span>';
        var br = $('#b-roll'); if (br) br.addEventListener('click', function () { br.disabled = true; act('roll'); });
      } else if (v.cur) {
        meta.innerHTML = '<b>' + v.cur.die + '</b> → <b>' + PRON[v.cur.person] + '</b><br><span class="muted">' + (v.cur.target === v.cur.from ? '' : 'Rute ' + v.cur.target) + '</span>';
        setDie(v.cur.die);
      }
    }
    renderPrompt(v, control);
    // spillere
    var pl = $('#pl'); pl.innerHTML = '';
    v.players.forEach(function (x) {
      var d = document.createElement('div'); d.className = 'p' + (p && x.id === p.id && v.phase === 'play' ? ' cur' : ''); d.style.setProperty('--pc', pcol(x.id));
      d.innerHTML = '<span class="pi">' + x.icon + '</span><span class="pn">' + esc(x.name) + (!x.conn && !x.local ? ' <small class="muted">(borte)</small>' : '') + '</span><span class="st">rute <b>' + x.pos + '</b> · <b class="g">' + x.right + '✓</b> <b class="r">' + x.wrong + '✗</b></span>';
      pl.appendChild(d);
    });
    var lg = $('#log'); lg.innerHTML = v.log.slice(-10).reverse().map(function (l) { return '<div class="' + esc(l.c) + '">' + esc(l.t) + '</div>'; }).join('');
  }
  function hintFor(c) {
    var h = [];
    if (c.t === 'perfekt') h.push('Perfekt: skriv hjelpeverb + partisipp, f.eks. «hat gelernt» eller «ist gegangen».');
    if (c.sep && c.t !== 'perfekt') h.push('Trennbart verb: partikkelen kommer helt sist, f.eks. «stehe auf».');
    if (c.ref) h.push('Refleksivt verb: ta med pronomenet, f.eks. «freue mich».');
    return h;
  }
  function renderPrompt(v, control) {
    var card = $('#c-prompt'), c = v.cur;
    if (v.phase !== 'play' || !c || (v.stage !== 'answer' && v.stage !== 'result')) { card.hidden = true; S.promptKey = ''; return; }
    card.hidden = false;
    var key = c.pid + ':' + c.from + ':' + c.die + ':' + v.stage + ':' + (v.stage === 'result' ? v.seq : '');
    if (key === S.promptKey) { if (v.stage === 'answer' && c.remaining != null) S.endAt = v._rx + c.remaining; return; }
    S.promptKey = key;
    var who = findP(v, c.pid), pr = PRON[c.person];
    var head = '<div class="row" style="justify-content:space-between"><span class="tag ' + c.t + '">' + TENSE_LABEL[c.t] + '</span><span class="muted">Rute ' + c.target + (c.target === v.board.n - 1 ? ' (MÅL)' : '') + '</span></div><div class="vb">' + esc(c.v) + '</div>' + (v.settings.help && c.n ? '<div class="no">' + esc(c.n) + '</div>' : '<div style="height:8px"></div>');
    if (v.stage === 'answer') {
      var h = hintFor(c).map(function (t) { return '<div class="hint">' + esc(t) + '</div>'; }).join('');
      var timer = c.remaining != null ? '<div class="tbar" id="tbar"><i></i></div><div class="muted" style="text-align:right"><span id="tleft"></span></div>' : '';
      if (c.remaining != null) S.endAt = v._rx + c.remaining;
      if (control) {
        card.innerHTML = head + '<div class="muted">Terningen viste <b>' + c.die + '</b> → bøy for <b>' + pr + '</b></div><div class="ans"><span class="pr">' + pr + '</span><input type="text" id="a-in" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Svar"><button class="btn prim" id="a-ok">OK</button></div><div class="keys">Tegn: <button type="button">ä</button><button type="button">ö</button><button type="button">ü</button><button type="button">ß</button></div>' + h + timer;
        var inp = $('#a-in'), ok = $('#a-ok');
        function send() { var t = inp.value.trim(); if (!t) { inp.focus(); return; } inp.disabled = true; ok.disabled = true; act('answer', t); }
        ok.addEventListener('click', send); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); send(); } });
        $$('.keys button', card).forEach(function (b) { b.addEventListener('mousedown', function (e) { e.preventDefault(); }); b.addEventListener('click', function () { var s = inp.selectionStart == null ? inp.value.length : inp.selectionStart, e2 = inp.selectionEnd == null ? s : inp.selectionEnd; inp.value = inp.value.slice(0, s) + b.textContent + inp.value.slice(e2); inp.selectionStart = inp.selectionEnd = s + 1; inp.focus(); }); });
        setTimeout(function () { inp.focus(); }, 30);
      } else {
        card.innerHTML = head + '<div class="muted">Terningen viste <b>' + c.die + '</b> → ' + (who ? esc(who.name) : '') + ' skal bøye for <b>' + pr + '</b></div><div class="ans"><span class="pr">' + pr + '</span><span class="muted" style="font-size:1.1rem">… ' + (who ? who.icon : '') + ' tenker</span></div>' + timer;
      }
    } else {
      var L = v.last, bad = !L.ok;
      var jumpTxt = L.jump === 'ladder' ? '<br>🪜 <b>Stige!</b> Opp til rute ' + L.to + '.' : L.jump === 'slide' ? '<br>🛝 <b>Sklie!</b> Ned til rute ' + L.to + '.' : '';
      var win = (v.winner && v.winner === c.pid) ? '<br>🏁 <b>I mål!</b>' : '';
      var body;
      if (L.ok) body = '<b class="big">✓ Riktig!</b> <span class="sol">' + esc(pr + ' ' + L.sol) + '</span>' + (L.near ? '<br><span class="muted">Husk å skrive ä/ö/ü/ß riktig.</span>' : '') + jumpTxt + win;
      else body = '<b class="big">✗ ' + (L.timeout ? 'Tiden gikk ut' : 'Ikke helt') + '</b><br>' + (L.given ? 'Svar: <s>' + esc(pr + ' ' + L.given) + '</s><br>' : '') + 'Riktig: <span class="sol">' + esc(pr + ' ' + L.sol) + '</span><br><span class="muted">Tilbake til rute ' + L.to + '.</span>';
      card.innerHTML = head + '<div class="muted" style="margin-bottom:6px">' + (who ? who.icon + ' ' + esc(who.name) : '') + ' · ' + pr + '</div><div class="res ' + (L.ok ? 'ok' : 'bad') + '">' + body + '</div><div style="margin-top:8px"><button class="btn sm" id="r-say" title="Hør formen">🔊 Hør</button></div>';
      var sb = $('#r-say'); if (sb) sb.addEventListener('click', function () { speak(pr.replace(/ \/ /g, ' ').split(' ')[0] + ' ' + L.sol); });
    }
  }
  function speak(t) { try { if (!window.speechSynthesis) return; speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'de-DE'; u.rate = .85; speechSynthesis.speak(u); } catch (e) { } }

  /* =====================================================================
     SLUTT
     ===================================================================== */
  function renderEnd(v) {
    buildGameOnce();
    var host = S.mode === 'host', sm = v.summary; if (!sm) return;
    $('#e-title').textContent = sm.why === 'win' ? '🏆 ' + (findP(v, v.winner) ? findP(v, v.winner).name : '') + ' vant!' : '🏁 Spillet er avsluttet';
    var med = ['🥇', '🥈', '🥉'];
    $('#e-podium').innerHTML = sm.rank.slice(0, 3).map(function (r, i) { return '<div class="pp' + (i === 0 ? ' first' : '') + '"><div class="big">' + r.icon + '</div><div style="font-weight:800">' + med[i] + ' ' + esc(r.name) + '</div><div class="muted">' + (r.finished ? 'i mål' : 'rute ' + r.pos) + '</div></div>'; }).join('');
    $('#e-table').innerHTML = '<tr><th>#</th><th>Spiller</th><th>Plass</th><th>Riktige</th><th>Feil</th><th>Treff</th><th>Beste rekke</th></tr>' + sm.rank.map(function (r) { var t = r.right + r.wrong; return '<tr><td>' + r.rank + '</td><td>' + r.icon + ' ' + esc(r.name) + '</td><td>' + (r.finished ? '🏁 i mål' : 'rute ' + r.pos) + '</td><td>' + r.right + '</td><td>' + r.wrong + '</td><td>' + (t ? Math.round(r.right / t * 100) + ' %' : '–') + '</td><td>' + r.best + '</td></tr>'; }).join('');
    $('#e-hard').innerHTML = sm.hard.length ? sm.hard.slice(0, 12).map(function (h) {
      return '<div class="h"><b>' + esc(h.v) + '</b> <span class="tag ' + h.t + '">' + TENSE_LABEL[h.t] + '</span> <span class="muted">' + (h.n ? esc(h.n) + ' · ' : '') + h.count + ' feil</span><br>' + h.items.slice(0, 4).map(function (it) { return esc(PRON[it.person]) + ': ' + (it.given ? '<s>' + esc(it.given) + '</s> → ' : '') + '<b>' + esc(it.sol) + '</b> <span class="muted">(' + esc(it.name) + ')</span>'; }).join('<br>') + '</div>';
    }).join('') : '<p class="muted">Ingen feil – imponerende! 🎉</p>';
    $('#e-again').hidden = !host; $('#e-wait').hidden = host;
    $('#e-leave').textContent = host ? 'Avslutt rommet' : 'Forlat';
  }
  function copyResult() {
    var v = S.view; if (!v || !v.summary) return; var sm = v.summary, out = 'Verb-Stigespill – resultat\n\n';
    sm.rank.forEach(function (r) { out += r.rank + '. ' + r.name + ' ' + r.icon + ' – ' + (r.finished ? 'i mål' : 'rute ' + r.pos) + ', ' + r.right + ' riktige / ' + r.wrong + ' feil\n'; });
    if (sm.hard.length) { out += '\nVerb å øve mer på:\n'; sm.hard.slice(0, 12).forEach(function (h) { out += '• ' + h.v + ' (' + TENSE_LABEL[h.t] + ') – ' + h.count + ' feil: ' + h.items.slice(0, 3).map(function (it) { return PRON[it.person] + ' ' + it.sol; }).join('; ') + '\n'; }); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out).then(function () { toast('Resultatet er kopiert'); }, function () { prompt('Kopier:', out); });
    else prompt('Kopier:', out);
  }
  function confetti() {
    var c = $('#confetti'), cols = ['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#d9a91c'];
    for (var i = 0; i < 90; i++) { var e = document.createElement('i'); e.style.left = Math.random() * 100 + '%'; e.style.background = cols[i % cols.length]; e.style.animationDuration = (2.4 + Math.random() * 2.2) + 's'; e.style.animationDelay = Math.random() * .8 + 's'; e.style.transform = 'rotate(' + Math.random() * 360 + 'deg)'; c.appendChild(e); }
    setTimeout(function () { c.innerHTML = ''; }, 6000);
  }

  window.addEventListener('beforeunload', function () { /* verten lagrer fortløpende */ });
  S.screen = 'home';
  initHome();
  window.__stige = S; // for feilsøking
})();
