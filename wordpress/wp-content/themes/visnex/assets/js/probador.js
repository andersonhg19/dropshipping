/**
 * D'MIKA — El Probador.
 * ---------------------------------------------------------------------------
 * Dos preguntas, una recomendacion de talla, y NO VUELVE A PREGUNTAR.
 *
 * Lo ultimo es lo que importa. La respuesta se guarda en el navegador, asi que
 * en la siguiente prenda el boton ya no dice "¿Me va a quedar?" sino "Para ti,
 * la M" — y basta con pulsarlo para confirmarlo contra esa prenda concreta.
 *
 * Es la diferencia entre una tienda y una tienda de barrio: que se acuerden de
 * tu talla.
 *
 * Lo guardado es una talla y un tramo de altura. Nada que identifique a nadie,
 * y vive solo en ese navegador: no viaja al servidor mas que para preguntar por
 * una prenda concreta.
 */
(function () {
  'use strict';

  var LLAVE = 'dm_medidas';

  function leer() {
    try {
      var s = localStorage.getItem(LLAVE);
      return s ? JSON.parse(s) : null;
    } catch (e) { return null; }   // modo privado, o almacenamiento lleno
  }

  function guardar(m) {
    try { localStorage.setItem(LLAVE, JSON.stringify(m)); } catch (e) { /* da igual */ }
  }

  function arrancar() {
    var caja = document.querySelector('.dm-probador');
    if (!caja || typeof DM_PROBADOR === 'undefined') return;

    var boton     = caja.querySelector('[data-dm-probador-abrir]');
    var etiqueta  = caja.querySelector('[data-dm-probador-etiqueta]');
    var panel     = caja.querySelector('[data-dm-probador-panel]');
    var respuesta = caja.querySelector('[data-dm-probador-respuesta]');
    var producto  = caja.dataset.dmProducto;

    var medidas = leer() || {};

    // Si ya se conoce la talla, el boton lo dice desde el principio.
    if (medidas.habitual) {
      etiqueta.textContent = 'Para ti, la ' + medidas.habitual + ' — comprobar';
      caja.classList.add('is-conocido');
      marcarElegidas();
    }

    function marcarElegidas() {
      caja.querySelectorAll('[data-dm-campo]').forEach(function (grupo) {
        var campo = grupo.dataset.dmCampo;
        grupo.querySelectorAll('.dm-probador__op').forEach(function (b) {
          b.classList.toggle('is-elegida', b.dataset.dmValor === medidas[campo]);
        });
      });
    }

    function completo() {
      return !!medidas.habitual && !!medidas.altura;
    }

    function preguntar() {
      if (!completo()) return;

      respuesta.hidden = false;
      respuesta.innerHTML = '<span class="dm-probador__latido" aria-hidden="true"></span>';

      var cuerpo = new URLSearchParams();
      cuerpo.set('action', 'dm_probador');
      cuerpo.set('nonce', DM_PROBADOR.nonce);
      cuerpo.set('producto', producto);
      cuerpo.set('habitual', medidas.habitual);
      cuerpo.set('altura', medidas.altura);

      fetch(DM_PROBADOR.url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: cuerpo.toString()
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res || !res.success) {
            return pintarAviso((res && res.data && res.data.mensaje) || 'No pude calcularlo.');
          }
          pintar(res.data);
        })
        .catch(function () { pintarAviso('Se cayó la conexión. Inténtalo otra vez.'); });
    }

    function pintarAviso(texto) {
      respuesta.textContent = texto;
    }

    function pintar(d) {
      respuesta.innerHTML = '';

      var t = document.createElement('strong');
      t.className = 'dm-probador__titulo';
      t.textContent = d.titulo;
      respuesta.appendChild(t);

      [d.texto, d.aviso, d.devolver].forEach(function (linea, i) {
        if (!linea) return;
        var p = document.createElement('span');
        p.className = 'dm-probador__linea' + (i === 1 ? ' dm-probador__linea--nota' : '');
        p.textContent = linea;
        respuesta.appendChild(p);
      });

      if (d.talla) {
        etiqueta.textContent = 'Para ti, la ' + medidas.habitual + ' — comprobar';
        caja.classList.add('is-conocido');
        elegirEnElFormulario(d.talla);
      }
    }

    /**
     * Deja la talla recomendada ELEGIDA en el desplegable de WooCommerce.
     *
     * Es el gesto que convierte el consejo en accion: no hay que leer la
     * recomendacion y despues buscarla en otro sitio. Se dispara `change` a
     * mano porque WooCommerce escucha ese evento para calcular precio y stock,
     * y una asignacion directa a .value no lo emite.
     */
    function elegirEnElFormulario(talla) {
      var sel = document.querySelector('.variations select');
      if (!sel) return;
      var opcion = Array.prototype.find.call(sel.options, function (o) {
        return o.value.toUpperCase() === talla.toUpperCase()
            || o.textContent.trim().toUpperCase() === talla.toUpperCase();
      });
      if (!opcion) return;
      sel.value = opcion.value;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }

    boton.addEventListener('click', function () {
      var abierto = !panel.hidden;
      panel.hidden = abierto;
      caja.classList.toggle('is-abierto', !abierto);
      // Si ya se sabe todo, al abrir se contesta directamente en vez de
      // obligar a repetir dos respuestas que ya se dieron.
      if (!abierto && completo()) preguntar();
    });

    caja.addEventListener('click', function (e) {
      var op = e.target.closest('.dm-probador__op');
      if (!op) return;
      var grupo = op.closest('[data-dm-campo]');
      if (!grupo) return;

      medidas[grupo.dataset.dmCampo] = op.dataset.dmValor;
      guardar(medidas);
      marcarElegidas();
      preguntar();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
