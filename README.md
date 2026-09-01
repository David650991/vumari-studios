# VUMARI STUDIOS

## VUMARI STUDIOS

**Creamos ideas. Construimos presencia.**

Sitio web oficial de VUMARI STUDIOS, estudio creativo con base en Tres Valles,
Veracruz, México. La plataforma presentará servicios de publicidad, producción
audiovisual, contenido digital, diseño, marketing y desarrollo web, y facilitará
el contacto y la solicitud de cotizaciones.

> Estado: versión inicial funcional. Los canales oficiales de contacto están
> pendientes de configuración antes de una publicación comercial.

## Principios del proyecto

- Contenido real, sin clientes, resultados ni credenciales inventadas.
- HTML semántico, CSS moderno y JavaScript modular como base.
- Generación estática para evitar duplicar navegación, datos y metadatos.
- Diseño mobile-first, accesible y con mejora progresiva.
- Dependencias limitadas a necesidades concretas y documentadas.
- Publicación prevista mediante GitHub Pages.

## Tecnologías

- HTML5 semántico generado estáticamente.
- CSS modular, mobile-first y sin librerías visuales.
- JavaScript ES Modules para navegación y formularios.
- Node.js para build, validación y pruebas, sin dependencias externas.
- GitHub Actions y GitHub Pages para integración y despliegue.

## Estructura

```text
.
├── .github/workflows/    Calidad y despliegue
├── docs/                 Arquitectura, marca, contenido y despliegue
├── scripts/              Generación y validación
├── src/
│   ├── assets/           Marca e iconos
│   ├── data/             Fuente central de información reutilizable
│   ├── scripts/          Comportamiento del navegador
│   └── styles/           Sistema visual modular
├── tests/                Pruebas del resultado generado
├── .editorconfig         Convenciones básicas de formato
├── .gitignore            Exclusiones del repositorio
├── LICENSE               Condiciones de uso del proyecto
└── README.md             Entrada a la documentación
```

La referencia visual original se conserva en `docs/reference/` y no se presenta
como un trabajo para terceros.

## Desarrollo

Requiere Node.js 20 o posterior.

```bash
npm install
npm run check
```

Comandos disponibles:

- `npm run validate`: comprueba datos y recursos requeridos.
- `npm test`: genera y prueba páginas, metadata y enlaces internos.
- `npm run build`: crea el sitio publicable en `dist/`.
- `npm run check`: ejecuta la revisión completa.

## Publicación

Los workflows validan cada cambio y publican `dist/` en GitHub Pages sólo desde
`main`. Consulta `docs/deployment.md` para la configuración del repositorio y el
futuro dominio.

## Mantenimiento de contenido

La información empresarial compartida se centraliza en
`src/data/company.json`. Los datos pendientes deben permanecer vacíos o
marcados expresamente como pendientes; nunca deben completarse por suposición.

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

## Autoría y avisos

Consulta [AUTHORS.md](AUTHORS.md), [NOTICE](NOTICE) y [LICENSE](LICENSE) para la
separación entre marca, autoría técnica y condiciones de uso.
