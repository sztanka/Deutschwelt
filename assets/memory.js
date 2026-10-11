/* Deutschwelt – Memory (Wortschatz-Jagd). Delt motor for challenges/wortschatz-jagd/ og Wichtige Themen.
   Kilde: memory-work/memory.js. Ingen lagring, ingen eksterne avhengigheter. */
(function(global){
'use strict';
var LV={
  easy:{name:'Lett',pairs:6,peek:4,flip:1200,icons:true},
  mid:{name:'Middels',pairs:8,peek:2,flip:950,icons:false},
  hard:{name:'Vanskelig',pairs:12,peek:0,flip:800,icons:false}
};
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function todayStr(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function shuffle(a,rng){for(var i=a.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fmt(s){return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2);}
function full(e){return (e[1]==='der'||e[1]==='die'||e[1]==='das')?e[1]+' '+e[0]:e[0];}
function letters(w){return w.replace(/[^A-Za-zÄÖÜäöüß]/g,'');}
/* velg n par med unike tyske og norske tekster */
function pick(pool,n,rng,minLen,maxLen){
  var c=shuffle(pool.filter(function(e){var l=letters(e[0]).length;return l>=(minLen||2)&&(!maxLen||l<=maxLen);}),rng),out=[],seenD={},seenN={};
  for(var i=0;i<c.length&&out.length<n;i++){
    var d=c[i][0].toLowerCase(),no=c[i][2].toLowerCase();
    if(seenD[d]||seenN[no])continue;
    seenD[d]=1;seenN[no]=1;out.push(c[i]);
  }
  return out;
}
function stars(att,pairs){var r=att/pairs;return r<=1.6?3:(r<=2.4?2:1);}
function cols(nCards,w){
  if(w<560)return nCards<=12?3:4;
  return nCards>=24?6:4;
}
function create(root){
  var g=null,timer=null,sess=0,lockT=null,peekT=null;
  function $(s){return root.querySelector(s);}
  root.addEventListener('click',function(e){
    var t=e.target.closest('button');if(!t)return;
    if(t.id==='mm-again'&&g&&g.cfg.onAgain)g.cfg.onAgain(false);
    else if(t.id==='mm-skip'&&g&&g.cfg.onAgain)g.cfg.onAgain(true);
    else if(t.id==='mm-share'){var ta=$('#mm-sharetxt');if(ta){ta.select();var ok=false;try{ok=document.execCommand('copy');}catch(x){}
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(ta.value).then(function(){t.textContent='✅ Kopiert!';});}else t.textContent=ok?'✅ Kopiert!':'Merk teksten og kopier selv';}}
    else if(t.hasAttribute('data-i'))flip(+t.getAttribute('data-i'));
  });
  window.addEventListener('resize',function(){if(g)setCols();});
  function setCols(){root.style.setProperty('--mc',cols(g.cards.length,window.innerWidth));}
  function start(cfg){
    var L=LV[cfg.level],rng=cfg.rng||Math.random,pairs=cfg.pairs.slice(0,L.pairs);
    var cards=[];
    pairs.forEach(function(p,i){cards.push({pid:i,side:'de',text:full(p),done:false});cards.push({pid:i,side:'no',text:p[2],done:false});});
    cards=shuffle(cards,rng);
    if(timer){clearInterval(timer);timer=null;}clearTimeout(lockT);clearTimeout(peekT);
    g={cfg:cfg,L:L,pairs:pairs,cards:cards,open:[],found:0,att:0,t0:0,secs:0,lock:false,done:false,peek:L.peek>0,msg:''};
    build();
    if(g.peek){g.lock=true;showAll(true);var left=L.peek;setPeek(left);
      (function tick(){peekT=setTimeout(function(){left--;if(left>0){setPeek(left);tick();}else{g.peek=false;g.lock=false;showAll(false);setPeek(0);}},1000);})();}
  }
  function setPeek(n){var e=$('#mm-peek');if(e)e.textContent=n>0?'👀 Husk kortene! Snur om '+n+'…':'';}
  function build(){
    var h='<div class="mm-panel"><div class="mm-top"><span>'+esc(g.cfg.label||'')+' · '+g.L.name+' ('+g.pairs.length+' par)</span><span>🃏 <b id="mm-fc">0</b>/'+g.pairs.length+' · 🔁 <b id="mm-att">0</b> forsøk · ⏱ <b id="mm-time">0:00</b></span></div>';
    h+='<p class="mm-info">Snu to kort om gangen. Finn det <b>tyske ordet</b> og dets <b>norske betydning</b>. '+(g.L.icons?'Kortene har flagg på baksiden: 🇩🇪 er tysk og 🇳🇴 er norsk. ':'')+'</p>';
    h+='<p class="mm-peek" id="mm-peek" aria-live="polite"></p><div class="mm-board" id="mm-board">';
    g.cards.forEach(function(c,i){
      var long=letters(c.text).length>9;
      h+='<button type="button" class="mm-card mm-'+c.side+(long?' ml':'')+'" data-i="'+i+'" aria-label="Kort '+(i+1)+', skjult"><span class="mm-back">'+(g.L.icons?(c.side==='de'?'🇩🇪':'🇳🇴'):'❓')+'</span></button>';
    });
    h+='</div><p class="mm-msg" id="mm-msg" aria-live="polite"></p>';
    h+='<div class="mm-btns" style="justify-content:center" id="mm-ctl">'+(g.cfg.onAgain&&!g.cfg.noSkip?'<button type="button" class="mm-btn alt" id="mm-skip">'+esc(g.cfg.skipLabel||'🔀 Nytt brett')+'</button>':'')+'</div></div><div id="mm-res"></div>';
    root.innerHTML=h;root.classList.add('mm-game');setCols();
  }
  function face(i,show){
    var el=root.querySelector('.mm-card[data-i="'+i+'"]');if(!el)return;var c=g.cards[i];
    if(show){el.classList.add('mm-fl');el.innerHTML=esc(c.text);el.setAttribute('aria-label','Kort '+(i+1)+': '+c.text);}
    else{el.classList.remove('mm-fl','mm-bad');el.innerHTML='<span class="mm-back">'+(g.L.icons?(c.side==='de'?'🇩🇪':'🇳🇴'):'❓')+'</span>';el.setAttribute('aria-label','Kort '+(i+1)+', skjult');}
  }
  function showAll(on){g.cards.forEach(function(c,i){if(!c.done)face(i,on);});}
  function startTimer(){
    if(g.t0||g.done)return;
    g.t0=Date.now();
    timer=setInterval(function(){g.secs=Math.round((Date.now()-g.t0)/1000);var e=$('#mm-time');if(e)e.textContent=fmt(g.secs);},500);
  }
  function flip(i){
    if(!g||g.lock||g.done||g.peek)return;
    var c=g.cards[i];if(c.done||g.open.indexOf(i)>=0)return;
    startTimer();face(i,true);g.open.push(i);
    if(g.open.length<2)return;
    g.att++;$('#mm-att').textContent=g.att;
    var a=g.cards[g.open[0]],b=g.cards[g.open[1]],i0=g.open[0],i1=g.open[1];
    if(a.pid===b.pid&&a.side!==b.side){
      a.done=b.done=true;g.found++;g.open=[];
      [i0,i1].forEach(function(k){var el=root.querySelector('.mm-card[data-i="'+k+'"]');el.classList.add('mm-ok');el.disabled=true;});
      var p=g.pairs[a.pid];$('#mm-msg').textContent='✅ '+full(p)+' = '+p[2];$('#mm-fc').textContent=g.found;
      if(g.found===g.pairs.length)finish();
    }else{
      g.lock=true;
      [i0,i1].forEach(function(k){root.querySelector('.mm-card[data-i="'+k+'"]').classList.add('mm-bad');});
      $('#mm-msg').textContent='';
      lockT=setTimeout(function(){face(i0,false);face(i1,false);g.open=[];g.lock=false;},g.L.flip);
    }
  }
  function finish(){
    g.done=true;if(timer){clearInterval(timer);timer=null;}
    g.secs=g.t0?Math.round((Date.now()-g.t0)/1000):0;sess++;
    var st=stars(g.att,g.pairs.length),sstr=new Array(st+1).join('⭐');
    var rows=g.pairs.map(function(p){return '<tr><td>'+esc(full(p))+'</td><td>🇳🇴 '+esc(p[2])+'</td></tr>';}).join('');
    var h='<div class="mm-result" role="status"><h3>🎉 Alle parene funnet! '+sstr+'</h3><p style="margin:0 0 6px">🔁 '+g.att+' forsøk · ⏱ '+fmt(g.secs)+'</p><table>'+rows+'</table><p style="font-size:.85rem;color:var(--dw-muted,#6b6b6b);margin:6px 0 0">Brett løst denne økten: '+sess+'.</p></div><div class="mm-btns" style="justify-content:center">';
    if(g.cfg.onAgain)h+='<button type="button" class="mm-btn" id="mm-again">'+esc(g.cfg.againLabel||'🔀 Stokk om')+'</button>';
    if(g.cfg.share)h+='<button type="button" class="mm-btn alt" id="mm-share">📋 Kopier resultatet</button>';
    h+='</div>';
    if(g.cfg.share)h+='<textarea class="mm-share" id="mm-sharetxt" readonly aria-label="Resultat som kan deles">'+esc(g.cfg.share({secs:g.secs,att:g.att,pairs:g.pairs.length,stars:sstr}))+'</textarea>';
    $('#mm-res').innerHTML=h;
    var ctl=$('#mm-ctl');if(ctl)ctl.style.display='none';
    $('#mm-msg').textContent='';
  }
  return {start:start,state:function(){return g;},flip:flip};
}
/* temaside: nivåvalg + start + stokk om. pool = [[Wort,art,norsk],…] */
function themeWidget(rootId,pool,label){
  var root=document.getElementById(rootId);if(!root)return;
  var lvl='mid';
  root.classList.add('mm-embed');
  root.innerHTML='<div class="mm-panel"><span class="mm-label" style="margin-top:0">Nivå</span><div class="mm-chips" role="group" aria-label="Nivå">'
   +'<button type="button" class="mm-chip" data-lv="easy" aria-pressed="false">🟢 Lett · 6 par</button><button type="button" class="mm-chip" data-lv="mid" aria-pressed="true">🟡 Middels · 8 par</button><button type="button" class="mm-chip" data-lv="hard" aria-pressed="false">🔴 Vanskelig · 12 par</button></div>'
   +'<p class="mm-desc" id="'+rootId+'-desc"></p><div class="mm-btns"><button type="button" class="mm-btn" data-act="start">▶ Start memory</button></div></div><div class="mm-slot"></div>';
  var slot=root.querySelector('.mm-slot'),eng=create(slot);
  function desc(){var L=LV[lvl];document.getElementById(rootId+'-desc').textContent=L.name+': '+L.pairs+' par fra temaet (valgt tilfeldig blant '+pool.length+' ord). '+(L.icons?'Flagg på baksiden viser om kortet er tysk eller norsk. ':'')+(L.peek?'Du får se alle kortene i '+L.peek+' sekunder først.':'Ingen forhåndsvisning.');}
  function run(){eng.start({level:lvl,pairs:pick(pool,LV[lvl].pairs,Math.random),label:label||'Temaord',onAgain:function(){run();},againLabel:'🔀 Stokk om – nytt brett med samme tema',skipLabel:'🔀 Nytt brett'});}
  root.addEventListener('click',function(e){
    var t=e.target.closest('button');if(!t||!root.querySelector('.mm-panel').contains(t))return;
    if(t.hasAttribute('data-lv')){lvl=t.getAttribute('data-lv');var cs=root.querySelectorAll('.mm-chips .mm-chip');for(var i=0;i<cs.length;i++)cs[i].setAttribute('aria-pressed',cs[i]===t?'true':'false');desc();}
    else if(t.getAttribute('data-act')==='start')run();
  });
  desc();
  global.DWMemory.last=eng;
  return eng;
}
global.DWMemory={LV:LV,create:create,pick:pick,full:full,hash:hash,mulberry:mulberry,todayStr:todayStr,fmt:fmt,esc:esc,letters:letters,themeWidget:themeWidget};
})(window);
