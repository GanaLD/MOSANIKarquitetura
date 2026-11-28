/* MOSARQ — entradas suaves nas páginas internas (GSAP, respeita movimento reduzido) */
addEventListener('load',function(){
  'use strict';
  var g=window.gsap,ST=window.ScrollTrigger;
  if(!g||!ST||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  g.registerPlugin(ST);
  var img=document.querySelector('.feature-frame img');
  if(img)g.fromTo(img,{scale:1.12},{scale:1,ease:'none',scrollTrigger:{trigger:'.feature-frame',start:'top bottom',end:'bottom top',scrub:true}});
  g.utils.toArray('[data-reveal]').forEach(function(el){
    g.from(el.children,{y:36,opacity:0,duration:.9,ease:'power3.out',stagger:.08,scrollTrigger:{trigger:el,start:'top 85%',once:true}});
  });
});
