// Red Dot scenes: scroll-scrubbed frame films cut from Red Dot's own full-size photos (push-in, truck, pan; no upscaling),
// one scroll clock (GSAP ScrollTrigger), hard-edged masked wipes and staggered type. No gradients behind type.
(function(){
  var B=document.body;if(!B.classList.contains('exp'))return;
  var G=window.gsap,ST=window.ScrollTrigger;if(!G||!ST){B.classList.remove('exp');return;}
  G.registerPlugin(ST);ST.config({ignoreMobileResize:true});
  var lite=B.classList.contains('lite');

  // ---------- scrubbed films: frame sequences cut from Red Dot's own photos, drawn on a canvas at the frame's own size ----------
  // Engine from e40d5d9 (micro ladder -> previews -> sharp frames near the reader, look-ahead, stale-request drop, nothing before the first scroll).
  // Every tier is drawn 1:1 into a canvas whose backing store is the frame size; CSS never shows it wider than the frame (<=1.0x).
  var FV='8',STEP=2;
  function Film(el){this.el=el;this.name=el.dataset.film;this.n=+el.dataset.frames;this.tiers=el.dataset.tiers.split('|').map(function(x){var p=x.split(':');return {k:p[0],w:+p[1].split('x')[0],h:+p[1].split('x')[1],mq:matchMedia(p.slice(2).join(':'))};});
    this.box=el.closest('.impact')||document.getElementById('track');this.cv=el.querySelector('canvas');this.ctx=this.cv.getContext('2d');this.poster=el.querySelector('.film__poster');
    this.cur=0;this.dir=1;this.set=null;this.gen=0;this.reset();this.size();}
  var F=Film.prototype;
  F.reset=function(){var n=this.n;this.gen++;this.full=new Array(n);this.lq=new Array(n);this.tq=new Array(n);this.ok=new Uint8Array(n);this.lok=new Uint8Array(n);this.tok=new Uint8Array(n);
    this.req=new Uint8Array(n);this.lreq=new Uint8Array(n);this.treq=new Uint8Array(n);this.inflight={};this.drawn=-1;this.drawnQ='';};
  F.isL=function(i){return i%STEP===0||i===this.n-1;};F.isT=function(i){return i%3===0||i===this.n-1;};
  F.src=function(i,lq){var s=String(i+1);while(s.length<3)s='0'+s;return 'frames/'+this.name+'/'+this.set+(lq===2?'t':lq?'q':'')+'/'+s+'.webp?v='+FV;};
  F.size=function(){var T=this.tiers.filter(function(x){return x.mq.matches;})[0]||this.tiers[this.tiers.length-1],t=T.k;if(t===this.set)return;var had=this.set;this.set=t;this.cv.width=T.w;this.cv.height=T.h;this.el.dataset.tier=t;
    this.ctx.imageSmoothingEnabled=false;if(had){this.reset();pump();}this.seed();};
  // the poster is frame 1 of the same tier: it seeds the canvas without a frame request
  F.seed=function(){var self=this,im=this.poster,g=this.gen;
    function use(){var src=im.currentSrc||im.src;if(g!==self.gen||!im.naturalWidth)return;if(src.indexOf('poster-'+self.set+'.')<0)return;self.full[0]=im;self.ok[0]=1;self.draw(self.cur,true);}
    if(im.complete)use();else im.addEventListener('load',use,{once:true});};
  F.away=function(){var r=this.box.getBoundingClientRect(),h=innerHeight;return r.top>h?(r.top-h)/h:r.bottom<0?-r.bottom/h:0;};
  F.go=function(p){this.p=Math.max(0,Math.min(1,p));this.draw(Math.round(this.p*(this.n-1)));};
  F.draw=function(f,force){f=Math.max(0,Math.min(this.n-1,Math.round(f)));if(f===this.cur&&!force)return;var now=performance.now();
    if(f!==this.cur){var dt=(now-(this.t0||now))/1000;if(dt>0)this.v=(this.v||0)*.5+Math.min(Math.abs(f-this.cur)/dt,400)*.5;this.t0=now;this.dir=f>this.cur?1:-1;}this.cur=f;
    var bf=-1,bl=-1,bt=-1,d;for(d=0;d<this.n&&(bf<0||bl<0||bt<0);d++){
      if(bf<0){if(f-d>=0&&this.ok[f-d])bf=f-d;else if(f+d<this.n&&this.ok[f+d])bf=f+d;}
      if(bl<0){if(f-d>=0&&this.lok[f-d])bl=f-d;else if(f+d<this.n&&this.lok[f+d])bl=f+d;}
      if(bt<0){if(f-d>=0&&this.tok[f-d])bt=f-d;else if(f+d<this.n&&this.tok[f+d])bt=f+d;}}
    var at=-1,q='',D=function(x){return x<0?1e9:Math.abs(x-f);};
    if(bf>=0&&D(bf)<=D(bl)+1.5&&D(bf)<=D(bt)+3){at=bf;q='full';}else if(bl>=0&&D(bl)<=D(bt)+2){at=bl;q='lq';}else if(bt>=0){at=bt;q='t';}
    if(at<0||(at===this.drawn&&q===this.drawnQ&&!force)){pump();return;}
    var im=q==='full'?this.full[at]:q==='t'?this.tq[at]:this.lq[at];this.ctx.drawImage(im,0,0,this.cv.width,this.cv.height);this.drawn=at;this.drawnQ=q;
    if(at>0)this.el.classList.add('is-live');pump();};
  F.next=function(){var n=this.n,dir=this.dir,v=(this.v||0)*Math.exp(-(performance.now()-(this.t0||0))/250),c=Math.max(0,Math.min(n-1,this.cur+dir*Math.min(v*.25,30))),fast=v>30,best=null,i,t,s;
    function cand(i,lq,p){if(!best||p<best.p)best={i:i,lq:lq,p:p};}
    if(!this.ok[0]&&!this.req[0]&&!this.lok[0])return {i:0,lq:0,p:-1};
    for(i=0;i<n;i++){t=(i-c)*dir;s=t>=0?t:-t*2+1;
      if(this.isT(i)&&!this.treq[i]&&!this.tok[i]&&!this.lok[i]&&!this.ok[i])cand(i,2,s*.1);
      if(this.isL(i)&&!this.lreq[i]&&!this.lok[i]&&!this.ok[i])cand(i,1,(t>=-3&&t<=12)?50+s:300+s);
      if(!this.req[i]&&!this.ok[i])cand(i,0,(t>=-2&&t<=6)?(fast?400:100)+s:1000+s);}
    if(v>1&&!this.wake){var self=this;this.wake=setTimeout(function(){self.wake=0;pump();},300);}
    return best;};
  F.prune=function(){var c=this.cur,k,r;for(k in this.inflight){r=this.inflight[k];if(Math.abs(r.i-c)>(r.lq===0?12:r.lq===1?30:1e9))r.drop();}};
  F.state=function(){function s(a){var t=0;for(var i=0;i<a.length;i++)t+=a[i];return t;}var r=this.cv.getBoundingClientRect();
    return {name:this.name,set:this.set,n:this.n,cur:this.cur,drawn:this.drawn,drawnQ:this.drawnQ,loaded:s(this.ok),previews:s(this.lok),micro:s(this.tok),requested:s(this.req)+s(this.lreq)+s(this.treq),
      fw:this.cv.width,fh:this.cv.height,cssW:+r.width.toFixed(1),cssH:+r.height.toFixed(1),scaleCss:+(r.width/this.cv.width).toFixed(3),scaleDev:+(r.width*(devicePixelRatio||1)/this.cv.width).toFixed(3)};};
  var films=[].slice.call(document.querySelectorAll('[data-film]')).map(function(el){return new Film(el);});
  var started=false,live=0,MAX=4,NEAR=2.5;
  function fetchOne(f,i,lq){var g=f.gen,key=lq+':'+i,fin=false,R=lq===2?f.treq:lq?f.lreq:f.req;live++;R[i]=1;var im=new Image();im.decoding='async';
    function done(okk){if(fin)return;fin=true;delete f.inflight[key];live--;if(g===f.gen&&okk){if(lq===2){f.tq[i]=im;f.tok[i]=1;}else if(lq){f.lq[i]=im;f.lok[i]=1;}else{f.full[i]=im;f.ok[i]=1;}if(Math.abs(i-f.cur)<=8)f.draw(f.cur,true);}pump();}
    f.inflight[key]={i:i,lq:lq,drop:function(){if(fin)return;im.onload=im.onerror=null;im.removeAttribute('src');R[i]=0;fin=true;delete f.inflight[key];live--;}};
    im.onload=function(){(im.decode?im.decode():Promise.resolve()).then(function(){done(true);},function(){done(true);});};
    im.onerror=function(){done(false);};im.src=f.src(i,lq);}
  var pumping=false;
  function pump(){if(!started||lite||pumping)return;pumping=true;films.forEach(function(f){f.prune();});
    for(;;){var best=null,bp=1e18;
      for(var k=0;k<films.length;k++){var f=films[k],a=f.away(),c=f.next();if(!c||(a>NEAR&&c.lq!==2))continue;var p=c.lq===2?c.p+a*5:c.p+a*2e3;if(p<bp){bp=p;best={f:f,c:c};}}
      if(!best||live>=(best.c.lq===2?6:best.c.lq?MAX:3))break;fetchOne(best.f,best.c.i,best.c.lq);}
    pumping=false;}
  function go(){if(started)return;started=true;films.forEach(function(f){if(f.poster.loading==='lazy')f.poster.loading='eager';});['scroll','wheel','touchmove','keydown'].forEach(function(e){removeEventListener(e,go);});pump();}
  ['scroll','wheel','touchmove','keydown'].forEach(function(e){addEventListener(e,go,{passive:true});});
  if(scrollY>0)go();
  var sq=0;addEventListener('scroll',function(){if(sq)return;sq=requestAnimationFrame(function(){sq=0;pump();});},{passive:true});
  var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){films.forEach(function(f){f.size();});},120);});
  // each film is bound to its section's scroll progress (scrub .35 s), so a scroll position always maps to one frame
  function bind(f,trig){var o={p:0};G.to(o,{p:1,ease:'none',scrollTrigger:{trigger:trig,start:'top top',end:'bottom bottom',scrub:.35},onUpdate:function(){f.go(o.p);}});}
  films.forEach(function(f){bind(f,f.name==='hero'?document.getElementById('track'):f.el.closest('.impact'));});
  // one filled RESERVE per screen: the bottom bar's filled RESERVE steps back to an outline while the Reserve section's own button is on screen
  var rg=document.querySelector('.reserve__go');if(rg&&window.IntersectionObserver)new IntersectionObserver(function(es){B.classList.toggle('res-in',es[0].isIntersecting);}).observe(rg);

  // ---------- staggered type: split headings into words that rise through a hard line mask ----------
  [].slice.call(document.querySelectorAll('.split')).forEach(function(h){if(h.dataset.split)return;h.dataset.split=1;var t=h.textContent;h.setAttribute('aria-label',t);
    h.innerHTML=t.trim().split(/\s+/).map(function(w){return '<span class="w" aria-hidden="true"><span>'+w+'</span></span>';}).join(' ');});
  function words(el){return el?el.querySelectorAll('.w>span'):[];}
  // a card arrives as a hard-edged wipe, then its words rise in sequence
  function reveal(card){var tl=G.timeline({paused:true,defaults:{ease:'power3.out'}});
    tl.fromTo(card,{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.55,ease:'power4.inOut'})
    var ws=words(card.querySelector('.split'));if(ws.length)tl.from(ws,{yPercent:110,duration:.6,stagger:.06},.25);
    tl      .from(card.querySelectorAll('.intro__k, p:not(.intro__k), .hots, .ctas'),{yPercent:40,clipPath:'inset(0 0 100% 0)',duration:.5,stagger:.06},.35);return tl;}

  // ---------- hero: the bar reel holds in a frame; chapters wipe in and out; the reel moves to the side the card isn't on ----------
  var prog=document.getElementById('prog'),track=document.getElementById('track'),reelH=document.querySelector('.reel--hero');
  ST.create({trigger:track,start:'top top',end:'bottom bottom',onUpdate:function(s){prog.style.transform='scaleX('+s.progress.toFixed(4)+')';}});
  G.to('.film__hint',{autoAlpha:0,duration:.2,scrollTrigger:{trigger:track,start:'top -4%',toggleActions:'play none none reverse'}});
  ST.create({trigger:'main',start:'top 70%',onEnter:function(){B.classList.add('past');},onLeaveBack:function(){B.classList.remove('past');}});
  // the reel opens with a hard wipe on load, and leaves with one as the page rises over it
  G.fromTo(reelH,{clipPath:'inset(0 0 0 100%)'},{clipPath:'inset(0 0 0 0%)',duration:1.1,ease:'power4.inOut',delay:.15});
  var desk=matchMedia('(min-width:900px)');
  G.utils.toArray('#track .ch:not(.ch--end)').forEach(function(ch){var card=ch.querySelector('.card');if(!card)return;
    if(!ch.classList.contains('ch--intro')){var tl=reveal(card);
      ST.create({trigger:card,start:'top 82%',onEnter:function(){tl.play();},onLeaveBack:function(){tl.reverse();}});}
    else{reveal(card).play();}
    // exit: wipe upward (a hard mask edge on the chapter wrapper, so it never fights the card's entrance), scrubbed so it reverses exactly
    ST.create({trigger:card,start:function(){return 'top '+Math.round(Math.min(150,card.getBoundingClientRect().top+scrollY-2))+'px';},end:function(){return 'top '+Math.round(Math.min(60,card.getBoundingClientRect().top+scrollY-92))+'px';},
      onUpdate:function(s){var off=card.getBoundingClientRect().top-ch.getBoundingClientRect().top;ch.style.clipPath=s.progress>0?'inset('+Math.round(off+s.progress*card.offsetHeight)+'px 0 0 0)':'';},onLeaveBack:function(){ch.style.clipPath='';}});
  });
  // the page rises over the film with a hard edge; the reel wipes shut beneath it
  G.fromTo(reelH,{'--o':0},{'--o':1,ease:'none',scrollTrigger:{trigger:'main',start:'top bottom',end:'top 30%',scrub:true,onUpdate:function(s){reelH.style.clipPath='inset('+(s.progress*100).toFixed(2)+'% 0 0 0)';}}});

  // ---------- the one-word scene: FRITES is cut out of solid red; scrolling drives the camera through the I ----------
  var wsec=document.getElementById('frites-film');
  if(wsec&&matchMedia('(orientation:portrait)').matches){var sv=wsec.querySelector('.word');sv.setAttribute('viewBox','0 0 900 1600');
    sv.innerHTML='<defs><mask id="word-m" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="1600"><rect width="900" height="1600" fill="#fff"/><text class="word__t word__t--m" x="450" y="800" text-anchor="middle">FRI</text><text class="word__t--m" x="450" y="1180" text-anchor="middle" fill="#000">TES</text></mask></defs><text class="word__t word__t--m word__probe" x="450" y="800" text-anchor="middle" opacity="0">FRI</text><rect class="word__fill" width="900" height="1600" mask="url(#word-m)"/>';}
  if(wsec){var svg=wsec.querySelector('.word'),wt=svg.querySelectorAll('mask text'),probe=svg.querySelector('.word__probe'),cap=wsec.querySelector('.impact__cap'),lab=wsec.querySelector('.film__label');
    var o='800 500';try{var e=probe.getExtentOfChar(2);o=(e.x+e.width/2).toFixed(1)+' '+(e.y+e.height*.55).toFixed(1);}catch(x){if(svg.viewBox.baseVal.width===900)o='450 700';}
    G.set(cap,{clipPath:'inset(0 100% 0 0)'});G.set(lab,{clipPath:'inset(0 100% 0 0)'});
    var wtl=G.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:wsec,start:'top top',end:'bottom bottom',scrub:.35}});
    wtl.fromTo(wt,{scale:1,svgOrigin:o},{scale:64,svgOrigin:o,duration:.55,ease:'power2.in'},.05)
       .set(svg,{visibility:'hidden'},.6)
       .to(cap,{clipPath:'inset(0 0% 0 0)',duration:.12,ease:'power4.inOut'},.64)
       .from(words(cap.querySelector('.split')),{yPercent:110,duration:.12,stagger:.02,ease:'power3.out'},.68)
       .to(lab,{clipPath:'inset(0 0% 0 0)',duration:.08},.66)
       .to({},{duration:.2},.8);}

  // ---------- brunch: the frame opens from a small square with a hard-edged wipe ----------
  var osec=document.getElementById('brunch-film');
  if(osec){var rr=osec.querySelector('.reel--open'),cap2=osec.querySelector('.impact__cap'),lab2=osec.querySelector('.film__label');
    G.set([cap2,lab2],{clipPath:'inset(0 100% 0 0)'});
    G.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:osec,start:'top top',end:'bottom bottom',scrub:.35}})
      .fromTo(rr,{clipPath:'inset(36% 40% 36% 40%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'power3.inOut'},0)
      .to(cap2,{clipPath:'inset(0 0% 0 0)',duration:.12,ease:'power4.inOut'},.55)
      .from(words(cap2.querySelector('.split')),{yPercent:110,duration:.12,stagger:.03,ease:'power3.out'},.6)
      .to(lab2,{clipPath:'inset(0 0% 0 0)',duration:.08},.58)
      .to({},{duration:.25},.75);}

  // ---------- page sections: heads and pictures arrive with hard-edged wipes (once, then stay) ----------
  G.utils.toArray('main .sec-head, main .frame, main .plate img, main .story li, main .space').forEach(function(el,i){
    G.fromTo(el,{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:.7,ease:'power4.inOut',scrollTrigger:{trigger:el,start:'top 88%',once:true}});});

  // the Raymakers chapter is centred on screen at exactly 50% of the opening
  var door=document.querySelector('#ch-door');
  function centreDoor(){if(!door)return;door.style.marginTop='0px';var c=door.querySelector('.card'),vh=innerHeight,S0=track.getBoundingClientRect().top+scrollY,R0=track.offsetHeight-vh,
      c0=c.getBoundingClientRect().top+scrollY+c.offsetHeight/2,x=Math.max(0,Math.round(2*(vh/2+S0+.5*R0-c0)));door.style.marginTop=x+'px';}
  ST.addEventListener('refreshInit',centreDoor);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){ST.refresh();});
  if(document.readyState==='complete')ST.refresh();else addEventListener('load',function(){ST.refresh();});
  window.__rdFilm={films:function(){return films.map(function(f){return f.state();});},started:function(){return started;},lite:lite};
})();
