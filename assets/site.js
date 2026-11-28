/* MOSARQ — carrinho de orçamento (WhatsApp), vídeos que repetem ao voltar ao topo e ano do rodapé */
(function () {
  'use strict';
  var WA = '554198659043';
  var KEY = 'mosarq-orcamento';
  var dlg = document.getElementById('cart');
  var btn = document.querySelector('.cart-btn');
  var count = btn && btn.querySelector('.cart-count');
  var state = { s: [], ref: '' };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved && saved.s) state = saved; } catch (e) {}

  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function sync() {
    if (!dlg) return;
    [].forEach.call(dlg.querySelectorAll('input[name=svc]'), function (i) { i.checked = state.s.indexOf(i.value) > -1; });
    var n = state.s.length;
    if (count) { count.textContent = n; count.hidden = n === 0; }
    if (btn) btn.setAttribute('aria-label', n ? 'Abrir orçamento: ' + n + (n > 1 ? ' serviços selecionados' : ' serviço selecionado') : 'Abrir orçamento');
    var ref = dlg.querySelector('.cart-ref');
    if (ref) { ref.hidden = !state.ref; ref.querySelector('strong').textContent = state.ref || ''; }
  }
  function open() {
    if (!dlg) return;
    sync();
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    document.documentElement.classList.add('cart-open');
  }
  function bump() { if (!btn) return; btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump'); }

  if (dlg) {
    dlg.addEventListener('close', function () { document.documentElement.classList.remove('cart-open'); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('change', function (e) {
      if (e.target.name !== 'svc') return;
      state.s = [].filter.call(dlg.querySelectorAll('input[name=svc]'), function (i) { return i.checked; }).map(function (i) { return i.value; });
      save(); sync();
    });
    var x = dlg.querySelector('.cart-ref-x');
    if (x) x.addEventListener('click', function () { state.ref = ''; save(); sync(); });
    dlg.querySelector('.cart-send').addEventListener('click', function () {
      var labels = [].filter.call(dlg.querySelectorAll('input[name=svc]'), function (i) { return i.checked; }).map(function (i) { return i.getAttribute('data-label'); });
      var hint = dlg.querySelector('.cart-hint');
      if (!labels.length) { hint.textContent = 'Escolha pelo menos um serviço para montar o orçamento.'; return; }
      hint.textContent = '';
      var nota = (dlg.querySelector('textarea').value || '').trim();
      var msg = 'Olá, Johnathan! Vim pelo site da MOSARQ e gostaria de um orçamento para: ' + labels.join(', ') + '.';
      if (state.ref) msg += '\nInspiração: ' + state.ref + '.';
      if (nota) msg += '\nSobre o espaço: ' + nota;
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }
  if (btn) btn.addEventListener('click', open);
  [].forEach.call(document.querySelectorAll('[data-open-cart]'), function (b) { b.addEventListener('click', open); });
  [].forEach.call(document.querySelectorAll('[data-add]'), function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-add');
      if (state.s.indexOf(k) < 0) state.s.push(k);
      if (b.getAttribute('data-ref')) state.ref = b.getAttribute('data-ref');
      save(); sync(); bump(); open();
    });
  });
  sync();

  /* Vídeos de abertura (logo reveal): tocam uma vez e repetem quando a pessoa volta ao topo */
  [].forEach.call(document.querySelectorAll('video[data-replay]'), function (v) {
    v.muted = true; v.defaultMuted = true;
    var left = false;
    var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    play();
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (en) {
      var e = en[0];
      if (!e.isIntersecting) { left = true; v.pause(); return; }
      if (left && e.intersectionRatio > 0.5) { left = false; try { v.currentTime = 0; } catch (err) {} play(); }
    }, { threshold: [0, 0.5] }).observe(v);
  });

  [].forEach.call(document.querySelectorAll('.year'), function (y) { y.textContent = new Date().getFullYear(); });
})();
