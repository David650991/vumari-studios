# Changelog

Todos los cambios relevantes se documentan en este archivo. No existe una nueva
versión publicada para los cambios de VUMARI Tools descritos a continuación.

## [Unreleased]

### Added

- 2026-09-02 — Estructura experimental de VUMARI Tools y VUMARI Media Tools
  (`bf310fc`).
- 2026-09-02 — Conversor experimental SRT → VTT con procesamiento local en el
  navegador (`04b9bf2`).
- 2026-09-07 — Conversor experimental VTT → SRT, fixtures y cobertura de casos
  válidos y no soportados (`d45cbc7`).

### Changed

- 2026-09-07 — Generalización del catálogo, las páginas, el controlador, la
  validación y los errores para las dos herramientas actuales, reutilizando el
  módulo de descarga compartido (`d45cbc7`).
- 2026-09-07 — Ajuste responsive del detalle de herramientas para evitar
  recortes en pantallas estrechas (`d45cbc7`).

### Fixed

- 2026-09-03 — Condición de carrera entre builds concurrentes de la suite de
  pruebas (`16393ff`).

### Estado de la rama

- Herramientas funcionales: 2.
- Pruebas: 53 aprobadas, 0 fallidas.
- Build: 10 páginas.
- Publicación de Tools: no; el trabajo permanece en `feature/vumari-tools` y en
  el Pull Request #1 Draft.
