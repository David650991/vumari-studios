---
project: VUMARI STUDIOS
author: David Vidal Ramírez
year: 2026
---

# Despliegue

El sitio se genera en `dist/` y se publica mediante GitHub Pages.

## Flujo

1. Un cambio llega a `main`.
2. GitHub Actions instala el entorno reproducible con Node.js 20.
3. `npm run check` valida datos, ejecuta pruebas y genera el sitio.
4. Sólo si todas las comprobaciones terminan correctamente se carga el artefacto.
5. El job de despliegue publica ese artefacto en GitHub Pages.

En la configuración del repositorio, Pages debe utilizar **GitHub Actions** como
fuente. No se necesita guardar ninguna API key en el frontend.

## Dominio

La URL canónica inicial es la de GitHub Pages. Antes de conectar un dominio
comercial se debe actualizar `siteUrl` en `src/data/company.json`, configurar el
DNS y añadir el archivo `CNAME` durante el build.
