---
project: VUMARI STUDIOS
author: David Vidal Ramírez
year: 2026
---

# Despliegue

El sitio se genera en `dist/` y se publica mediante GitHub Pages exclusivamente
desde `main`.

## Producción

El sitio comercial estable se encuentra en `main`. El workflow de despliegue se
activa por cambios en esa rama o mediante ejecución manual autorizada.

Flujo automático:

1. Un cambio llega a `main`.
2. GitHub Actions prepara Node.js 20.
3. `npm run check` valida datos, ejecuta pruebas y genera el sitio.
4. Sólo si las comprobaciones terminan correctamente se carga `dist/`.
5. El job de despliegue publica el artefacto en GitHub Pages.

En la configuración del repositorio, Pages debe utilizar **GitHub Actions** como
fuente. No se necesita guardar ninguna API key en el frontend.

## Rama experimental de Tools

VUMARI Tools permanece en `feature/vumari-tools`, revisada mediante el Pull
Request #1, que está abierto y en Draft. Esta rama pasa el workflow Quality, pero
no activa automáticamente el despliegue de producción.

Actualmente contiene:

- `/herramientas/`;
- `/herramientas/srt-a-vtt/`;
- `/herramientas/vtt-a-srt/`.

Las tres páginas usan `noindex`; no aparecen en el sitemap ni en el menú
principal. No deben considerarse publicadas mientras no exista un merge
autorizado hacia `main`.

## Dominio

La URL canónica inicial es la de GitHub Pages. Antes de conectar un dominio
comercial se debe actualizar `siteUrl` en `src/data/company.json`, configurar el
DNS y añadir el archivo `CNAME` durante el build.
