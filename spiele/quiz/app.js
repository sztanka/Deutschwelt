/* Deutschwelt — Quiz-Arena: skjermer, nett (PeerJS), lærer-editor og rapport.
   Læreren er vert og kjører motoren (engine.js). Elevene får bare sin egen utgave av tilstanden (uten fasit før de har svart). */
(function () {
  'use strict';
  var E = window.DWQuizEngine, NET = window.DWNet, BANK = window.DWQuizBank;
  var ICONS = ['🙂', '😎', '🤓', '🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🐵', '🦄', '🐧', '🦉', '🐙', '🚀', '⚽', '🐯', '🐨', '🦖', '🐝'];
  var MODES = {
    gold: { name: 'Schatzsuche', icon: '💰', desc: 'Riktig svar gir tre kister. Samle flest mynter – men se opp for tyver og storm!' },
    race: { name: 'Rennen', icon: '🏁', desc: 'Hvert riktige svar flytter deg ett felt (to ved tre riktige på rad). Først i mål vinner.' },
    castle: { name: 'Burgverteidigung', icon: '🏰', desc: 'Hele klassen forsvarer borgen sammen. Riktige svar skader monstrene som kommer i bølger.' }
  };
  var KINDS = { c1: ['🪙', '+1 mynt'], c3: ['💰', '+3 mynter'], c5: ['💎', '+5 mynter'], c10: ['👑', '+10 mynter'], thief: ['🦹', 'Tyv!'], storm: ['⛈️', 'Storm!'], double: ['✨', 'Dobbelt opp!'], empty: ['🕸️', 'Tom kiste'] };
  var OPTCOL = ['#e53935', '#1e88e5', '#43a047', '#fb8c00'];
  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { } return null; }
  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } return null; }
  function uid() { return 's' + Math.random().toString(36).slice(2, 9); }
  function show(id) { ['scr-home', 'scr-sets', 'scr-edit', 'scr-lobby', 'scr-host', 'scr-play', 'scr-end'].forEach(function (x) { $('#' + x).hidden = x !== id; }); window.scrollTo(0, 0); }
  function toast(t) { var el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { el.hidden = true; }, 3200); }
  function mmss(ms) { var s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  var role = null, G = null, host = null, guest = null, conns = {}, code = '', myIcon = ICONS[0], myName = '';
  var chosen = null;                       // valgt sett (lærer)
  var cfg = { mode: 'gold', order: 'random', timeLimit: 20, duration: 8, goal: 20, waves: 6, difficulty: 'normal', hp: 20 };
  var gs = null, gsAt = 0;                 // siste elev-tilstand og når den kom
  var hv = null;                           // vertens visning
  var tickTimer = null, pushTimer = null, edit = null;

  /* ============ sett (lagring) ============ */
  function mySets() { var a = ls('dwquiz-sets-v1'); return Array.isArray(a) ? a : []; }
  function saveSets(a) { ls('dwquiz-sets-v1', a); }
  function upsert(set) { var a = mySets(), i = a.findIndex(function (x) { return x.id === set.id; }); set.updated = Date.now(); if (i >= 0) a[i] = set; else a.unshift(set); saveSets(a); }
  function download(name, text, type) { var b = new Blob([text], { type: type || 'application/json' }), u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 500); }
  function cleanForSave(s) { var c = E.cleanSet(s); return { id: s.id || uid(), title: c.title, desc: s.desc || '', qs: c.qs }; }

  /* ============ sett-skjerm ============ */
  var setsTab = 'mine';
  function showSets() { show('scr-sets'); renderSets(); }
  function setCard(s, kind) {
    var n = (s.qs || []).length, d = document.createElement('div'); d.className = 'setcard';
    d.innerHTML = '<div class="sc-main"><b>' + esc(s.title) + '</b><div class="muted">' + n + ' spørsmål' + (s.desc ? ' · ' + esc(s.desc) : '') + '</div></div>';
    var row = document.createElement('div'); row.className = 'row';
    function btn(t, cls, cb) { var b = document.createElement('button'); b.className = 'btn sm ' + (cls || ''); b.textContent = t; b.onclick = cb; row.appendChild(b); }
    btn('▶ Bruk', 'prim', function () { chosen = cleanForSave(s); startHosting(); });
    if (kind === 'mine') { btn('✏️ Rediger', '', function () { openEdit(s); }); btn('⬇ Eksport', '', function () { download((s.title || 'quiz').replace(/[^\wæøåÆØÅäöüÄÖÜ-]+/g, '_') + '.json', JSON.stringify(cleanForSave(s), null, 1)); }); btn('🗑', '', function () { if (confirm('Slette «' + s.title + '»?')) { saveSets(mySets().filter(function (x) { return x.id !== s.id; })); renderSets(); } }); }
    else btn('📋 Kopier til mine', '', function () { var c = cleanForSave(s); c.id = uid(); upsert(c); toast('Kopiert til «Mine sett»'); });
    d.appendChild(row); return d;
  }
  function renderSets() {
    $$('#sets-tabs .tab').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === setsTab); });
    $('#sets-mine').hidden = setsTab !== 'mine'; $('#sets-bank').hidden = setsTab !== 'bank'; $('#sets-gen').hidden = setsTab !== 'gen';
    if (setsTab === 'mine') {
      var box = $('#mine-list'); box.innerHTML = ''; var a = mySets();
      if (!a.length) box.innerHTML = '<p class="muted">Du har ingen egne sett ennå. Lag et nytt, importer en fil, eller kopier et ferdig sett.</p>';
      a.forEach(function (s) { box.appendChild(setCard(s, 'mine')); });
    } else if (setsTab === 'bank') {
      var bb = $('#bank-list'); bb.innerHTML = ''; var cat = '';
      BANK.SETS.forEach(function (s) { if (s.cat !== cat) { cat = s.cat; var h = document.createElement('h3'); h.className = 'cat'; h.textContent = cat === 'Muntlig' ? '🗣️ Muntlige temaer' : '🧩 Grammatikk'; bb.appendChild(h); } bb.appendChild(setCard(s, 'bank')); });
    } else renderGen();
  }

  /* ---- generator fra ordlister ---- */
  var gen = { tasks: ['oversett', 'artikkel'], themes: ['n', 's'], sets: ['svake', 'sterke'], tenses: ['praesens'], dir: 'begge', mode: 'velg', level: 'A2', n: 20 };
  var GL = { tasks: { oversett: '🌍 Oversettelse', artikkel: '📘 Artikler', pronomen: '👤 Pronomen og eiendomsord', verb: '🔧 Verbbøying' }, themes: { n: 'Mat, dyr og natur', s: 'Skole, hverdag og reise', g: 'Allmenne ord', o: 'Byer, land og geografi' }, sets: { svake: 'Svake verb', sterke: 'Sterke verb', modal: 'Modalverb', hjelp: 'sein/haben/werden/wissen', trennbare: 'Trennbare', refleksive: 'Refleksive' }, tenses: { praesens: 'Presens', praeteritum: 'Präteritum', perfekt: 'Perfekt' } };
  function renderGen() {
    function chips(id, key) { var b = $(id); b.innerHTML = ''; Object.keys(GL[key]).forEach(function (k) { var c = document.createElement('button'); c.type = 'button'; c.className = 'chip' + (gen[key].indexOf(k) >= 0 ? ' on' : ''); c.textContent = GL[key][k]; c.onclick = function () { var i = gen[key].indexOf(k); if (i >= 0) { if (gen[key].length > 1) gen[key].splice(i, 1); } else gen[key].push(k); renderGen(); }; b.appendChild(c); }); }
    chips('#g-tasks', 'tasks'); chips('#g-themes', 'themes'); chips('#g-sets', 'sets'); chips('#g-tenses', 'tenses');
    $$('#g-dir button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === gen.dir); });
    $$('#g-mode button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === gen.mode); });
    $$('#g-level button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === gen.level); });
    $$('#g-n button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === String(gen.n)); });
    var has = function (k) { return gen.tasks.indexOf(k) >= 0; };
    $('#g-words').hidden = !(has('oversett') || has('artikkel')); $('#g-trans').hidden = !(has('oversett') || has('pronomen')); $('#g-verbs').hidden = !has('verb');
  }
  function makeGenerated() {
    var L = window.DWLudo, V = window.dwVerben || [];
    if (!L) { toast('Generatoren kunne ikke lastes.'); return null; }
    var s = L.defaults(); s.tasks = gen.tasks; s.themes = gen.themes; s.sets = gen.sets; s.tenses = gen.tenses; s.level = gen.level; s.transDir = gen.dir; s.answerMode = gen.mode; s.reqArt = false; s.help = false;
    var tasks = L.makeTasks(V, s, gen.n, Math.floor(Math.random() * 90000) + 10000, null), qs = BANK.fromTasks(tasks);
    if (qs.length < 4) { toast('For få oppgaver med disse valgene.'); return null; }
    return { id: uid(), title: 'Ordtrening ' + gen.level + ' – ' + new Date().toLocaleDateString('nb-NO'), desc: gen.tasks.map(function (k) { return GL.tasks[k].replace(/^\S+\s/, ''); }).join(', '), qs: qs };
  }

  /* ============ editor ============ */
  function openEdit(s) { edit = JSON.parse(JSON.stringify(s || { id: uid(), title: 'Nytt sett', desc: '', qs: [{ t: 'mc', q: '', o: ['', '', '', ''], c: 0, sh: true }] })); if (!edit.qs) edit.qs = []; show('scr-edit'); renderEdit(); }
  function blankQ(t) { return t === 'tf' ? { t: 'tf', q: '', c: true } : t === 'type' ? { t: 'type', q: '', a: [''] } : { t: 'mc', q: '', o: ['', '', '', ''], c: 0, sh: true }; }
  function renderEdit() {
    $('#ed-title').value = edit.title || '';
    var box = $('#ed-list'); box.innerHTML = '';
    edit.qs.forEach(function (q, i) {
      var d = document.createElement('div'); d.className = 'edq';
      var h = '<div class="edq-h"><b>' + (i + 1) + '.</b><select data-k="t" data-i="' + i + '"><option value="mc"' + (q.t === 'mc' ? ' selected' : '') + '>Flervalg</option><option value="tf"' + (q.t === 'tf' ? ' selected' : '') + '>Wahr / Falsch</option><option value="type"' + (q.t === 'type' ? ' selected' : '') + '>Skriv svaret</option></select><span class="grow"></span><button class="xbtn" data-act="up" data-i="' + i + '" title="Opp">▲</button><button class="xbtn" data-act="down" data-i="' + i + '" title="Ned">▼</button><button class="xbtn" data-act="dup" data-i="' + i + '" title="Dupliser">⧉</button><button class="xbtn" data-act="del" data-i="' + i + '" title="Slett">✕</button></div>';
      h += '<input type="text" class="wide" data-k="q" data-i="' + i + '" value="' + esc(q.q) + '" placeholder="Spørsmålet (gjerne på tysk)">';
      if (q.t === 'mc') {
        h += '<div class="opts">' + (q.o || []).map(function (o, j) { return '<div class="opt"><label title="Riktig svar"><input type="radio" name="c' + i + '" data-k="c" data-i="' + i + '" data-j="' + j + '"' + (q.c === j ? ' checked' : '') + '></label><input type="text" data-k="o" data-i="' + i + '" data-j="' + j + '" value="' + esc(o) + '" placeholder="Alternativ ' + (j + 1) + '"></div>'; }).join('') + '</div><div class="muted">Velg sirkelen ved riktig svar. Alternativene blandes automatisk' + ((q.o || []).length < 4 ? ' · <a href="#" data-act="addopt" data-i="' + i + '">+ legg til alternativ</a>' : '') + '.</div>';
      } else if (q.t === 'tf') {
        h += '<div class="seg"><button data-act="tf" data-i="' + i + '" data-v="1" class="' + (q.c ? 'on' : '') + '">Wahr er riktig</button><button data-act="tf" data-i="' + i + '" data-v="0" class="' + (!q.c ? 'on' : '') + '">Falsch er riktig</button></div>';
      } else {
        h += '<input type="text" class="wide" data-k="a" data-i="' + i + '" value="' + esc((q.a || []).join(' ; ')) + '" placeholder="Godkjente svar, skilt med semikolon (f.eks. Bruder ; der Bruder)"><div class="muted">Store/små bokstaver og ä = ae, ö = oe, ü = ue, ß = ss godtas.</div>';
      }
      h += '<input type="text" class="wide sm" data-k="n" data-i="' + i + '" value="' + esc(q.n || '') + '" placeholder="Hint / norsk støtte (valgfritt)">';
      d.innerHTML = h; box.appendChild(d);
    });
    $('#ed-count').textContent = edit.qs.length + ' spørsmål';
  }
  function bindEdit() {
    $('#ed-title').oninput = function () { edit.title = this.value; };
    $('#ed-list').addEventListener('input', function (ev) {
      var el = ev.target, k = el.getAttribute('data-k'), i = +el.getAttribute('data-i'); if (!k || isNaN(i)) return; var q = edit.qs[i];
      if (k === 'q') q.q = el.value; else if (k === 'n') q.n = el.value; else if (k === 'o') q.o[+el.getAttribute('data-j')] = el.value; else if (k === 'a') q.a = el.value.split(';').map(function (x) { return x.trim(); }).filter(Boolean); else if (k === 'c' && el.checked) q.c = +el.getAttribute('data-j');
    });
    $('#ed-list').addEventListener('change', function (ev) { var el = ev.target; if (el.getAttribute('data-k') === 't') { var i = +el.getAttribute('data-i'), old = edit.qs[i], nq = blankQ(el.value); nq.q = old.q; nq.n = old.n; edit.qs[i] = nq; renderEdit(); } });
    $('#ed-list').addEventListener('click', function (ev) {
      var el = ev.target.closest('[data-act]'); if (!el) return; ev.preventDefault(); var a = el.getAttribute('data-act'), i = +el.getAttribute('data-i');
      if (a === 'del') edit.qs.splice(i, 1); else if (a === 'dup') edit.qs.splice(i + 1, 0, JSON.parse(JSON.stringify(edit.qs[i]))); else if (a === 'up' && i > 0) { var t = edit.qs[i]; edit.qs[i] = edit.qs[i - 1]; edit.qs[i - 1] = t; } else if (a === 'down' && i < edit.qs.length - 1) { var t2 = edit.qs[i]; edit.qs[i] = edit.qs[i + 1]; edit.qs[i + 1] = t2; } else if (a === 'tf') edit.qs[i].c = el.getAttribute('data-v') === '1'; else if (a === 'addopt') edit.qs[i].o.push('');
      renderEdit();
    });
    $$('#ed-add button').forEach(function (b) { b.onclick = function () { edit.qs.push(blankQ(b.getAttribute('data-v'))); renderEdit(); var l = $$('#ed-list .edq'); if (l.length) l[l.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' }); }; });
    $('#ed-save').onclick = function () { var c = cleanForSave(edit); if (!c.qs.length) { toast('Settet må ha minst ett fullstendig spørsmål.'); return; } c.title = (edit.title || '').trim() || 'Quiz'; var dropped = edit.qs.length - c.qs.length; upsert(c); toast('Lagret' + (dropped > 0 ? ' (' + dropped + ' ufullstendige spørsmål ble hoppet over)' : '')); setsTab = 'mine'; showSets(); };
    $('#ed-cancel').onclick = function () { showSets(); };
    $('#ed-paste').onclick = function () {
      var txt = $('#ed-bulk').value, n = 0;
      txt.split(/\r?\n/).forEach(function (line) {
        line = line.trim(); if (!line) return; var tp = /^T:\s*/i.test(line); if (tp) line = line.replace(/^T:\s*/i, '');
        var f = line.split(/\s*;\s*|\t/).filter(function (x) { return x.length; }); if (f.length < 2) return;
        var q;
        if (tp) q = { t: 'type', q: f[0], a: f.slice(1) };
        else if (f.length === 2 && /^(wahr|falsch|richtig|sant|usant)$/i.test(f[1])) q = { t: 'tf', q: f[0], c: /^(wahr|richtig|sant)$/i.test(f[1]) };
        else q = { t: 'mc', q: f[0], o: f.slice(1, 5), c: 0, sh: true };
        edit.qs.push(q); n++;
      });
      $('#ed-bulk').value = ''; renderEdit(); toast(n + ' spørsmål lagt til');
    };
  }

  /* ============ vert / elev ============ */
  function startHosting() {
    if (!window.Peer) { toast('Nettverksbiblioteket kunne ikke lastes.'); return; }
    role = 'host'; conns = {}; G = E.create(chosen, cfg); code = '';
    host = new NET.Host({
      onReady: function (c) { code = c; $('#l-code').textContent = c; $('#l-status').textContent = '🟢 Rom åpent'; $('#h-code').textContent = c; },
      onError: function (m) { toast(m); $('#l-status').textContent = '🔴 ' + m; },
      onStatus: function (s) { $('#l-status').textContent = s === 'ok' ? '🟢 Rom åpent' : '🟠 Kobler til …'; },
      onJoin: function () { },
      onData: onGuestData,
      onClose: function (cid) { var k = conns[cid]; delete conns[cid]; if (k) { G.setOnline(k, false); refreshHost(); } }
    });
    host.start(); $('#l-title').textContent = chosen.title + ' (' + chosen.qs.length + ' spørsmål)';
    showLobby(); clearInterval(tickTimer); tickTimer = setInterval(hostTick, 1000);
  }
  function hostTick() {
    if (!G) return; var before = G.S.seq; G.tick(Date.now());
    var ph = G.S.phase; refreshHost();
    if (ph === 'play') { var n = Math.floor(Date.now() / 1000); if (n % 2 === 0 || G.S.seq !== before) pushAll(); }
    if (ph === 'end' && !hostTick.ended) { hostTick.ended = true; pushAll(); }
    if (ph !== 'end') hostTick.ended = false;
  }
  function pushTo(cid) { if (host && conns[cid]) host.send(cid, { t: 'state', s: G.snapshot(conns[cid], Date.now()) }); }
  function pushAll() { Object.keys(conns).forEach(pushTo); }
  function onGuestData(cid, m) {
    if (!m || !m.t || m.t === 'ping') return;
    if (m.t === 'hello') {
      var key = String(m.key || '').slice(0, 24) || cid; Object.keys(conns).forEach(function (c) { if (conns[c] === key && c !== cid) delete conns[c]; });
      var p = G.addPlayer(key, String(m.name || 'Elev').slice(0, 14), m.icon); if (!p) { host.send(cid, { t: 'full', msg: 'Rommet er fullt.' }); return; }
      conns[cid] = key; pushAll(); refreshHost(); return;
    }
    var key2 = conns[cid]; if (!key2) return; var r;
    if (m.t === 'ans') r = G.answer(key2, { i: m.i, text: m.text }, Date.now());
    else if (m.t === 'next') r = G.next(key2, Date.now());
    else if (m.t === 'chest') r = G.chest(key2, m.i, Date.now());
    else if (m.t === 'timeout') r = G.timeout(key2, Date.now());
    if (r && r.err) host.send(cid, { t: 'err', msg: r.err });
    pushTo(cid); refreshHost();
  }
  function joinRoom() {
    var c = NET.cleanCode($('#j-code').value), n = $('#j-name').value.trim();
    if (c.length !== 4) { $('#j-err').textContent = 'Skriv inn fire tegn.'; return; } if (!n) { $('#j-err').textContent = 'Skriv inn navnet ditt.'; return; }
    if (!window.Peer) { $('#j-err').textContent = 'Nettverksbiblioteket mangler.'; return; }
    role = 'guest'; code = c; myName = n; var key = ss('dwquiz-key') || uid(); ss('dwquiz-key', key);
    guest = new NET.Guest(c, {
      onOpen: function () { guest.send({ t: 'hello', key: key, name: n, icon: myIcon }); },
      onData: function (m) { if (m.t === 'state') { gs = m.s; gsAt = Date.now(); renderGuest(); } else if (m.t === 'err') toast(m.msg); else if (m.t === 'full') { toast(m.msg); leave(); } else if (m.t === 'kick') { toast('Du ble fjernet fra rommet.'); leave(); } },
      onClose: function () { setStatus('🔴 Frakoblet'); },
      onError: function (m, soft) { $('#j-err').textContent = m; if (!soft) toast(m); },
      onStatus: function (s) { setStatus(s === 'ok' ? '🟢 Tilkoblet' : s === 'down' ? '🔴 Frakoblet – prøver igjen …' : '🟠 Kobler til …'); }
    });
    guest.start(); $('#j-err').textContent = 'Kobler til …';
  }
  function setStatus(t) { $$('.stat').forEach(function (e) { e.textContent = t; }); }
  function leave() { try { if (host) host.close(); } catch (e) { } try { if (guest) guest.close(); } catch (e) { } clearInterval(tickTimer); clearInterval(uiTimer); host = guest = G = null; conns = {}; gs = hv = null; role = null; show('scr-home'); }
  function guestSend(m) { if (guest) guest.send(m); }

  /* ============ lobby ============ */
  function showLobby() { show('scr-lobby'); $('#l-hostonly').hidden = role !== 'host'; $('#l-guestwait').hidden = role === 'host'; $('#l-codebox').hidden = false; renderLobby(); }
  function seg(id, key) { $$(id + ' button').forEach(function (b) { b.classList.toggle('on', String(cfg[key]) === b.getAttribute('data-v')); }); }
  function renderLobby() {
    if (role === 'host') {
      var v = G.hostView(Date.now());
      seg('#s-mode', 'mode'); seg('#s-order', 'order'); seg('#s-time', 'timeLimit'); seg('#s-dur', 'duration'); seg('#s-goal', 'goal'); seg('#s-waves', 'waves'); seg('#s-diff', 'difficulty');
      $('#s-modedesc').textContent = MODES[cfg.mode].icon + ' ' + MODES[cfg.mode].desc;
      $('#r-dur').hidden = cfg.mode === 'castle'; $('#r-goal').hidden = cfg.mode !== 'race'; $('#r-castle').hidden = cfg.mode !== 'castle';
      var list = $('#plist'); list.innerHTML = '';
      v.players.slice().sort(function (a, b) { return a.name < b.name ? -1 : 1; }).forEach(function (p) {
        var li = document.createElement('li'); li.innerHTML = '<span class="pi">' + esc(p.icon) + '</span><span class="pn">' + esc(p.name) + '</span><span class="dot ' + (p.online ? 'on' : 'off') + '"></span>';
        var x = document.createElement('button'); x.className = 'xbtn'; x.textContent = '✕'; x.title = 'Fjern'; x.onclick = function () { var cid = Object.keys(conns).filter(function (c) { return conns[c] === p.key; })[0]; if (cid) { host.kick(cid); delete conns[cid]; } G.removePlayer(p.key); renderLobby(); }; li.appendChild(x); list.appendChild(li);
      });
      $('#l-count').textContent = v.players.length; var e = G.check(); $('#b-start').disabled = !!e; $('#s-err').textContent = e && v.players.length ? e : '';
      if (!v.players.length) $('#s-err').textContent = 'Vent til minst én elev har gått inn …';
    } else if (gs) {
      $('#l-summary').innerHTML = '<b>' + esc(gs.title) + '</b> · ' + MODES[gs.mode].icon + ' ' + MODES[gs.mode].name + '<br>' + gs.count + ' ' + (gs.count === 1 ? 'spiller' : 'spillere') + ' i rommet';
      $('#l-code').textContent = code; $('#l-status').textContent = $('#l-status').textContent || '';
    }
  }
  function refreshHost() {
    if (role !== 'host' || !G) return;
    var ph = G.S.phase;
    if (ph === 'lobby') { if ($('#scr-lobby').hidden) showLobby(); else renderLobby(); }
    else if (ph === 'play') { if ($('#scr-host').hidden) show('scr-host'); renderHostLive(); }
    else if (ph === 'end') { if ($('#scr-end').hidden || !$('#scr-end').getAttribute('data-r')) { show('scr-end'); $('#scr-end').setAttribute('data-r', '1'); renderReport(); } }
  }

  /* ============ lærer: live ============ */
  function modeBox(v, big) {
    if (v.mode === 'castle' && v.castle) {
      var c = v.castle, mon = c.mon;
      return '<div class="castle"><div class="cs-l"><div class="cs-ic">🏰</div><div class="bar"><i style="width:' + Math.round(100 * c.hp / c.max) + '%;background:' + (c.hp / c.max > .5 ? '#43a047' : c.hp / c.max > .25 ? '#fb8c00' : '#c62828') + '"></i></div><div class="muted">Borg: ' + c.hp + '/' + c.max + '</div></div><div class="cs-m">' + (mon ? '<div class="cs-ic mon">' + ['👹', '👺', '🐲', '👾', '🧟', '🦖', '🐉', '😈'][(c.wave - 1) % 8] + '</div><div class="bar mb"><i style="width:' + Math.round(100 * mon.hp / mon.max) + '%"></i></div><div class="muted">Bølge ' + c.wave + '/' + c.waves + ' · ' + mon.hp + '/' + mon.max + ' liv</div>' : '<div class="cs-ic">🎉</div>') + '</div></div>';
    }
    if (v.mode === 'race') return '<div class="muted">Første til felt ' + v.goal + ' vinner.</div>';
    return '';
  }
  function raceRows(players, goal, meKey) {
    return '<div class="lanes">' + players.slice(0, 40).map(function (p) { var pct = Math.round(100 * p.pos / goal); return '<div class="lane' + (p.me ? ' me' : '') + '"><span class="ln">' + esc(p.name) + '</span><div class="trk"><span class="fl">🏁</span><div class="runner" style="left:calc(' + pct + '% * .92)">' + esc(p.icon) + '</div></div><span class="lp">' + (p.fin ? '🏆' + p.fin : p.pos + '/' + goal) + '</span></div>'; }).join('') + '</div>';
  }
  function renderHostLive() {
    hv = G.hostView(Date.now());
    $('#h-code').textContent = code || '----'; $('#h-title').textContent = hv.title + ' · ' + MODES[hv.mode].icon + ' ' + MODES[hv.mode].name;
    $('#h-clock').textContent = hv.left ? '⏱ ' + mmss(hv.left) : (hv.mode === 'castle' ? '' : '');
    $('#h-clock').hidden = !hv.left;
    var box = $('#h-mode'); box.innerHTML = modeBox(hv);
    if (hv.mode === 'race') box.innerHTML += raceRows(hv.players.map(function (p) { return { name: p.name, icon: p.icon, pos: p.pos, fin: p.fin }; }), hv.goal);
    var t = $('#h-table'); t.innerHTML = '<tr><th>#</th><th>Elev</th><th>' + (hv.mode === 'gold' ? 'Mynter' : hv.mode === 'race' ? 'Felt' : 'Skade') + '</th><th>Riktig</th><th>Rekke</th></tr>' + hv.players.map(function (p) { return '<tr' + (p.online ? '' : ' class="off"') + '><td>' + p.rank + '</td><td>' + esc(p.icon) + ' ' + esc(p.name) + '</td><td><b>' + (hv.mode === 'race' ? (p.fin ? '🏆' + p.fin : p.pos) : p.score) + '</b></td><td>' + p.correct + '/' + p.answered + (p.acc != null ? ' (' + p.acc + '%)' : '') + '</td><td>' + (p.streak ? '🔥' + p.streak : '') + '</td></tr>'; }).join('');
    var f = $('#h-feed'); f.innerHTML = hv.feed.slice().reverse().map(function (x) { return '<div class="' + (x.k === 'ok' ? 'ok' : x.k === 'bad' ? 'bad' : 'sys') + '">' + esc(x.t) + '</div>'; }).join('');
    $('#h-count').textContent = hv.players.filter(function (p) { return p.online; }).length + ' elever online';
  }

  /* ============ elev: spillskjerm ============ */
  var uiTimer = null;
  function renderGuest() {
    if (!gs) return;
    if (gs.phase === 'lobby') { showLobby(); return; }
    if (gs.phase === 'end') { show('scr-end'); renderFinal(); return; }
    if ($('#scr-play').hidden) show('scr-play');
    drawPlay();
  }
  function drawPlay() {
    var s = gs, me = s.me; if (!me) return;
    $('#p-name').textContent = me.icon + ' ' + me.name;
    $('#p-score').innerHTML = s.mode === 'race' ? '🏁 ' + me.pos + '/' + s.goal : s.mode === 'gold' ? '💰 ' + me.score : '⚔️ ' + me.score;
    $('#p-rank').textContent = '#' + me.rank + (me.streak >= 2 ? ' · 🔥' + me.streak : '');
    $('#p-clock').hidden = !s.left; if (s.left) $('#p-clock').textContent = '⏱ ' + mmss(Math.max(0, s.left - (Date.now() - gsAt)));
    var mb = $('#p-mode'); mb.innerHTML = s.mode === 'castle' ? modeBox(s) : s.mode === 'race' ? raceRows(s.board.map(function (b) { return { name: b.name, icon: b.icon, pos: b.pos, fin: b.fin, me: b.me }; }), s.goal) : '';
    $('#p-mode-wrap').hidden = !mb.innerHTML; var nt = (s.notes || []); if (nt.length) toast(nt.join(' '));
    var q = s.q, qa = $('#p-q');
    if (!q) { qa.innerHTML = s.me.fin ? '<div class="qbox"><h2>🏆 I mål som nr. ' + me.fin + '!</h2><p class="muted">Vent mens de andre fullfører …</p></div>' : '<div class="qbox"><h2>Venter …</h2></div>'; }
    else qa.innerHTML = qHtml(q);
    bindQ(q);
    $('#p-board').innerHTML = s.mode === 'castle' ? '' : '<h3>Toppliste</h3>' + s.board.map(function (b) { return '<div class="br' + (b.me ? ' me' : '') + '"><span>' + b.rank + '</span><span>' + esc(b.icon) + ' ' + esc(b.name) + '</span><b>' + (s.mode === 'race' ? (b.fin ? '🏆' + b.fin : b.pos) : b.score) + '</b></div>'; }).join('');
    $('#p-feed').innerHTML = (s.feed || []).slice().reverse().map(function (x) { return '<div class="' + (x.k === 'ok' ? 'ok' : x.k === 'bad' ? 'bad' : 'sys') + '">' + esc(x.t) + '</div>'; }).join('');
  }
  function qHtml(q) {
    var h = '<div class="qbox"><div class="qnum">Spørsmål ' + q.idx + '</div>';
    if (q.status === 'open' && q.total) h += '<div class="tbar"><i id="p-tbar" style="width:' + Math.round(100 * q.left / q.total) + '%"></i></div>';
    h += '<h2 class="qtext">' + esc(q.text) + '</h2>' + (q.n ? '<div class="muted qn">' + esc(q.n) + '</div>' : '');
    if (q.status === 'open') {
      if (q.t === 'type') h += '<div class="row"><input type="text" id="p-ans" class="wide" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Skriv svaret …"><button class="btn prim" id="p-send">Svar</button></div><div class="keys">' + ['ä', 'ö', 'ü', 'ß'].map(function (c) { return '<button type="button" class="kb" data-c="' + c + '">' + c + '</button>'; }).join('') + '</div>';
      else h += '<div class="optg' + (q.t === 'tf' ? ' two' : '') + '">' + q.opts.map(function (o, i) { return '<button class="opt-b" data-i="' + i + '" style="--oc:' + OPTCOL[i % 4] + '">' + esc(o) + '</button>'; }).join('') + '</div>';
    } else {
      var r = q.result;
      if (q.t !== 'type') h += '<div class="optg' + (q.t === 'tf' ? ' two' : '') + '">' + q.opts.map(function (o, i) { return '<button class="opt-b done' + (i === r.solIdx ? ' right' : (o === r.given && !r.ok ? ' wrong' : '')) + '" disabled style="--oc:' + OPTCOL[i % 4] + '">' + esc(o) + '</button>'; }).join('') + '</div>';
      h += '<div class="res ' + (r.ok ? 'ok' : 'bad') + '">' + (r.ok ? '✅ Richtig!' : (r.timeout ? '⏰ Tiden gikk ut.' : '❌ Leider falsch.')) + (r.ok || q.t === 'type' ? '' : '') + (!r.ok ? ' <span class="sol">Riktig: ' + esc(r.solution) + '</span>' : '') + (q.t === 'type' && !r.ok && r.given ? '<div class="muted">Du skrev: ' + esc(r.given) + '</div>' : '') + (r.gain ? '<div class="muted">' + (gs.mode === 'race' ? '+' + r.gain + ' felt' : '+' + r.gain + ' skade') + '</div>' : '') + '</div>';
      if (q.bonus && q.bonus.state === 'pick') h += '<h3 style="margin:10px 0 4px">Velg en kiste!</h3><div class="chests">' + [0, 1, 2].map(function (i) { return '<button class="chest" data-i="' + i + '">🎁</button>'; }).join('') + '</div>';
      else if (q.bonus && q.bonus.state === 'done') { var res = q.bonus.result, k = KINDS[res.kind] || KINDS.empty; h += '<div class="chests">' + q.bonus.chests.map(function (c, i) { var kk = KINDS[c]; return '<div class="chest open' + (i === q.bonus.picked ? ' pick' : '') + '"><div>' + kk[0] + '</div><small>' + kk[1] + '</small></div>'; }).join('') + '</div><div class="res ' + (res.amount < 0 ? 'bad' : 'ok') + '"><b>' + k[0] + ' ' + esc(res.text) + '</b></div>'; }
      if (!(q.bonus && q.bonus.state === 'pick')) h += '<div style="margin-top:12px"><button class="btn prim big" id="p-next">Neste spørsmål →</button></div>';
    }
    return h + '</div>';
  }
  function bindQ(q) {
    if (!q) return;
    $$('#p-q .opt-b:not(.done)').forEach(function (b) { b.onclick = function () { $$('#p-q .opt-b').forEach(function (x) { x.disabled = true; }); b.classList.add('chosen'); guestSend({ t: 'ans', i: +b.getAttribute('data-i') }); }; });
    var sb = $('#p-send'), inp = $('#p-ans');
    if (sb) { var go = function () { var v = inp.value.trim(); if (!v) return; sb.disabled = true; inp.disabled = true; guestSend({ t: 'ans', text: v }); }; sb.onclick = go; inp.onkeydown = function (e) { if (e.key === 'Enter') go(); }; if (document.activeElement !== inp) inp.focus(); }
    $$('#p-q .kb').forEach(function (k) { k.onclick = function () { var el = $('#p-ans'); if (el && !el.disabled) { el.value += k.getAttribute('data-c'); el.focus(); } }; });
    $$('#p-q .chest:not(.open)').forEach(function (c) { c.onclick = function () { $$('#p-q .chest').forEach(function (x) { x.disabled = true; }); guestSend({ t: 'chest', i: +c.getAttribute('data-i') }); }; });
    var nx = $('#p-next'); if (nx) nx.onclick = function () { nx.disabled = true; guestSend({ t: 'next' }); };
  }
  function uiTick() {
    if (!gs || gs.phase !== 'play' || $('#scr-play').hidden) return;
    var q = gs.q; if (gs.left) $('#p-clock').textContent = '⏱ ' + mmss(Math.max(0, gs.left - (Date.now() - gsAt)));
    if (q && q.status === 'open' && q.total) { var left = Math.max(0, q.left - (Date.now() - gsAt)), bar = $('#p-tbar'); if (bar) { bar.style.width = Math.round(100 * left / q.total) + '%'; bar.style.background = left < 5000 ? '#c62828' : ''; } if (left <= 0 && !uiTick.sent) { uiTick.sent = q.idx; guestSend({ t: 'timeout' }); } }
    if (!q || q.status !== 'open') uiTick.sent = 0;
  }

  /* ============ resultater ============ */
  function renderFinal() {
    var f = gs.final || {}, me = gs.me || {};
    $('#e-host').hidden = true; $('#e-guest').hidden = false; $('#e-code').textContent = code;
    var medal = f.rank === 1 ? '🥇' : f.rank === 2 ? '🥈' : f.rank === 3 ? '🥉' : '🎉';
    $('#e-gtitle').textContent = gs.mode === 'castle' ? (gs.why === 'won' ? '🏰 Borgen holdt – dere vant!' : gs.why === 'lost' ? '💥 Borgen falt' : '🏁 Spillet er avsluttet') : medal + ' Du ble nr. ' + f.rank + ' av ' + f.of;
    $('#e-gstats').innerHTML = '<div class="stat3"><b>' + f.correct + '</b><span>riktige</span></div><div class="stat3"><b>' + f.wrong + '</b><span>feil</span></div><div class="stat3"><b>' + f.acc + '%</b><span>treff</span></div><div class="stat3"><b>' + f.best + '</b><span>lengste rekke</span></div><div class="stat3"><b>' + (gs.mode === 'race' ? me.pos : me.score) + '</b><span>' + (gs.mode === 'gold' ? 'mynter' : gs.mode === 'race' ? 'felt' : 'skade') + '</span></div>';
    $('#e-gboard').innerHTML = '<h3>Toppliste</h3>' + gs.board.map(function (b) { return '<div class="br' + (b.me ? ' me' : '') + '"><span>' + b.rank + '</span><span>' + esc(b.icon) + ' ' + esc(b.name) + '</span><b>' + (gs.mode === 'race' ? (b.fin ? '🏆' + b.fin : b.pos) : b.score) + '</b></div>'; }).join('');
  }
  var lastReport = null;
  function renderReport() {
    var r = G.report(); lastReport = r; $('#e-host').hidden = false; $('#e-guest').hidden = true; $('#e-code').textContent = code;
    var why = r.result && r.result.why, cs = r.result && r.result.castle;
    $('#e-htitle').textContent = r.mode === 'castle' ? (why === 'won' ? '🏰 Borgen holdt!' : why === 'lost' ? '💥 Borgen falt' : '🏁 Spillet er avsluttet') : '🏆 Resultater';
    $('#e-hsub').textContent = r.title + ' · ' + MODES[r.mode].name + (why === 'time' ? ' · tiden gikk ut' : why === 'host' ? ' · avsluttet av læreren' : '');
    var unit = r.mode === 'gold' ? 'Mynter' : r.mode === 'race' ? 'Felt' : 'Skade';
    $('#e-ptable').innerHTML = '<tr><th>#</th><th>Elev</th><th>' + unit + '</th><th>Besvart</th><th>Riktig</th><th>Treff</th><th>Lengste rekke</th></tr>' + r.players.map(function (p) { return '<tr><td>' + p.rank + '</td><td>' + esc(p.name) + '</td><td>' + (r.mode === 'race' ? (p.fin ? '🏆' + p.fin : p.pos) : p.score) + '</td><td>' + p.answered + '</td><td>' + p.correct + '</td><td>' + p.acc + '%</td><td>' + p.best + '</td></tr>'; }).join('');
    var qs = r.questions.filter(function (q) { return q.asked; }).sort(function (a, b) { return a.pct - b.pct; });
    $('#e-qtable').innerHTML = '<tr><th>Spørsmål</th><th>Riktig svar</th><th>Besvart</th><th>% riktig</th></tr>' + qs.map(function (q) { return '<tr><td>' + esc(q.q) + '</td><td>' + esc(q.sol) + '</td><td>' + q.asked + '</td><td><span class="pcb" style="--p:' + q.pct + '"></span> ' + q.pct + '%</td></tr>'; }).join('');
    var low = r.players.filter(function (p) { return p.answered >= 5 && p.acc < 55; });
    $('#e-help').innerHTML = low.length ? '<p><b>Elever som kan trenge ekstra støtte (under 55 % riktig):</b> ' + low.map(function (p) { return esc(p.name) + ' (' + p.acc + '%)'; }).join(', ') + '</p>' : '<p class="muted">Ingen elever under 55 % riktig.</p>';
  }
  function reportCsv() {
    var r = lastReport || G.report(), q = function (s) { return '"' + String(s).replace(/"/g, '""') + '"'; };
    var out = 'Elev;Plassering;Poeng/felt;Besvart;Riktig;Treff %;Lengste rekke\n' + r.players.map(function (p) { return [q(p.name), p.rank, r.mode === 'race' ? p.pos : p.score, p.answered, p.correct, p.acc, p.best].join(';'); }).join('\n') + '\n\nSpørsmål;Riktig svar;Besvart;% riktig\n' + r.questions.map(function (x) { return [q(x.q), q(x.sol), x.asked, x.pct == null ? '' : x.pct].join(';'); }).join('\n');
    download('quiz-resultat.csv', '\ufeff' + out, 'text/csv;charset=utf-8');
  }

  /* ============ init ============ */
  function init() {
    function iconPick(sel, cb) { var box = $(sel); box.innerHTML = ''; ICONS.forEach(function (ic) { var b = document.createElement('button'); b.type = 'button'; b.className = 'ico' + (ic === myIcon ? ' on' : ''); b.textContent = ic; b.onclick = function () { myIcon = ic; $$('.icopick .ico').forEach(function (x) { x.classList.toggle('on', x.textContent === ic); }); }; box.appendChild(b); }); }
    iconPick('#j-icons');
    $('#h-sets').onclick = function () { setsTab = 'mine'; showSets(); };
    $('#j-go').onclick = joinRoom; $('#j-code').addEventListener('input', function () { this.value = NET.cleanCode(this.value); });
    $('#j-name').addEventListener('keydown', function (e) { if (e.key === 'Enter') joinRoom(); });
    $('#sets-tabs').addEventListener('click', function (e) { var b = e.target.closest('.tab'); if (!b) return; setsTab = b.getAttribute('data-v'); renderSets(); });
    $('#sets-back').onclick = function () { show('scr-home'); };
    $('#mine-new').onclick = function () { openEdit(null); };
    $('#mine-import').onclick = function () { $('#file-in').click(); };
    $('#file-in').onchange = function () { var f = this.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function () { try { var d = JSON.parse(rd.result), arr = Array.isArray(d) ? d : [d]; var n = 0; arr.forEach(function (s) { var c = cleanForSave(s); if (c.qs.length) { c.id = uid(); upsert(c); n++; } }); toast(n + ' sett importert'); renderSets(); } catch (e) { toast('Kunne ikke lese filen.'); } }; rd.readAsText(f); this.value = ''; };
    ['#g-dir', '#g-mode', '#g-level', '#g-n'].forEach(function (id, i) { var key = ['dir', 'mode', 'level', 'n'][i]; $(id).addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; gen[key] = key === 'n' ? parseInt(b.getAttribute('data-v'), 10) : b.getAttribute('data-v'); renderGen(); }); });
    $('#g-make').onclick = function () { var s = makeGenerated(); if (s) { upsert(s); toast('Sett laget: «' + s.title + '»'); setsTab = 'mine'; renderSets(); } };
    bindEdit();
    [['#s-mode', 'mode'], ['#s-order', 'order'], ['#s-time', 'timeLimit', 1], ['#s-dur', 'duration', 1], ['#s-goal', 'goal', 1], ['#s-waves', 'waves', 1], ['#s-diff', 'difficulty']].forEach(function (a) { $(a[0]).addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var v = b.getAttribute('data-v'); cfg[a[1]] = a[2] ? parseInt(v, 10) : v; if (G) G.configure(cfg); renderLobby(); }); });
    $('#b-start').onclick = function () { G.configure(cfg); var r = G.start(Date.now()); if (r.err) { $('#s-err').textContent = r.err; return; } show('scr-host'); $('#scr-end').removeAttribute('data-r'); pushAll(); renderHostLive(); };
    $('#l-leave').onclick = leave; $('#h-leave').onclick = function () { if (confirm('Avslutte og forlate rommet?')) leave(); }; $('#p-leave').onclick = leave; $('#e-leave').onclick = leave;
    $('#h-end').onclick = function () { if (confirm('Avslutte spillet nå?')) { G.hostEnd(Date.now()); refreshHost(); pushAll(); } };
    $('#e-again').onclick = function () { G.toLobby(); $('#scr-end').removeAttribute('data-r'); pushAll(); showLobby(); };
    $('#e-csv').onclick = reportCsv; $('#e-print').onclick = function () { window.print(); };
    $('#e-copy').onclick = function () { var r = lastReport; if (!r) return; var t = r.title + ' – ' + MODES[r.mode].name + '\n' + r.players.map(function (p) { return p.rank + '. ' + p.name + ' – ' + p.correct + '/' + p.answered + ' riktige (' + p.acc + '%)'; }).join('\n'); try { navigator.clipboard.writeText(t); toast('Kopiert'); } catch (e) { toast('Kunne ikke kopiere'); } };
    $('#l-copy').onclick = function () { var u = location.origin + location.pathname + '?rom=' + code; try { navigator.clipboard.writeText(u); toast('Lenke kopiert'); } catch (e) { toast(u); } };
    var m = /[?&]rom=([A-Za-z0-9]{4})/.exec(location.search); if (m) $('#j-code').value = m[1].toUpperCase();
    if (!window.Peer) $('#h-nopeer').hidden = false;
    uiTimer = setInterval(uiTick, 250);
    window.__quiz = { get gs() { return gs; }, get hv() { return hv; }, get G() { return G; }, get role() { return role; } };
  }
  init();
})();
