// Red Dot film: scroll-scrubbed WebP frame sequences on canvas (GSAP ScrollTrigger, hosted locally).
// The footage is illustrative motion generated from Red Dot's own photos, not filmed.
// Engine reused from the Poured / The Hill film builds: tiers by canvas size x DPR (capped at 2),
// a light preview ladder that lands first, nothing requested before the first scroll, poster under the canvas.
(function(){
  var B=document.body,root=document.documentElement;
  if(!B.classList.contains('exp'))return;
  var G=window.gsap,ST=window.ScrollTrigger;
  if(!G||!ST){B.classList.remove('exp');return;}
  G.registerPlugin(ST);ST.config({ignoreMobileResize:true});
  var lite=B.classList.contains('lite'),ext='webp',avifKnown=false;
  var avif=new Promise(function(res){var t=new Image();t.onload=function(){res(t.width===2);};t.onerror=function(){res(false);};
    t.src='data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADrbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAETAAAAIgAAAChpaW5mAAAAAAABAAAAGmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAABqaXBycAAAAEtpcGNvAAAAFGlzcGUAAAAAAAAAAgAAAAIAAAAQcGl4aQAAAAADCAgIAAAADGF2MUOBAAwAAAAAE2NvbHJuY2x4AAEADQAGgAAAABdpcG1hAAAAAAAAAAEAAQQBAoMEAAAAKm1kYXQSAAoIGAA2iAhoNCAyFBlHh4Yhh5555oAAAJBAyRxhQoFI';})
    .then(function(a){ext=a?'avif':'webp';avifKnown=true;pump();});
  var FV='1',STEP=3,TIERS=[{k:'d',h:1080},{k:'x',h:1440}];
  function cap(){return Math.min(window.devicePixelRatio||1,2);}
  function portrait(){return innerHeight>innerWidth;}

  // ---------- Film: one canvas, frames from one progress clock ----------
  function Film(el,data){
    this.el=el;this.name=data.dataset.film;this.n=+data.dataset.frames;
    this.box=el.closest('.impact')||document.getElementById('track');
    this.cv=el.querySelector('canvas');this.ctx=this.cv.getContext('2d');this.poster=el.querySelector('.film__poster');
    this.cur=0;this.dir=1;this.shown=false;this.set=null;this.gen=0;this.near=this.name==='hero';this.reset();this.size();
  }
  var F=Film.prototype;
  F.reset=function(){var n=this.n;this.gen++;this.full=new Array(n);this.lq=new Array(n);this.ok=new Uint8Array(n);this.lok=new Uint8Array(n);
    this.req=new Uint8Array(n);this.lreq=new Uint8Array(n);this.drawn=-1;this.drawnQ='';};
  F.pick=function(){if(portrait())return 'm';var c=this.cv,need=Math.max((c.clientWidth||innerWidth)*cap()/16*9,(c.clientHeight||innerHeight)*cap()),t=TIERS[0];
    for(var i=0;i<TIERS.length;i++){t=TIERS[i];if(t.h>=need*.9)break;}return t.k;};
  F.isL=function(i){return i%STEP===0||i===this.n-1;};
  // sharp frames: per-frame AVIF (lowest quality that still matches the master, SSIM floor), WebP where AVIF won't decode
  F.src=function(i,lq){var s=String(i+1);while(s.length<3)s='0'+s;return 'frames/'+this.name+'/'+(lq?(this.set==='m'?'mq':'dq'):this.set)+'/'+s+(lq?'.webp':'.'+ext)+'?v='+FV;};
  F.size=function(){var d=cap(),w=this.cv.clientWidth||innerWidth,h=this.cv.clientHeight||innerHeight;
    var W=Math.round(w*d),H=Math.round(h*d);if(W!==this.cv.width||H!==this.cv.height){this.cv.width=W;this.cv.height=H;}
    this.ctx.imageSmoothingEnabled=true;this.ctx.imageSmoothingQuality='high';
    var t=this.pick();if(t!==this.set){var had=this.set;this.set=t;if(had){this.reset();this.seed();pump();}}
    this.draw(this.cur,true);};
  // the poster is frame 1 of the same tier, already on screen: it seeds the canvas without a frame request
  F.seed=function(){var self=this,im=this.poster,g=this.gen;if(!im)return;
    function use(){var src=im.currentSrc||im.src;if(g!==self.gen||!im.naturalWidth)return;
      if((self.set==='m')!==/poster-m/.test(src))return;self.lq[0]=im;self.lok[0]=1;self.draw(self.cur,true);}
    if(im.complete)use();else im.addEventListener('load',use);};
  F.away=function(){var r=this.box.getBoundingClientRect(),h=innerHeight;return r.top>h?(r.top-h)/h:r.bottom<0?-r.bottom/h:0;};
  F.state=function(){var im=this.drawnQ==='full'?this.full[this.drawn]:this.lq[this.drawn];function s(a){var t=0;for(var i=0;i<a.length;i++)t+=a[i];return t;}
    return {ext:ext,name:this.name,set:this.set,n:this.n,cur:this.cur,drawn:this.drawn,drawnQ:this.drawnQ,loaded:s(this.ok),previews:s(this.lok),requested:s(this.req)+s(this.lreq),cw:this.cv.width,ch:this.cv.height,src:im?im.naturalWidth+'x'+im.naturalHeight:null};};
  F.go=function(p){this.draw(Math.round(Math.max(0,Math.min(1,p))*(this.n-1)));};
  F.draw=function(f,force){f=Math.max(0,Math.min(this.n-1,Math.round(f)));if(f===this.cur&&!force)return;if(f!==this.cur)this.dir=f>this.cur?1:-1;this.cur=f;
    // nearest sharp frame vs nearest preview; a preview wins only when it is 2+ frames closer
    var bf=-1,bl=-1,d;for(d=0;d<this.n&&(bf<0||bl<0);d++){
      if(bf<0){if(f-d>=0&&this.ok[f-d])bf=f-d;else if(f+d<this.n&&this.ok[f+d])bf=f+d;}
      if(bl<0){if(f-d>=0&&this.lok[f-d])bl=f-d;else if(f+d<this.n&&this.lok[f+d])bl=f+d;}}
    var at=-1,q='';if(bf>=0&&(bl<0||Math.abs(bf-f)<=Math.abs(bl-f)+1.5)){at=bf;q='full';}else if(bl>=0){at=bl;q='lq';}
    if(at<0||(at===this.drawn&&q===this.drawnQ&&!force)){pump();return;}
    var im=q==='full'?this.full[at]:this.lq[at],c=this.cv,cw=c.width,ch=c.height,s=Math.max(cw/im.naturalWidth,ch/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;
    this.ctx.drawImage(im,(cw-w)/2,(ch-h)/2,w,h);this.drawn=at;this.drawnQ=q;
    if(!this.shown&&at>0){this.shown=true;}
    pump();};
  // next request: previews first (closest to the reader), then sharp frames ahead of the scroll direction
  F.next=function(){var n=this.n,c=this.cur,dir=this.dir,best=-1,bd=1e9,i,d;
    for(i=0;i<n;i++){if(this.isL(i)&&!this.lreq[i]&&!this.lok[i]&&!this.ok[i]){d=Math.abs(i-c);if(d<bd){bd=d;best=i;}}}
    if(best>=0)return {i:best,lq:true,p:bd};
    for(i=0;i<n;i++){if(!this.req[i]){d=(i-c)*dir;d=d>=0?d:-d*2+1;if(d<bd){bd=d;best=i;}}}
    return best>=0?{i:best,lq:false,p:1000+bd}:null;};

  var films=[].slice.call(document.querySelectorAll('[data-film]')).map(function(el){return new Film(el.classList.contains('impact')?el.querySelector('.impact__media'):el,el);});
  var started=false,live=0,MAX=4,NEAR=2.5;
  function fetchOne(f,i,lq){var g=f.gen;live++;(lq?f.lreq:f.req)[i]=1;var im=new Image();im.decoding='async';
    function done(okk){live--;if(g===f.gen&&okk){if(lq){f.lq[i]=im;f.lok[i]=1;}else{f.full[i]=im;f.ok[i]=1;}if(Math.abs(i-f.cur)<=8)f.draw(f.cur,true);}pump();}
    im.onload=function(){(im.decode?im.decode():Promise.resolve()).then(function(){done(true);},function(){done(true);});};
    im.onerror=function(){done(false);}; // not retried; drawing falls back to neighbours and the poster
    im.src=f.src(i,lq);}
  var pumping=false;
  function pump(){if(!started||lite||pumping||!avifKnown)return;pumping=true;
    for(;;){var best=null,bp=1e18;
      for(var k=0;k<films.length;k++){var f=films[k],a=f.away();if(a>NEAR)continue;var c=f.next();if(!c)continue;
        var p=(c.lq?0:1e6)+a*1e4+c.p;if(p<bp){bp=p;best={f:f,c:c};}}
      if(!best||live>=(best.c.lq?2:MAX))break;fetchOne(best.f,best.c.i,best.c.lq);}
    pumping=false;}
  films.forEach(function(f){f.seed();});
  function go(){if(started)return;started=true;['scroll','wheel','touchmove','keydown'].forEach(function(e){removeEventListener(e,go);});pump();}
  ['scroll','wheel','touchmove','keydown'].forEach(function(e){addEventListener(e,go,{passive:true});});
  if(scrollY>0)go(); // opened part-way down
  var sq=0;addEventListener('scroll',function(){if(sq)return;sq=requestAnimationFrame(function(){sq=0;pump();});},{passive:true});
  var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){films.forEach(function(f){f.size();});},120);});

  // ---------- hero: the film follows the chapters; the veil lifts as you step in ----------
  var hero=films[0],prog=document.getElementById('prog'),hp={p:0};
  var tl=G.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'#track',start:'top top',end:'bottom bottom',scrub:.35}});
  tl.to(hp,{p:1,duration:1,onUpdate:function(){hero.go(hp.p);prog.style.transform='scaleX('+hp.p.toFixed(4)+')';}},0);
  tl.fromTo('.film__veil',{opacity:.62},{opacity:0,duration:.07,ease:'power1.out'},0);
  tl.to('.film__hint',{opacity:0,duration:.03},.01);
  ST.create({trigger:'main',start:'top 70%',onEnter:function(){B.classList.add('past');},onLeaveBack:function(){B.classList.remove('past');}});
  // the film dims softly as the page rises over it (no hard line: main carries a gradient top edge)
  G.fromTo('.film__shade',{opacity:0},{opacity:1,ease:'none',scrollTrigger:{trigger:'main',start:'top bottom',end:'top 20%',scrub:true}});
  // chapter cards (unchanged from the 3D build)
  G.utils.toArray('.ch .card:not(.card--intro)').forEach(function(c){G.fromTo(c,{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:.8,ease:'power2.out',scrollTrigger:{trigger:c,start:'top 85%',toggleActions:'play none none reverse'}});});
  G.from('.card--intro > :not(h1)',{autoAlpha:0,y:24,duration:1,stagger:.09,ease:'power3.out',delay:.25});G.from('#intro-h',{y:18,duration:1.1,ease:'power3.out',delay:.1});
  // each chapter softly leaves before it reaches the top bar (the chapter wrapper fades, the card keeps its own entrance)
  G.utils.toArray('#track .ch:not(.ch--end)').forEach(function(ch){
    G.fromTo(ch,{opacity:1},{opacity:0,ease:'none',immediateRender:false,scrollTrigger:{trigger:ch.querySelector('.card'),start:'top 130px',end:'top 40px',scrub:true}});});

  // ---------- impact films inside the page: sticky stage, soft veils in the neighbours' colours ----------
  films.slice(1).forEach(function(f){var sec=f.el.closest('.impact'),o={p:0};
    G.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:sec,start:'top top',end:'bottom bottom',scrub:.35}})
      .to(o,{p:1,duration:1,onUpdate:function(){f.go(o.p);}},0);
    G.fromTo(sec.querySelector('.impact__veil--top'),{opacity:1},{opacity:0,ease:'none',scrollTrigger:{trigger:sec,start:'top bottom',end:'top top',scrub:true}});
    G.fromTo(sec.querySelector('.impact__veil--bot'),{opacity:0},{opacity:1,ease:'none',scrollTrigger:{trigger:sec,start:'bottom bottom',end:'bottom 15%',scrub:true}});
    var cap=sec.querySelector('.impact__cap');
    G.fromTo(cap,{autoAlpha:0,y:40},{autoAlpha:1,y:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:sec,start:'top 25%',end:'bottom 70%',toggleActions:'play reverse play reverse'}});
  });

  // ---------- later sections: the same motion as before (cards rise and settle) ----------
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){ST.refresh();});
  if(document.readyState==='complete')ST.refresh();else addEventListener('load',function(){ST.refresh();});
  window.__rdFilm={films:function(){return films.map(function(f){return f.state();});},hero:function(){return hp.p;},started:function(){return started;},lite:lite};
})();
