/**
 * VISNEX — Movimiento.
 *
 * QUE HACE Y QUE NO
 * Este archivo solo añade ceremonia. Si no se ejecuta —porque falla, porque el
 * navegador es viejo o porque el usuario pidió menos movimiento— la tienda se
 * ve entera y se puede comprar igual. Nada de lo de aquí es imprescindible, y
 * está escrito para que eso sea verdad y no una intención.
 *
 * La mayor parte del movimiento vive en `motion.css` y la ejecuta el navegador
 * fuera del hilo principal (`animation-timeline`). Aquí queda solo lo que CSS
 * todavía no puede hacer solo:
 *
 *   1. Partir los titulares en palabras para poder enmascararlas.
 *   2. El respaldo de aparición donde no existe `animation-timeline: view()`.
 *   3. El cursor de las zonas de imagen.
 *   4. Marcar los elementos que deben revelarse, sin ensuciar el PHP de clases.
 *
 * Cero dependencias.
 */
(function () {
  'use strict';

  var quietoPorFavor = window.matchMedia('(prefers-reduced-motion: reduce)');
  var hayRaton = window.matchMedia('(hover: hover) and (pointer: fine)');
  var soportaScrollNativo =
    CSS && CSS.supports && CSS.supports('animation-timeline', 'view()');

  /* =====================================================================
     1. MARCAR LO QUE SE REVELA
     ---------------------------------------------------------------------
     Se hace desde JavaScript y no escribiendo las clases en el PHP por un
     motivo concreto: si el JS no llega a ejecutarse, el marcado nunca lleva
     `.vn-reveal` y por tanto NUNCA queda nada oculto esperando una animación
     que no va a ocurrir. El fallo, si ocurre, deja la página completa.
     ================================================================== */

  var A_REVELAR = [
    '.vn-section__header',
    '.vn-card-cat',
    '.vn-duo__item',
    '.vn-strip__body',
    '.vn-editorial__content',
    '.vn-trust__item',
    '.vn-newsletter__title',
    '.vn-newsletter__subtitle',
    '.vn-newsletter__form',
    '.woocommerce ul.products li.product'
  ];

  var A_DESVELAR = [
    '.vn-card-cat',
    '.vn-duo__item',
    '.vn-editorial__image'
  ];

  function marcar() {
    if (quietoPorFavor.matches) return;

    document.querySelectorAll(A_REVELAR.join(',')).forEach(function (el) {
      el.classList.add('vn-reveal');
    });

    // Escalonado dentro de cada rejilla: los hermanos no llegan a la vez, llegan
    // en fila. Es la diferencia entre "aparecio un bloque" y "se estan
    // colocando las cosas". Se reinicia cada 6 para que el ultimo de una fila
    // larga no espere medio segundo.
    ['.vn-grid-cats', '.vn-duo', '.vn-trust__grid', '.woocommerce ul.products'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (rejilla) {
        Array.prototype.forEach.call(rejilla.children, function (hijo, i) {
          hijo.style.setProperty('--i', i % 6);
        });
      });
    });

    document.querySelectorAll(A_DESVELAR.join(',')).forEach(function (el) {
      el.classList.add('vn-unveil');
    });

    var editorial = document.querySelector('.vn-editorial__image');
    if (editorial) editorial.classList.add('vn-parallax');
  }

  /* =====================================================================
     2. TITULARES PARTIDOS EN PALABRAS
     ---------------------------------------------------------------------
     Cada palabra va dentro de una máscara y sube desde debajo de su línea.
     Se parte por PALABRAS, no por letras: por letras se lee como efecto de
     plantilla y además un lector de pantalla acabaría deletreando.

     El texto accesible se conserva intacto porque solo se reordena el
     marcado — no se toca el contenido — y los espacios se mantienen como
     nodos de texto reales, así que el titular se sigue seleccionando y
     copiando como una frase normal.
     ================================================================== */

  function partirTitulares() {
    if (quietoPorFavor.matches) return;

    var titulares = document.querySelectorAll(
      '.vn-split__title, .vn-section__title, .vn-strip__title, .vn-editorial__title, .vn-newsletter__title'
    );

    titulares.forEach(function (h) {
      // Solo titulares de texto plano: si alguien mete un <em> o un <br>, se
      // deja como está antes que romperlo.
      if (h.children.length || h.dataset.vnPartido) return;

      var texto = h.textContent.trim();
      if (!texto || texto.length > 120) return;

      var palabras = texto.split(/\s+/);
      var frag = document.createDocumentFragment();

      palabras.forEach(function (palabra, i) {
        var mascara = document.createElement('span');
        mascara.className = 'vn-word';
        mascara.style.setProperty('--i', i);

        var interior = document.createElement('span');
        interior.textContent = palabra;

        mascara.appendChild(interior);
        frag.appendChild(mascara);

        if (i < palabras.length - 1) {
          frag.appendChild(document.createTextNode(' '));
        }
      });

      h.textContent = '';
      h.appendChild(frag);
      h.classList.add('vn-headline');
      h.dataset.vnPartido = '1';
    });
  }

  /* =====================================================================
     3. DISPARADOR DE APARICIONES
     ---------------------------------------------------------------------
     Con `animation-timeline: view()` el navegador se encarga solo y aquí no
     hace falta observar nada — salvo los titulares partidos, que sí necesitan
     una clase porque su animación es una transición escalonada.
     ================================================================== */

  function observar() {
    if (quietoPorFavor.matches) {
      document
        .querySelectorAll('.vn-reveal, .vn-unveil, .vn-headline')
        .forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var objetivos = soportaScrollNativo
      ? document.querySelectorAll('.vn-headline')
      : document.querySelectorAll('.vn-reveal, .vn-unveil, .vn-headline');

    if (!objetivos.length) return;

    if (!('IntersectionObserver' in window)) {
      objetivos.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -12% 0px' }
    );

    objetivos.forEach(function (el) { io.observe(el); });
  }

  /* =====================================================================
     4. CURSOR DE LAS ZONAS DE IMAGEN
     ---------------------------------------------------------------------
     Un disco que sigue al ratón y dice VER cuando pasa sobre una foto que
     lleva a algún sitio. Convierte una imagen en algo que invita a entrar.

     Solo con ratón de verdad. Nunca sobre texto ni sobre campos de
     formulario: ahí el cursor del sistema comunica algo (dónde se escribe,
     qué se puede seleccionar) y sustituirlo es quitar información.

     La posición se escribe en un rAF y con `translate3d`, así que el
     movimiento lo hace la GPU y no provoca ni un solo recálculo de estilo.
     ================================================================== */

  function cursor() {
    if (!hayRaton.matches || quietoPorFavor.matches) return;

    var zonas = document.querySelectorAll(
      '.vn-split__panel, .vn-card-cat, .vn-duo__item, .vn-editorial__image'
    );
    if (!zonas.length) return;

    var disco = document.createElement('div');
    disco.className = 'vn-cursor';
    disco.setAttribute('aria-hidden', 'true');
    disco.textContent = 'Ver';
    document.body.appendChild(disco);

    var x = -200, y = -200, pendiente = false;

    function pintar() {
      disco.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      pendiente = false;
    }

    document.addEventListener(
      'mousemove',
      function (e) {
        x = e.clientX;
        y = e.clientY;
        if (!pendiente) {
          pendiente = true;
          requestAnimationFrame(pintar);
        }
      },
      { passive: true }
    );

    zonas.forEach(function (zona) {
      zona.classList.add('vn-cursor-zone');
      zona.addEventListener('mouseenter', function () {
        disco.classList.add('is-on');
      });
      zona.addEventListener('mouseleave', function () {
        disco.classList.remove('is-on');
      });
    });

    // Si el ratón se va de la ventana, el disco no se queda colgado.
    document.addEventListener('mouseleave', function () {
      disco.classList.remove('is-on');
    });
  }

  /* =====================================================================
     5. BARRA DE PROGRESO
     ---------------------------------------------------------------------
     El elemento se crea aquí para no dejarlo en el marcado de todas las
     páginas cuando el navegador no vaya a animarlo. Si soporta
     `animation-timeline: scroll()`, CSS lo mueve solo y este archivo no
     vuelve a tocarlo: ni un listener de scroll.
     ================================================================== */

  function progreso() {
    if (quietoPorFavor.matches) return;
    if (!CSS.supports('animation-timeline', 'scroll()')) return;

    var barra = document.createElement('div');
    barra.className = 'vn-progress';
    barra.setAttribute('aria-hidden', 'true');
    document.body.appendChild(barra);
  }

  /* =====================================================================
     Arranque
     ================================================================== */

  function iniciar() {
    try {
      marcar();
      partirTitulares();
      observar();
      cursor();
      progreso();
    } catch (e) {
      // Si algo falla, la tienda se queda quieta pero completa. Se registra
      // para poder verlo en la consola, y no se vuelve a intentar.
      if (window.console && console.warn) {
        console.warn('[VISNEX] movimiento desactivado:', e);
      }
      document
        .querySelectorAll('.vn-reveal, .vn-unveil, .vn-headline')
        .forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

  // Si el usuario cambia su preferencia de movimiento sin recargar, se le hace
  // caso al momento.
  quietoPorFavor.addEventListener('change', function (e) {
    if (e.matches) {
      document
        .querySelectorAll('.vn-reveal, .vn-unveil, .vn-headline')
        .forEach(function (el) { el.classList.add('is-visible'); });
      var d = document.querySelector('.vn-cursor');
      if (d) d.remove();
      var b = document.querySelector('.vn-progress');
      if (b) b.remove();
    }
  });
})();
