// Red Dot scenes: crisp framed reels (slow camera moves across Red Dot's own full-resolution photos, H.264 + WebM),
// one scroll clock (GSAP ScrollTrigger), hard-edged masked wipes and staggered type. No fades between sections, no gradients.
// Every reel is held at <= 1.0 source px per device px: --rw = clip width / devicePixelRatio.
(function(){
  var B=document.body;if(!B.classList.contains('exp'))return;
  var G=window.gsap,ST=window.ScrollTrigger;if(!G||!ST){B.classList.remove('exp');return;}
  G.registerPlugin(ST);ST.config({ignoreMobileResize:true});
  var lite=B.classList.contains('lite'),V='1';
  var webm=(function(){var v=document.createElement('video');return !!(v.canPlayType&&v.canPlayType('video/webm; codecs="vp9"'));})();

  // ---------- reels: size cap, source pick, play only while on screen ----------
  var reels=[].slice.call(document.querySelectorAll('.reel[data-reel]'));
  function dpr(){return window.devicePixelRatio||1;}
  function sizeReels(){reels.forEach(function(r){var W=+r.dataset.w;r.style.setProperty('--rw',(W/dpr()).toFixed(1)+'px');});}
  function srcFor(r){var name=r.dataset.reel;if(name==='bar-584')return 'vid/bar-584';
    return 'vid/'+name+(r.clientWidth*dpr()>1280?'-1080':'-720');}
  function load(r){if(r._loaded||lite)return;r._loaded=true;var v=r.querySelector('video'),b=srcFor(r);
    if(webm){var s1=document.createElement('source');s1.src=b+'.webm?v='+V;s1.type='video/webm';v.appendChild(s1);}
    var s2=document.createElement('source');s2.src=b+'.mp4?v='+V;s2.type='video/mp4';v.appendChild(s2);
    v.addEventListener('playing',function(){r.classList.add('is-playing');});v.load();}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){var r=e.target,v=r.querySelector('video');
    if(e.isIntersecting){load(r);if(v){var p=v.play();if(p&&p.catch)p.catch(function(){});}}else if(v&&!v.paused)v.pause();});},{rootMargin:'60% 0px'});
  sizeReels();reels.forEach(function(r){io.observe(r);});
  addEventListener('resize',function(){sizeReels();});

  // ---------- staggered type: split headings into words that rise through a hard line mask ----------
  [].slice.call(document.querySelectorAll('.split')).forEach(function(h){if(h.dataset.split)return;h.dataset.split=1;var t=h.textContent;h.setAttribute('aria-label',t);
    h.innerHTML=t.trim().split(/\s+/).map(function(w){return '<span class="w" aria-hidden="true"><span>'+w+'</span></span>';}).join(' ');});
  function words(el){return el?el.querySelectorAll('.w>span'):[];}
  // a card arrives as a hard-edged wipe, then its words rise in sequence
  function reveal(card){var tl=G.timeline({paused:true,defaults:{ease:'power3.out'}});
    tl.fromTo(card,{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.55,ease:'power4.inOut'})
      .from(words(card.querySelector('.split')),{yPercent:110,duration:.6,stagger:.06},.25)
      .from(card.querySelectorAll('.intro__k, p:not(.intro__k), .hots, .ctas'),{yPercent:40,clipPath:'inset(0 0 100% 0)',duration:.5,stagger:.06},.35);return tl;}

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
    ST.create({trigger:card,start:function(){return 'top '+(desk.matches?130:Math.round(Math.min(reelH.getBoundingClientRect().bottom+20,card.getBoundingClientRect().top-2)))+'px';},end:function(){return 'top '+(desk.matches?20:Math.round(reelH.getBoundingClientRect().bottom-80))+'px';},
      onUpdate:function(s){var off=card.getBoundingClientRect().top-ch.getBoundingClientRect().top;ch.style.clipPath=s.progress>0?'inset('+Math.round(off+s.progress*card.offsetHeight)+'px 0 0 0)':'';},onLeaveBack:function(){ch.style.clipPath='';}});
    // desktop: the reel slides to the side opposite the card (scrubbed with the chapter)
    if(desk.matches&&card.classList.contains('card--r'))G.to(reelH,{x:function(){var r=reelH.getBoundingClientRect();return -(r.left-Math.max(24,(innerWidth-1240)/2));},ease:'power2.inOut',
      scrollTrigger:{trigger:ch,start:'top 60%',end:'top 10%',scrub:.4,invalidateOnRefresh:true}});
    if(desk.matches&&!card.classList.contains('card--r')&&!ch.classList.contains('ch--intro'))G.to(reelH,{x:0,ease:'power2.inOut',scrollTrigger:{trigger:ch,start:'top 60%',end:'top 10%',scrub:.4}});
  });
  // the page rises over the film with a hard edge; the reel wipes shut beneath it
  G.fromTo(reelH,{'--o':0},{'--o':1,ease:'none',scrollTrigger:{trigger:'main',start:'top bottom',end:'top 30%',scrub:true,onUpdate:function(s){reelH.style.clipPath='inset('+(s.progress*100).toFixed(2)+'% 0 0 0)';}}});

  // ---------- the one-word scene: FRITES is cut out of solid red; scrolling drives the camera through the I ----------
  var wsec=document.getElementById('frites-film');
  if(wsec){var svg=wsec.querySelector('.word'),wt=svg.querySelector('mask .word__t'),probe=svg.querySelector('.word__probe'),cap=wsec.querySelector('.impact__cap'),lab=wsec.querySelector('.film__label');
    var o='800 500';try{var e=probe.getExtentOfChar(2);o=(e.x+e.width/2).toFixed(1)+' '+(e.y+e.height*.55).toFixed(1);}catch(x){}
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
  // file width of a poster (naturalWidth is density-corrected for srcset images, so it can't measure scale)
  function fw(u){return /-1080\./.test(u)?1920:/-584\.|-720\./.test(u)?1280:0;}
  window.__rdScene={reels:function(){return reels.map(function(r){var v=r.querySelector('video'),p=r.querySelector('.reel__p'),b=r.getBoundingClientRect();
    return {name:r.dataset.reel,cssW:Math.round(b.width),cssH:Math.round(b.height),video:v.currentSrc||'',vw:v.videoWidth,vh:v.videoHeight,playing:r.classList.contains('is-playing'),
      vScale:v.videoWidth?+(b.width*dpr()/v.videoWidth).toFixed(3):null,poster:p.currentSrc,pw:fw(p.currentSrc),pScale:p.currentSrc?+(b.width*dpr()/fw(p.currentSrc)).toFixed(3):null};});}};
})();
