import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const readJson = async file => JSON.parse(await readFile(path.join(root, 'src/data', file), 'utf8'));
const [company, author, legal, services, portfolio, site, socialLinks] = await Promise.all([
  readJson('company.json'), readJson('author.json'), readJson('legal.json'),
  readJson('services.json'), readJson('portfolio.json'), readJson('site.json'),
  readJson('social-links.json')
]);
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const escape = value => String(value).replace(/[&<>"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
const absolute = file => new URL(file, company.siteUrl).href;
const nav = current => site.navigation.map(item => `<li><a href="${item.href}"${item.href === current ? ' aria-current="page"' : ''}>${item.label}</a></li>`).join('');
const activeSocialLinks = socialLinks.filter(item => Boolean(item.url));
const socialItem = item => {
  const content = `<img src="${item.icon}" alt="" width="32" height="32" loading="lazy"><span><strong>${item.label}</strong><small>${item.url ? 'Visitar perfil' : 'Próximamente'}</small></span>`;
  return item.url
    ? `<li><a class="social-item" href="${item.url}" rel="me noopener">${content}</a></li>`
    : `<li class="social-item social-item--pending" aria-label="${item.label}: próximamente">${content}</li>`;
};
const socialList = className => `<ul class="${className}" aria-label="Redes sociales de VUMARI STUDIOS">${socialLinks.map(socialItem).join('')}</ul>`;

function header(current) {
  return `<a class="skip-link" href="#contenido">Saltar al contenido</a>
  <header class="site-header"><div class="container nav-wrap">
    <a class="brand" href="index.html" aria-label="VUMARI STUDIOS, inicio"><img src="assets/images/brand/vumari-logo-primary.png" alt="" width="48" height="60">VUMARI</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" data-nav-toggle>Menú</button>
    <nav class="site-nav" id="site-navigation" aria-label="Navegación principal" data-navigation data-open="false"><ul>${nav(current)}</ul></nav>
  </div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container"><div class="footer-grid">
    <div><p class="eyebrow">${company.brand}</p><p>${company.description}</p></div>
    <nav aria-label="Navegación secundaria"><ul class="footer-links">${nav('')}<li><a href="privacidad.html">Privacidad</a></li></ul></nav>
  </div>${socialList('social-list social-list--footer')}<p class="copyright">© ${legal.copyrightYear} ${escape(legal.copyrightHolder)}. ${company.brand} es la identidad comercial. Desarrollo técnico: ${escape(author.name)}.</p></div></footer>`;
}

function schema() {
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': ['Organization', 'ProfessionalService'],
    name: company.brand, slogan: company.slogan, url: company.siteUrl,
    logo: absolute('assets/images/brand/vumari-logo-primary.png'),
    areaServed: ['Tres Valles', 'Veracruz', 'México'],
    address: {'@type':'PostalAddress', addressLocality: company.location.city, addressRegion: company.location.state, addressCountry: 'MX'},
    founder: company.founders.map(name => ({'@type':'Person', name})),
    ...(activeSocialLinks.length ? {sameAs: activeSocialLinks.map(item => item.url)} : {})
  });
}

function layout({title, description, file, content}) {
  const canonical = absolute(file);
  return `<!doctype html><html lang="es-MX"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="author" content="${escape(author.name)}">
  <link rel="canonical" href="${canonical}"><meta name="theme-color" content="#06050a">
  <meta property="og:type" content="website"><meta property="og:locale" content="es_MX"><meta property="og:site_name" content="${company.brand}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${absolute('assets/images/brand/vumari-logo-primary.png')}">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${absolute('assets/images/brand/vumari-logo-primary.png')}">
  <link rel="icon" href="assets/icons/favicon.ico" sizes="any"><link rel="icon" href="assets/icons/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">
  <link rel="stylesheet" href="styles/main.css"><script type="application/ld+json">${schema()}</script><script type="module" src="scripts/core/app.js"></script>
  </head><body>${header(file)}<main id="contenido">${content}</main>${footer()}</body></html>`;
}

