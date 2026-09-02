/**
 * D'MIKA — La lupa de tejido.
 * ---------------------------------------------------------------------------
 * Al pasar el raton sobre la foto del producto aparece un circulo que ensena
 * esa zona ampliada tres veces.
 *
 * POR QUE ESTO Y NO OTRA COSA
 * La duda real de quien compra ropa por internet no es el corte —eso se ve en
 * la foto— sino el TEJIDO: como es de grueso, si el punto se ve, si el blanco
 * es blanco o tira a crudo. Un catalogo normal no lo ensena nunca, y por eso
 * la gente compra dos tallas o directamente no compra. Esto lo ensena sin
 * pedir un clic ni abrir nada.
 *
 * COMO
 * El circulo no lleva otra imagen dentro: lleva la MISMA foto como fondo, a
 * mayor tamano y desplazada para que bajo el cursor quede el punto que se
 * estaba mirando. Es una sola imagen en toda la pagina — la que el navegador
 * ya descargo— asi que no cuesta ni una peticion mas.
 *
 * Se usa la foto de mas resolucion que WordPress haya publicado en el srcset;
 * si se ampliara la de 800 px, a 3x se veria el pixel.
 *
 * REGLAS
 *  - Nada de raton, nada de lupa: en tactil no existe "pasar por encima", y un
 *    circulo que persigue al dedo tapa justo lo que se quiere ver.
 *  - Se apaga entera con prefers-reduced-motion.
 *  - Si algo falla, la foto se queda como estaba.
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  var AUMENTO = 3;
  var LADO = 200;          // diametro del circulo, en px

  function montar(figura) {
    var img = figura.querySelector('img.wp-post-image, img');
    if (!img) return;

    var lupa = document.createElement('div');
    lupa.className = 'dm-lupa';
    lupa.setAttribute('aria-hidden', 'true');
    lupa.innerHTML = '<span class="dm-lupa__eti">Tejido &times;' + AUMENTO + '</span>';
    figura.appendChild(lupa);
    figura.classList.add('dm-tiene-lupa');

    // La de mas resolucion del srcset. Si no hay srcset, la que haya.
    function mejorFuente() {
      var mejor = img.currentSrc || img.src;
      var srcset = img.getAttribute('srcset');
      if (srcset) {
        var top = 0;
        srcset.split(',').forEach(function (parte) {
          var t = parte.trim().split(/\s+/);
          var w = parseInt(t[1], 10) || 0;
          if (w > top) { top = w; mejor = t[0]; }
        });
      }
      return mejor;
    }

    var fuente = '';
    var caja = null;
    var pendiente = false;
    var ex = 0, ey = 0;

    function pintar() {
      pendiente = false;
      if (!caja) return;
      // Posicion relativa dentro de la foto, de 0 a 1.
      var px = (ex - caja.left) / caja.width;
      var py = (ey - caja.top) / caja.height;

      lupa.style.left = (ex - caja.left) + 'px';
      lupa.style.top = (ey - caja.top) + 'px';
      lupa.style.backgroundSize = (caja.width * AUMENTO) + 'px ' + (caja.height * AUMENTO) + 'px';
      // El menos LADO/2 centra el punto mirado en el circulo, no en su esquina.
      lupa.style.backgroundPosition =
        (-(px * caja.width * AUMENTO) + LADO / 2) + 'px ' +
        (-(py * caja.height * AUMENTO) + LADO / 2) + 'px';
    }

    figura.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      // La caja se mide al ENTRAR y no en cada movimiento: getBoundingClientRect
      // fuerza al navegador a recalcular la maqueta, y hacerlo sesenta veces
      // por segundo sobre una foto grande se nota.
      caja = img.getBoundingClientRect();
      if (!fuente) {
        fuente = mejorFuente();
        lupa.style.backgroundImage = 'url("' + fuente + '")';
      }
      figura.classList.add('is-lupa');
    });

    figura.addEventListener('pointerleave', function () {
      figura.classList.remove('is-lupa');
    });

    figura.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      ex = e.clientX; ey = e.clientY;
      if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); }
    }, { passive: true });

    // Al cambiar de foto (galeria) o de tamano, la medida vieja no sirve.
    addEventListener('resize', function () { caja = null; figura.classList.remove('is-lupa'); }, { passive: true });
    addEventListener('scroll', function () { if (caja) caja = img.getBoundingClientRect(); }, { passive: true });
  }

  function arrancar() {
    var figura = document.querySelector('.woocommerce-product-gallery__wrapper');
    if (figura) montar(figura);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
