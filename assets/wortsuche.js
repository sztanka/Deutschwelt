/* Deutschwelt – Wortsuche (ordsøk). Delt motor for challenges/wortsuche/ og Wichtige Themen.
   Kilde: wortsuche-work/wortsuche.js. Ingen lagring, ingen eksterne avhengigheter. */
(function(global){
'use strict';
var LV={
  easy:{name:'Lett',size:8,count:6,dirs:[[0,1],[1,0]],de:true},
  mid:{name:'Middels',size:10,count:8,dirs:[[0,1],[1,0],[1,1],[-1,1]],de:false},
  hard:{name:'Vanskelig',size:12,count:10,dirs:[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]],de:false}
};
var NCOL=10;
var POSNAME={der:'der',die:'die',das:'das'};
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function todayStr(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function shuffle(a,rng){for(var i=a.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fmt(s){return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2);}
function norm(w){var o='';for(var i=0;i<w.length;i++){var c=w.charAt(i);if(c==='ß')o+='ß';else if(/[A-Za-zÄÖÜäöü]/.test(c))o+=c.toUpperCase();}return o;}
function full(e){return (e[1]==='der'||e[1]==='die'||e[1]==='das')?e[1]+' '+e[0]:e[0];}
/* velg count ord (ikke ord som inneholder hverandre) */
function pick(pool,count,rng,maxLen,minLen){
  var c=shuffle(pool.filter(function(e){var n=norm(e[0]).length;return n>=(minLen||3)&&(!maxLen||n<=maxLen);}),rng),out=[];
  for(var i=0;i<c.length&&out.length<count;i++){
    var w=norm(c[i][0]),ok=true;
    for(var j=0;j<out.length;j++){var v=norm(out[j][0]);if(v.indexOf(w)>=0||w.indexOf(v)>=0||v.split('').reverse().join('').indexOf(w)>=0||w.split('').reverse().join('').indexOf(v)>=0){ok=false;break;}}
    if(ok)out.push(c[i]);
  }
  return out;
}
var FREQ='EEEEEEEEEEEEEEEEENNNNNNNNNNIIIIIIIISSSSSSSRRRRRRRAAAAAATTTTTTDDDDDHHHHHUUUULLLCCCGGGMMMOOBBWWFFKZPV';
function countOcc(grid,n,w){
  var cnt=0,D=[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
  for(var r=0;r<n;r++)for(var c=0;c<n;c++)for(var d=0;d<8;d++){
    var dr=D[d][0],dc=D[d][1],r1=r+dr*(w.length-1),c1=c+dc*(w.length-1);
    if(r1<0||r1>=n||c1<0||c1>=n)continue;
    var ok=true;for(var i=0;i<w.length;i++){if(grid[(r+dr*i)*n+c+dc*i]!==w.charAt(i)){ok=false;break;}}
    if(ok)cnt++;
  }
  return cnt;
}
function generate(words,size,dirs,rng){
  var ws=words.slice().sort(function(a,b){return b.length-a.length;});
  var letters=words.join('').split(''),um=[];
  ['Ä','Ö','Ü','ß'].forEach(function(u){if(words.join('').indexOf(u)>=0)um.push(u);});
  for(var att=0;att<80;att++){
    var grid=[],i,k,t;for(i=0;i<size*size;i++)grid.push('');
    var placed=[],ok=true;
    for(k=0;k<ws.length&&ok;k++){
      var w=ws[k],len=w.length,done=false;
      for(t=0;t<500&&!done;t++){
        var d=dirs[Math.floor(rng()*dirs.length)],r0=Math.floor(rng()*size),c0=Math.floor(rng()*size);
        var r1=r0+d[0]*(len-1),c1=c0+d[1]*(len-1);
        if(r1<0||r1>=size||c1<0||c1>=size)continue;
        var cells=[],fit=true,ov=0;
        for(i=0;i<len;i++){var ix=(r0+d[0]*i)*size+c0+d[1]*i;if(grid[ix]&&grid[ix]!==w.charAt(i)){fit=false;break;}if(grid[ix])ov++;cells.push(ix);}
        if(!fit||ov===len)continue;
        for(i=0;i<len;i++)grid[cells[i]]=w.charAt(i);
        placed.push({w:w,cells:cells});done=true;
      }
      if(!done)ok=false;
    }
    if(!ok)continue;
    var base=grid.slice();
    for(var fl=0;fl<30;fl++){
      for(i=0;i<size*size;i++){
        if(base[i]){grid[i]=base[i];continue;}
        var x=rng();
        if(x<0.35)grid[i]=letters[Math.floor(rng()*letters.length)];
        else if(um.length&&x<0.37)grid[i]=um[Math.floor(rng()*um.length)];
        else grid[i]=FREQ.charAt(Math.floor(rng()*FREQ.length));
        if(grid[i]==='ß'&&x>=0.35)grid[i]='S';
      }
      var good=true;
      for(k=0;k<words.length;k++){if(countOcc(grid,size,words[k])!==1){good=false;break;}}
      if(good)return {grid:grid,placed:placed};
    }
  }
  return null;
}
function create(root){
  var g=null,timer=null,sess=0,drag=null,hintT=null;
  function $(s){return root.querySelector(s);}
  root.addEventListener('click',function(e){
    var t=e.target.closest('button');if(!t)return;
    if(t.id==='ws-again'&&g&&g.cfg.onAgain)g.cfg.onAgain(false);
    else if(t.id==='ws-share'){var ta=$('#ws-sharetxt');if(ta){ta.select();var ok=false;try{ok=document.execCommand('copy');}catch(x){}
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(ta.value).then(function(){t.textContent='✅ Kopiert!';});}else t.textContent=ok?'✅ Kopiert!':'Merk teksten og kopier selv';}}
  });
  function start(cfg){
    var L=LV[cfg.level],rng=cfg.rng||Math.random,words=cfg.words.slice(),gen=null;
    while(words.length>=3){
      var ns=words.map(function(e){return norm(e[0]);});
      gen=generate(ns,L.size,L.dirs,rng);
      if(gen)break;
      words.pop();
    }
    if(!gen){root.innerHTML='<p class="ws-info">Kunne ikke lage brett. Prøv igjen.</p>';return;}
    if(timer){clearInterval(timer);timer=null;}
    var items=gen.placed.map(function(p){
      var e=null;for(var i=0;i<words.length;i++)if(norm(words[i][0])===p.w){e=words[i];break;}
      return {w:p.w,de:e[0],art:e[1],no:e[2],cells:p.cells,found:false,ci:-1,gave:false};
    });
    items.sort(function(a,b){return a.no.localeCompare(b.no,'nb');});
    g={cfg:cfg,L:L,n:L.size,grid:gen.grid,items:items,found:0,t0:0,secs:0,hints:0,sel:-1,done:false,gave:false,showDe:cfg.showDe!==undefined?cfg.showDe:L.de,msg:'',pre:[],ci:0,hintCell:-1,focus:0};
    build();
  }
  function build(){
    var n=g.n,h='<div class="ws-panel"><div class="ws-top"><span>'+esc(g.cfg.label||'')+' · '+g.L.name+' ('+n+'×'+n+')</span><span>🔎 <b id="ws-fc">0</b>/'+g.items.length+' · ⏱ <b id="ws-time">0:00</b></span></div>';
    h+='<p class="ws-info">Finn alle ordene i rutenettet. Dra fingeren eller musa over bokstavene, eller trykk på første og siste bokstav. '+(g.L.dirs.length===2?'Ordene står vannrett (→) eller loddrett (↓).':(g.L.dirs.length===4?'Ordene står vannrett, loddrett eller på skrå (nedover/oppover mot høyre).':'Ordene kan stå i alle retninger, også baklengs.'))+'</p>';
    h+='<div class="ws-layout"><div class="ws-gridwrap"><div class="ws-grid" id="ws-grid" role="grid" aria-label="Ordsøk">';
    for(var i=0;i<n*n;i++){h+='<button type="button" class="ws-c" data-i="'+i+'" tabindex="'+(i===0?0:-1)+'" aria-label="Rad '+(Math.floor(i/n)+1)+', kolonne '+(i%n+1)+': '+esc(g.grid[i])+'">'+esc(g.grid[i])+'</button>';}
    h+='</div></div><div class="ws-side"><h3>📋 Ordene du skal finne</h3><ul class="ws-list" id="ws-list"></ul><label class="ws-opt"><input type="checkbox" id="ws-showde"'+(g.showDe?' checked':'')+'> Vis de tyske ordene (lettere)</label></div></div>';
    h+='<p class="ws-msg" id="ws-msg" aria-live="polite"></p>';
    h+='<div class="ws-btns" style="justify-content:center" id="ws-ctl"><button type="button" class="ws-btn alt" id="ws-hintb">💡 Hint</button><button type="button" class="ws-btn alt" id="ws-giveup">🏳 Vis løsningen</button>'+(g.cfg.onAgain&&!g.cfg.noSkip?'<button type="button" class="ws-btn alt" id="ws-skip">'+esc(g.cfg.skipLabel||'🔀 Nytt brett')+'</button>':'')+'</div></div><div id="ws-res"></div>';
    root.innerHTML=h;
    root.style.setProperty('--ws-n',n);
    var gm=root;gm.classList.add('ws-game');
    bind();paint();list();
  }
  function paint(){
    var cs=root.querySelectorAll('.ws-c'),i,it,k;
    for(i=0;i<cs.length;i++){cs[i].className='ws-c';cs[i].removeAttribute('data-f');}
    var fc=0;
    g.items.forEach(function(p){if(p.found||p.gave){p.cells.forEach(function(ix){cs[ix].className='ws-c ws-f ws-f'+(p.gave&&!p.found?8:p.ci%10)+(p.gave&&!p.found?' ws-gave':'');});}if(p.found)fc++;});
    g.pre.forEach(function(ix){cs[ix].classList.add('ws-pre');});
    if(g.sel>=0)cs[g.sel].classList.add('ws-st');
    if(g.hintCell>=0)cs[g.hintCell].classList.add('ws-hint');
    var e=$('#ws-fc');if(e)e.textContent=fc;
    e=$('#ws-msg');if(e)e.textContent=g.msg||'';
  }
  function list(){
    var h='';
    g.items.forEach(function(p){
      var cls='ws-w'+((p.found||p.gave)?' ws-ok ws-f'+(p.gave&&!p.found?8:p.ci%10):'');
      if(p.found||p.gave)h+='<li class="'+cls+'"><span class="ws-sw"></span><span><b>'+esc(full([p.de,p.art]))+'</b> <span class="ws-no">· '+esc(p.no)+'</span></span></li>';
      else h+='<li class="'+cls+'"><span class="ws-sw"></span><span>'+esc(p.no)+' <span class="ws-n">('+p.w.length+' bokstaver)</span>'+(g.showDe?' <span class="ws-de">'+esc(full([p.de,p.art]))+'</span>':'')+'</span></li>';
    });
    $('#ws-list').innerHTML=h;
  }
  function startTimer(){
    if(g.t0||g.done)return;
    g.t0=Date.now();
    timer=setInterval(function(){g.secs=Math.round((Date.now()-g.t0)/1000);var e=$('#ws-time');if(e)e.textContent=fmt(g.secs);},500);
  }
  function rc(i){return [Math.floor(i/g.n),i%g.n];}
  function cellAt(x,y){
    var r=$('#ws-grid').getBoundingClientRect(),n=g.n;
    var c=Math.floor((x-r.left)/(r.width/n)),rr=Math.floor((y-r.top)/(r.height/n));
    return [Math.max(0,Math.min(n-1,rr)),Math.max(0,Math.min(n-1,c))];
  }
  function line(a,b,strict){
    var n=g.n,dr=b[0]-a[0],dc=b[1]-a[1],step,L;
    if(dr===0&&dc===0)return [a[0]*n+a[1]];
    if(strict){
      if(!(dr===0||dc===0||Math.abs(dr)===Math.abs(dc)))return null;
      step=[Math.sign(dr),Math.sign(dc)];L=Math.max(Math.abs(dr),Math.abs(dc));
    }else{
      var k=Math.round(Math.atan2(dr,dc)/(Math.PI/4)),an=k*Math.PI/4;
      step=[Math.round(Math.sin(an)),Math.round(Math.cos(an))];
      L=Math.round((dr*step[0]+dc*step[1])/(step[0]*step[0]+step[1]*step[1]));
      if(L<0)L=0;
      while(L>0&&(a[0]+step[0]*L<0||a[0]+step[0]*L>=n||a[1]+step[1]*L<0||a[1]+step[1]*L>=n))L--;
    }
    var out=[];for(var i=0;i<=L;i++)out.push((a[0]+step[0]*i)*n+a[1]+step[1]*i);
    return out;
  }
  function submit(cells){
    g.sel=-1;g.pre=[];
    if(!cells||cells.length<2){g.msg='';paint();return;}
    var txt=cells.map(function(i){return g.grid[i];}).join(''),rev=txt.split('').reverse().join(''),hit=null;
    g.items.forEach(function(p){if(!p.found&&!p.gave&&(p.w===txt||p.w===rev))hit=p;});
    if(hit){
      hit.found=true;hit.ci=g.ci++;hit.cells=cells.slice();
      g.hintCell=-1;
      var left=g.items.filter(function(p){return !p.found;}).length;
      g.msg='✅ '+full([hit.de,hit.art])+' – '+hit.no;
      g.found++;
      list();
      if(!left){finish(false);return;}
    }else{
      var dup=false;g.items.forEach(function(p){if(p.found&&(p.w===txt||p.w===rev))dup=true;});
      g.msg=dup?'Det ordet har du allerede funnet.':'✗ «'+txt+'» står ikke på lista. Prøv igjen!';
    }
    paint();
  }
  function tap(i){
    startTimer();g.focus=i;
    if(g.sel<0){g.sel=i;g.msg='Velg nå siste bokstav i ordet.';paint();return;}
    if(g.sel===i){g.sel=-1;g.msg='';paint();return;}
    var ln=line(rc(g.sel),rc(i),true);
    if(ln)submit(ln);else{g.sel=i;g.msg='Ikke på rett linje – dette er ny startbokstav.';paint();}
  }
  function finish(gaveUp){
    g.done=true;g.gave=gaveUp;
    if(timer){clearInterval(timer);timer=null;}
    g.secs=g.t0?Math.round((Date.now()-g.t0)/1000):0;
    if(gaveUp)g.items.forEach(function(p){if(!p.found)p.gave=true;});
    sess+=gaveUp?0:1;
    paint();list();
    var rows=g.items.map(function(p){return '<tr><td>'+esc(full([p.de,p.art]))+'</td><td>🇳🇴 '+esc(p.no)+'</td></tr>';}).join('');
    var h='<div class="ws-result'+(gaveUp?' gave':'')+'" role="status"><h3>'+(gaveUp?'Her er løsningen':'🎉 Alle ordene funnet! ⏱ '+fmt(g.secs)+(g.hints?' · 💡 '+g.hints:''))+'</h3><table>'+rows+'</table>';
    if(!gaveUp)h+='<p style="font-size:.85rem;color:var(--dw-muted,#6b6b6b);margin:6px 0 0">Brett løst denne økten: '+sess+'.</p>';
    h+='</div><div class="ws-btns" style="justify-content:center">';
    if(g.cfg.onAgain)h+='<button type="button" class="ws-btn" id="ws-again">'+esc(g.cfg.againLabel||'🔀 Stokk om')+'</button>';
    if(!gaveUp&&g.cfg.share)h+='<button type="button" class="ws-btn alt" id="ws-share">📋 Kopier resultatet</button>';
    h+='</div>';
    if(!gaveUp&&g.cfg.share)h+='<textarea class="ws-share" id="ws-sharetxt" readonly aria-label="Resultat som kan deles">'+esc(g.cfg.share({secs:g.secs,hints:g.hints,n:g.items.length,level:g.L.name}))+'</textarea>';
    $('#ws-res').innerHTML=h;
    var ctl=$('#ws-ctl');if(ctl)ctl.style.display='none';
    g.msg=gaveUp?'':'';paint();
  }
  function bind(){
    var grid=$('#ws-grid');
    grid.addEventListener('pointerdown',function(e){
      if(g.done||(e.pointerType==='mouse'&&e.button!==0))return;
      var a=cellAt(e.clientX,e.clientY);
      drag={a:a,moved:false};
      try{grid.setPointerCapture(e.pointerId);}catch(x){}
      e.preventDefault();
    });
    grid.addEventListener('pointermove',function(e){
      if(!drag||g.done)return;
      var b=cellAt(e.clientX,e.clientY);
      if(b[0]===drag.a[0]&&b[1]===drag.a[1]&&!drag.moved)return;
      if(!drag.moved){drag.moved=true;startTimer();g.sel=-1;}
      g.pre=line(drag.a,b,false);g.msg='';paint();
    });
    function up(e,cancel){
      if(!drag)return;
      var d=drag;drag=null;
      try{grid.releasePointerCapture(e.pointerId);}catch(x){}
      if(g.done)return;
      if(cancel){g.pre=[];paint();return;}
      if(d.moved){var b=cellAt(e.clientX,e.clientY);submit(line(d.a,b,false));}
      else tap(d.a[0]*g.n+d.a[1]);
    }
    grid.addEventListener('pointerup',function(e){up(e,false);});
    grid.addEventListener('pointercancel',function(e){up(e,true);});
    grid.addEventListener('click',function(e){
      if(e.detail!==0||g.done)return;
      var b=e.target.closest('.ws-c');if(b)tap(+b.getAttribute('data-i'));
    });
    grid.addEventListener('keydown',function(e){
      var b=e.target.closest('.ws-c');if(!b||g.done)return;
      var i=+b.getAttribute('data-i'),n=g.n,ni=-1;
      if(e.key==='ArrowRight'&&i%n<n-1)ni=i+1;else if(e.key==='ArrowLeft'&&i%n>0)ni=i-1;else if(e.key==='ArrowDown'&&i+n<n*n)ni=i+n;else if(e.key==='ArrowUp'&&i-n>=0)ni=i-n;
      else if(e.key==='Escape'){g.sel=-1;g.msg='';paint();return;}
      if(ni>=0){e.preventDefault();var cs=root.querySelectorAll('.ws-c');cs[i].tabIndex=-1;cs[ni].tabIndex=0;cs[ni].focus();}
    });
    $('#ws-showde').addEventListener('change',function(){g.showDe=this.checked;list();});
    $('#ws-hintb').addEventListener('click',function(){
      if(g.done)return;
      var un=g.items.filter(function(p){return !p.found;});if(!un.length)return;
      var p=un[Math.floor(Math.random()*un.length)];
      g.hints++;g.hintCell=p.cells[0];g.msg='💡 Et ord begynner i den blinkende ruta: «'+p.no+'» ('+p.w.length+' bokstaver).';paint();
      clearTimeout(hintT);hintT=setTimeout(function(){if(g){g.hintCell=-1;paint();}},4000);
    });
    $('#ws-giveup').addEventListener('click',function(){if(!g.done)finish(true);});
    var sk=$('#ws-skip');if(sk)sk.addEventListener('click',function(){g.cfg.onAgain(true);});
  }
  return {start:start,state:function(){return g;},sessCount:function(){return sess;}};
}
/* Hjelper for temasider: nivåvalg + start + stokk om. pool = [[Wort,art,norsk],…] */
function themeWidget(rootId,pool,label){
  var root=document.getElementById(rootId);if(!root)return;
  var lvl='mid';
  root.classList.add('ws-embed');
  root.innerHTML='<div class="ws-panel"><span class="ws-label" style="margin-top:0">Nivå</span><div class="ws-chips" role="group" aria-label="Nivå">'
   +'<button type="button" class="ws-chip" data-lv="easy" aria-pressed="false">🟢 Lett · 8×8, 6 ord</button><button type="button" class="ws-chip" data-lv="mid" aria-pressed="true">🟡 Middels · 10×10, 8 ord</button><button type="button" class="ws-chip" data-lv="hard" aria-pressed="false">🔴 Vanskelig · 12×12, 10 ord</button></div>'
   +'<p class="ws-desc" id="'+rootId+'-desc"></p><div class="ws-btns"><button type="button" class="ws-btn" data-act="start">▶ Start ordsøk</button></div></div><div class="ws-slot"></div>';
  var slot=root.querySelector('.ws-slot'),eng=create(slot);
  function desc(){var L=LV[lvl];document.getElementById(rootId+'-desc').textContent=L.name+': '+L.size+'×'+L.size+' rutenett med '+L.count+' ord fra temaet (valgt tilfeldig blant '+pool.length+'). '+(L.dirs.length===2?'Bare vannrett og loddrett.':(L.dirs.length===4?'Også på skrå.':'Alle åtte retninger, også baklengs.'))+' Norsk hint i lista.';}
  function run(){eng.start({level:lvl,words:pick(pool,LV[lvl].count,Math.random,LV[lvl].size),label:label||'Temaord',onAgain:function(){run();},againLabel:'🔀 Stokk om – nytt brett med samme tema',skipLabel:'🔀 Nytt brett'});}
  root.addEventListener('click',function(e){
    var t=e.target.closest('button');if(!t||!root.querySelector('.ws-panel').contains(t))return;
    if(t.hasAttribute('data-lv')){lvl=t.getAttribute('data-lv');var cs=root.querySelectorAll('.ws-chips .ws-chip');for(var i=0;i<cs.length;i++)cs[i].setAttribute('aria-pressed',cs[i]===t?'true':'false');desc();}
    else if(t.getAttribute('data-act')==='start'){run();}
  });
  desc();
  global.DWWortsuche.last=eng;
  return eng;
}
global.DWWortsuche={LV:LV,create:create,pick:pick,generate:generate,norm:norm,full:full,hash:hash,mulberry:mulberry,todayStr:todayStr,fmt:fmt,esc:esc,themeWidget:themeWidget};
})(window);
