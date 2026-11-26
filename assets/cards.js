/* MOSARQ — Cards GSAP: scroll horizontal fixado (desktop), parallax da textura e barra de progresso */
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
      var dist = function () { return innerWidth * (panels.length - 1); };
      var main = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: '.horizontal', start: 'top 100px', end: function () { return '+=' + dist(); },
          pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: function (self) { if (bar) gsap.set(bar, { scaleX: 1 / 3 + self.progress * (2 / 3) }); }
        }
      });
      panels.forEach(function (p) {
        var tex = p.querySelector('.tex'), num = p.querySelector('.num'), glass = p.querySelector('.glass');
        var st = { trigger: p, containerAnimation: main, start: 'left right', end: 'right left', scrub: true };
        gsap.fromTo(tex, { xPercent: -9 }, { xPercent: 9, ease: 'none', scrollTrigger: st });
        gsap.fromTo(num, { xPercent: 14 }, { xPercent: -14, ease: 'none', scrollTrigger: st });
        gsap.fromTo(glass, { opacity: 0.2, y: 40, scale: 0.96 }, {
          opacity: 1, y: 0, scale: 1, ease: 'power2.out',
          scrollTrigger: { trigger: p, containerAnimation: main, start: 'left 85%', end: 'left 35%', scrub: true }
        });
      });
    });
  });
})();
