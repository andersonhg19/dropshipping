# Punto de retoma — 1 de septiembre de 2026

Este es el estado al que volver si la reforma del diseño sale mal.

Lo que hay guardado aquí es la tienda **con el logo correcto ya restaurado** y
**sin el efecto del hero**, que es exactamente donde se pidió dejar la marca
antes de empezar a rediseñar.

## Qué incluye

| Pieza | Dónde | Tamaño |
|---|---|---|
| Código | etiqueta de git `punto-de-retoma-2026-09-01` | — |
| Base de datos | `base-de-datos.sql.gz` (fuera del repo, ver abajo) | 222 KB |
| Fotos y subidas | `subidas.tar.gz` (fuera del repo, ver abajo) | 88 MB |

Los dos archivos comprimidos **no están en git**. Desde el 2026-10-01 tampoco
viven en esta carpeta: se sacaron del repo tras comprobar (sha256) que están en
el respaldo protegido
`C:\Users\ander\Documents\Anderson\Personales\respaldos-shark\wordpress-visnex-2026-10-01\`:

- base: `db/punto-de-retoma-base-de-datos.sql.gz`
- fotos: dentro de `repo/repo-seguimiento-docs.tar.gz`, en
  `seguimiento/punto-de-retoma/subidas.tar.gz`

En los comandos de abajo, `RESPALDO` es esa carpeta:
`RESPALDO=/c/Users/ander/Documents/Anderson/Personales/respaldos-shark/wordpress-visnex-2026-10-01`

El código sí está en git, y esa es la parte que no se puede perder.

## Cómo volver aquí

**Solo el código** (lo habitual: el diseño no gustó, los datos están bien):

```bash
git checkout punto-de-retoma-2026-09-01
# o, para seguir trabajando desde aquí en una rama nueva:
git switch -c rescate punto-de-retoma-2026-09-01
```

**El código y la base** (algo rompió los productos o los ajustes):

```bash
git checkout punto-de-retoma-2026-09-01
gunzip -c "$RESPALDO/db/punto-de-retoma-base-de-datos.sql.gz" \
  | docker exec -i dropshipping-mysql-1 sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" wordpress_vn' 
```

**Todo, incluidas las fotos** (raro: las subidas casi nunca se corrompen):

```bash
mkdir -p /tmp/retoma
tar xzf "$RESPALDO/repo/repo-seguimiento-docs.tar.gz" -C /tmp/retoma \
  seguimiento/punto-de-retoma/subidas.tar.gz
docker run --rm -v dropshipping_wpcontent:/d \
  -v /tmp/retoma/seguimiento/punto-de-retoma:/in \
  alpine sh -c "rm -rf /d/uploads && tar xzf /in/subidas.tar.gz -C /d"
```

Después de restaurar la base, purgar el caché de PHP para que no siga sirviendo
lo anterior:

```bash
docker exec dropshipping-wordpress-1 php -r 'opcache_reset();'
```

## Qué NO hace falta restaurar

El tema vive en `wordpress/wp-content/themes/visnex`, que está montado desde el
repositorio: con volver el código atrás, el tema vuelve atrás. No hay que tocar
volúmenes de Docker para deshacer un cambio de diseño.

## Estado en el momento de guardar

- 154 productos, 11 páginas, todas respondiendo 200
- La tienda sirve en `http://192.168.40.32:8850` y en `localhost:8850`
- Portada en 0,35 s
- Logo: el aprobado, vectorizado desde `brand/fuente/logo-principal.jpeg`
- Hero: dos fotos, sin la capa de WebGL
