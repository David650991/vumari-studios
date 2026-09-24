import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { loadSiteData } from './build/data-loader.mjs';
import { absoluteUrl } from './build/html.mjs';
import { createCommercialPages } from './build/pages/commercial-pages.mjs';
import { createToolPages } from './build/pages/tool-pages.mjs';
import { createSiteShell } from './build/site-shell.mjs';

const root = process.cwd();
const { company, author, legal, services, portfolio, site, socialLinks, contactChannels, toolsData } = await loadSiteData(root);
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const absolute = file => absoluteUrl(company.siteUrl, file);
const { layout, contactList, socialList } = createSiteShell({ company, legal, site, socialLinks, contactChannels, absolute });

const commercialPages = createCommercialPages({
  company,
  services,
  portfolio,
  site,
  contactList,
  socialList
});
const toolPages = createToolPages({ company, toolsData });
const pages = [
  ...commercialPages,
  ...toolPages
];

for (const page of pages) {
  const output = path.join(dist, page.file);
  await mkdir(path.dirname(output), {recursive:true});
  await writeFile(output, layout(page), 'utf8');
}
await cp(path.join(root, 'src/styles'), path.join(dist, 'styles'), {recursive:true});
await cp(path.join(root, 'src/scripts'), path.join(dist, 'scripts'), {recursive:true});
await cp(path.join(root, 'src/assets'), path.join(dist, 'assets'), {recursive:true});
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${absolute('sitemap.xml')}\n`);
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(page => !page.noindex).map(page=>`<url><loc>${absolute(page.canonicalPath ?? page.file)}</loc></url>`).join('')}</urlset>`);
await writeFile(path.join(dist, '.nojekyll'), '');
console.log(`Sitio generado: ${pages.length} páginas en dist/`);
