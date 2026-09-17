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

## VUMARI Tools

VUMARI Tools está integrada en `main` y se publica mediante el mismo workflow
de GitHub Pages que el sitio comercial. Actualmente contiene:

- `/herramientas/`;
- `/herramientas/srt-a-vtt/`;
- `/herramientas/vtt-a-srt/`.

Las tres páginas continúan como `Experimental`, usan `noindex` y permanecen
fuera del sitemap de forma intencional. `Herramientas` forma parte de la
navegación pública. Los cambios posteriores sólo se publican cuando llegan a
`main` y superan las comprobaciones del workflow.

## Dominio

La URL canónica inicial es la de GitHub Pages. Antes de conectar un dominio
comercial se debe actualizar `siteUrl` en `src/data/company.json`, configurar el
DNS y añadir el archivo `CNAME` durante el build.
