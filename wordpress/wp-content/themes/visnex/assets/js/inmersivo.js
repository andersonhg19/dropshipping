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

  // Las zonas que se comportan como "foto en la que se puede entrar". Se
  // declara fuera para que la use tanto el marcado (cursor: none) como la
  // deteccion por elementFromPoint, y no se puedan desincronizar.
  var ZONAS = '.vn-split__panel, .vn-card-cat, .vn-duo__item, .vn-editorial__image, .vn-strip';

  function cursor() {
    if (tactil) return;

    var p = document.createElement('div');
    p.className = 'vn-cursor';
    p.setAttribute('aria-hidden', 'true');

    // La etiqueta va en su propio elemento y no como texto suelto del disco:
    // asi puede aparecer y desaparecer con su propia transicion, y sobre todo
    // no desborda cuando el disco mide 10 px. Esa era exactamente la averia
    // que dejaba un "er" flotando junto al raton.
    var txt = document.createElement('span');
    txt.className = 'vn-cursor__txt';
    txt.textContent = 'Ver';
    p.appendChild(txt);

    document.body.appendChild(p);

    // Sobre las zonas de foto se esconde el cursor del sistema: si se ven los
    // dos, el disco parece un adorno pegado y no el cursor.
    document.querySelectorAll(ZONAS).forEach(function (z) {
      z.classList.add('vn-cursor-zone');
    });

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
    //
    // El bucle SE PARA cuando el punto alcanza al raton. Antes era un
    // requestAnimationFrame infinito: gastaba un cuadro cada 16 ms aunque
    // nadie moviera el raton, y ademas dejaba la pagina permanentemente
    // "ocupada" — cualquier herramienta que espere a que el navegador quede
    // en reposo se quedaba esperando para siempre.
    var corriendo = false;
    function seguir() {
      var dx = x - cx, dy = y - cy;
      cx += dx * 0.18;
      cy += dy * 0.18;
      p.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      // Medio pixel de margen: por debajo, el ojo no distingue y no hay
      // motivo para seguir gastando cuadros.
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        requestAnimationFrame(seguir);
      } else {
        corriendo = false;
      }
    }
    function despertar() {
      if (corriendo) return;
      corriendo = true;
      requestAnimationFrame(seguir);
    }
    addEventListener('mousemove', despertar, { passive: true });

    // El estado se decide por lo que hay DEBAJO del raton, no por listeners en
    // cada elemento: asi funciona tambien con lo que se anada despues.
    var ultimo = '';
    addEventListener('mousemove', function (e) {
      var el = document.elementFromPoint(e.clientX, e.clientY);
      var estado = '';
      if (el) {
        // El orden importa: una zona de foto suele SER un enlace. Si se
        // preguntara antes por el enlace, el disco de "Ver" no saldria nunca.
        if (el.closest(ZONAS)) estado = 'is-media';
        else if (el.closest('a, button, input, select, textarea, [role="button"], summary')) estado = 'is-activo';
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
