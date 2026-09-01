/**
 * D'MIKA — Tejido.
 * ---------------------------------------------------------------------------
 * El hero deja de ser dos <img> quietas y pasa a ser una superficie de WebGL
 * que reacciona al cursor.
 *
 * POR QUE ASI Y NO CON CSS
 * CSS puede mover, escalar y desenfocar una foto entera. Lo que no puede es
 * mover CADA PIXEL de la foto por separado. Eso ultimo es lo que hace que una
 * imagen parezca tela o agua en vez de una lamina rigida, y es la diferencia
 * entre "una web con animaciones" y "una web que se siente viva".
 *
 * COMO FUNCIONA — dos pasadas por cuadro:
 *
 *   1. ESTELA (256x256, fuera de pantalla)
 *      Un lienzo diminuto donde el raton PINTA su velocidad. Lo que se pinto
 *      antes se desvanece un 4% por cuadro. El resultado es un campo de
 *      vectores que recuerda por donde paso la mano hace medio segundo: la
 *      inercia, el rastro.
 *      Se guarda en RGBA de 8 bits con el cero en 0.5. Asi no hace falta
 *      textura en coma flotante (que no toda GPU integrada soporta) y para una
 *      estela que se desvanece la precision sobra.
 *
 *   2. ESCENA (pantalla completa)
 *      Cada pixel lee la estela en su posicion y se DESPLAZA segun ese vector
 *      antes de ir a buscar su color a la foto. Donde no paso el raton la
 *      estela vale cero y la foto sale intacta.
 *      Los tres canales se leen con desplazamientos distintos (R 100%, G 94%,
 *      B 88%): es la aberracion cromatica de un objetivo real, y es lo que
 *      evita que la deformacion parezca plastico.
 *
 * ADEMAS
 *   - Respiracion: una onda lentisima permanente, para que nunca este muerto
 *     aunque nadie toque el raton.
 *   - Entrada: la foto se revela desde abajo con la deformacion alta, que se
 *     calma hasta cero en 1,6 s.
 *   - Recorte "cover" hecho en el shader, para que encuadre igual que con
 *     object-fit y no se deforme en ningun ancho.
 *
 * REGLAS
 *   - Si algo falla (no hay WebGL, la foto no carga, el contexto se pierde)
 *     no se toca nada y quedan las <img> de siempre. Las <img> solo se ocultan
 *     DESPUES de que el primer cuadro este pintado.
 *   - Se apaga entero con prefers-reduced-motion.
 *   - Se detiene cuando el hero sale de pantalla o la pestana pasa a segundo
 *     plano. Una GPU girando para nadie es bateria tirada.
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var raiz = document.querySelector('.vn-split');
  if (!raiz) return;

  var paneles = raiz.querySelectorAll('.vn-split__panel');
  if (paneles.length < 2) return;

  var imgA = paneles[0].querySelector('img');
  var imgB = paneles[1].querySelector('img');
  if (!imgA || !imgB) return;

  /* =======================================================================
     Shaders
     ==================================================================== */

  var VERT = [
    'attribute vec2 aPos;',
    'varying vec2 vUv;',
    'void main(){',
    '  vUv = aPos * 0.5 + 0.5;',
    '  gl_Position = vec4(aPos, 0.0, 1.0);',
    '}'
  ].join('\n');

  /* Pasada 1 — la estela. */
  var FRAG_ESTELA = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D uPrev;',
    'uniform vec2  uRaton;',
    'uniform vec2  uVel;',
    'uniform float uAspecto;',
    'uniform float uDentro;',
    'void main(){',
    '  vec4 prev = texture2D(uPrev, vUv);',
    /* Se desvanece hacia el reposo (0.5 = vector nulo). */
    '  vec2 campo = (prev.rg - 0.5) * 0.960;',
    /* Brocha: distancia corregida por aspecto para que sea un circulo. */
    '  vec2 d = vUv - uRaton;',
    '  d.x *= uAspecto;',
    '  float caida = smoothstep(0.16, 0.0, length(d));',
    '  campo += uVel * caida * uDentro;',
    '  campo = clamp(campo, -0.5, 0.5);',
    '  gl_FragColor = vec4(campo + 0.5, 0.0, 1.0);',
    '}'
  ].join('\n');

  /* Pasada 2 — la escena. */
  var FRAG_ESCENA = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D uEstela;',
    'uniform sampler2D uTexA;',
    'uniform sampler2D uTexB;',
    'uniform vec2  uLienzo;',
    'uniform vec2  uTamA;',
    'uniform vec2  uTamB;',
    'uniform float uApilado;',
    'uniform vec2  uHover;',
    'uniform float uTiempo;',
    'uniform float uEntrada;',
    'uniform vec3  uTinte;',

    /* Recorte tipo object-fit: cover, hecho a mano. */
    'vec2 cubrir(vec2 uv, vec2 marco, vec2 tex, float zoom){',
    '  float am = marco.x / marco.y;',
    '  float at = tex.x / tex.y;',
    '  vec2 s = am > at ? vec2(1.0, at / am) : vec2(am / at, 1.0);',
    '  return (uv - 0.5) * s / zoom + 0.5;',
    '}',

    'void main(){',
    '  vec2 uv = vUv;',

    /* Que panel toca y cual es su marco. */
    '  float izq = uApilado > 0.5 ? step(0.5, uv.y) : step(uv.x, 0.5);',
    '  vec2 local;',
    '  vec2 marco;',
    '  if (uApilado > 0.5) {',
    '    local = vec2(uv.x, fract(uv.y * 2.0));',
    '    marco = vec2(uLienzo.x, uLienzo.y * 0.5);',
    '  } else {',
    '    local = vec2(fract(uv.x * 2.0), uv.y);',
    '    marco = vec2(uLienzo.x * 0.5, uLienzo.y);',
    '  }',

    /* Desplazamiento. */
    '  vec2 estela = (texture2D(uEstela, uv).rg - 0.5) * 2.0;',
    '  float fuerza = length(estela);',
    '  vec2 respira = vec2(',
    '    sin(uv.y * 7.0 + uTiempo * 0.45),',
    '    cos(uv.x * 6.0 + uTiempo * 0.38)',
    '  ) * 0.0032;',
    '  float extra = pow(1.0 - uEntrada, 2.0);',
    '  vec2 desp = estela * 0.085 + respira + vec2(0.0, extra * 0.10);',

    '  float foco = mix(uHover.y, uHover.x, izq);',
    '  float zoom = 1.0 + foco * 0.045 + fuerza * 0.03;',

    '  vec2 tam = izq > 0.5 ? uTamA : uTamB;',
    '  vec3 col;',
    /* Aberracion cromatica: los tres canales no se desplazan igual. */
    '  if (izq > 0.5) {',
    '    col.r = texture2D(uTexA, cubrir(local + desp * 1.00, marco, tam, zoom)).r;',
    '    col.g = texture2D(uTexA, cubrir(local + desp * 0.94, marco, tam, zoom)).g;',
    '    col.b = texture2D(uTexA, cubrir(local + desp * 0.88, marco, tam, zoom)).b;',
    '  } else {',
    '    col.r = texture2D(uTexB, cubrir(local + desp * 1.00, marco, tam, zoom)).r;',
    '    col.g = texture2D(uTexB, cubrir(local + desp * 0.94, marco, tam, zoom)).g;',
    '    col.b = texture2D(uTexB, cubrir(local + desp * 0.88, marco, tam, zoom)).b;',
    '  }',

    /* Tinte de marca muy suave: unifica temperatura sin tapar. */
    '  col = mix(col, col * uTinte * 1.22, 0.16);',

    /* El panel bajo el raton se ilumina un punto. */
    '  col *= 1.0 + foco * 0.07;',

    /* La costura. El grid tenia 2 px de hueco negro entre paneles; como el
       lienzo pasa por encima, se vuelve a dibujar aqui — es lo que hace que
       se lean como dos piezas y no como una foto partida. */
    '  float costura = uApilado > 0.5',
    '    ? smoothstep(0.0, 1.6 / uLienzo.y, abs(uv.y - 0.5))',
    '    : smoothstep(0.0, 1.6 / uLienzo.x, abs(uv.x - 0.5));',
    '  col *= costura;',

    /* Entrada: cortina desde abajo con borde suave. */
    '  float cortina = smoothstep(0.0, 0.30, uEntrada * 1.30 - (1.0 - uv.y) * 0.30);',
    '  col *= cortina;',

    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  /* =======================================================================
     WebGL — utilidades minimas
     ==================================================================== */

  var lienzo = document.createElement('canvas');
  lienzo.className = 'vn-tejido';
  lienzo.setAttribute('aria-hidden', 'true');

  var opciones = {
    alpha: false, antialias: false, depth: false, stencil: false,
    premultipliedAlpha: false, powerPreference: 'high-performance'
  };
  var gl = lienzo.getContext('webgl', opciones) ||
           lienzo.getContext('experimental-webgl', opciones);
  if (!gl) return;

  function compilar(tipo, fuente) {
    var s = gl.createShader(tipo);
    gl.shaderSource(s, fuente);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (window.console) console.warn('[tejido]', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function programa(fragFuente) {
    var v = compilar(gl.VERTEX_SHADER, VERT);
    var f = compilar(gl.FRAGMENT_SHADER, fragFuente);
    if (!v || !f) return null;
    var p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      if (window.console) console.warn('[tejido]', gl.getProgramInfoLog(p));
      return null;
    }
    p.u = {};
    var n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) {
      var nom = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, '');
      p.u[nom] = gl.getUniformLocation(p, nom);
    }
    return p;
  }

  var pEstela = programa(FRAG_ESTELA);
  var pEscena = programa(FRAG_ESCENA);
  if (!pEstela || !pEscena) return;

  /* Un solo triangulo que cubre la pantalla: menos vertices que dos y sin
     costura en la diagonal. */
  var quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  function texturaFoto(img) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    /* CLAMP porque la foto no se repite, y LINEAR sin mipmaps porque sus
       lados no son potencia de dos. */
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }

  var LADO = 256;
  function destino() {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    /* Se inicializa en 0.5 (vector nulo), no en negro, que seria -1,-1. */
    var cero = new Uint8Array(LADO * LADO * 4);
    for (var i = 0; i < cero.length; i += 4) {
      cero[i] = 128; cero[i + 1] = 128; cero[i + 3] = 255;
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, LADO, LADO, 0, gl.RGBA, gl.UNSIGNED_BYTE, cero);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    var f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { tex: t, fbo: f };
  }

  /* Ping-pong: no se puede leer y escribir la misma textura en la misma
     pasada, asi que hacen falta dos y se turnan. */
  var ping = destino(), pong = destino();
  var completo = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  if (!completo) return;

  /* =======================================================================
     Estado
     ==================================================================== */

  var texA = null, texB = null;
  var tamA = [1, 1], tamB = [1, 1];
  var raton = [0.5, 0.5], ratonAnt = [0.5, 0.5], vel = [0, 0];
  var dentro = 0, hover = [0, 0];
  var t0 = 0, entrada = 0, visible = true, vivo = false, primerCuadro = false;
  var ancho = 0, alto = 0, apilado = 0;

  /* Marfil calido llevado a 0..1. */
  var TINTE = [244 / 255, 239 / 255, 231 / 255];

  function medir() {
    var r = raiz.getBoundingClientRect();
    /* El pixel ratio se topa en 2: por encima el coste sube al cuadrado y la
       diferencia no se ve en una foto que ya se esta deformando. */
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = Math.max(1, Math.round(r.width * dpr));
    alto = Math.max(1, Math.round(r.height * dpr));
    if (lienzo.width !== ancho || lienzo.height !== alto) {
      lienzo.width = ancho;
      lienzo.height = alto;
    }
    /* Los paneles se apilan cuando el segundo empieza por debajo del primero. */
    var a = paneles[0].getBoundingClientRect();
    var b = paneles[1].getBoundingClientRect();
    apilado = b.top >= a.bottom - 2 ? 1 : 0;
  }

  function pintar(ahora) {
    if (!vivo) return;
    if (!t0) t0 = ahora;
    var t = (ahora - t0) / 1000;
    entrada = Math.min(1, t / 1.6);

    /* Velocidad con amortiguacion: si el raton se para, la fuerza cae sola. */
    vel[0] = (raton[0] - ratonAnt[0]) * 4.0 + vel[0] * 0.86;
    vel[1] = (raton[1] - ratonAnt[1]) * 4.0 + vel[1] * 0.86;
    ratonAnt[0] = raton[0];
    ratonAnt[1] = raton[1];

    /* --- Pasada 1: estela --- */
    gl.bindFramebuffer(gl.FRAMEBUFFER, pong.fbo);
    gl.viewport(0, 0, LADO, LADO);
    gl.useProgram(pEstela);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, ping.tex);
    gl.uniform1i(pEstela.u.uPrev, 0);
    gl.uniform2f(pEstela.u.uRaton, raton[0], raton[1]);
    gl.uniform2f(pEstela.u.uVel, vel[0], vel[1]);
    gl.uniform1f(pEstela.u.uAspecto, ancho / alto);
    gl.uniform1f(pEstela.u.uDentro, dentro);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    var tmp = ping; ping = pong; pong = tmp;

    /* --- Pasada 2: escena --- */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, ancho, alto);
    gl.useProgram(pEscena);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, ping.tex);
    gl.uniform1i(pEscena.u.uEstela, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texA);
    gl.uniform1i(pEscena.u.uTexA, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texB);
    gl.uniform1i(pEscena.u.uTexB, 2);
    gl.uniform2f(pEscena.u.uLienzo, ancho, alto);
    gl.uniform2f(pEscena.u.uTamA, tamA[0], tamA[1]);
    gl.uniform2f(pEscena.u.uTamB, tamB[0], tamB[1]);
    gl.uniform1f(pEscena.u.uApilado, apilado);
    gl.uniform2f(pEscena.u.uHover, hover[0], hover[1]);
    gl.uniform1f(pEscena.u.uTiempo, t);
    gl.uniform1f(pEscena.u.uEntrada, entrada);
    gl.uniform3f(pEscena.u.uTinte, TINTE[0], TINTE[1], TINTE[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!primerCuadro) {
      primerCuadro = true;
      /* Solo ahora se apagan las <img>: si algo hubiera fallado antes, la
         pagina se queda con la version de siempre y nadie ve un hueco. */
      raiz.classList.add('vn-tejido-on');
    }

    requestAnimationFrame(pintar);
  }

  function arrancarBucle() {
    if (vivo || !texA || !texB || !visible) return;
    vivo = true;
    t0 = 0;
    requestAnimationFrame(pintar);
  }
  function pararBucle() { vivo = false; }

  /* =======================================================================
     Entradas
     ==================================================================== */

  raiz.addEventListener('pointermove', function (e) {
    var r = raiz.getBoundingClientRect();
    raton[0] = (e.clientX - r.left) / r.width;
    /* WebGL mide desde abajo. */
    raton[1] = 1 - (e.clientY - r.top) / r.height;
    dentro = 1;
  }, { passive: true });

  raiz.addEventListener('pointerleave', function () { dentro = 0; });

  paneles[0].addEventListener('pointerenter', function () { hover[0] = 1; });
  paneles[0].addEventListener('pointerleave', function () { hover[0] = 0; });
  paneles[1].addEventListener('pointerenter', function () { hover[1] = 1; });
  paneles[1].addEventListener('pointerleave', function () { hover[1] = 0; });

  var redimensionar;
  addEventListener('resize', function () {
    clearTimeout(redimensionar);
    redimensionar = setTimeout(medir, 120);
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    visible = !document.hidden;
    if (visible) arrancarBucle(); else pararBucle();
  });

  /* Fuera de pantalla no se dibuja: el hero se queda atras en cuanto se baja. */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (ent) {
      visible = ent[0].isIntersecting && !document.hidden;
      if (visible) arrancarBucle(); else pararBucle();
    }, { threshold: 0 }).observe(raiz);
  }

  /* Contexto perdido (cambio de GPU, suspension): se vuelve a las <img>. */
  lienzo.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    pararBucle();
    raiz.classList.remove('vn-tejido-on');
  });

  /* =======================================================================
     Carga
     ==================================================================== */

  function lista(img) {
    return img.complete && img.naturalWidth > 0
      ? Promise.resolve(img)
      : new Promise(function (ok, mal) {
          img.addEventListener('load', function () { ok(img); }, { once: true });
          img.addEventListener('error', mal, { once: true });
        });
  }

  Promise.all([lista(imgA), lista(imgB)]).then(function () {
    texA = texturaFoto(imgA); tamA = [imgA.naturalWidth, imgA.naturalHeight];
    texB = texturaFoto(imgB); tamB = [imgB.naturalWidth, imgB.naturalHeight];
    raiz.insertBefore(lienzo, raiz.firstChild);
    medir();
    arrancarBucle();
  }).catch(function () { /* se queda el hero de siempre */ });
})();
