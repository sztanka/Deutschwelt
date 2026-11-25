/* Deutschwelt — Verb-Stigespill: nettverkslag (PeerJS / WebRTC)
   Verten registrerer en «peer» med id  dwstige-<KODE>  hos PeerJS sin gratis signaltjeneste; spillerne kobler seg direkte til verten.
   Selve spilldataene går ikke via noen server. Alle meldinger er enkle JSON-objekter  {t:'...'}.
   Egen server / TURN (hvis skolenettet blokkerer): sett window.DW_PEER_OPTIONS før net.js lastes, f.eks.
     window.DW_PEER_OPTIONS = {host:'min-peerserver.example', port:443, secure:true, path:'/', config:{iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'turn:…',username:'…',credential:'…'}]}};
   For testing kan  ?peer=localhost:9000  brukes i adressen (lokal peerjs-server). */
(function () {
  'use strict';
  var PREFIX = 'dwstige-';
  var ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function baseOptions() {
    var o = {};
    var ext = window.DW_PEER_OPTIONS; if (ext) for (var k in ext) o[k] = ext[k];
    var m = /[?&]peer=([^&]+)/.exec(location.search);
    if (m) { var hp = decodeURIComponent(m[1]).split(':'); o.host = hp[0]; o.port = parseInt(hp[1] || '9000', 10); o.path = '/'; o.secure = false; }
    if (o.debug == null) o.debug = 0;
    return o;
  }
  function newCode() { var s = ''; for (var i = 0; i < 4; i++) s += ALPHA.charAt(Math.floor(Math.random() * ALPHA.length)); return s; }
  function cleanCode(c) { return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); }

  /* ---------- VERT ---------- */
  function Host(cb) {
    // cb: onReady(code), onError(msg), onJoin(connId, conn), onData(connId, msg), onClose(connId), onStatus(txt)
    var self = this, tries = 0, conns = {}, peer = null, code = '', closed = false;
    self.code = '';
    function open(wantCode) {
      code = wantCode || newCode();
      peer = new window.Peer(PREFIX + code, baseOptions());
      peer.on('open', function () { self.code = code; cb.onStatus && cb.onStatus('ok'); cb.onReady(code); });
      peer.on('error', function (e) {
        if (e && e.type === 'unavailable-id') {
          if (tries++ < (wantCode ? 12 : 8)) { try { peer.destroy(); } catch (x) { } setTimeout(function () { open(wantCode ? code : null); }, wantCode ? 2500 : 50); }
          else cb.onError('Kunne ikke opprette rommet. Prøv igjen om litt.');
        } else if (e && (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error' || e.type === 'socket-closed')) {
          cb.onStatus && cb.onStatus('down');
        } else if (e && e.type !== 'peer-unavailable') { cb.onError('Nettverksfeil: ' + (e.type || e.message || e)); }
      });
      peer.on('disconnected', function () { cb.onStatus && cb.onStatus('down'); if (!closed) { setTimeout(function () { try { peer.reconnect(); } catch (x) { } }, 1500); } });
      peer.on('connection', function (conn) {
        conn.on('open', function () {
          conns[conn.peer] = conn;
          cb.onJoin(conn.peer, conn);
        });
        conn.on('data', function (d) { cb.onData(conn.peer, d, conn); });
        conn.on('close', function () { if (conns[conn.peer] === conn) { delete conns[conn.peer]; cb.onClose(conn.peer); } });
        conn.on('error', function () { if (conns[conn.peer] === conn) { delete conns[conn.peer]; cb.onClose(conn.peer); } });
      });
    }
    self.start = function (wantCode) { open(wantCode ? cleanCode(wantCode) : null); };
    self.send = function (id, msg) { var c = conns[id]; if (c && c.open) { try { c.send(msg); } catch (e) { } } };
    self.broadcast = function (msg) { for (var id in conns) self.send(id, msg); };
    self.kick = function (id) { var c = conns[id]; if (c) { try { c.send({ t: 'kick' }); } catch (e) { } setTimeout(function () { try { c.close(); } catch (e) { } }, 200); } };
    self.close = function () { closed = true; try { peer.destroy(); } catch (e) { } };
  }

  /* ---------- GJEST ---------- */
  function Guest(code, cb) {
    // cb: onOpen(), onData(msg), onClose(), onError(msg), onStatus(txt)
    var self = this, peer = null, conn = null, closed = false, retry = null, lastRx = 0, hbTimer = null;
    code = cleanCode(code);
    function connect() {
      if (closed) return;
      cb.onStatus && cb.onStatus('connecting');
      try { if (peer) peer.destroy(); } catch (e) { }
      peer = new window.Peer(undefined, baseOptions());
      peer.on('open', function () {
        conn = peer.connect(PREFIX + code, { reliable: true, serialization: 'json' });
        var opened = false;
        conn.on('open', function () { opened = true; lastRx = Date.now(); cb.onStatus && cb.onStatus('ok'); cb.onOpen(); });
        conn.on('data', function (d) { lastRx = Date.now(); cb.onData(d); });
        conn.on('close', function () { if (opened) { cb.onClose(); } schedule(); });
        conn.on('error', function () { schedule(); });
      });
      peer.on('error', function (e) {
        if (e && e.type === 'peer-unavailable') { cb.onError('Fant ikke rommet «' + code + '». Sjekk koden — og at læreren har åpnet rommet.', true); schedule(); }
        else if (e && (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error' || e.type === 'socket-closed')) { cb.onStatus && cb.onStatus('down'); schedule(); }
        else cb.onError('Nettverksfeil: ' + ((e && (e.type || e.message)) || e), false);
      });
      peer.on('disconnected', function () { /* signaltjenesten; datakanalen kan leve videre */ });
    }
    function schedule() {
      if (closed || retry) return;
      cb.onStatus && cb.onStatus('down');
      retry = setTimeout(function () { retry = null; connect(); }, 3000);
    }
    self.start = function () {
      connect();
      hbTimer = setInterval(function () {
        if (conn && conn.open) { try { conn.send({ t: 'ping' }); } catch (e) { } if (lastRx && Date.now() - lastRx > 16000) { lastRx = 0; try { conn.close(); } catch (e) { } cb.onClose(); schedule(); } }
      }, 5000);
    };
    self.send = function (msg) { if (conn && conn.open) { try { conn.send(msg); return true; } catch (e) { } } return false; };
    self.isOpen = function () { return !!(conn && conn.open); };
    self.close = function () { closed = true; clearInterval(hbTimer); clearTimeout(retry); try { peer.destroy(); } catch (e) { } };
  }

  window.DWNet = { Host: Host, Guest: Guest, cleanCode: cleanCode, newCode: newCode };
})();
