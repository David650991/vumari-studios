import { escape, withPrefix } from '../html.mjs';

const toolPagePrefix = '../../';
const renderToolPage = tool => {
  const inputLabel = tool.input.formats[0].toUpperCase();
  const outputLabel = tool.output.formats[0].toUpperCase();
  const inputExtension = `.${tool.input.formats[0].toLowerCase()}`;
  const inputId = `${tool.slug}-file`;
  const isVttInput = inputLabel === 'VTT';
  const acceptedTypes = isVttInput ? '.vtt,text/vtt,text/plain' : '.srt,application/x-subrip,text/plain';
  const inputDescription = isVttInput ? 'subtítulos WebVTT simples' : 'subtítulos SubRip';
  const outputDescription = isVttInput ? 'SubRip SRT' : 'WebVTT';
  const formatsDescription = isVttInput
    ? '<p><strong>Entrada:</strong> WebVTT simple con timestamps HH:MM:SS.mmm o MM:SS.mmm.</p><p><strong>Salida:</strong> SRT numerado con timestamps HH:MM:SS,mmm.</p>'
    : '<p><strong>Entrada:</strong> SRT con timestamps HH:MM:SS,mmm.</p><p><strong>Salida:</strong> WebVTT con timestamps HH:MM:SS.mmm.</p>';
  const specificLimitation = isVttInput
    ? '<li>No admite identifiers, settings, NOTE, STYLE, REGION ni marcado WebVTT avanzado.</li>'
    : '<li>No corrige, traduce ni reescribe el texto.</li>';
  const numberingAnswer = isVttInput
    ? 'Sí. Los subtítulos se numeran consecutivamente desde 1.'
    : 'No es necesaria en WebVTT; se conserva el orden de los subtítulos.';
  return {
    file:`herramientas/${tool.slug}/index.html`, canonicalPath:`herramientas/${tool.slug}/`, assetPrefix:toolPagePrefix, noindex:true,
    pageScript:'scripts/tools/tool-controller.js', title:tool.seo.title, description:tool.seo.description,
    content:`<section class="page-hero"><div class="container"><nav class="breadcrumb" aria-label="Ruta de navegación"><ol><li><a href="${withPrefix(toolPagePrefix, 'index.html')}">Inicio</a></li><li><a href="../">VUMARI Tools</a></li><li aria-current="page">${escape(tool.shortName)}</li></ol></nav><p class="eyebrow">Experimental</p><h1>${escape(tool.name)}</h1><p class="lead">Convierte ${inputDescription} al formato ${outputDescription} directamente en tu navegador.</p></div></section>
    <section class="section section--soft"><div class="container tool-detail-layout"><div><div class="tool-workspace" data-tool-controller data-processor="${escape(tool.processor)}" data-input-extension="${inputExtension}" data-input-label="${inputLabel}" data-output-label="${outputLabel}" data-processing-label="${isVttInput ? 'SRT' : 'WebVTT'}" data-state="idle" hidden><div><p class="eyebrow">Conversor local</p><h2>Selecciona tu archivo ${inputLabel}</h2></div><p class="privacy-note">${escape(tool.privacy.message)}</p><form class="tool-form" data-tool-form><label class="tool-file-label" for="${inputId}">Archivo ${inputLabel}</label><p id="${inputId}-help">Se admite un archivo con extensión ${inputExtension} y texto UTF-8.</p><input class="tool-file" id="${inputId}" name="subtitle" type="file" accept="${acceptedTypes}" aria-describedby="${inputId}-help" data-tool-file><button class="button button--primary" type="submit" data-tool-submit disabled>Convertir a ${outputLabel}</button><p class="tool-status" role="status" aria-live="polite" data-tool-status></p></form><section class="tool-result" tabindex="-1" data-tool-result hidden><h3>Resultado ${outputDescription}</h3><pre data-tool-result-text></pre><a class="button button--secondary" href="#" data-tool-download hidden>Descargar ${outputLabel}</a></section></div><noscript><p class="card">Esta herramienta necesita JavaScript para procesar el archivo localmente. La información y las instrucciones de esta página siguen disponibles.</p></noscript></div>
    <div class="tool-information"><article><h2>Cómo funciona</h2><ol><li>Selecciona un archivo ${inputLabel}.</li><li>Revisa que el archivo sea válido.</li><li>Convierte y descarga el resultado ${outputLabel}.</li></ol></article><article><h2>Formatos</h2>${formatsDescription}</article><article><h2>Limitaciones</h2><ul><li>Esta versión admite texto UTF-8 con o sin BOM.</li><li>No convierte archivos UTF-16, Windows-1252 ni otras codificaciones.</li>${specificLimitation}</ul></article><article><h2>Preguntas frecuentes</h2><h3>¿El archivo se sube a internet?</h3><p>No. La lectura y la conversión ocurren localmente en este navegador.</p><h3>¿Cómo se trata la numeración?</h3><p>${numberingAnswer}</p></article><article><h2>¿Necesitas una solución digital?</h2><p>VUMARI STUDIOS desarrolla sitios y herramientas orientados a necesidades concretas.</p><div class="actions"><a class="button button--secondary" href="${withPrefix(toolPagePrefix, 'servicios.html')}#desarrollo-web">Conoce desarrollo web</a><a class="button button--primary" href="${withPrefix(toolPagePrefix, 'cotizacion.html')}">Solicita una cotización</a></div></article></div></div></section>`
  };
};

