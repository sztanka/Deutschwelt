/* Deutschwelt — «Ärgere dich nicht»: brukergrensesnitt (app.js)
   Avhenger av: engine.js (DWLudo), ../stigespill/engine.js (DWStige), ../stigespill/net.js (DWNet), ../../assets/peerjs.min.js (Peer), dwVerben.
   Verten kjører spillmotoren og sender «snapshots» til alle; gjester sender bare {t:'roll'}, {t:'answer',text} og {t:'pick',i}.
   Alle (også verten) viser tilstanden gjennom samme kø: onState → play (animasjon av hendelser) → render. */
(function () {
  'use strict';
  var L = window.DWLudo, N = window.DWNet, V = window.dwVerben || [];
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var PRON = L.PRON, SEATS = L.SEATS;
  var KIND_LABEL = { oversett: 'Oversettelse', artikkel: 'Artikkel', pronomen: 'Pronomen', verb: 'Verb' };
  var TASK_CHIP = { oversett: '🌍 Oversettelse', artikkel: '📘 Artikler (der/die/das)', pronomen: '👤 Pronomen og eiendomsord', verb: '🔧 Verbbøying' };
  var THEME_LABEL = { n: 'Mat, dyr og natur', s: 'Skole, hverdag og reise', g: 'Allmenne ord (verb, adjektiv …)', o: 'Byer, land og geografi' };
  var SET_LABEL = { svake: 'Svake verb', sterke: 'Sterke verb', modal: 'Modalverb', hjelp: 'sein / haben / werden / wissen', trennbare: 'Trennbare verb', refleksive: 'Refleksive verb' };
  var TENSE_LABEL = { praesens: 'Presens', praeteritum: 'Präteritum', perfekt: 'Perfekt' };
  var FALLBACK = ['#8e24aa', '#00acc1', '#6d4c41', '#d81b60'];
  var KEY_H = 'dw-ludo-host', KEY_G = 'dw-ludo-guest', KEY_SND = 'dw-ludo-snd', KEY_NAME = 'dw-ludo-name';

  var S = {
    mode: null, engine: null, host: null, guest: null, code: '', myPid: null, view: null, lastSeq: 0, disp: {}, q: [], busy: false,
    conn2pid: {}, pid2conn: {}, seen: {}, tickT: null, hbT: null, timerT: null, clockT: null, endAt: 0, promptKey: '', boardBuilt: false, dieVal: 0,
    guestSession: null, joined: false, sound: true, status: 'ok', icon: '', alIcon: '', screen: 'home'
  };
  try { S.sound = localStorage.getItem(KEY_SND) !== '0'; } catch (e) { }

  /* ---------- små hjelpere ---------- */
  function toast(msg, ms) { var t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, ms || 2600); }
  function findP(v, id) { for (var i = 0; i < v.players.length; i++) if (v.players[i].id === id) return v.players[i]; return null; }
  function iControl(v, pid) { var p = findP(v, pid); if (!p) return false; return S.mode === 'host' ? !!p.local : pid === S.myPid; }
  function curP(v) { return v && v.players[v.turn] || null; }
  function pcolor(p, idx) { return p && p.seat >= 0 ? SEATS[p.seat].col : FALLBACK[(idx || 0) % FALLBACK.length]; }
  function seatFor(i, n) { return n === 2 ? [0, 2][i] : i; }
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
    kick: function () { this.tone(800, .35, 'sawtooth', .09, 0, 150); this.tone(300, .25, 'square', .06, .12, 90); },
    home: function () { this.tone(330, .45, 'triangle', .11, 0, 990); },
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
    S.screen = name; window.scrollTo(0, 0);
  }
  function setStatus(st) {
    S.status = st;
    var txt = st === 'ok' ? '● Tilkoblet' : st === 'connecting' ? '… Kobler til' : '● Mistet kontakt – prøver igjen';
    ['#l-status', '#g-status'].forEach(function (id) { var e = $(id); if (e) { e.textContent = txt; e.className = 'pill ' + (st === 'ok' ? 'ok' : st === 'down' ? 'down' : ''); } });
  }
  function iconPicker(host, getTaken, onPick, initial) {
    host.innerHTML = '';
    L.ICONS.forEach(function (ic) {
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
    S.icon = L.ICONS[Math.floor(Math.random() * L.ICONS.length)];
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
    S.engine = resume ? L.restore(V, resume.data) : L.createGame(V, {});
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
  function hostData(connId, m, conn) {
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
      case 'roll': if (pid && e.roll(pid, Date.now()).ok) hostPush(); break;
      case 'answer': if (pid && e.answer(pid, String(m.text || '').slice(0, 60), Date.now()).ok) hostPush(); break;
      case 'pick': if (pid && e.pick(pid, parseInt(m.i, 10), Date.now()).ok) hostPush(); break;
      case 'leave': if (pid) { e.removePlayer(pid); delete S.conn2pid[connId]; delete S.pid2conn[pid]; hostPush(); } break;
      case 'sync': { var sn = e.snapshot(Date.now()); sn.events = []; S.host.send(connId, { t: 'state', s: sn }); break; }
      case 'ping': S.host.send(connId, { t: 'pong' }); break;
    }
  }
  function hostAction(type, arg) {
    var e = S.engine, p = e.G.players[e.G.turn];
    if (!p || !p.local) return;
    var r = type === 'roll' ? e.roll(p.id, Date.now()) : type === 'pick' ? e.pick(p.id, arg, Date.now()) : e.answer(p.id, arg, Date.now());
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
    var msg = type === 'roll' ? { t: 'roll' } : type === 'pick' ? { t: 'pick', i: arg } : { t: 'answer', text: arg };
    if (!S.guest.send(msg)) toast('Ingen kontakt med rommet akkurat nå …', 2500);
  }
  function act(type, arg) { if (S.mode === 'host') hostAction(type, arg); else guestAction(type, arg); }

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
    S.mode = null; S.engine = null; S.host = null; S.guest = null; S.view = null; S.lastSeq = 0; S.q = []; S.busy = false; S.disp = {}; S.conn2pid = {}; S.pid2conn = {}; S.joined = false; S.myPid = null; S.promptKey = ''; S.seen = {};
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
      play(s).then(next, function (e) { try { console.error(e); } catch (x) { } S.view = s; setDisp(s); renderAll(s); next(); });
    })();
  }
  function setDisp(v) {
    v.players.forEach(function (p) { S.disp[p.id] = (p.pieces || []).slice(); });
    Object.keys(S.disp).forEach(function (k) { if (!findP(v, k)) delete S.disp[k]; });
  }
  async function play(s) {
    var prev = S.view, ph = s.phase, scr = ph === 'lobby' ? 'lobby' : ph === 'play' ? 'game' : 'end';
    if (S.screen !== scr) {
      if (scr === 'game') { buildBoard(); S.disp = {}; setDisp(s); S.dieVal = 0; S.promptKey = ''; }
      show(scr);
    }
    var evs = (s.events || []);
    if (ph === 'play' && prev && prev.phase === 'play') {
      for (var i = 0; i < evs.length; i++) await playEvent(evs[i], s);
    } else if (ph === 'end') {
      if (evs.some(function (x) { return x.k === 'end'; }) && s.winner) { Snd.win(); confetti(); }
    }
    S.view = s; setDisp(s); renderAll(s);
  }
  function tokEl(pid, i) { return $('.ltok[data-k="' + pid + ':' + i + '"]'); }
  async function playEvent(e, s) {
    switch (e.k) {
      case 'roll': Snd.roll(); setDieRolling(true); await sleep(850); setDieRolling(false); setDie(e.die); await sleep(250); break;
      case 'nomove': await sleep(250); break;
      case 'move': {
        if (!S.disp[e.pid]) S.disp[e.pid] = [];
        for (var i = 0; i < e.path.length; i++) { S.disp[e.pid][e.i] = e.path[i]; renderTokens(s); Snd.tick(); await sleep(180); }
        break;
      }
      case 'capture': {
        if (!S.disp[e.pid]) S.disp[e.pid] = [];
        var t = tokEl(e.pid, e.i); if (t) t.classList.add('kick');
        Snd.kick(); await sleep(350); S.disp[e.pid][e.i] = -1; renderTokens(s); await sleep(450); if (t) t.classList.remove('kick'); break;
      }
      case 'home': Snd.home(); await sleep(450); break;
      case 'result': if (e.ok) Snd.ok(); else Snd.bad(); await sleep(350); break;
      case 'win': Snd.win(); confetti(); await sleep(500); break;
    }
  }
  function renderAll(v) {
    if (S.screen === 'lobby') renderLobby(v);
    else if (S.screen === 'game') renderGame(v);
    else if (S.screen === 'end') renderEnd(v);
    $('#g-code').textContent = v.code; $('#e-code').textContent = v.code; $('#l-code').textContent = v.code || '----';
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
  function buildLobbyOnce() {
    if (lobbyBuilt) return; lobbyBuilt = true;
    chipList('#s-tasks', TASK_CHIP, 'tasks', true);
    chipList('#s-themes', THEME_LABEL, 'themes', true);
    chipList('#s-sets', SET_LABEL, 'sets', true);
    chipList('#s-tenses', TENSE_LABEL, 'tenses', true);
    [['#s-level', 'level'], ['#s-dir', 'transDir'], ['#s-mode', 'answerMode'], ['#s-pieces', 'pieces'], ['#s-start', 'start'], ['#s-time', 'time'], ['#s-minutes', 'minutes']].forEach(function (x) {
      $(x[0]).addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b || !S.engine) return; var o = {}; o[x[1]] = b.getAttribute('data-v'); S.engine.setSettings(o); hostPush(); });
    });
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
    out.push('Nivå: <b>' + esc(s.level) + '</b> · Brikker: <b>' + s.pieces + '</b> · Start: <b>' + (s.start === 'one' ? 'rask' : 'klassisk (6)') + '</b>');
    out.push('Svartid: <b>' + (s.time ? s.time + ' sekunder' : 'ingen grense') + '</b> · Spilletid: <b>' + (s.minutes ? s.minutes + ' minutter' : 'ingen grense') + '</b>');
    return '<p>' + out.join('<br>') + '</p><p>Når spillet starter, får du en farge og terningen når det er din tur.</p>';
  }
  function renderLobby(v) {
    buildLobbyOnce();
    var host = S.mode === 'host', n = v.players.length;
    $('#l-count').textContent = n;
    $('#settings-card').hidden = !host; $('#summary-card').hidden = host; $('#addlocal').hidden = !host || n >= 4;
    $('#l-linkline').textContent = host ? 'Elevene går til denne siden (Deutschwelt → Challenges → Ärgere dich nicht) og velger «Jeg skal være med».' : 'Du er med i rommet.';
    $('#l-copy').hidden = !host;
    $('#l-colnote').textContent = n === 2 ? 'Med to spillere sitter dere mot hverandre: Rød og Grønn.' : 'Fargene fordeles når spillet starter (rød, blå, grønn, gul).';
    var ul = $('#plist'); ul.innerHTML = '';
    v.players.forEach(function (p, idx) {
      var li = document.createElement('li'), seat = seatFor(idx, n); li.style.setProperty('--pc', SEATS[seat].col);
      var me = (host ? p.local : p.id === S.myPid);
      li.innerHTML = '<span class="pcol" title="' + SEATS[seat].name + '"></span><span class="pi">' + p.icon + '</span><span class="pn">' + esc(p.name) + (me ? '<small>' + (host ? '(denne maskinen)' : '(deg)') + '</small>' : '') + '</span>' + (p.local ? '' : '<span class="dot ' + (p.conn ? 'on' : 'off') + '" title="' + (p.conn ? 'Tilkoblet' : 'Frakoblet') + '"></span>');
      if (host) { var x = document.createElement('button'); x.className = 'xbtn'; x.type = 'button'; x.title = 'Fjern spiller'; x.textContent = '✕'; x.addEventListener('click', function () { var cid = S.pid2conn[p.id]; S.engine.removePlayer(p.id); if (cid) { S.host.kick(cid); delete S.conn2pid[cid]; delete S.pid2conn[p.id]; } hostPush(); }); li.appendChild(x); }
      ul.appendChild(li);
    });
    if (!n) ul.innerHTML = '<li class="muted" style="display:block">Ingen spillere ennå – elevene kan bli med med koden, eller du kan legge til spillere på denne maskinen.</li>';
    if (host) {
      var st = v.settings, pools = S.engine.pools();
      function on(sel, key) { $$(sel + ' .chip').forEach(function (b) { b.classList.toggle('on', st[key].indexOf(b.getAttribute('data-k')) >= 0); }); }
      function seg(sel, val) { $$(sel + ' button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === String(val)); }); }
      on('#s-tasks', 'tasks'); on('#s-themes', 'themes'); on('#s-sets', 'sets'); on('#s-tenses', 'tenses');
      seg('#s-level', st.level); seg('#s-dir', st.transDir); seg('#s-mode', st.answerMode); seg('#s-pieces', st.pieces); seg('#s-start', st.start); seg('#s-time', st.time); seg('#s-minutes', st.minutes);
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
      $('#b-start').disabled = !n || !!bad;
      var ai = $('#al-icons'); if (ai._mark) ai._mark(S.alIcon);
    } else $('#s-summary').innerHTML = setSummary(v.settings);
  }

  /* =====================================================================
     BRETT
     ===================================================================== */
  function coord(seat, d, i) {
    if (d < 0) { var y = L.YARD[seat][i]; return [y[0], y[1]]; }
    if (d <= 39) { var c = L.RING[(L.START[seat] + d) % 40]; return [c[0] + .5, c[1] + .5]; }
    var l = L.LANE[seat][d - 40]; return [l[0] + .5, l[1] + .5];
  }
  function buildBoard() {
    var h = '', fill = {};
    L.START.forEach(function (s, seat) { fill[L.RING[s].join(',')] = seat; });
    L.LANE.forEach(function (lane, seat) { lane.forEach(function (c) { fill[c.join(',')] = seat; }); });
    h += '<rect x=".14" y=".14" width="10.72" height="10.72" fill="none" stroke="#1d1d1d" stroke-width=".05" rx=".25"/>';
    L.RING.forEach(function (c) { var sd = fill[c.join(',')]; h += '<circle cx="' + (c[0] + .5) + '" cy="' + (c[1] + .5) + '" r=".41" fill="' + (sd != null ? SEATS[sd].col : '#fff') + '" stroke="#1d1d1d" stroke-width=".06"/>'; });
    L.LANE.forEach(function (lane, seat) { lane.forEach(function (c) { h += '<circle cx="' + (c[0] + .5) + '" cy="' + (c[1] + .5) + '" r=".41" fill="' + SEATS[seat].col + '" stroke="#1d1d1d" stroke-width=".06"/>'; }); });
    L.START.forEach(function (s, seat) { var c = L.RING[s]; h += '<circle cx="' + (c[0] + .5) + '" cy="' + (c[1] + .5) + '" r=".27" fill="none" stroke="#fff" stroke-width=".07" opacity=".85"/>'; });
    L.YARD.forEach(function (ys, seat) { ys.forEach(function (y) { h += '<circle cx="' + y[0] + '" cy="' + y[1] + '" r=".46" fill="' + SEATS[seat].col + '" stroke="#1d1d1d" stroke-width=".06"/>'; }); });
    // midten: fire fargede kileformer
    var cx = 5.5, cy = 5.5, cols = [SEATS[0].col, SEATS[1].col, SEATS[2].col, SEATS[3].col];
    h += '<polygon points="' + cx + ',' + cy + ' ' + (cx - .42) + ',' + (cy - .42) + ' ' + (cx + .42) + ',' + (cy - .42) + '" fill="' + cols[0] + '"/><polygon points="' + cx + ',' + cy + ' ' + (cx + .42) + ',' + (cy - .42) + ' ' + (cx + .42) + ',' + (cy + .42) + '" fill="' + cols[1] + '"/><polygon points="' + cx + ',' + cy + ' ' + (cx + .42) + ',' + (cy + .42) + ' ' + (cx - .42) + ',' + (cy + .42) + '" fill="' + cols[2] + '"/><polygon points="' + cx + ',' + cy + ' ' + (cx - .42) + ',' + (cy + .42) + ' ' + (cx - .42) + ',' + (cy - .42) + '" fill="' + cols[3] + '"/><rect x="' + (cx - .42) + '" y="' + (cy - .42) + '" width=".84" height=".84" fill="none" stroke="#1d1d1d" stroke-width=".05"/>';
    // retningspiler
    [[7.45, 1.7, 'M7.2 1.3 L7.7 1.3 L7.45 1.95 Z'], [1.7, 3.55, 'M1.3 3.3 L1.3 3.8 L1.95 3.55 Z'], [9.3, 7.45, 'M9.7 7.2 L9.7 7.7 L9.05 7.45 Z'], [3.55, 9.3, 'M3.3 9.7 L3.8 9.7 L3.55 9.05 Z']].forEach(function (a) { h += '<path d="' + a[2] + '" fill="#1d1d1d" opacity=".55"/>'; });
    $('#bg').innerHTML = h; $('#toks').innerHTML = ''; $('#ylabs').innerHTML = ''; S.boardBuilt = true;
  }
  var YLAB = [[9.15, 3.45], [9.15, 7.55], [1.85, 7.55], [1.85, 3.45]];
  function renderYardLabels(v, cp) {
    var box = $('#ylabs'); var bySeat = {}; v.players.forEach(function (p) { bySeat[p.seat] = p; });
    var h = '';
    for (var s = 0; s < 4; s++) {
      var p = bySeat[s], pos = YLAB[s]; if (!p) continue;
      h += '<div class="ylab' + (cp && cp.id === p.id && v.phase === 'play' ? ' cur' : '') + '" style="--pc:' + SEATS[s].col + ';left:' + (pos[0] / 11 * 100) + '%;top:' + (pos[1] / 11 * 100) + '%">' + p.icon + ' ' + esc(p.name) + '</div>';
    }
    box.innerHTML = h;
  }
  function captureAt(v, p, to) {
    if (to > 39) return false; var r = (L.START[p.seat] + to) % 40, hit = false;
    v.players.forEach(function (q) { if (q.id === p.id) return; (q.pieces || []).forEach(function (d) { if (d >= 0 && d <= 39 && (L.START[q.seat] + d) % 40 === r) hit = true; }); });
    return hit;
  }
  function renderTokens(v) {
    var toks = $('#toks'), alive = {}, cp = (v.phase === 'play' && v.stage !== 'idle') ? curP(v) : null;
    var pickMoves = (v.stage === 'pick' && cp && iControl(v, cp.id) && v.cur) ? v.cur.moves : [];
    $$('.ltgt', toks).forEach(function (t) { t.remove(); });
    v.players.forEach(function (p, pi) {
      var arr = S.disp[p.id] || p.pieces || [];
      (p.pieces || []).forEach(function (real, i) {
        var d = arr[i] != null ? arr[i] : real, xy = coord(p.seat, d, i), key = p.id + ':' + i, el = toks.querySelector('.ltok[data-k="' + key + '"]');
        if (!el) { el = document.createElement('div'); el.className = 'ltok'; el.setAttribute('data-k', key); toks.appendChild(el); el.addEventListener('click', function () { if (el.classList.contains('pick')) { act('pick', parseInt(el.getAttribute('data-i'), 10)); } }); }
        el.setAttribute('data-i', i);
        if (el._ic !== p.icon || el._n !== i) { el.innerHTML = p.icon + '<span class="nb">' + (i + 1) + '</span>'; el._ic = p.icon; el._n = i; }
        el.style.setProperty('--pc', pcolor(p, pi)); el.title = p.name + ' – brikke ' + (i + 1);
        el.style.left = (xy[0] / 11 * 100) + '%'; el.style.top = (xy[1] / 11 * 100) + '%';
        el.classList.toggle('cur', !!(cp && cp.id === p.id && !pickMoves.length));
        var can = !!(cp && cp.id === p.id && pickMoves.some(function (m) { return m.i === i; }));
        el.classList.toggle('pick', can); alive[key] = 1;
      });
    });
    $$('.ltok', toks).forEach(function (el) { if (!alive[el.getAttribute('data-k')]) el.remove(); });
    if (pickMoves.length && cp) pickMoves.forEach(function (m) {
      var xy = coord(cp.seat, m.to, m.i), t = document.createElement('div'); t.className = 'ltgt'; t.style.setProperty('--pc', pcolor(cp));
      t.style.left = (xy[0] / 11 * 100) + '%'; t.style.top = (xy[1] / 11 * 100) + '%'; t.addEventListener('click', function () { act('pick', m.i); }); toks.appendChild(t);
    });
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
    buildGameOnce(); ensureTimers();
    if (!S.boardBuilt) buildBoard();
    var host = S.mode === 'host', p = curP(v);
    $('#g-skip').hidden = !host; $('#g-end').hidden = !host;
    $('#g-leave').textContent = host ? 'Avslutt rommet' : 'Forlat';
    var mine = v.players.filter(function (x) { return host ? x.local : x.id === S.myPid; });
    $('#g-role').textContent = host ? (mine.length ? 'Vert · ' + mine.map(function (x) { return x.icon; }).join(' ') : 'Vert (lærervisning)') : (mine[0] ? 'Du er ' + mine[0].icon + ' ' + mine[0].name + ' (' + SEATS[mine[0].seat].name.toLowerCase() + ')' : '');
    renderYardLabels(v, p); renderTokens(v); updateClock();
    var control = !!(p && iControl(v, p.id)), stage = v.stage, banner = $('#t-banner'), meta = $('#t-meta');
    if (v.phase === 'play' && p) {
      banner.className = 'turn' + (control ? ' me' : '');
      banner.innerHTML = '<span class="ti">' + p.icon + '</span><span>' + (control ? (host && !(mine.length === 1) ? esc(p.name) + ' – din tur!' : 'Din tur!') : esc(p.name) + ' sin tur') + ' <small class="muted" style="font-size:.7em">(' + SEATS[p.seat].name.toLowerCase() + ')</small></span>';
      var tk = (v.cur ? v.cur.tid : 0) + ':' + p.id + ':' + stage + ':' + v.turn;
      if (stage === 'roll') { if (S.dieVal) setDie(0); }
      if (stage === 'roll' && control && lastTurnKey !== tk) Snd.turn();
      lastTurnKey = tk;
      if (stage === 'roll') {
        meta.innerHTML = control ? '<button class="btn prim big yourturn" id="b-roll">🎲 Kast terningen</button>' : '<span class="muted">' + (p.conn || p.local ? 'Venter på at ' + esc(p.name) + ' skal kaste …' : esc(p.name) + ' har mistet kontakten – turen hoppes over snart …') + '</span>';
        var br = $('#b-roll'); if (br) br.addEventListener('click', function () { br.disabled = true; act('roll'); });
      } else if (v.cur) {
        var verb = v.cur.task && v.cur.task.k === 'verb';
        var rt = v.cur.die + (v.cur.die === 1 ? ' rute' : ' ruter');
        meta.innerHTML = '<b>' + v.cur.die + '</b>' + (verb ? ' → <b>' + PRON[v.cur.person] + '</b><br><span class="muted">og ' + rt + ' fram hvis du svarer riktig</span>' : '<br><span class="muted">' + rt + ' fram hvis du svarer riktig</span>');
        setDie(v.cur.die);
      }
    }
    renderPrompt(v, control);
    var pl = $('#pl'); pl.innerHTML = '';
    v.players.forEach(function (x, xi) {
      var d = document.createElement('div'); d.className = 'p' + (p && x.id === p.id && v.phase === 'play' ? ' cur' : ''); d.style.setProperty('--pc', pcolor(x, xi));
      d.innerHTML = '<span class="pc2"></span><span class="pi" style="border-color:' + pcolor(x, xi) + '">' + x.icon + '</span><span class="pn">' + esc(x.name) + (!x.conn && !x.local ? ' <small class="muted">(borte)</small>' : '') + '</span><span class="st">🏠 <b>' + x.home + '/' + x.pieces.length + '</b> · <b class="g">' + x.right + '✓</b> <b class="r">' + x.wrong + '✗</b>' + (x.caps ? ' · 😤' + x.caps : '') + '</span>';
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
  function moveText(v, p, m) {
    var cap = captureAt(v, p, m.to);
    var base = m.from < 0 ? 'ut på startfeltet' : (m.to >= 40 ? (m.from >= 40 ? 'flytt ' + (m.to - m.from) + ' i hjem-feltet' : 'inn i hjem-feltet') : 'flytt ' + (m.to - m.from) + (m.to - m.from === 1 ? ' rute' : ' ruter'));
    return 'Brikke ' + (m.i + 1) + ' – ' + base + (cap ? ' ⚔️ slår ut en motstander' : '');
  }
  function renderPrompt(v, control) {
    var card = $('#c-prompt'), c = v.cur, p = curP(v);
    if (v.phase !== 'play' || !c || (v.stage !== 'answer' && v.stage !== 'result' && v.stage !== 'pick') || (!c.task && !(v.last && v.last.none))) { card.hidden = true; S.promptKey = ''; return; }
    card.hidden = false;
    var key = c.tid + ':' + c.pid + ':' + v.stage + ':' + (v.stage === 'answer' ? '' : v.seq);
    if (key === S.promptKey) { if (v.stage === 'answer' && c.remaining != null) S.endAt = v._rx + c.remaining; return; }
    S.promptKey = key;
    var who = findP(v, c.pid), t = c.task;
    // ingen mulige trekk
    if (v.last && v.last.none) {
      card.innerHTML = '<div class="res bad"><b class="big">Ingen brikke kan flyttes</b><br>' + (who ? who.icon + ' ' + esc(who.name) : '') + ' kastet <b>' + c.die + '</b>.' + (v.last.again ? ' Du får prøve igjen.' : '') + '</div>';
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
        card.innerHTML = head + res + '<div class="muted" style="margin-top:8px"><b>Velg hvilken brikke du vil flytte</b> (klikk på brettet eller her):</div><div class="pbtns">' + c.moves.map(function (m) { return '<button type="button" data-i="' + m.i + '" style="--pc:' + pcolor(p) + '"><span class="dot2"></span>' + esc(moveText(v, p, m)) + '</button>'; }).join('') + '</div>';
        $$('.pbtns button', card).forEach(function (b) { b.addEventListener('click', function () { act('pick', parseInt(b.getAttribute('data-i'), 10)); }); });
      } else card.innerHTML = head + res + '<div class="muted" style="margin-top:8px">' + (who ? who.icon + ' ' + esc(who.name) : '') + ' velger brikke …</div>';
    } else {
      var L3 = v.last || {}, extra = '';
      if (L3.ok) {
        if (L3.cap) extra += '<br>😤 <b>Utslått!</b> ' + esc(L3.cap.name) + ' må tilbake til start-boksen.';
        if (v.winner && v.winner === c.pid) extra += '<br>🏁 <b>Alle brikkene er i hus!</b>';
        else if (L3.again) extra += '<br>🎲 <b>6-er!</b> Du får en ekstra tur.';
      }
      var solLine = esc((t.pr ? t.pr + ' ' : '') + L3.sol) + (L3.solNo && t.k !== 'verb' ? ' <span class="muted" style="font-weight:600">· ' + esc(L3.solNo) + '</span>' : '');
      var body;
      if (L3.ok) body = '<b class="big">✓ Riktig!</b> <span class="sol">' + solLine + '</span>' + (L3.near ? '<br><span class="muted">Husk å skrive ä/ö/ü/ß (æ/ø/å) riktig.</span>' : '') + extra;
      else body = '<b class="big">✗ ' + (L3.timeout ? 'Tiden gikk ut' : 'Ikke helt') + '</b><br>' + (L3.given ? 'Svar: <s>' + esc((t.pr ? t.pr + ' ' : '') + L3.given) + '</s><br>' : '') + 'Riktig: <span class="sol">' + solLine + '</span><br><span class="muted">Brikken blir stående.</span>';
      card.innerHTML = head + '<div class="muted" style="margin-bottom:6px">' + (who ? who.icon + ' ' + esc(who.name) : '') + '</div><div class="res ' + (L3.ok ? 'ok' : 'bad') + '">' + body + '</div><div style="margin-top:8px"><button class="btn sm" id="r-say" title="Hør tysk uttale">🔊 Hør</button></div>';
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
    $('#e-title').textContent = sm.why === 'win' ? '🏆 ' + (findP(v, v.winner) ? findP(v, v.winner).name : '') + ' vant!' : sm.why === 'time' ? '⏱ Tiden er ute' : '🏁 Spillet er avsluttet';
    var med = ['🥇', '🥈', '🥉', '4.'];
    $('#e-podium').innerHTML = sm.rank.slice(0, 4).map(function (r, i) { return '<div class="pp' + (i === 0 ? ' first' : '') + '" style="border-color:' + (i === 0 ? '' : SEATS[r.seat] ? SEATS[r.seat].col : '') + '"><div class="big">' + r.icon + '</div><div style="font-weight:800">' + med[i] + ' ' + esc(r.name) + '</div><div class="muted">' + (r.finished ? 'alle i hus' : r.home + ' av ' + r.total + ' hjemme') + '</div></div>'; }).join('');
    $('#e-table').innerHTML = '<tr><th>#</th><th>Spiller</th><th>Hjemme</th><th>Riktige</th><th>Feil</th><th>Treff</th><th>Beste rekke</th><th>Utslått</th></tr>' + sm.rank.map(function (r) { var t = r.right + r.wrong; return '<tr><td>' + r.rank + '</td><td>' + r.icon + ' ' + esc(r.name) + '</td><td>' + (r.finished ? '🏁 ' : '') + r.home + '/' + r.total + '</td><td>' + r.right + '</td><td>' + r.wrong + '</td><td>' + (t ? Math.round(r.right / t * 100) + ' %' : '–') + '</td><td>' + r.best + '</td><td>' + r.caps + ' / ' + r.kicked + '</td></tr>'; }).join('') + '';
    $('#e-hard').innerHTML = sm.hard.length ? sm.hard.slice(0, 14).map(hardItem).join('') : '<p class="muted">Ingen feil – imponerende! 🎉</p>';
    $('#e-again').hidden = !host; $('#e-wait').hidden = host; $('#e-leave').textContent = host ? 'Avslutt rommet' : 'Forlat';
  }
  function copyResult() {
    var v = S.view; if (!v || !v.summary) return; var sm = v.summary, out = 'Ärgere dich nicht – resultat\n\n';
    sm.rank.forEach(function (r) { out += r.rank + '. ' + r.name + ' ' + r.icon + ' – ' + r.home + '/' + r.total + ' hjemme, ' + r.right + ' riktige / ' + r.wrong + ' feil, slo ut ' + r.caps + '\n'; });
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
  window.__ludo = S; // for feilsøking
})();
