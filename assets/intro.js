/* MOSARQ — Intro (logo reveal). Toca uma vez por sessão, pulável, sem JS ou com movimento reduzido não aparece. */
(function () {
  'use strict';
  var root = document.documentElement;
  var intro = document.getElementById('intro');
  if (!intro) return;
  var parts = Array.prototype.slice.call(document.querySelectorAll('body > header, body > main, body > footer, .skip'));
  var done = false;

  function setInert(v) { parts.forEach(function (el) { if (v) { el.setAttribute('inert', ''); } else { el.removeAttribute('inert'); } }); }

  function finish(immediate) {
    if (done) return; done = true;
    try { sessionStorage.setItem('mq-intro', '1'); } catch (e) {}
    function close() {
      root.classList.remove('js-intro'); intro.setAttribute('hidden', ''); setInert(false);
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }
    if (immediate || !window.gsap) { close(); return; }
    window.gsap.to(intro, { opacity: 0, duration: 0.55, ease: 'power2.inOut', onComplete: close });
  }

  if (!root.classList.contains('js-intro') || !window.gsap || !window.MosarqLogoReveal) { finish(true); return; }

  setInert(true);
  var tl = window.MosarqLogoReveal.mount(document.getElementById('introStage'));
  var skip = intro.querySelector('.intro-skip');
  skip.addEventListener('click', function () { tl.kill(); finish(false); });
  document.addEventListener('keydown', function (e) { if (!done && e.key === 'Escape') { tl.kill(); finish(false); } });
  tl.eventCallback('onComplete', function () { window.gsap.delayedCall(0.45, function () { finish(false); }); });
  tl.play();
  skip.focus({ preventScroll: true });
  // trava de segurança: nunca prende o visitante
  window.setTimeout(function () { finish(false); }, 7000);
})();