export function createToolPages({ company, toolsData }) {
  const familyGroups = toolsData.families.map((family, index) => ({
    family,
    index,
    tools: toolsData.tools.filter(tool => tool.family === family.id)
  })).filter(group => group.tools.length > 0);
  const familySections = familyGroups.map(({ family, index, tools }, groupIndex) => {
    const eyebrow = index === 0 ? 'Primera familia' : `Familia ${index + 1}`;
    const description = family.id === 'media'
      ? 'Utilidades para formatos multimedia, comenzando por transformaciones ligeras y verificables.'
      : 'Utilidades digitales agrupadas por una necesidad común.';
    const cta = groupIndex === familyGroups.length - 1
      ? '<p class="tools-family__cta">¿Necesitas una solución digital para tu proyecto? <a href="../cotizacion.html">Solicita una cotización</a>.</p>'
      : '';
    return `<section class="section section--soft"><div class="container tools-family"><div class="tools-family__heading"><p class="eyebrow">${eyebrow}</p><h2>${escape(family.name)}</h2><p>${description}</p></div><div class="tools-grid">${tools.map(tool => `<article class="tool-card"><p class="tool-card__status">${tool.status === 'experimental' ? 'Experimental' : escape(tool.status)}</p><h3>${escape(tool.shortName)}</h3><p>${escape(tool.summary)}</p><p class="tool-card__format">${escape(tool.input.formats.join(', ').toUpperCase())} <span aria-hidden="true">→</span> ${escape(tool.output.formats.join(', ').toUpperCase())}</p><a href="${escape(tool.slug)}/">Abrir herramienta experimental <span aria-hidden="true">→</span></a></article>`).join('')}</div>${cta}</div></section>`;
  }).join('');
  return [
    {
      file:'herramientas/index.html', canonicalPath:'herramientas/', assetPrefix:'../', noindex:true,
      title:`VUMARI Tools | ${company.brand}`,
      description:'Herramientas digitales desarrolladas progresivamente por VUMARI STUDIOS.',
      content:`<section class="page-hero"><div class="container tools-intro"><p class="eyebrow">Tecnología VUMARI</p><h1>VUMARI Tools</h1><p class="lead">Herramientas digitales desarrolladas progresivamente por VUMARI STUDIOS.</p></div></section>${familySections}`
    },
    ...toolsData.tools.map(renderToolPage)
  ];
}
