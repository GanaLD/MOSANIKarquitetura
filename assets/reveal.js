/* MOSARQ — Seção 2: logo reveal por scroll (uma vez), com fallback estático e sem movimento reduzido */
(function () {
  'use strict';
  var stage = document.getElementById('conceitoStage');
  var text = document.querySelector('.reveal-text');
  if (!stage) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function showText(now) {
    if (!text) return;
    if (now || !window.gsap) { text.style.opacity = 1; return; }
    window.gsap.fromTo(text, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
  }
  addEventListener('load', function () {
    if (!window.gsap || !window.ScrollTrigger || !window.MosarqLogoReveal) { showText(true); return; }
    window.gsap.registerPlugin(window.ScrollTrigger);
    var tl = window.MosarqLogoReveal.mount(stage);
    tl.pause(0);
    if (reduce) { tl.progress(1); showText(true); return; }
    window.ScrollTrigger.create({
      trigger: stage, start: 'top 55%', once: true,
      onEnter: function () { tl.eventCallback('onComplete', function () { showText(false); }); tl.play(); }
    });
  });
})();
