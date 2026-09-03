/**
 * D'MIKA — La Bolsa.
 * ---------------------------------------------------------------------------
 * Anadir al carrito deja de sacarte de la tienda.
 *
 * EL VUELO
 * La foto de la prenda se despega, viaja hasta el icono de la bolsa y
 * desaparece dentro. Dura 750 ms y describe una curva, no una recta: un objeto
 * lanzado nunca va en linea recta, y el ojo lo sabe aunque no sepa por que.
 *
 * Ese medio segundo hace un trabajo concreto: dice QUE se anadio y DONDE fue a
 * parar. Sin el, el unico aviso es un numerito que cambia en una esquina, y
 * mucha gente ni lo ve — de ahi vienen los "creo que no se anadio" y los
 * pedidos con la misma prenda tres veces.
 *
 * SI ALGO FALLA
 * Se deja al formulario hacer lo de siempre: recargar e ir al carrito. Peor
 * experiencia, pero la compra sigue siendo posible. Nunca se traga un clic.
 */
(function () {
  'use strict';

  var QUIETO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function arrancar() {
    var panel = document.getElementById('dm-bolsa');
    if (!panel || typeof DM_BOLSA === 'undefined') return;

    var cuerpo = panel.querySelector('[data-dm-bolsa-cuerpo]');
    var iconos = document.querySelectorAll('.dm-cab__accion[href*="cart"], .dm-cab__carrito, [data-dm-bolsa-abrir]');
    var contador = document.querySelector('[data-dm-cuenta]');

    /* ------------------------------------------------------------------
       Abrir y cerrar
       ------------------------------------------------------------------ */

    function abrir() {
      panel.hidden = false;
      requestAnimationFrame(function () { panel.classList.add('is-abierta'); });
      document.documentElement.style.overflow = 'hidden';
      var cerrar = panel.querySelector('[data-dm-bolsa-cerrar]');
      if (cerrar) cerrar.focus({ preventScroll: true });
    }

    function cerrar() {
      panel.classList.remove('is-abierta');
      document.documentElement.style.overflow = '';
      setTimeout(function () { panel.hidden = true; }, 420);
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-dm-bolsa-cerrar]')) { cerrar(); return; }

      // El icono de la bolsa abre el cajon en vez de ir a la pagina del
      // carrito. Con Ctrl o rueda, se respeta el enlace: quien quiere abrir en
      // otra pestana tiene derecho a hacerlo.
      var icono = e.target.closest('.dm-cab__accion[href*="cart"], [data-dm-bolsa-abrir]');
      if (icono && !e.metaKey && !e.ctrlKey && e.button === 0) {
        e.preventDefault();
        abrir();
      }
    });

    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) cerrar();
    });

    /* ------------------------------------------------------------------
       El vuelo
       ------------------------------------------------------------------ */

    function destino() {
      var i = document.querySelector('.dm-cab__accion[href*="cart"], [data-dm-bolsa-abrir]');
      if (!i) return null;
      var r = i.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, el: i };
    }

    function volar(img) {
      if (QUIETO || !img) return;
      var meta = destino();
      if (!meta) return;

      var r = img.getBoundingClientRect();
      if (!r.width) return;

      var copia = img.cloneNode(true);
      copia.className = 'dm-vuelo';
      copia.style.left = r.left + 'px';
      copia.style.top = r.top + 'px';
      copia.style.width = r.width + 'px';
      copia.style.height = r.height + 'px';
      document.body.appendChild(copia);

      // La curva: sube antes de caer. Un objeto lanzado no va en linea recta, y
      // el ojo lo nota aunque no sepa por que. Se hace con dos tramos de
      // animacion en vez de uno.
      var dx = meta.x - (r.left + r.width / 2);
      var dy = meta.y - (r.top + r.height / 2);

      copia.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0 },
        { transform: 'translate(' + (dx * 0.45) + 'px,' + (dy * 0.25 - 90) + 'px) scale(.62)', opacity: .95, offset: .55 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.06)', opacity: 0, offset: 1 }
      ], {
        duration: 750,
        easing: 'cubic-bezier(.36,.06,.32,1)',
        fill: 'forwards'
      }).onfinish = function () {
        copia.remove();
        // La bolsa acusa el golpe. Sin esto, la prenda llega y no pasa nada.
        if (meta.el) {
          meta.el.classList.add('is-golpe');
          setTimeout(function () { meta.el.classList.remove('is-golpe'); }, 460);
        }
      };
    }

    /* ------------------------------------------------------------------
       Refrescar el cajon
       ------------------------------------------------------------------ */

    function refrescar(accion, extra) {
      var cuerpoPeticion = new URLSearchParams();
      cuerpoPeticion.set('action', accion || 'dm_bolsa');
      cuerpoPeticion.set('nonce', DM_BOLSA.nonce);
      if (extra) {
        Object.keys(extra).forEach(function (k) { cuerpoPeticion.set(k, extra[k]); });
      }

      return fetch(DM_BOLSA.url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: cuerpoPeticion.toString()
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res || !res.success) return;
          cuerpo.innerHTML = res.data.html;
          if (contador) {
            contador.textContent = res.data.total;
            contador.hidden = res.data.total < 1;
          }
        });
    }

    /* ------------------------------------------------------------------
       Anadir
       ------------------------------------------------------------------ */

    document.addEventListener('submit', function (e) {
      var form = e.target.closest('form.cart');
      if (!form) return;

      // Un producto variable sin variacion elegida: que WooCommerce haga su
      // trabajo y avise. Interceptarlo aqui seria tragarse el aviso.
      var varId = form.querySelector('input[name="variation_id"]');
      if (form.classList.contains('variations_form') && (!varId || !varId.value || varId.value === '0')) {
        return;
      }

      e.preventDefault();

      var img = document.querySelector('.woocommerce-product-gallery__wrapper img');
      volar(img);

      var datos = new FormData(form);
      var boton = form.querySelector('.single_add_to_cart_button');
      if (boton) {
        datos.set('add-to-cart', boton.value || datos.get('add-to-cart') || '');
        boton.classList.add('is-cargando');
      }

      fetch(DM_BOLSA.anadirWc, { method: 'POST', credentials: 'same-origin', body: datos })
        .then(function () { return refrescar(); })
        .then(function () {
          if (boton) boton.classList.remove('is-cargando');
          // El cajon se abre DESPUES del vuelo: si se abre a la vez, la prenda
          // aterriza detras del panel y no se ve llegar.
          setTimeout(abrir, QUIETO ? 0 : 620);
        })
        .catch(function () {
          // Si algo falla, se manda el formulario de siempre: peor experiencia,
          // pero la compra sigue siendo posible.
          if (boton) boton.classList.remove('is-cargando');
          form.submit();
        });
    });

    // Anadir desde la rejilla (WooCommerce lo hace ya por AJAX y avisa asi).
    document.body.addEventListener('added_to_cart', function () {
      refrescar().then(function () { setTimeout(abrir, 260); });
    });

    document.addEventListener('click', function (e) {
      var suelto = e.target.closest('.woocommerce ul.products .add_to_cart_button');
      if (suelto) {
        var tarjeta = suelto.closest('li.product');
        var f = tarjeta && tarjeta.querySelector('img');
        volar(f);
      }
    });

    /* ------------------------------------------------------------------
       Quitar
       ------------------------------------------------------------------ */

    panel.addEventListener('click', function (e) {
      var quitar = e.target.closest('[data-dm-quitar]');
      if (!quitar) return;
      e.preventDefault();
      var fila = quitar.closest('.dm-bolsa__item');
      if (fila) fila.classList.add('is-yendose');
      refrescar('dm_bolsa_quitar', { clave: quitar.dataset.dmQuitar });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
