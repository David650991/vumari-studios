# VUMARI STUDIOS

**Creamos ideas. Construimos presencia.**

Sitio web oficial de VUMARI STUDIOS, estudio creativo con base en Tres Valles,
Veracruz, México. El sitio comercial presenta servicios de publicidad,
producción audiovisual, contenido digital, diseño, marketing y desarrollo web,
y facilita el contacto y la solicitud de cotizaciones.

## Estado actual

El repositorio mantiene dos estados claramente separados:

- `main`: sitio comercial estable y publicado mediante GitHub Pages.
- `feature/vumari-tools`: desarrollo experimental de VUMARI Tools, todavía fuera
  de producción y revisado mediante el Pull Request #1, que permanece abierto y
  en Draft.

En `feature/vumari-tools` funcionan actualmente dos herramientas:

- SRT → VTT.
- VTT → SRT.

Ambas son experimentales, procesan el archivo localmente en el navegador y se
mantienen con `noindex`. La rama genera 10 páginas y su suite actual tiene 53
pruebas aprobadas y ninguna fallida.

Los canales oficiales de contacto siguen pendientes de configuración antes de
habilitar el flujo comercial completo.

## Principios del proyecto

- Contenido real, sin clientes, resultados ni credenciales inventadas.
- HTML semántico, CSS moderno y JavaScript modular.
- Generación estática para no duplicar navegación, datos ni metadatos.
- Diseño mobile-first, accesible y con mejora progresiva.
- Dependencias limitadas a necesidades concretas y documentadas.
- Publicación mediante GitHub Pages exclusivamente desde `main`.

## Tecnologías

- HTML5 semántico generado estáticamente.
- CSS modular, mobile-first y sin librerías visuales.
- JavaScript ES Modules para navegación, formularios y herramientas.
- Node.js para build, validación y pruebas, sin dependencias externas de
  producción.
- GitHub Actions y GitHub Pages para integración y despliegue.

## Estructura

```text
.
├── .github/workflows/    Calidad y despliegue
├── docs/                 Arquitectura, marca, contenido y despliegue
├── scripts/              Generación, validación y servidor local
├── src/
│   ├── assets/           Marca, imágenes, video e iconos
│   ├── data/             Fuente central de información y catálogo de Tools
│   ├── scripts/
│   │   └── tools/
│   │       ├── tool-controller.js
│   │       ├── registry.js
│   │       ├── file-validation.js
│   │       ├── download.js
│   │       ├── tool-error.js
│   │       └── processors/
│   │           ├── subtitle-srt-to-vtt.js
│   │           └── subtitle-vtt-to-srt.js
│   └── styles/           Sistema visual modular
├── tests/                Pruebas y fixtures
├── LICENSE               Licencia propietaria del proyecto
└── README.md             Entrada a la documentación
```

La explicación técnica completa se encuentra en
[`docs/architecture.md`](docs/architecture.md).

## Privacidad de las herramientas actuales

SRT → VTT y VTT → SRT leen y transforman el archivo dentro del navegador. No
envían el contenido a VUMARI STUDIOS, no usan backend ni API externa y no
requieren cuenta o API key. Esta afirmación se limita a las dos herramientas
implementadas actualmente.

## Desarrollo

Requiere Node.js 20 o posterior.

```bash
npm install
npm run check
```

Comandos disponibles:

- `npm run validate`: comprueba datos y recursos requeridos.
- `npm test`: genera el sitio y ejecuta las pruebas.
- `npm run build`: crea el sitio en `dist/`.
- `npm run preview`: sirve `dist/` para revisión local.
- `npm run check`: ejecuta validación, pruebas y build.

## Resultado del build en la rama de Tools

La rama `feature/vumari-tools` genera 10 páginas:

- 7 páginas comerciales.
- 3 páginas de Tools: `/herramientas/`, `/herramientas/srt-a-vtt/` y
  `/herramientas/vtt-a-srt/`.

Tools no aparece en el sitemap ni en la navegación principal y no está publicado
en producción.

## Publicación

GitHub Pages publica `dist/` solamente cuando un cambio llega a `main` y supera
el workflow de calidad. La rama `feature/vumari-tools` se valida mediante PR,
pero no activa el despliegue de producción. Consulta
[`docs/deployment.md`](docs/deployment.md).

## Mantenimiento de contenido

La información empresarial compartida se centraliza en `src/data/`. Los datos
pendientes deben permanecer vacíos o marcados expresamente como pendientes;
nunca deben completarse por suposición.

## Autor

**David Vidal Ramírez**

Creador y desarrollador principal del proyecto.

GitHub: [@David650991](https://github.com/David650991)

## Propiedad intelectual

El código original, arquitectura y documentación desarrollados específicamente
para este repositorio corresponden a David Vidal Ramírez conforme a la licencia
propietaria indicada en este proyecto.

VUMARI STUDIOS constituye la identidad comercial asociada al sitio. Los recursos
de terceros conservan los derechos correspondientes a sus titulares.

Consulta [AUTHORS.md](AUTHORS.md), [NOTICE](NOTICE) y [LICENSE](LICENSE) para la
separación entre marca, autoría técnica y condiciones de uso.
