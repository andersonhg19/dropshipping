#!/bin/sh
# ---------------------------------------------------------------------------
# Recarga el PHP tras editar un .php del tema o de un plugin.
#
# Hace falta porque opcache.ini pone `validate_timestamps=0`: OPcache no vuelve
# a mirar el disco nunca, y sin eso el sitio tardaba 18 s en responder (ver el
# comentario de opcache.ini). El precio es este script.
#
# NO hace falta para: CSS, JS, imagenes, ni para nada que se cambie desde el
# administrador de WordPress (paginas, productos, textos del Personalizador).
# Todo eso se ve al instante.
# ---------------------------------------------------------------------------
set -e
echo "Recargando PHP..."
docker compose restart wordpress >/dev/null 2>&1
printf "Esperando"
i=0
while [ $i -lt 40 ]; do
  if [ "$(curl -s -o /dev/null -m 5 -w '%{http_code}' http://localhost:8850/ 2>/dev/null)" = "200" ]; then
    echo " listo."
    exit 0
  fi
  printf "."
  i=$((i+1))
done
echo " el sitio no respondio; mira 'docker compose logs wordpress'."
exit 1
