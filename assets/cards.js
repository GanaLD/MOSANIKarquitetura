/* MOSARQ — Cards GSAP: scroll horizontal fixado (desktop), com encaixe por card, parallax da textura e barra de progresso */
(function () {
  'use strict';
  addEventListener('load', function () {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ST);
    var mm = gsap.matchMedia();
    mm.add('(min-width: 701px)', function () {
      var track = document.getElementById('track');
      var panels = gsap.utils.toArray('.panel');
      var bar = document.querySelector('.proc-progress span');
      var steps = panels.length - 1;
      var dist = function () { return innerWidth * steps; };
      var main = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: '.horizontal', start: 'top 100px', end: function () { return '+=' + dist(); },
          pin: true, scrub: 0.6, invalidateOnRefresh: true,
          snap: { snapTo: 1 / steps, directional: false, inertia: false, duration: { min: 0.25, max: 0.6 }, delay: 0.08, ease: 'power2.inOut' },
          onUpdate: function (self) { if (bar) gsap.set(bar, { scaleX: 1 / panels.length + self.progress * (steps / panels.length) }); }
        }
      });
      panels.forEach(function (p, i) {
        var tex = p.querySelector('.tex'), glass = p.querySelector('.glass');
        gsap.fromTo(tex, { xPercent: -9 }, { xPercent: 9, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: main, start: 'left right', end: 'right left', scrub: true } });
        if (i === 0) return;
        gsap.fromTo(glass, { autoAlpha: 0.35 }, {
          autoAlpha: 1, ease: 'none',
          scrollTrigger: { trigger: p, containerAnimation: main, start: 'left 70%', end: 'left 20%', scrub: true }
        });
      });
    });
  });
})();

/* Alinhamento: todos os cards de vidro com a mesma altura (desktop) */
(function () {
  'use strict';
  var mq = matchMedia('(min-width: 701px)');
  function equal() {
    var gs = [].slice.call(document.querySelectorAll('.horizontal .glass'));
    gs.forEach(function (g) { g.style.minHeight = ''; });
    if (!mq.matches) return;
    var h = Math.max.apply(null, gs.map(function (g) { return g.offsetHeight; }));
    gs.forEach(function (g) { g.style.minHeight = h + 'px'; });
  }
  addEventListener('load', equal);
  addEventListener('resize', function () { clearTimeout(equal.t); equal.t = setTimeout(equal, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(equal);
})();
