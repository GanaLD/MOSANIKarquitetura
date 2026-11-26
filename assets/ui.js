/* MOSARQ — interações de UI: dock (pílula deslizante) e sanfona de imagens */
(function(){
  'use strict';
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Dock do tour 3D */
  var dock=document.querySelector('.dock');
  if(dock){
    var btns=[].slice.call(dock.querySelectorAll('button[data-room]'));
    var place=function(){
      var on=dock.querySelector('[aria-pressed=true]');if(!on)return;
      dock.style.setProperty('--x',on.offsetLeft+'px');dock.style.setProperty('--w',on.offsetWidth+'px');
      if(dock.scrollWidth>dock.clientWidth){var c=on.offsetLeft-(dock.clientWidth-on.offsetWidth)/2;dock.scrollTo({left:c,behavior:reduce?'auto':'smooth'})}
    };
    btns.forEach(function(b){b.addEventListener('click',function(){
      btns.forEach(function(o){o.setAttribute('aria-pressed',o===b?'true':'false')});place();
    })});
    dock.addEventListener('keydown',function(e){
      var i=btns.indexOf(document.activeElement);if(i<0)return;
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();var n=btns[(i+(e.key==='ArrowRight'?1:btns.length-1))%btns.length];n.focus();n.click()}
    });
    addEventListener('resize',place);addEventListener('mq:dock',place);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);
    place();requestAnimationFrame(place);
    dock.querySelector('.dock-pill').style.transition='none';
    requestAnimationFrame(function(){requestAnimationFrame(function(){dock.querySelector('.dock-pill').style.transition=''})});
  }

  /* Sanfona */
  var acc=document.querySelector('.accordion');
  if(acc){
    var trig=[].slice.call(acc.querySelectorAll('.acc-trigger'));
    var open=function(t){trig.forEach(function(o){o.setAttribute('aria-expanded',o===t?'true':'false')})};
    var canHover=matchMedia('(hover:hover) and (pointer:fine)').matches&&innerWidth>800;
    trig.forEach(function(t,i){
      t.addEventListener('click',function(){open(t)});
      if(canHover)t.addEventListener('mouseenter',function(){open(t)});
      t.addEventListener('focus',function(){open(t)});
      t.addEventListener('keydown',function(e){
        var k=e.key,d=(k==='ArrowRight'||k==='ArrowDown')?1:(k==='ArrowLeft'||k==='ArrowUp')?-1:0;
        if(!d)return;e.preventDefault();trig[(i+d+trig.length)%trig.length].focus();
      });
    });
    /* entrada com GSAP (apenas se disponível e sem movimento reduzido) */
    addEventListener('load',function(){
      if(reduce||!window.gsap||!window.ScrollTrigger)return;
      gsap.registerPlugin(ScrollTrigger);
      var items=acc.querySelectorAll('.acc-item');
      gsap.from(items,{y:48,opacity:0,duration:.9,ease:'power3.out',stagger:.09,scrollTrigger:{trigger:acc,start:'top 82%',once:true}});
    });
  }
})();

/* Menu mobile em tela cheia */
(function(){
  'use strict';
  var btn=document.querySelector('.menu-toggle'),nav=document.getElementById('site-nav'),root=document.documentElement;
  if(!btn||!nav)return;
  var label=btn.querySelector('.menu-label');
  function set(open){
    root.classList.toggle('menu-open',open);
    btn.setAttribute('aria-expanded',open?'true':'false');
    if(label)label.textContent=open?'Fechar':'Menu';
    if(open){var f=nav.querySelector('a');if(f)setTimeout(function(){f.focus({preventScroll:true})},350)}
  }
  btn.addEventListener('click',function(){set(btn.getAttribute('aria-expanded')!=='true')});
  nav.addEventListener('click',function(e){if(e.target.closest('a'))set(false)});
  document.addEventListener('keydown',function(e){
    if(!root.classList.contains('menu-open'))return;
    if(e.key==='Escape'){set(false);btn.focus();return}
    if(e.key==='Tab'){
      var items=[btn].concat([].slice.call(nav.querySelectorAll('a')));
      var i=items.indexOf(document.activeElement);
      if(e.shiftKey&&i<=0){e.preventDefault();items[items.length-1].focus()}
      else if(!e.shiftKey&&i===items.length-1){e.preventDefault();items[0].focus()}
    }
  });
  matchMedia('(min-width:701px)').addEventListener('change',function(m){if(m.matches)set(false)});
})();

/* Hero: vídeo de fundo (pausa acessível, movimento reduzido) e rolagem suave dos links internos */
(function(){
  'use strict';
  var v=document.querySelector('.hero-video'),b=document.querySelector('.hero-pause');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(v&&b){
    var set=function(paused){b.setAttribute('aria-pressed',paused?'true':'false');b.setAttribute('aria-label',paused?'Reproduzir vídeo de fundo':'Pausar vídeo de fundo')};
    if(reduce){v.removeAttribute('autoplay');v.pause();set(true)}
    b.addEventListener('click',function(){if(v.paused){v.play().catch(function(){});set(false)}else{v.pause();set(true)}});
    v.addEventListener('playing',function(){b.hidden=false});
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#"]');if(!a)return;
    var id=a.getAttribute('href');if(id.length<2)return;
    var t=document.querySelector(id);if(!t)return;
    e.preventDefault();
    var off=parseInt(getComputedStyle(document.documentElement).scrollPaddingTop)||0;
    scrollTo({top:t.getBoundingClientRect().top+scrollY-off,behavior:reduce?'auto':'smooth'});
    history.replaceState(null,'',id);
  });
  /* Recalcula posições do ScrollTrigger quando o layout muda depois do load */
  var refresh=function(){if(window.ScrollTrigger)window.ScrollTrigger.refresh()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refresh);
  addEventListener('mq:dock',refresh);
  addEventListener('load',function(){setTimeout(refresh,600)});
})();
