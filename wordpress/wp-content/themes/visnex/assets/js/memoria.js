/**
 * D'MIKA — La memoria.
 * ---------------------------------------------------------------------------
 * La tienda se acuerda de lo que estabas mirando.
 *
 * QUE HACE
 * Guarda las ultimas prendas que se han visto y, al volver a la portada, saluda
 * con ellas: "Seguias mirando el abrigo".
 *
 * POR QUE
 * Es lo que hace la persona que atiende en una tienda de barrio. No es una
 * funcionalidad, es un gesto — y es el gesto que convierte un sitio en TU
 * sitio. Ademas recupera compras: la mayoria de la gente no compra en la
 * primera visita, y volver a encontrar lo que estabas mirando ahorra la parte
 * mas aburrida de volver.
 *
 * QUE SE GUARDA Y DONDE
 * Titulo, direccion, precio y foto de hasta seis prendas. En localStorage, o
 * sea EN ESE NAVEGADOR: no viaja a ningun servidor, no hay cuenta, no hay
 * cookie de seguimiento y nadie mas lo ve. Se puede borrar desde el propio
 * saludo.
 */
(function () {
  'use strict';

  var LLAVE = 'dm_vistas';
  var TOPE = 6;

  function leer() {
    try {
      var s = localStorage.getItem(LLAVE);
      var v = s ? JSON.parse(s) : [];
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }

  function guardar(v) {
    try { localStorage.setItem(LLAVE, JSON.stringify(v.slice(0, TOPE))); } catch (e) { /* da igual */ }
  }

  function olvidar() {
    try { localStorage.removeItem(LLAVE); } catch (e) { /* da igual */ }
  }

  /* ---------------------------------------------------------------------
     1. APUNTAR — solo en la ficha de producto
     --------------------------------------------------------------------- */

  function apuntar() {
    var caja = document.querySelector('[data-dm-ficha]');
    if (!caja) return;

    var prenda = {
      id:     caja.dataset.dmFicha,
      nombre: caja.dataset.dmNombre || '',
      url:    location.pathname,
      precio: caja.dataset.dmPrecio || '',
      img:    caja.dataset.dmImg || '',
      // Para poder ordenar por lo mas reciente y caducar lo viejo.
      visto:  Date.now()
    };
    if (!prenda.id || !prenda.nombre) return;

    var vistas = leer().filter(function (v) { return v.id !== prenda.id; });
    vistas.unshift(prenda);
    guardar(vistas);
  }

  /* ---------------------------------------------------------------------
     2. SALUDAR — solo en la portada
     --------------------------------------------------------------------- */

  function saludar() {
    var hueco = document.querySelector('[data-dm-memoria]');
    if (!hueco) return;

    var vistas = leer();

    // Un mes. Pasado ese tiempo, "seguias mirando" es mentira: nadie sigue
    // mirando algo que vio hace cinco semanas, y recordarselo es raro.
    var MES = 31 * 24 * 60 * 60 * 1000;
    var ahora = Date.now();
    vistas = vistas.filter(function (v) { return v.visto && (ahora - v.visto) < MES; });

    if (vistas.length !== leer().length) guardar(vistas);
    if (!vistas.length) return;

    var titulo = document.createElement('div');
    titulo.className = 'dm-memoria__cab';

    var h = document.createElement('h2');
    h.className = 'dm-memoria__titulo';
    // Con una sola prenda se la nombra; con varias, no cabe.
    h.textContent = vistas.length === 1
      ? 'Seguías mirando ' + vistas[0].nombre.toLowerCase()
      : 'Donde lo dejaste';
    titulo.appendChild(h);

    var olvida = document.createElement('button');
    olvida.className = 'dm-memoria__olvidar';
    olvida.type = 'button';
    olvida.textContent = 'Olvidar';
    // Que se pueda borrar es parte del trato: la tienda se acuerda porque
    // resulta comodo, no porque no haya forma de evitarlo.
    olvida.addEventListener('click', function () {
      olvidar();
      hueco.classList.add('is-yendose');
      setTimeout(function () { hueco.remove(); }, 380);
    });
    titulo.appendChild(olvida);

    var tira = document.createElement('div');
    tira.className = 'dm-memoria__tira';

    vistas.forEach(function (v, i) {
      var a = document.createElement('a');
      a.className = 'dm-memoria__pieza';
      a.href = v.url;
      a.style.setProperty('--d', (i * 0.07) + 's');

      if (v.img) {
        var img = document.createElement('img');
        img.src = v.img;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        a.appendChild(img);
      }

      var n = document.createElement('span');
      n.className = 'dm-memoria__n';
      n.textContent = v.nombre;
      a.appendChild(n);

      if (v.precio) {
        var p = document.createElement('span');
        p.className = 'dm-memoria__p';
        // El precio se guardo como texto plano al apuntarlo, no como HTML.
        p.textContent = v.precio;
        a.appendChild(p);
      }

      tira.appendChild(a);
    });

    hueco.appendChild(titulo);
    hueco.appendChild(tira);
    hueco.hidden = false;
    requestAnimationFrame(function () { hueco.classList.add('is-viva'); });
  }

  function arrancar() {
    apuntar();
    saludar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