const serviceCards = services.map((s,i) => `<article class="card"><span class="card__number">0${i+1}</span><h3>${s.name}</h3><p>${s.summary}</p></article>`).join('');
const processCards = site.process.map((step,i) => `<li class="card"><span class="card__number">PASO ${i+1}</span><h3>${step}</h3></li>`).join('');
const quoteButton = `<a class="button button--primary" href="cotizacion.html">Solicita una cotización</a>`;

const pages = [
  {
    file:'index.html', title:`${company.brand} | Agencia creativa en Tres Valles`, description:company.description,
    content:`<section class="hero"><div class="container hero-grid"><div class="hero-brand"><img class="hero-mark" src="assets/images/brand/vumari-logo-primary.png" alt="Logotipo multicolor de VUMARI STUDIOS" width="1122" height="1402" fetchpriority="high"></div><div class="hero-copy"><p class="eyebrow">Estudio creativo · Tres Valles, Veracruz</p><h1>Ideas que toman <span class="gradient-text">forma y presencia.</span></h1><p class="lead">${company.description}</p><div class="actions"><a class="button button--primary" href="servicios.html">Conoce nuestros servicios</a>${quoteButton}</div></div></div></section>
    <section class="section section--soft"><div class="container"><div class="section-heading"><p class="eyebrow">Lo que hacemos</p><h2>Una idea necesita más que una pieza bonita.</h2><p class="lead">Partimos del problema de comunicación y definimos qué conviene producir.</p></div><div class="grid grid--3">${serviceCards}</div></div></section>
    <section class="section"><div class="container"><div class="section-heading"><p class="eyebrow">Qué podemos crear</p><h2>Proyectos concretos para necesidades reales.</h2></div><ul class="idea-list">${site.projectIdeas.map(x=>`<li>${x}</li>`).join('')}</ul></div></section>
    <section class="section section--soft"><div class="container"><div class="section-heading"><p class="eyebrow">Proceso</p><h2>Claridad desde la primera conversación.</h2><p>Los tiempos y entregables se definen en cada propuesta según el alcance.</p></div><ol class="grid grid--3 process-grid">${processCards}</ol></div></section>
    <section class="section"><div class="container cta-panel"><p class="eyebrow">Hablemos del proyecto</p><h2>Cuéntanos qué necesitas comunicar.</h2><p>No necesitas llegar con todo resuelto. Comparte el contexto y revisaremos qué alcance tiene sentido.</p><div class="actions">${quoteButton}<a class="button button--secondary" href="contacto.html">Ver contacto</a></div></div></section>`
  },
  {
    file:'servicios.html', title:`Servicios | ${company.brand}`, description:'Publicidad, producción audiovisual, contenido, diseño, marketing y desarrollo web desde Tres Valles, Veracruz.',
    content:`<section class="page-hero"><div class="container"><p class="eyebrow">Servicios</p><h1>Comunicación con un propósito definido.</h1><p class="lead">Integramos disciplinas según lo que cada proyecto necesita. El alcance siempre se acuerda antes de producir.</p></div></section><section class="section section--soft"><div class="container">${services.map(s=>`<article class="service-detail" id="${s.slug}"><div><p class="eyebrow">${s.availability ? 'Disponible previa evaluación' : 'Área de servicio'}</p><h2>${s.name}</h2></div><div><p>${s.problem}</p><p>${s.summary}</p><ul class="tag-list">${s.deliverables.map(x=>`<li class="tag">${x}</li>`).join('')}</ul></div></article>`).join('')}</div></section><section class="section"><div class="container cta-panel"><h2>El servicio correcto depende del problema.</h2><p>Describe el proyecto y prepararemos una propuesta de alcance.</p>${quoteButton}</div></section>`
  },
  {
    file:'portafolio.html', title:`Portafolio | ${company.brand}`, description:'Proyectos propios, trabajos para clientes y demostraciones conceptuales de VUMARI STUDIOS claramente identificados.',
    content:`<section class="page-hero"><div class="container"><p class="eyebrow">Portafolio</p><h1>Trabajo con contexto, no sólo imágenes.</h1><p class="lead">Cada proyecto indica su origen. Las demostraciones conceptuales nunca se presentan como clientes reales.</p></div></section><section class="section section--soft"><div class="container">${portfolio.map(p=>`<article class="project"><img src="${p.image}" alt="Logotipo desarrollado para la identidad de VUMARI STUDIOS" loading="lazy" width="1122" height="1402"><div><p class="status">${p.statusLabel}</p><h2>${p.name}</h2><p>${p.summary}</p><ul class="timeline"><li><strong>Problema:</strong> ${p.problem}</li><li><strong>Objetivo:</strong> ${p.objective}</li><li><strong>Concepto:</strong> ${p.concept}</li><li><strong>Producción:</strong> ${p.production}</li><li><strong>Entregables:</strong> ${p.deliverables.join(', ')}</li>${p.result ? `<li><strong>Resultado:</strong> ${p.result}</li>` : ''}</ul></div></article>`).join('')}</div></section>`
  },
  {
    file:'nosotros.html', title:`Nosotros | ${company.brand}`, description:'Conoce el origen, la misión y la forma de trabajo de VUMARI STUDIOS en Tres Valles, Veracruz.',
    content:`<section class="page-hero"><div class="container"><p class="eyebrow">Quiénes somos</p><h1>Un estudio creativo construido desde Tres Valles.</h1><p class="lead">VUMARI STUDIOS nace como un proyecto de David Vidal Ramírez y Ulises Márquez González, con una forma de trabajo principalmente digital y capacidad de producción presencial cuando el proyecto lo requiere.</p></div></section><section class="section section--soft"><div class="container grid grid--2"><article class="card"><p class="eyebrow">Misión</p><h2>Comunicar mejor lo que cada negocio hace.</h2><p>Ayudar a negocios, empresas y emprendedores mediante publicidad, contenido audiovisual, diseño y herramientas digitales. Trabajamos con claridad, creatividad y responsabilidad para que cada solución responda a una necesidad real.</p></article><article class="card"><p class="eyebrow">Visión</p><h2>Crecer con procesos serios y trabajo de calidad.</h2><p>Construir gradualmente un estudio capaz de integrar publicidad, producción audiovisual, marketing y tecnología; comenzar en Tres Valles y la región, crecer en Veracruz y trabajar con clientes de distintas partes de México.</p></article></div></section><section class="section"><div class="container"><div class="section-heading"><p class="eyebrow">Cómo trabajamos</p><h2>Un proceso entendible de principio a fin.</h2></div><ol class="grid grid--3 process-grid">${processCards}</ol></div></section>`
  },
  {
    file:'cotizacion.html', title:`Solicitar cotización | ${company.brand}`, description:'Comparte la información básica de tu proyecto para definir alcance y preparar una cotización con VUMARI STUDIOS.',
    content:`<section class="page-hero"><div class="container"><p class="eyebrow">Cotización</p><h1>Cuéntanos sobre tu proyecto.</h1><p class="lead">La información ayuda a entender el alcance inicial. El envío en línea se habilitará cuando exista un canal oficial configurado.</p></div></section><section class="section section--soft"><div class="container grid grid--2"><form class="form card" action="#" method="post" data-contact-form><div class="field"><label for="name">Nombre</label><input id="name" name="name" autocomplete="name" required></div><div class="field"><label for="company">Empresa o proyecto</label><input id="company" name="company" autocomplete="organization"></div><div class="field"><label for="phone">Teléfono</label><input id="phone" name="phone" type="tel" autocomplete="tel" required></div><div class="field"><label for="email">Correo</label><input id="email" name="email" type="email" autocomplete="email" required></div><div class="field"><label for="city">Ciudad</label><input id="city" name="city" autocomplete="address-level2" required></div><div class="field"><label for="project-type">Tipo de proyecto</label><select id="project-type" name="projectType" required><option value="">Selecciona una opción</option>${services.map(s=>`<option>${s.name}</option>`).join('')}</select></div><div class="field"><label for="description">Descripción</label><textarea id="description" name="description" required></textarea></div><div class="field"><label for="budget">Presupuesto aproximado <span>(opcional)</span></label><input id="budget" name="budget" inputmode="decimal"></div><div class="field"><label for="desired-date">Fecha deseada <span>(opcional)</span></label><input id="desired-date" name="desiredDate" type="date"></div><label class="check"><input type="checkbox" name="privacy" required> <span>He leído el <a href="privacidad.html">aviso de privacidad</a> y autorizo el uso de estos datos para atender mi solicitud.</span></label><button class="button button--primary" type="submit">Preparar solicitud</button><p class="form-status" aria-live="polite" data-form-status></p><noscript><p class="form-note">El envío requiere JavaScript mientras se configura el canal definitivo.</p></noscript></form><aside><h2>Antes de enviar</h2><p>No es necesario tener una idea terminada. Describe qué quieres comunicar, a quién y dónde piensas utilizar el material.</p><p>Los archivos y referencias se habilitarán cuando exista un servicio de recepción seguro.</p></aside></div></section>`
  },
  {
    file:'contacto.html', title:`Contacto | ${company.brand}`, description:'Contacta a VUMARI STUDIOS para conversar sobre publicidad, producción, contenido, diseño o desarrollo web.',
    content:`<section class="page-hero"><div class="container"><p class="eyebrow">Contacto</p><h1>Una conversación clara es el primer paso.</h1><p class="lead">Atendemos de forma digital desde Tres Valles, Veracruz, y evaluamos trabajos presenciales según el proyecto.</p><div class="actions">${quoteButton}</div></div></section><section class="section section--soft"><div class="container grid grid--2"><article class="card"><h2>Canales oficiales</h2>${company.email ? `<p><a href="mailto:${company.email}">${company.email}</a></p>` : '<p>Correo: pendiente de configuración.</p>'}<p>Los perfiles se activarán en cuanto exista una dirección oficial confirmada.</p>${socialList('social-list social-list--contact')}</article><article class="card"><h2>Ubicación y cobertura</h2><p>Tres Valles, Veracruz, México.</p><p>Atención principalmente digital para clientes de la región y de otras partes de México.</p></article></div></section>`
  },
  {
    file:'privacidad.html', title:`Aviso de privacidad | ${company.brand}`, description:'Información sobre el tratamiento de datos compartidos con VUMARI STUDIOS mediante sus formularios de contacto.',
    content:`<section class="page-hero"><div class="container"><p class="eyebrow">Privacidad</p><h1>Aviso de privacidad.</h1><p class="lead">Versión inicial para el formulario del sitio. Debe revisarse cuando se configure el responsable y el canal definitivo de recepción.</p></div></section><section class="section section--soft"><div class="container legal"><p><strong>Responsable:</strong> VUMARI STUDIOS. Domicilio y correo para derechos ARCO: PENDIENTE DE DEFINIR antes de habilitar el envío público.</p><h2>Datos solicitados</h2><p>Nombre, empresa o proyecto, teléfono, correo, ciudad e información que la persona decida compartir sobre su solicitud.</p><h2>Finalidad</h2><p>Entender la solicitud, contactar a la persona interesada y preparar una propuesta de servicios. No se usarán estos datos para finalidades distintas sin informar y obtener el consentimiento correspondiente.</p><h2>Conservación y transferencias</h2><p>Los plazos de conservación y proveedores involucrados se documentarán cuando se seleccione el mecanismo de formularios. El formulario no debe habilitarse públicamente antes de completar esa configuración.</p><h2>Derechos</h2><p>El canal para ejercer acceso, rectificación, cancelación u oposición se publicará junto con el correo oficial.</p></div></section>`
  }
];

for (const page of pages) await writeFile(path.join(dist, page.file), layout(page), 'utf8');
await cp(path.join(root, 'src/styles'), path.join(dist, 'styles'), {recursive:true});
await cp(path.join(root, 'src/scripts'), path.join(dist, 'scripts'), {recursive:true});
await cp(path.join(root, 'src/assets'), path.join(dist, 'assets'), {recursive:true});
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${absolute('sitemap.xml')}\n`);
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p=>`<url><loc>${absolute(p.file)}</loc></url>`).join('')}</urlset>`);
await writeFile(path.join(dist, '.nojekyll'), '');
console.log(`Sitio generado: ${pages.length} páginas en dist/`);
