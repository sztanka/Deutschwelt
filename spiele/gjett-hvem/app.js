/* Deutschwelt — «Wer ist es?» (Gjett hvem): skjermer, nettverk og brett.
   Verten kjører spillmotoren (engine.js) og sender hver spiller sin egen utgave av tilstanden. Solo = motoren kjører lokalt uten nett. */
(function () {
  'use strict';
  var D = window.DWWerData, E = window.DWWerEngine, ART = window.DWWerArt, NET = window.DWNet;
  var ICONS = ['🙂', '😎', '🤓', '🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🐵', '🦄', '🐧', '🦉', '🐙', '🚀', '⚽'];
  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { } return null; }

  var role = null;               // 'host' | 'guest' | 'solo'
  var G = null, host = null, guest = null, conns = {};   // conns: connId -> key
  var myKey = 'host', snap = null, code = '';
  var cfg = { mode: 'duell', set: 'look', level: 'A1', dimHelp: 'knapp', guessRule: 'turn', maxQ: 20, lives: 3, auto: false, playSelf: true };
  var ui = { cat: null, a: [], op: 'und', free: false, guessing: false, cand: null, sel: null, dim: {}, autoFor: '', lastNote: '' };
  var myName = '', myIcon = ICONS[0];

  /* ---------------- hjelpere ---------------- */
  function show(id) { ['scr-home', 'scr-lobby', 'scr-game', 'scr-end'].forEach(function (x) { $('#' + x).hidden = x !== id; }); window.scrollTo(0, 0); }
  function toast(t) { var el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { el.hidden = true; }, 3200); }
  function iconPick(sel, cur, cb) {
    var box = $(sel); box.innerHTML = ''; ICONS.forEach(function (ic) { var b = document.createElement('button'); b.type = 'button'; b.className = 'ico' + (ic === cur ? ' on' : ''); b.textContent = ic; b.onclick = function () { cb(ic); iconPick(sel, ic, cb); }; box.appendChild(b); });
  }
  function charsOf() { return D.chars(snap ? snap.set : cfg.set); }
  function isDuell() { return snap && snap.mode === 'duell'; }

  /* ---------------- motor-kobling ---------------- */
  function view() { return G.snapshot(myKey); }
  function pushAll() {
    if (!G) return;
    Object.keys(conns).forEach(function (cid) { host.send(cid, { t: 'state', s: G.snapshot(conns[cid]) }); });
    snap = view(); render();
  }
  function act(m) {           // handling fra denne enheten
    if (role === 'guest') { guest.send(m); return; }
    var r = handle(myKey, m); if (r && r.err) toast(r.err); pushAll();
  }
  function handle(key, m) {
    switch (m.t) {
      case 'pick': return G.pick(key, m.id);
      case 'randomSecret': return key === 'host' ? G.randomSecret() : { err: 'Bare læreren.' };
      case 'ask': return G.ask(key, m.q);
      case 'answer': return G.answer(key, !!m.yes);
      case 'dim': return G.dim(key, m.id);
      case 'dimMany': return G.dimMany(key, m.ids || [], !!m.on);
      case 'guess': return G.guess(key, m.id);
      case 'endturn': return G.endTurn(key);
    }
    return { err: 'Ukjent handling.' };
  }

  /* ---------------- hjem / start ---------------- */
  function startSolo() {
    role = 'solo'; myKey = 'host';
    G = E.create({ mode: 'klasse', solo: true, auto: true, set: cfg.set, level: cfg.level, dimHelp: cfg.dimHelp, maxQ: cfg.maxQ, lives: cfg.lives });
    G.addPlayer('host', myName || 'Du', myIcon, true); snap = view(); showLobby();
  }
  function createRoom() {
    if (!window.Peer) { $('#h-nopeer').hidden = false; return; }
    role = 'host'; myKey = 'host'; conns = {};
    cfg.mode = 'duell'; G = E.create({ mode: 'duell', set: cfg.set, level: cfg.level });
    host = new NET.Host({
      onReady: function (c) { code = c; ss('dwwer-host', c); $('#l-code').textContent = c; $('#l-status').textContent = '🟢 Rom åpent'; },
      onError: function (m) { toast(m); $('#l-status').textContent = '🔴 ' + m; },
      onStatus: function (s) { $('#l-status').textContent = s === 'ok' ? '🟢 Rom åpent' : '🟠 Kobler til …'; },
      onJoin: function () { },
      onData: function (cid, m) { onGuestData(cid, m); },
      onClose: function (cid) { var k = conns[cid]; delete conns[cid]; if (k) { G.setOnline(k, false); pushAll(); } }
    });
    host.start();
    applyCfg(); snap = view(); showLobby();
  }
  function onGuestData(cid, m) {
    if (!m || !m.t) return;
    if (m.t === 'ping') return;
    if (m.t === 'hello') {
      var key = String(m.key || '').slice(0, 24) || cid;
      Object.keys(conns).forEach(function (c) { if (conns[c] === key && c !== cid) { delete conns[c]; } });
      var p = G.addPlayer(key, String(m.name || 'Spiller').slice(0, 14), m.icon);
      if (!p) { host.send(cid, { t: 'full', msg: G.S.mode === 'duell' ? 'Duellen er full eller har startet.' : 'Kunne ikke bli med.' }); return; }
      conns[cid] = key; pushAll(); return;
    }
    var key2 = conns[cid]; if (!key2) return;
    var r = handle(key2, m); if (r && r.err) host.send(cid, { t: 'err', msg: r.err });
    pushAll();
  }
  function joinRoom() {
    var c = NET.cleanCode($('#j-code').value), n = $('#j-name').value.trim();
    if (c.length !== 4) { $('#j-err').textContent = 'Skriv inn fire tegn.'; return; }
    if (!n) { $('#j-err').textContent = 'Skriv inn navnet ditt.'; return; }
    if (!window.Peer) { $('#j-err').textContent = 'Nettverksbiblioteket mangler.'; return; }
    $('#j-err').textContent = ''; role = 'guest'; code = c; myName = n;
    var key = ss('dwwer-key') || ('g' + Math.random().toString(36).slice(2, 10)); ss('dwwer-key', key); myKey = key;
    guest = new NET.Guest(c, {
      onOpen: function () { guest.send({ t: 'hello', key: key, name: n, icon: myIcon }); },
      onData: function (m) {
        if (m.t === 'state') { snap = m.s; render(); }
        else if (m.t === 'err') toast(m.msg);
        else if (m.t === 'full') { toast(m.msg); leave(); }
        else if (m.t === 'kick') { toast('Du ble fjernet fra rommet.'); leave(); }
      },
      onClose: function () { $('#g-status').textContent = '🔴 Frakoblet'; $('#l-status').textContent = '🔴 Frakoblet'; },
      onError: function (m, soft) { $('#j-err').textContent = m; if (!soft) toast(m); },
      onStatus: function (s) { var t = s === 'ok' ? '🟢 Tilkoblet' : s === 'down' ? '🔴 Frakoblet – prøver igjen …' : '🟠 Kobler til …'; $('#g-status').textContent = t; $('#l-status').textContent = t; }
    });
    guest.start();
    $('#j-err').textContent = 'Kobler til …';
  }
  function leave() { try { if (host) host.close(); } catch (e) { } try { if (guest) guest.close(); } catch (e) { } host = guest = G = null; conns = {}; snap = null; role = null; ui.dim = {}; show('scr-home'); }
  function applyCfg() {
    if (!G) return;
    G.configure({ mode: cfg.mode, set: cfg.set, level: cfg.level, dimHelp: cfg.dimHelp, guessRule: cfg.guessRule, maxQ: cfg.maxQ, lives: cfg.lives, auto: cfg.auto });
    // vert som spiller i duell
    var hasHost = G.S.players.some(function (p) { return p.key === 'host'; });
    if (role === 'host') {
      var want = cfg.mode === 'duell' && cfg.playSelf;
      if (want && !hasHost) { G.S.players.unshift({ key: 'host', name: myName || 'Lærer', icon: myIcon, online: true, secret: null, host: true }); if (G.S.players.length > 2) { var drop = G.S.players.filter(function (p) { return p.key !== 'host'; })[1]; if (drop) { host.kick(Object.keys(conns).filter(function (c) { return conns[c] === drop.key; })[0]); G.removePlayer(drop.key); } } }
      if (!want && hasHost) G.S.players = G.S.players.filter(function (p) { return p.key !== 'host'; });
    }
  }

  /* ---------------- lobby ---------------- */
  function showLobby() {
    show('scr-lobby');
    $('#l-hostonly').hidden = role === 'guest'; $('#l-guestwait').hidden = role !== 'guest';
    $('#l-codebox').hidden = role === 'solo';
    $('#row-mode').hidden = role !== 'host';
    $('#l-players-card').hidden = role === 'solo';
    $('#l-code').textContent = code || '----';
    if (role === 'host') iconPick('#l-icons', myIcon, function (ic) { myIcon = ic; var p = G.S.players.filter(function (x) { return x.key === 'host'; })[0]; if (p) p.icon = ic; pushAll(); });
    else $('#l-icons').innerHTML = '';
    renderLobby();
  }
  function seg(id, key, num) {
    var el = $(id); if (!el) return;
    $$(id + ' button').forEach(function (b) { b.classList.toggle('on', String(cfg[key]) === b.getAttribute('data-v')); });
  }
  function renderLobby() {
    if (!snap) return;
    if (role !== 'guest') {
      seg('#s-mode', 'mode'); seg('#s-set', 'set'); seg('#s-level', 'level'); seg('#s-dim', 'dimHelp'); seg('#s-guess', 'guessRule'); seg('#s-auto', 'auto'); seg('#s-maxq', 'maxQ'); seg('#s-lives', 'lives');
      $('#s-self').classList.toggle('on', cfg.playSelf);
      var duell = role === 'host' && cfg.mode === 'duell', klasse = role === 'solo' || cfg.mode === 'klasse';
      $('#r-self').hidden = !duell; $('#r-guess').hidden = !duell; $('#r-auto').hidden = !(role === 'host' && klasse); $('#r-maxq').hidden = !klasse; $('#r-lives').hidden = !klasse;
      $('#l-hint').textContent = role === 'solo' ? 'Datamaskinen velger en hemmelig person. Du stiller ja/nein-spørsmål og dimmer personer som ikke passer.' : duell ? 'To spillere, hver med en hemmelig person. Dere spør etter tur og svarer ja eller nein på tysk.' : 'Læreren (du) har en hemmelig person. Elevene spør etter tur – du svarer, eller velger «Automatisk».';
    } else {
      var s = snap; $('#l-summary').innerHTML = '<b>' + (s.mode === 'duell' ? '🕵️ Duell' : '👥 Klasse mot læreren') + '</b> · ' + (s.set === 'look' ? '😀 Utseende' : '📇 Personbeskrivelse') + ' · nivå ' + esc(s.level);
    }
    var list = $('#plist'); list.innerHTML = '';
    snap.players.forEach(function (p) {
      var li = document.createElement('li'); li.innerHTML = '<span class="pi">' + esc(p.icon) + '</span><span class="pn">' + esc(p.name) + (p.host ? ' <small>(vert)</small>' : '') + '</span><span class="dot ' + (p.online ? 'on' : 'off') + '"></span>';
      if (role === 'host' && !p.host) { var x = document.createElement('button'); x.className = 'xbtn'; x.textContent = '✕'; x.title = 'Fjern'; x.onclick = function () { var cid = Object.keys(conns).filter(function (c) { return conns[c] === p.key; })[0]; if (cid) host.kick(cid); G.removePlayer(p.key); delete conns[cid]; pushAll(); }; li.appendChild(x); }
      list.appendChild(li);
    });
    $('#l-count').textContent = snap.players.length;
    if (role !== 'guest') {
      var e = G.check(); $('#b-start').disabled = !!e; $('#s-err').textContent = e;
    }
  }

  /* ---------------- brett ---------------- */
  function cardHtml(c, set) {
    var inner;
    if (set === 'look') inner = '<div class="art">' + ART.face(c) + '</div>';
    else { var b = D.bioLines(c); inner = '<div class="art bio"><div class="av">' + D.bioAvatar(c) + '</div><div class="bl"><span>' + esc(b.l1) + '</span><span>' + esc(b.l2) + '</span><span>' + b.ic + ' ' + esc(b.l3) + '</span><span>' + (b.pi || '🚫') + ' ' + esc(b.l4) + '</span></div></div>'; }
    return inner + '<div class="nm">' + esc(c.name) + '</div>';
  }
  function dimSet() { return snap.mode === 'klasse' ? (snap.dim || []) : Object.keys(ui.dim).filter(function (k) { return ui.dim[k]; }).map(Number); }
  function renderBoard() {
    var bd = $('#bd'), cs = charsOf(), set = snap.set;
    if (bd.getAttribute('data-sig') !== snap.set + ':' + snap.round) {
      bd.setAttribute('data-sig', snap.set + ':' + snap.round); bd.innerHTML = '';
      cs.forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.className = 'wc'; b.setAttribute('data-id', c.id); b.innerHTML = cardHtml(c, set); b.onclick = function () { onCard(c.id); }; bd.appendChild(b); });
    }
    var dm = dimSet(), mine = snap.me.secret, end = snap.phase === 'end';
    $$('#bd .wc').forEach(function (b) {
      var id = +b.getAttribute('data-id');
      b.classList.toggle('dim', dm.indexOf(id) >= 0);
      b.classList.toggle('mine', mine != null && mine === id);
      b.classList.toggle('cand', ui.cand === id);
      b.classList.toggle('sel', ui.sel === id);
      b.classList.toggle('reveal', end && (snap.result && snap.result.secret === id || (isDuell() && snap.players.some(function (p) { return p.secret === id; }))));
    });
    $('#bd').classList.toggle('guessing', ui.guessing || snap.phase === 'pick'); $('#bd').classList.toggle('bio', set === 'bio');
  }
  function onCard(id) {
    if (!snap) return;
    if (snap.phase === 'pick') {
      var canPick = (isDuell() && snap.me.secret == null || isDuell() && true) || snap.me.teacher;
      if ((isDuell() && snap.players.some(function (p) { return p.key === myKey; })) || snap.me.teacher) { ui.sel = id; renderBoard(); renderSide(); }
      return;
    }
    if (snap.phase !== 'play') return;
    if (ui.guessing && snap.me.role === 'asker') { ui.cand = id; renderBoard(); renderSide(); return; }
    // dimming
    if (isDuell()) { ui.dim[id] = !ui.dim[id]; renderBoard(); }
    else if (snap.me.role === 'asker' || (snap.solo && snap.me.role === 'asker') || snap.me.teacher) act({ t: 'dim', id: id });
  }

  /* ---------------- side-panel ---------------- */
  function chip(label, on, cb, cls) { var b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (on ? ' on' : '') + (cls ? ' ' + cls : ''); b.innerHTML = label; b.onclick = cb; return b; }
  function renderSide() {
    var s = snap, r = s.me.role, el = $('#c-turn'), pr = $('#c-prompt'), cs = charsOf();
    pr.hidden = true; pr.innerHTML = '';
    var turnP = s.players.filter(function (p) { return p.key === s.turnKey; })[0];
    var h = '';
    if (s.phase === 'pick') {
      if (s.mode === 'duell') {
        var meP = s.players.filter(function (p) { return p.key === myKey; })[0];
        if (meP && !meP.ready) h = '<div class="turn me"><span class="ti">🤫</span>Velg din hemmelige person</div><p class="muted">Klikk på personen du vil være. Motstanderen skal gjette hvem det er!</p>' + (ui.sel != null ? '<div class="selbox">' + miniCard(cs[ui.sel]) + '<button class="btn prim" id="b-pick">Velg ' + esc(cs[ui.sel].name) + '</button></div>' : '<p class="muted">Ingen valgt ennå.</p>');
        else h = '<div class="turn"><span class="ti">⏳</span>Venter på motstanderen …</div>' + (s.me.secret != null ? '<div class="selbox">' + miniCard(cs[s.me.secret]) + '<div class="muted">Din hemmelige person</div></div>' : '');
      } else if (s.me.teacher) {
        h = '<div class="turn me"><span class="ti">🤫</span>Velg en hemmelig person</div><p class="muted">Klassen skal finne ut hvem det er ved å stille ja/nein-spørsmål.</p>' + (ui.sel != null ? '<div class="selbox">' + miniCard(cs[ui.sel]) + '<button class="btn prim" id="b-pick">Velg ' + esc(cs[ui.sel].name) + '</button></div>' : '') + '<div style="margin-top:10px"><button class="btn gold" id="b-rand">🎲 Velg tilfeldig</button></div>';
      } else h = '<div class="turn"><span class="ti">⏳</span>Læreren velger en hemmelig person …</div>';
    } else if (s.phase === 'play') {
      h = turnHead(s, turnP);
    } else h = '<div class="turn">Spillet er over</div>';
    el.innerHTML = h;
    var bp = $('#b-pick'); if (bp) bp.onclick = function () { act({ t: 'pick', id: ui.sel }); ui.sel = null; };
    var br = $('#b-rand'); if (br) br.onclick = function () { act({ t: 'randomSecret' }); };
    if (s.phase !== 'play') { $('#c-log').hidden = false; return; }
    // spørsmål-/svar-panel
    if (r === 'asker') renderAsk(pr);
    else if (r === 'answerer') renderAnswer(pr);
    else if (r === 'waitAnswer') { pr.hidden = false; pr.innerHTML = '<h3>Ditt spørsmål</h3><div class="qbig">' + esc(s.q.text) + '</div><p class="muted">Venter på svar …</p>'; }
    else if (s.q) { pr.hidden = false; pr.innerHTML = '<h3>' + (s.q.status === 'wait' ? 'Spørsmål' : 'Siste spørsmål') + '</h3><div class="qbig">' + esc(s.q.text) + '</div>' + (s.q.status === 'answered' ? '<div class="res ' + (s.q.yes ? 'ok' : 'bad') + '"><span class="sol">' + esc(s.q.sentence) + '</span></div>' + (s.q.corrected && (isDuell() && s.me.role === 'waitTurn') ? '<p class="muted">Du svarte feil – svaret er rettet til det som stemmer.</p>' : '') : '<p class="muted">Venter på svar …</p>') + helpDim(s); }
    if (s.me.role === 'teacher' && !s.q) { pr.hidden = false; pr.innerHTML = '<h3>Din hemmelige person</h3><div class="selbox">' + (s.me.secret != null ? miniCard(cs[s.me.secret]) : '') + '</div><p class="muted">Venter på at ' + esc(turnP ? turnP.name : 'neste elev') + ' stiller et spørsmål …</p>'; }
  }
  function turnHead(s, turnP) {
    var r = s.me.role, h = '', me = turnP && turnP.key === myKey;
    var info = s.mode === 'klasse' ? '<div class="pills"><span class="pill">❓ ' + s.qCount + '/' + s.maxQ + '</span><span class="pill">' + new Array(Math.max(0, s.livesLeft) + 1).join('❤️') + new Array(Math.max(0, s.lives - s.livesLeft) + 1).join('🤍') + '</span></div>' : '';
    if (r === 'asker') h = '<div class="turn me yourturn"><span class="ti">' + esc(turnP.icon) + '</span>Din tur!</div>';
    else if (r === 'waitAnswer') h = '<div class="turn"><span class="ti">💬</span>Du har spurt …</div>';
    else if (r === 'answerer') h = '<div class="turn me yourturn"><span class="ti">💬</span>Svar på spørsmålet</div>';
    else h = '<div class="turn"><span class="ti">' + esc(turnP ? turnP.icon : '⏳') + '</span>' + esc(turnP ? turnP.name : '') + ' sin tur</div>';
    return h + info;
  }
  function helpDim(s) {
    if (s.mode !== 'klasse' || !(s.me.role === 'asker' || s.me.teacher)) return '';
    return '';
  }
  function miniCard(c) { return '<div class="mini"><div class="art">' + (snap.set === 'look' ? ART.face(c) : '<div class="av big">' + D.bioAvatar(c) + '</div>') + '</div><div class="nm">' + esc(c.name) + '</div></div>'; }

  function renderAsk(pr) {
    var s = snap; pr.hidden = false;
    var cats = D.categories(s.set, s.level), human = s.mode === 'duell' || (!s.solo && !s.auto);
    var canAsk = !s.asked && !(s.mode === 'klasse' && s.qCount >= s.maxQ);
    var h = '';
    if (s.q && s.q.status === 'answered') {
      h += '<h3>Svaret</h3><div class="qbig sm">' + esc(s.q.text) + '</div><div class="res ' + (s.q.yes ? 'ok' : 'bad') + '"><span class="sol">' + esc(s.q.sentence) + '</span></div>';
      if (s.q.free == null) h += '<div class="row" style="margin-top:8px">' + (s.dimHelp === 'knapp' ? '<button class="btn sm gold" id="b-autodim">🪄 Dimm de som ikke passer</button>' : '') + '</div>';
    }
    if (ui.guessing) {
      h += '<h3 style="margin-top:12px">🎯 Gjett personen</h3><p class="muted">Klikk på personen du tror det er.</p>' + (ui.cand != null ? '<div class="selbox">' + miniCard(charsOf()[ui.cand]) + '<button class="btn prim" id="b-guessgo">Gjett på ' + esc(charsOf()[ui.cand].name) + '!</button></div>' : '') + '<div style="margin-top:8px"><button class="btn sm" id="b-guesscancel">Avbryt</button></div>';
      pr.innerHTML = h; bindAsk(); return;
    }
    if (canAsk) {
      h += '<h3 style="margin-top:' + (s.q ? 12 : 0) + 'px">Still et spørsmål</h3>';
      h += '<div class="tabs"><button class="tab' + (!ui.free ? ' on' : '') + '" id="t-build">🧩 Bygg spørsmål</button>' + (human ? '<button class="tab' + (ui.free ? ' on' : '') + '" id="t-free">✍️ Skriv selv</button>' : '') + '</div>';
      if (!ui.free) {
        h += '<div class="chips" id="q-cats"></div><div class="chips vals" id="q-vals"></div>';
        h += '<div id="q-b2"></div>';
        h += '<div class="qprev" id="q-prev"></div><div class="row"><button class="btn prim" id="b-ask" disabled>Spør!</button><span class="muted" id="q-no"></span></div>';
      } else {
        h += '<p class="muted">Skriv et ja/nein-spørsmål på tysk. Motstanderen svarer ja eller nein.</p><input type="text" id="q-free" maxlength="120" placeholder="Hat die Person …?" style="width:100%"><div class="row" style="margin-top:8px"><button class="btn prim" id="b-askfree">Spør!</button></div>';
      }
      h += '<details class="tips"><summary>💡 Hvordan spør jeg?</summary><div>Et ja/nein-spørsmål på tysk starter med <b>verbet</b>: <i>Hat die Person …?</i> (har), <i>Ist die Person …?</i> (er), <i>Trägt die Person …?</i> (bærer/har på seg), <i>Wohnt die Person in …?</i> (bor). Svaret er <i>Ja, sie/er …</i> eller <i>Nein, sie/er …</i>.' + (s.level === 'B1' ? ' På B1 kan du sette to egenskaper sammen med <b>und</b> (begge stemmer) eller <b>oder</b> (minst én stemmer).' : '') + '</div></details>';
    } else if (s.mode === 'klasse' && s.qCount >= s.maxQ) h += '<p class="muted"><b>Alle spørsmålene er brukt.</b> Nå kan du bare gjette!</p>';
    h += '<div class="row" style="margin-top:12px"><button class="btn gold" id="b-guess">🎯 Gjett personen</button>' + (s.asked ? '<button class="btn" id="b-end">✔ Ferdig – neste tur</button>' : '') + '</div>';
    pr.innerHTML = h; bindAsk();
  }
  function curQ() { var a = ui.a.slice(0, snap.level === 'B1' ? 2 : 1); return a.length ? { a: a, op: ui.op } : null; }
  function bindAsk() {
    var s = snap, set = s.set;
    var ad = $('#b-autodim'); if (ad) ad.onclick = function () { dimByQ(s.q); };
    var g = $('#b-guess'); if (g) g.onclick = function () { ui.guessing = true; ui.cand = null; renderBoard(); renderSide(); };
    var gc = $('#b-guesscancel'); if (gc) gc.onclick = function () { ui.guessing = false; ui.cand = null; renderBoard(); renderSide(); };
    var gg = $('#b-guessgo'); if (gg) gg.onclick = function () { var id = ui.cand; ui.guessing = false; ui.cand = null; act({ t: 'guess', id: id }); };
    var be = $('#b-end'); if (be) be.onclick = function () { act({ t: 'endturn' }); };
    var tb = $('#t-build'); if (tb) tb.onclick = function () { ui.free = false; renderSide(); };
    var tf = $('#t-free'); if (tf) tf.onclick = function () { ui.free = true; renderSide(); };
    var af = $('#b-askfree'); if (af) af.onclick = function () { var v = $('#q-free').value.trim(); if (v.length < 2) return; act({ t: 'ask', q: { free: v } }); };
    var cats = $('#q-cats'); if (!cats) return;
    var cl = D.categories(set, s.level); if (!ui.cat || !cl.some(function (c) { return c.id === ui.cat; })) ui.cat = cl[0].id;
    cl.forEach(function (c) { cats.appendChild(chip(c.icon + ' ' + c.label, ui.cat === c.id, function () { ui.cat = c.id; renderSide(); })); });
    var vals = $('#q-vals'), atoms = D.atoms(set, ui.cat);
    atoms.forEach(function (a) { var lbl = a.cat === 'smile' ? 'lächelt' : a.cat === 'gender' ? a.q : a.v + ' ' + a.q; vals.appendChild(chip(esc(lbl), ui.a.indexOf(a.id) >= 0, function () { pickAtom(a.id); }, 'val')); });
    if (s.level === 'B1') {
      var b2 = $('#q-b2'); b2.innerHTML = '<div class="muted" style="margin:8px 0 2px">Valgt: ' + (ui.a.length ? ui.a.map(function (id) { var a = D.allAtoms(set)[id]; return '<span class="tagx">' + esc(a.v + ' ' + a.q) + '</span>'; }).join(' ') : 'ingenting ennå') + '. Velg opptil to egenskaper (fra samme eller ulike kategorier).</div>' + (ui.a.length > 1 ? '<div class="seg"><button data-v="und" class="' + (ui.op === 'und' ? 'on' : '') + '">und</button><button data-v="oder" class="' + (ui.op === 'oder' ? 'on' : '') + '">oder</button></div> <button class="btn sm" id="b-clr">Nullstill</button>' : (ui.a.length ? '<button class="btn sm" id="b-clr">Nullstill</button>' : ''));
      $$('#q-b2 .seg button').forEach(function (b) { b.onclick = function () { ui.op = b.getAttribute('data-v'); renderSide(); }; });
      var cl2 = $('#b-clr'); if (cl2) cl2.onclick = function () { ui.a = []; renderSide(); };
    }
    var q = curQ(), prev = $('#q-prev'), ask = $('#b-ask');
    if (q) { prev.innerHTML = '<div class="qbig">' + esc(D.text(set, q)) + '</div><div class="muted">' + esc(D.textNo(set, q)) + '</div>'; ask.disabled = false; ask.onclick = function () { var qq = curQ(); ui.a = []; act({ t: 'ask', q: qq }); }; }
    else prev.innerHTML = '<div class="muted">Velg en kategori og en egenskap, så dukker spørsmålet opp her.</div>';
  }
  function pickAtom(id) {
    var max = snap.level === 'B1' ? 2 : 1, i = ui.a.indexOf(id);
    if (i >= 0) ui.a.splice(i, 1); else { if (ui.a.length >= max) ui.a.shift(); ui.a.push(id); }
    renderSide();
  }
  function renderAnswer(pr) {
    var s = snap, q = s.q, secret = s.me.secret != null ? charsOf()[s.me.secret] : null; pr.hidden = false;
    var a = D.answers(s.set, q.free != null ? { free: q.free } : { a: q.a, op: q.op }, secret || { g: 'f' });
    var no = q.free != null ? '' : D.textNo(s.set, { a: q.a, op: q.op });
    pr.innerHTML = '<h3>' + esc(q.fromName) + ' spør:</h3><div class="qbig">' + esc(q.text) + '</div>' + (no ? '<div class="muted">' + esc(no) + '</div>' : '') +
      (secret ? '<div class="selbox" style="margin:10px 0">' + miniCard(secret) + '<div class="muted">' + (s.me.teacher ? 'Den hemmelige personen' : 'Din hemmelige person') + (s.me.teacher && q.truth != null ? '<br><b>Fasit: ' + (q.truth ? 'Ja' : 'Nein') + '</b>' : '') + '</div></div>' : '') +
      '<div class="ansbtns"><button class="btn ansy" data-y="1">' + esc(a.yes) + '</button><button class="btn ansn" data-y="0">' + esc(a.no) + '</button></div><p class="muted">Se på personen og velg setningen som stemmer.</p>';
    $$('.ansbtns button').forEach(function (b) { b.onclick = function () { act({ t: 'answer', yes: b.getAttribute('data-y') === '1' }); }; });
  }
  function dimByQ(q) {
    if (!q || q.free != null) return;
    var ids = charsOf().filter(function (c) { return D.evalQ(snap.set, { a: q.a, op: q.op }, c) !== q.yes; }).map(function (c) { return c.id; });
    if (isDuell()) { ids.forEach(function (i) { ui.dim[i] = true; }); renderBoard(); }
    else act({ t: 'dimMany', ids: ids, on: true });
  }

  /* ---------------- spillere / logg / slutt ---------------- */
  function renderPlayers() {
    var s = snap, box = $('#pl'); box.innerHTML = '';
    s.players.forEach(function (p) {
      var cur = p.key === s.turnKey && s.phase === 'play', d = document.createElement('div'); d.className = 'p' + (cur ? ' cur' : '');
      d.innerHTML = '<span class="pi" style="--pc:#ccc">' + esc(p.icon) + '</span><span class="pn">' + esc(p.name) + (p.key === myKey ? ' (deg)' : '') + '</span><span class="st">' + (s.phase === 'pick' && s.mode === 'duell' ? (p.ready ? '✅' : '⏳') : '') + (p.online ? '' : '🔴') + '</span>';
      box.appendChild(d);
    });
    $('#c-players').hidden = s.solo;
    var lg = $('#log'); lg.innerHTML = ''; s.log.slice().reverse().forEach(function (l) { var d = document.createElement('div'); d.className = l.k === 'ok' ? 'ok' : l.k === 'no' ? 'bad' : l.k === 'sys' ? 'sys' : ''; d.textContent = l.t; lg.appendChild(d); });
  }
  function renderEnd() {
    var s = snap, r = s.result || {}, cs = charsOf();
    var title, sub = '';
    if (r.aborted) title = '🏁 Spillet ble avsluttet';
    else if (s.mode === 'duell') { var w = s.players.filter(function (p) { return p.key === r.win; })[0]; title = w ? (w.key === myKey ? '🏆 Du vant!' : '🏆 ' + esc(w.name) + ' vant!') : '🏁 Ferdig'; sub = r.lostBy ? esc((s.players.filter(function (p) { return p.key === r.lostBy; })[0] || {}).name || '') + ' gjettet feil.' : ''; }
    else if (r.win) { title = s.solo ? '🎉 Du fant ham/henne!' : '🎉 ' + esc(r.winName) + ' gjettet riktig!'; sub = 'Spørsmål brukt: ' + r.questions; }
    else { title = '😅 Ikke denne gangen'; sub = 'Alle livene er brukt.'; }
    $('#e-title').innerHTML = title; $('#e-sub').textContent = sub;
    var reveal = []; if (s.mode === 'duell') s.players.forEach(function (p) { if (p.secret != null) reveal.push({ who: p.name, c: cs[p.secret] }); }); else if (r.secret != null) reveal.push({ who: 'Den hemmelige personen', c: cs[r.secret] });
    $('#e-reveal').innerHTML = reveal.map(function (x) { return '<div class="selbox">' + miniCard(x.c) + '<div class="muted">' + esc(x.who) + '</div></div>'; }).join('');
    $('#e-again').hidden = role === 'guest'; $('#e-wait').hidden = role !== 'guest';
    if (r.win && (r.win === myKey || (s.mode === 'klasse' && !r.aborted)) && window.__confetti !== false) { /* ingen konfetti nødvendig */ }
  }

  /* ---------------- hoved-render ---------------- */
  function render() {
    if (!snap) return;
    if (snap.phase === 'lobby') { ui.dim = {}; ui.sel = null; ui.guessing = false; ui.cand = null; ui.a = []; ui.autoFor = ''; if (role === 'guest') { show('scr-lobby'); $('#l-hostonly').hidden = true; $('#l-guestwait').hidden = false; $('#l-codebox').hidden = false; $('#row-mode').hidden = true; $('#l-code').textContent = code; $('#l-players-card').hidden = false; } renderLobby(); if ($('#scr-lobby').hidden) showLobby(); return; }
    if (snap.phase === 'end') { show('scr-end'); renderEnd(); $('#e-code').textContent = code || '—'; return; }
    if ($('#scr-game').hidden) { show('scr-game'); ui.dim = {}; ui.sel = null; }
    $('#g-code').textContent = code || 'solo'; $('#g-codepill').hidden = role === 'solo';
    $('#g-role').textContent = snap.me.teacher ? '🎓 Lærer' : snap.solo ? '🕵️ Solo' : snap.mode === 'duell' ? '🕵️ Duell' : '👥 Klasse';
    if (role === 'host' || role === 'solo') { $('#g-status').textContent = role === 'solo' ? '💻 Lokalt' : '🟢 Rom åpent'; }
    $('#g-end').hidden = role === 'guest'; $('#g-skip').hidden = !(role === 'host' && snap.mode === 'klasse' && snap.phase === 'play');
    // auto-dimming i duell / ved svar
    var sig = snap.round + ':' + snap.qCount;
    if (snap.dimHelp === 'auto' && isDuell() && snap.q && snap.q.status === 'answered' && snap.q.from === myKey && ui.autoFor !== sig) { ui.autoFor = sig; dimByQ(snap.q); }
    renderBoard(); renderSide(); renderPlayers();
    var lg = $('#boardnote'); lg.textContent = snap.phase === 'pick' ? 'Klikk på en person for å velge.' : (isDuell() ? 'Klikk på en person for å dimme/vise henne igjen – bare du ser dimmingen din.' : 'Den som spør, klikker på personer for å dimme dem. Alle ser det.');
  }

  /* ---------------- init ---------------- */
  function bindSeg(id, key, num, after) {
    var el = $(id); if (!el) return;
    el.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return; var v = b.getAttribute('data-v');
      if (key === 'auto') cfg.auto = v === 'true'; else cfg[key] = num ? parseInt(v, 10) : v;
      if (role === 'solo') { G.configure({ set: cfg.set, level: cfg.level, dimHelp: cfg.dimHelp, maxQ: cfg.maxQ, lives: cfg.lives }); snap = view(); }
      else if (role === 'host') { applyCfg(); pushAll(); }
      renderLobby();
    });
  }
  function init() {
    iconPick('#j-icons', myIcon, function (ic) { myIcon = ic; });
    iconPick('#h-icons', myIcon, function (ic) { myIcon = ic; });
    $('#h-name').oninput = function () { myName = this.value.trim().slice(0, 14); };
    $('#h-create').onclick = function () { myName = $('#h-name').value.trim().slice(0, 14) || 'Lærer'; createRoom(); };
    $('#h-solo').onclick = function () { myName = $('#h-name').value.trim().slice(0, 14) || 'Du'; startSolo(); };
    $('#j-go').onclick = joinRoom;
    $('#j-code').addEventListener('input', function () { this.value = NET.cleanCode(this.value); });
    $('#j-code').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#j-name').focus(); });
    $('#j-name').addEventListener('keydown', function (e) { if (e.key === 'Enter') joinRoom(); });
    bindSeg('#s-mode', 'mode'); bindSeg('#s-set', 'set'); bindSeg('#s-level', 'level'); bindSeg('#s-dim', 'dimHelp'); bindSeg('#s-guess', 'guessRule'); bindSeg('#s-auto', 'auto'); bindSeg('#s-maxq', 'maxQ', true); bindSeg('#s-lives', 'lives', true);
    $('#s-self').onclick = function () { cfg.playSelf = !cfg.playSelf; applyCfg(); pushAll(); };
    $('#b-start').onclick = function () {
      var r;
      if (role === 'solo') { G.configure({ set: cfg.set, level: cfg.level, dimHelp: cfg.dimHelp, maxQ: cfg.maxQ, lives: cfg.lives }); r = G.start(); snap = view(); render(); return; }
      applyCfg(); r = G.start(); if (r.err) { $('#s-err').textContent = r.err; return; } pushAll();
    };
    $('#l-leave').onclick = leave; $('#g-leave').onclick = leave; $('#e-leave').onclick = leave;
    $('#g-end').onclick = function () { if (confirm('Avslutte spillet nå?')) { G.hostEnd(); pushAll(); } };
    $('#g-skip').onclick = function () { G.skipTurn(); pushAll(); };
    $('#e-again').onclick = function () { G.toLobby(); ui.dim = {}; pushAll(); if (role === 'solo') { snap = view(); showLobby(); } };
    $('#l-copy').onclick = function () { var u = location.origin + location.pathname + '?rom=' + code; try { navigator.clipboard.writeText(u); toast('Lenke kopiert'); } catch (e) { toast(u); } };
    var m = /[?&]rom=([A-Za-z0-9]{4})/.exec(location.search); if (m) { $('#j-code').value = m[1].toUpperCase(); }
    if (!window.Peer) $('#h-nopeer').hidden = false;
    window.__wer = { get snap() { return snap; }, get G() { return G; }, act: act, get role() { return role; } };
  }
  init();
})();
