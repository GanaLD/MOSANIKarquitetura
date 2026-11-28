/* MOSARQ — movimento ao rolar: abertura em tela cheia, textos por palavra,
   seções que sobem sobre a anterior e imagens que se abrem. Respeita "reduzir movimento". */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var intro = document.querySelector('.intro');
  var introDone = !intro;
  var waiters = [];
  function whenIntro(fn) { if (introDone) fn(); else waiters.push(fn); }
  function finishIntro() {
    if (introDone) return; introDone = true;
    document.documentElement.classList.remove('intro-lock');
    waiters.splice(0).forEach(function (f) { f(); });
  }

  /* 1. Abertura em tela cheia (logo reveal) — uma vez por visita */
  if (intro) {
    var seen = false; try { seen = sessionStorage.getItem('mosarq-intro') === '1'; } catch (e) {}
    if (reduce || seen) { intro.classList.add('done'); finishIntro(); }
    else {
      document.documentElement.classList.add('intro-lock');
      var v = intro.querySelector('video'), closed = false;
      var close = function () {
        if (closed) return; closed = true;
        try { sessionStorage.setItem('mosarq-intro', '1'); } catch (e) {}
        var g = window.gsap;
        if (g) g.to(intro, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.inOut', onComplete: function () { intro.classList.add('done'); } });
        else intro.classList.add('done');
        setTimeout(finishIntro, 450);
      };
      if (v) {
        v.muted = true;
        v.addEventListener('ended', close);
        v.addEventListener('timeupdate', function () { if (v.duration && v.currentTime > v.duration - 0.35) close(); });
        var p = v.play(); if (p && p.catch) p.catch(function () { setTimeout(close, 900); });
      }
      setTimeout(close, 16000);
      intro.addEventListener('click', close);
      addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') close(); }, { once: true });
    }
  }

  /* 2. Divide títulos em palavras (mantém <br> e o texto para leitores de tela) */
  var SEL = '[data-split], .split-copy h1, .split-copy h2, .lr-copy h1, .refs-head h2, .cta-band h2, .reveal h2, .gallery h2, .tour h2';
  function split(el) {
    if (el.dataset.splitDone) return; el.dataset.splitDone = '1';
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    [].slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType !== 3 || !n.textContent.trim()) return;
      var frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(function (t) {
        if (!t) return;
        if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
        var i = document.createElement('i'); i.textContent = t; w.appendChild(i); frag.appendChild(w);
      });
      n.parentNode.replaceChild(frag, n);
    });
  }

  addEventListener('load', function () {
    var g = window.gsap, ST = window.ScrollTrigger;
    if (!g || !ST || reduce) { finishIntro(); return; }
    g.registerPlugin(ST);
    var heads = [].slice.call(document.querySelectorAll(SEL)).filter(function (h) { return !h.closest('dialog,.intro,.panel'); });
    heads.forEach(split);
    heads.forEach(function (h) {
      var ws = h.querySelectorAll('.w>i');
      if (!ws.length) return;
      g.set(ws, { yPercent: 115 });
      var top = h.getBoundingClientRect().top < innerHeight;
      var play = function () { g.to(ws, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.045 }); };
      if (top) whenIntro(function () { setTimeout(play, 120); });
      else ST.create({ trigger: h, start: 'top 88%', once: true, onEnter: play });
    });

    var mm = g.matchMedia();
    /* 3. Seções que sobem sobre a anterior (desktop) */
    mm.add('(min-width: 901px)', function () {
      [].forEach.call(document.querySelectorAll('.hero-v, .lr-media, .ct-hero'), function (el) {
        var next = el.nextElementSibling || (el.parentElement && el.parentElement.nextElementSibling);
        if (el.classList.contains('lr-media')) next = el.nextElementSibling;
        if (!next) return;
        next.classList.add('stack-over');
        ST.create({ trigger: el, start: 'top 100px', end: 'bottom 100px', pin: true, pinSpacing: false });
        g.fromTo(g.utils.toArray(el.children), { scale: 1, filter: 'brightness(1)' }, { scale: 0.92, filter: 'brightness(.55)', ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 100px', end: 'bottom 100px', scrub: true } });
      });
      var tex = document.querySelector('.ct-tex');
      if (tex) g.to(tex, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.ct-hero', start: 'top top', end: 'bottom top', scrub: true } });
    });

    /* 4. Imagens que se abrem ao entrar na tela */
    [].forEach.call(document.querySelectorAll('.split-media, .gal-grid figure, .ref-media, .cta-process .cp-steps'), function (el) {
      var img = el.querySelector('img');
      g.fromTo(el, { clipPath: 'inset(9% 7% 9% 7% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 45%', scrub: 0.6 } });
      if (img) g.fromTo(img, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* 5. Blocos que sobem suavemente */
    [].forEach.call(document.querySelectorAll('.split-copy > p, .split-copy dl, .split-copy .btn-row, .lr-copy p, .refs-head p, .cp-copy p, .cp-copy .btn-row, .about-text p, .about-big, .faq details, .ct-card p, .ct-card .btn-row, .credits, .pn'), function (el) {
      if (el.closest('[data-reveal]')) return;
      var top = el.getBoundingClientRect().top < innerHeight;
      var t = g.from(el, { y: 40, autoAlpha: 0, duration: 1, ease: 'power3.out', paused: true });
      if (top) whenIntro(function () { setTimeout(function () { t.play(); }, 350); });
      else ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { t.play(); } });
    });
    setTimeout(function () { ST.refresh(); }, 300);
  });
})();
