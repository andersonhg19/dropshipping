#!/bin/sh
# Purga la cache de PHP que sirve la WEB.
#
# OJO, que cuesta una hora entenderlo: `docker exec ... php -r "opcache_reset();"`
# NO sirve. Ese comando abre un proceso de PHP de linea de comandos, con su
# propia cache, y deja intacta la de Apache — que es la que decide lo que ve el
# navegador. Durante un rato parecio funcionar solo porque opcache.ini tiene
# revalidate_freq=60 y los cambios entraban solos al minuto.
#
# `apachectl -k graceful` recicla los procesos de Apache: los nuevos leen los
# archivos del disco. Es inmediato y no corta ninguna peticion en curso.
docker exec dropshipping-wordpress-1 apachectl -k graceful 2>/dev/null
sleep 3
printf 'tienda: '
curl -s -o /dev/null -w '%{http_code} en %{time_total}s\n' http://192.168.40.32:8850/
