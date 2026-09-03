/**
 * D'MIKA — El Asesor.
 * ---------------------------------------------------------------------------
 * Tres preguntas, una cada vez, y al final un look armado.
 *
 * La regla que gobierna el ritmo: en una tienda de verdad, quien te atiende no
 * te pone un formulario delante. Hace UNA pregunta, espera la respuesta y hace
 * la siguiente. Por eso hay una pausa de 260 ms entre que se elige y avanza:
 * sin ella, el panel salta y se siente como una encuesta.
 *
 * Si algo falla -no hay red, el servidor devuelve error- se dice con palabras y
 * se ofrece volver a intentarlo. Un asesor que se queda mudo es peor que no
 * tenerlo.
 */
(function () {
  'use strict';

  // Se espera al documento aunque el marcado ya deberia estar.
  // Cinturon ademas del tirante: el panel se imprime en wp_footer con
  // prioridad 5 y los scripts en la 20, asi que a estas alturas existe. Pero si
  // alguien cambia esa prioridad, esto evita que el asesor deje de funcionar en
  // silencio — que es exactamente lo que paso la primera vez.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }

  function arrancar() {

  var panel = document.getElementById('dm-asesor');
  if (!panel || typeof DM_ASESOR === 'undefined') return;

  var caja      = panel.querySelector('.dm-asesor__caja');
  var avance    = panel.querySelector('.dm-asesor__avance');
  var pasos     = panel.querySelectorAll('[data-dm-paso]');
  var elLook    = panel.querySelector('[data-dm-look]');
  var elTotal   = panel.querySelector('[data-dm-total]');
  var elNota    = panel.querySelector('[data-dm-nota]');
  var TOTAL_PREGUNTAS = 3;

  var respuestas = {};
  var actual = 0;
  var abridor = null;      // a quien devolver el foco al cerrar

  /* ------------------------------------------------------------------ */

  function mostrar(clave) {
    pasos.forEach(function (p) {
      p.hidden = String(p.dataset.dmPaso) !== String(clave);
    });
    // Al cambiar de paso, arriba del todo: en movil el panel se desplaza y
    // sin esto la pregunta nueva aparece a media altura.
    if (caja) caja.scrollTop = 0;
  }

  function pintarAvance() {
    if (!avance) return;
    var pct = Math.min(100, (Object.keys(respuestas).length / TOTAL_PREGUNTAS) * 100);
    avance.style.width = pct + '%';
  }

  function abrir(quien) {
    abridor = quien || null;
    panel.hidden = false;
    // Un cuadro de margen para que el navegador vea el estado inicial y la
    // transicion de entrada se ejecute en vez de saltar.
    requestAnimationFrame(function () { panel.classList.add('is-abierto'); });
    document.documentElement.style.overflow = 'hidden';
    var primera = panel.querySelector('[data-dm-paso="0"] .dm-op');
    if (primera) primera.focus({ preventScroll: true });
  }

  function cerrar() {
    panel.classList.remove('is-abierto');
    document.documentElement.style.overflow = '';
    setTimeout(function () { panel.hidden = true; }, 380);
    if (abridor) abridor.focus({ preventScroll: true });
  }

  function reiniciar() {
    respuestas = {};
    actual = 0;
    panel.querySelectorAll('.dm-op.is-elegida').forEach(function (b) {
      b.classList.remove('is-elegida');
    });
    pintarAvance();
    mostrar(0);
  }

  /* ------------------------------------------------------------------
     La consulta
     ------------------------------------------------------------------ */

  function pedirLook() {
    mostrar('buscando');

    var cuerpo = new URLSearchParams();
    cuerpo.set('action', 'dm_asesor');
    cuerpo.set('nonce', DM_ASESOR.nonce);
    Object.keys(respuestas).forEach(function (k) { cuerpo.set(k, respuestas[k]); });

    // Una espera minima de 700 ms A PROPOSITO. Si la respuesta llega en 80 ms,
    // el look aparece de golpe y se lee como un filtro automatico. Con una
    // pausa breve se lee como que alguien fue a mirar. La percepcion de que
    // hay criterio detras vale mas que esos milisegundos.
    var reloj = new Promise(function (r) { setTimeout(r, 700); });

    Promise.all([
      fetch(DM_ASESOR.url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: cuerpo.toString()
      }).then(function (r) { return r.json(); }),
      reloj
    ]).then(function (par) {
      var res = par[0];
      if (!res || !res.success) {
        return fallo((res && res.data && res.data.mensaje) || 'No pude armar el look.');
      }
      pintarLook(res.data);
    }).catch(function () {
      fallo('Se cayó la conexión. ¿Lo intentamos otra vez?');
    });
  }

  function fallo(mensaje) {
    elLook.innerHTML = '';
    elNota.textContent = mensaje;
    elTotal.textContent = '';
    mostrar('resultado');
  }

  function pintarLook(datos) {
    elLook.innerHTML = '';

    datos.look.forEach(function (p, i) {
      var a = document.createElement('a');
      a.className = 'dm-pieza';
      a.href = p.url;
      // Escalonado: las tres piezas no aparecen a la vez, se van poniendo
      // encima del mostrador una detras de otra.
      a.style.setProperty('--d', (i * 0.12) + 's');

      var foto = document.createElement('span');
      foto.className = 'dm-pieza__foto';
      if (p.img) {
        var img = document.createElement('img');
        img.src = p.img;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        foto.appendChild(img);
      }
      var hueco = document.createElement('span');
      hueco.className = 'dm-pieza__hueco';
      hueco.textContent = { arriba: 'Arriba', abajo: 'Abajo', remate: 'Remate' }[p.hueco] || '';
      foto.appendChild(hueco);
      a.appendChild(foto);

      var n = document.createElement('span');
      n.className = 'dm-pieza__n';
      n.textContent = p.nombre;
      a.appendChild(n);

      var pr = document.createElement('span');
      pr.className = 'dm-pieza__p';
      // El precio viene de wc_price(), que es HTML de WooCommerce y no texto
      // del usuario. Es el unico sitio donde se inyecta marcado, y viene del
      // propio WordPress.
      pr.innerHTML = p.precio;
      a.appendChild(pr);

      if (p.motivo) {
        var m = document.createElement('span');
        m.className = 'dm-pieza__m';
        m.textContent = p.motivo;
        a.appendChild(m);
      }

      elLook.appendChild(a);
    });

    elTotal.innerHTML = datos.total;
    elNota.textContent = datos.nota || 'Tres piezas que funcionan juntas. Toca cualquiera para verla.';
    mostrar('resultado');
  }

  /* ------------------------------------------------------------------
     Eventos
     ------------------------------------------------------------------ */

  document.addEventListener('click', function (e) {
    var abre = e.target.closest('[data-dm-asesor-abrir]');
    if (abre) { e.preventDefault(); abrir(abre); return; }

    if (e.target.closest('[data-dm-asesor-cerrar]')) { cerrar(); return; }
    if (e.target.closest('[data-dm-asesor-otra]')) { pedirLook(); return; }

    if (e.target.closest('[data-dm-asesor-atras]')) {
      actual = Math.max(0, actual - 1);
      // Se borra la respuesta del paso al que se vuelve: si se conservara, la
      // barra diria que quedan menos preguntas de las que quedan.
      var clave = pasos[actual] && pasos[actual].querySelector('.dm-op');
      if (clave) delete respuestas[clave.dataset.dmClave];
      pintarAvance();
      mostrar(actual);
      return;
    }

    var op = e.target.closest('.dm-op');
    if (op && panel.contains(op)) {
      // Se marca la elegida y se limpian las hermanas, por si se volvio atras.
      var grupo = op.closest('.dm-asesor__ops');
      if (grupo) grupo.querySelectorAll('.dm-op').forEach(function (b) { b.classList.remove('is-elegida'); });
      op.classList.add('is-elegida');

      respuestas[op.dataset.dmClave] = op.dataset.dmValor;
      pintarAvance();

      // La pausa de 260 ms: da tiempo a VER que se eligio. Sin ella el panel
      // salta y se siente como una encuesta, no como una conversacion.
      setTimeout(function () {
        actual++;
        if (actual >= TOTAL_PREGUNTAS) {
          pedirLook();
        } else {
          mostrar(actual);
          var sig = pasos[actual] && pasos[actual].querySelector('.dm-op');
          if (sig) sig.focus({ preventScroll: true });
        }
      }, 260);
    }
  });

  addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) cerrar();
  });

  // Al abrirlo de nuevo empieza limpio: nadie quiere retomar una conversacion
  // a medias con un dependiente.
  panel.addEventListener('transitionend', function (e) {
    if (e.target === caja && panel.hidden) reiniciar();
  });

  pintarAvance();

  }
})();
