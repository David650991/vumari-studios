---
project: VUMARI STUDIOS
author: David Vidal Ramírez
year: 2026
---

# Arquitectura

El proyecto es un sitio estático generado con Node.js, sin framework de interfaz
ni dependencias de producción. `src/` contiene datos, recursos, CSS y JavaScript;
`scripts/build.mjs` compone las páginas y produce `dist/`.

## Capas generales

- `src/data/`: fuente única para empresa, navegación, servicios, proyectos y
  catálogo de herramientas.
- `src/styles/`: tokens, base, layout, componentes y estilos por página.
- `src/scripts/`: mejora progresiva y comportamiento del navegador.
- `src/assets/`: recursos de marca y contenido listos para publicación.
- `scripts/`: build, validación y servidor local.
- `tests/`: comprobaciones del resultado generado, procesadores y fixtures.

## Arquitectura actual de VUMARI Tools

```text
src/data/tools.json
        ↓
scripts/build.mjs
        ↓
página HTML generada
        ↓
tool-controller.js
        ↓
registry.js
        ↓
procesador específico
```

### Responsabilidades

- `src/data/tools.json`: catálogo declarativo. Define nombre, slug, familia,
  estado, procesador, formatos, privacidad, SEO y orden.
- `scripts/build.mjs`: genera el catálogo y una página estática por herramienta
  registrada. En la rama actual produce 10 páginas: 7 comerciales y 3 de Tools.
- `src/scripts/tools/tool-controller.js`: lee la configuración de la página,
  coordina selección, estados, validación, conversión y descarga. No interpreta
  formatos de subtítulos.
- `src/scripts/tools/registry.js`: registra de forma estática y explícita los
  procesadores disponibles. No utiliza imports dinámicos.
- `src/scripts/tools/file-validation.js`: valida que exista una sola selección,
  su extensión y que el archivo no esté vacío; también realiza lectura UTF-8
  estricta.
- `src/scripts/tools/processors/subtitle-srt-to-vtt.js`: contiene exclusivamente
  la conversión SRT → VTT.
- `src/scripts/tools/processors/subtitle-vtt-to-srt.js`: contiene exclusivamente
  la conversión WebVTT simple → SRT.
- `src/scripts/tools/download.js`: prepara la descarga mediante `Blob` y
  `Object URL`, y libera la URL cuando deja de utilizarse.
- `src/scripts/tools/tool-error.js`: define el error estructurado compartido por
  la infraestructura actual.

## Principios aplicados a las herramientas actuales

1. Un controlador compartido coordina la interfaz.
2. Cada dirección de conversión tiene un procesador separado.
3. El registro de procesadores es estático.
4. No existe backend ni API externa para estas conversiones.
5. No se añadió ninguna dependencia para procesar subtítulos.
6. Los archivos se procesan localmente en el navegador.

Estos principios describen SRT → VTT y VTT → SRT. No establecen todavía una
arquitectura obligatoria para herramientas futuras.

## Privacidad de Tools

El flujo comprobado de las dos herramientas es:

```text
File API
   ↓
procesamiento local
   ↓
Blob
   ↓
Object URL
   ↓
descarga
```

El código actual de Tools no usa `fetch`, `XMLHttpRequest`, `WebSocket`,
`sendBeacon`, `localStorage`, `sessionStorage` ni `IndexedDB`. Tampoco requiere
backend o API externa. Esta descripción se limita al código implementado y
revisado actualmente.

## Estado, publicación y SEO

SRT → VTT y VTT → SRT están marcadas como experimentales. Sus páginas incluyen
`noindex, follow` y canonical, pero están fuera del sitemap y la navegación
principal. Permanecen en `feature/vumari-tools`; GitHub Pages publica desde
`main`, por lo que Tools todavía no está en producción.

## Reglas generales del repositorio

1. El contenido principal funciona sin JavaScript.
2. Los datos empresariales reutilizados no se duplican en páginas manuales.
3. El portafolio diferencia trabajos de cliente, propios y conceptuales.
4. Los datos no confirmados permanecen nulos y no se muestran como reales.
5. `dist/` se genera; no se edita ni versiona manualmente.
