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
    addEventListener('resize',place);
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
