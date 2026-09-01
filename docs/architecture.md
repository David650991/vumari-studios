# Arquitectura

El proyecto es un sitio estático generado con Node.js, sin framework de interfaz
ni dependencias de producción. `src/` contiene datos, recursos, CSS y JavaScript;
`scripts/build.mjs` compone las páginas y produce `dist/`.

## Capas

- `src/data/`: fuente única para empresa, navegación, servicios y proyectos.
- `src/styles/`: tokens, base, layout, componentes y páginas.
- `src/scripts/`: mejora progresiva de navegación y formularios.
- `src/assets/`: recursos de marca listos para publicación.
- `scripts/`: build, validación y servidor local.
- `tests/`: comprobaciones del resultado generado.

## Reglas

1. El contenido principal funciona sin JavaScript.
2. Los datos empresariales reutilizados no se duplican en páginas manuales.
3. El portafolio diferencia trabajos de cliente, propios y conceptuales.
4. Los datos no confirmados permanecen nulos y no se muestran como reales.
5. `dist/` se genera; no se edita ni versiona manualmente.

