# VUMARI STUDIOS

**Creamos ideas. Construimos presencia.**

Sitio web oficial de VUMARI STUDIOS, estudio creativo con base en Tres Valles,
Veracruz, México. El sitio comercial presenta servicios de publicidad,
producción audiovisual, contenido digital, diseño, marketing y desarrollo web,
y facilita el contacto y la solicitud de cotizaciones.

## Estado actual

El sitio comercial y VUMARI Tools están integrados en `main`, la rama estable
que se publica mediante GitHub Pages. Actualmente existen dos herramientas:

- SRT → VTT.
- VTT → SRT.

Ambas continúan como `Experimental`, están publicadas y procesan el archivo
localmente en el navegador dentro del alcance validado. Sus páginas conservan
`noindex` y permanecen fuera del sitemap de forma intencional. La navegación
pública incluye `Herramientas`. El build actual genera 10 páginas y la suite
tiene 55 pruebas aprobadas y 0 fallidas.

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

## Resultado actual del build

El build actual de `main` genera 10 páginas:

- 7 páginas comerciales.
- 3 páginas de Tools: `/herramientas/`, `/herramientas/srt-a-vtt/` y
  `/herramientas/vtt-a-srt/`.

Las páginas de Tools permanecen fuera del sitemap de forma intencional y están
publicadas mediante GitHub Pages. La navegación pública incluye el acceso a
`Herramientas`.

## Publicación

GitHub Pages publica `dist/` solamente cuando un cambio llega a `main` y supera
el workflow de calidad. VUMARI Tools sigue el mismo flujo y actualmente forma
parte del sitio publicado. Consulta
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
