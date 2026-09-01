/**
 * D'MIKA — Capa inmersiva.
 *
 * Reglas que se siguen aqui:
 *   - Nada es imprescindible. Si este archivo no carga, la tienda funciona
 *     igual: todo lo que hace es ceremonia.
 *   - Cero dependencias.
 *   - Se apaga entero con prefers-reduced-motion.
 *   - El trabajo pesado (paralaje, revelados) lo hace CSS con
 *     `animation-timeline`, que corre en el compositor. Aqui solo queda lo que
 *     CSS no puede: leer la posicion del raton y partir titulares en lineas.
 */
(function () {
  'use strict';

  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tactil = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (quieto) return;

  /* =====================================================================
     Cursor
     ================================================================== */

  function cursor() {
    if (tactil) return;

    var p = document.createElement('div');
    p.className = 'vn-cursor';
    p.setAttribute('aria-hidden', 'true');
    document.body.appendChild(p);

    var x = innerWidth / 2, y = innerHeight / 2;   // destino
    var cx = x, cy = y;                            // posicion actual
    var vivo = false;

    addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      if (!vivo) { cx = x; cy = y; vivo = true; p.classList.add('is-vivo'); }
    }, { passive: true });

    addEventListener('mouseleave', function () { p.classList.remove('is-vivo'); });
    addEventListener('mouseenter', function () { p.classList.add('is-vivo'); });

    // Persecucion con retardo: el punto llega un instante despues que el
    // raton. Ese retardo es lo que se percibe como "peso".
    (function seguir() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      p.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      requestAnimationFrame(seguir);
    })();

    // El estado se decide por lo que hay DEBAJO del raton, no por listeners en
    // cada elemento: asi funciona tambien con lo que se anada despues.
    var ultimo = '';
    addEventListener('mousemove', function (e) {
      var el = document.elementFromPoint(e.clientX, e.clientY);
      var estado = '';
      if (el) {
        if (el.closest('a, button, input, select, textarea, [role="button"], summary')) estado = 'is-activo';
        else if (el.closest('img, picture, .vn-split__panel, .vn-card-cat, .vn-duo, .vn-strip')) estado = 'is-media';
      }
      if (estado !== ultimo) {
        p.classList.remove('is-activo', 'is-media');
        if (estado) p.classList.add(estado);
        ultimo = estado;
      }
    }, { passive: true });
  }

  /* =====================================================================
     Revelado de titulares — NO se hace aqui
     --------------------------------------------------------------------
     motion.js ya trocea los titulares en palabras con mascara y escalonado,
     y marca `dataset.vnPartido`. Yo tenia aqui una version por LINEAS que
     usaba esa misma bandera: como motion.js corre antes, la mia salia por la
     puerta y no pintaba nada — 0 lineas en la comprobacion.
     Dos implementaciones del mismo efecto es peor que una: se queda la suya.
     ================================================================== */

  /* =====================================================================
     Inclinacion 3D
     ================================================================== */

  function inclinacion() {
    if (tactil) return;

    var sel = '.vn-card-cat, .woocommerce ul.products li.product, .vn-duo__item, .vn-strip';
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.add('vn-tilt');
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

      if (!el.querySelector('.vn-tilt__brillo')) {
        var b = document.createElement('span');
        b.className = 'vn-tilt__brillo';
        b.setAttribute('aria-hidden', 'true');
        el.appendChild(b);
      }

      var pendiente = false;
      el.addEventListener('mousemove', function (e) {
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(function () {
          var r = el.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;
          // Maximo 6 grados: pasado ese punto parece un truco de feria.
          el.style.setProperty('--vn-tilt-y', ((px - .5) * 6).toFixed(2) + 'deg');
          el.style.setProperty('--vn-tilt-x', ((.5 - py) * 6).toFixed(2) + 'deg');
          el.style.setProperty('--vn-mx', (px * 100).toFixed(1) + '%');
          el.style.setProperty('--vn-my', (py * 100).toFixed(1) + '%');
          pendiente = false;
        });
      }, { passive: true });

      el.addEventListener('mouseleave', function () {
        el.style.setProperty('--vn-tilt-x', '0deg');
        el.style.setProperty('--vn-tilt-y', '0deg');
      });
    });
  }

  /* =====================================================================
     Continuidad entre paginas
     --------------------------------------------------------------------
     Se nombra la foto sobre la que se hace clic para que el navegador la
     lleve de la rejilla a la ficha en vez de recargar de golpe.
     ================================================================== */

  function continuidad() {
    if (!document.startViewTransition) return;
    document.addEventListener('click', function (e) {
      var enlace = e.target.closest('.woocommerce ul.products li.product a');
      if (!enlace) return;
      var img = enlace.closest('li.product').querySelector('img');
      if (img) img.style.setProperty('--vn-vt', 'vn-producto');
    }, true);
  }

  /* =====================================================================
     Carril horizontal: se arrastra con el raton, no solo con la rueda
     ================================================================== */

  function carriles() {
    document.querySelectorAll('.vn-carril').forEach(function (c) {
      var abajo = false, x0 = 0, s0 = 0;
      c.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse') return;
        abajo = true; x0 = e.clientX; s0 = c.scrollLeft;
        c.style.cursor = 'grabbing';
      });
      addEventListener('pointerup', function () { abajo = false; c.style.cursor = ''; });
      c.addEventListener('pointermove', function (e) {
        if (!abajo) return;
        e.preventDefault();
        c.scrollLeft = s0 - (e.clientX - x0);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  function arrancar() {
    window.__vnInmOK = true;
    cursor();
    inclinacion();
    continuidad();
    carriles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
