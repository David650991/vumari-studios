import { escape, withPrefix } from './html.mjs';

export function createSiteShell({ company, legal, site, socialLinks, contactChannels, absolute }) {
  const nav = (current, prefix = '') => site.navigation.map(item => {
    const isActive = item.href === current || Boolean(item.activePrefix && current.startsWith(item.activePrefix));
    const className = item.variant === 'cta' ? ' class="site-nav__cta"' : '';
    return `<li><a${className} href="${withPrefix(prefix, item.href)}"${isActive ? ' aria-current="page"' : ''}>${item.label}</a></li>`;
  }).join('');
  const activeSocialLinks = socialLinks.filter(item => Boolean(item.url));
  const socialItem = (item, prefix = '') => {
    const content = `<img src="${withPrefix(prefix, item.icon)}" alt="" width="32" height="32" loading="lazy"><span><strong>${item.label}</strong><small>${item.url ? 'Visitar perfil' : 'Próximamente'}</small></span>`;
    return item.url
      ? `<li><a class="social-item" href="${item.url}" rel="me noopener">${content}</a></li>`
      : `<li class="social-item social-item--pending" aria-label="${item.label}: próximamente">${content}</li>`;
  };
  const socialList = (className, prefix = '') => `<ul class="${className}" aria-label="Redes sociales de VUMARI STUDIOS">${socialLinks.map(item => socialItem(item, prefix)).join('')}</ul>`;
  const contactItem = item => {
    const detail = item.value ?? 'Pendiente de configuración';
    const content = `<img src="${item.icon}" alt="" width="32" height="32"><span><strong>${item.label}</strong><small>${detail}</small></span>`;
    return item.url
      ? `<li><a class="social-item" href="${item.url}">${content}</a></li>`
      : `<li class="social-item social-item--pending" aria-label="${item.label}: ${detail}">${content}</li>`;
  };
  const contactList = `<ul class="social-list social-list--contact" aria-label="Canales de contacto de VUMARI STUDIOS">${contactChannels.map(contactItem).join('')}</ul>`;

  function header(current, prefix = '') {
    return `<a class="skip-link" href="#contenido">Saltar al contenido</a>
  <header class="site-header"><div class="container nav-wrap">
    <a class="brand" href="${withPrefix(prefix, 'index.html')}" aria-label="VUMARI STUDIOS, inicio"><img src="${withPrefix(prefix, 'assets/images/brand/vumari-logo-primary.png')}" alt="" width="48" height="60">VUMARI</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" data-nav-toggle>Menú</button>
    <nav class="site-nav" id="site-navigation" aria-label="Navegación principal" data-navigation data-open="false"><ul>${nav(current, prefix)}</ul></nav>
  </div></header>`;
  }

  function footer(prefix = '') {
    return `<footer class="site-footer"><div class="container"><div class="footer-grid">
    <div class="footer-brand"><p class="eyebrow">${company.brand}</p><p>${company.description}</p></div>
    <nav class="footer-navigation" aria-label="Navegación secundaria"><p class="footer-title">Explorar</p><ul class="footer-links">${nav('', prefix)}<li><a href="${withPrefix(prefix, 'privacidad.html')}">Privacidad</a></li></ul></nav>
    <div class="footer-social"><p class="footer-title">Conecta con VUMARI</p>${socialList('social-list social-list--footer', prefix)}<p class="footer-pending">Perfiles oficiales en preparación.</p></div>
  </div><div class="footer-bottom"><p class="copyright">© ${legal.copyrightYear} ${company.brand}. Todos los derechos reservados.</p></div></div></footer>`;
  }

  function schema() {
    return JSON.stringify({
      '@context': 'https://schema.org', '@type': ['Organization', 'ProfessionalService'],
      name: company.brand, slogan: company.slogan, url: company.siteUrl,
      logo: absolute('assets/images/brand/vumari-logo-primary.png'),
      areaServed: ['Tres Valles', 'Veracruz', 'México'],
      address: {'@type':'PostalAddress', addressLocality: company.location.city, addressRegion: company.location.state, addressCountry: 'MX'},
      ...(activeSocialLinks.length ? {sameAs: activeSocialLinks.map(item => item.url)} : {})
    });
  }

  function layout({title, description, file, content, canonicalPath, noindex = false, assetPrefix = '', pageScript}) {
    const canonical = absolute(canonicalPath ?? (file === 'index.html' ? '' : file));
    return `<!doctype html><html lang="es-MX"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="author" content="${company.brand}">${noindex ? '<meta name="robots" content="noindex, follow">' : ''}
  <link rel="canonical" href="${canonical}"><meta name="theme-color" content="#06050a">
  <meta property="og:type" content="website"><meta property="og:locale" content="es_MX"><meta property="og:site_name" content="${company.brand}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${absolute('assets/images/brand/vumari-logo-primary.png')}">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${absolute('assets/images/brand/vumari-logo-primary.png')}">
  <link rel="icon" href="${withPrefix(assetPrefix, 'assets/icons/favicon.ico')}" sizes="any"><link rel="icon" href="${withPrefix(assetPrefix, 'assets/icons/favicon.svg')}" type="image/svg+xml"><link rel="apple-touch-icon" href="${withPrefix(assetPrefix, 'assets/icons/apple-touch-icon.png')}">
  <link rel="stylesheet" href="${withPrefix(assetPrefix, 'styles/main.css')}"><script type="application/ld+json">${schema()}</script><script type="module" src="${withPrefix(assetPrefix, 'scripts/core/app.js')}"></script>${pageScript ? `<script type="module" src="${withPrefix(assetPrefix, pageScript)}"></script>` : ''}
  </head><body>${header(file, assetPrefix)}<main id="contenido">${content}</main>${footer(assetPrefix)}</body></html>`;
  }

  return { layout, contactList, socialList };
}
