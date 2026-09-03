import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { test, before } from 'node:test';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
let toolsData;

before(async () => {
  execFileSync(process.execPath, ['scripts/build.mjs'], {cwd: root});
  toolsData = JSON.parse(await readFile(path.join(root, 'src/data/tools.json'), 'utf8'));
});

test('mantiene un catálogo mínimo y válido de VUMARI Tools', () => {
  assert.equal(toolsData.families.length, 1);
  assert.equal(toolsData.families[0].name, 'VUMARI Media Tools');
  assert.equal(toolsData.tools.length, 1);
  const ids = toolsData.tools.map(tool => tool.id);
  const slugs = toolsData.tools.map(tool => tool.slug);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(toolsData.tools.every(tool => ['planned', 'experimental', 'beta', 'stable'].includes(tool.status)));
});

test('registra SRT a VTT como experimental, local previsto y no indexable', () => {
  const [tool] = toolsData.tools;
  assert.equal(tool.shortName, 'SRT → VTT');
  assert.equal(tool.status, 'experimental');
  assert.equal(tool.processingMode, 'browser');
  assert.equal(tool.seo.indexable, false);
});

test('genera el índice experimental con rutas y metadata correctas', async () => {
  const file = path.join(dist, 'herramientas/index.html');
  await assert.doesNotReject(access(file));
  const html = await readFile(file, 'utf8');
  assert.match(html, /<meta name="robots" content="noindex, follow">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/david650991\.github\.io\/vumari-studios\/herramientas\/">/);
  assert.match(html, /<h1>VUMARI Tools<\/h1>/);
  assert.match(html, /SRT → VTT/);
  assert.match(html, /Experimental/);
  assert.match(html, /Abrir herramienta experimental/);
  assert.match(html, /href="\.\.\/styles\/main\.css"/);
  assert.match(html, /src="\.\.\/scripts\/core\/app\.js"/);
  assert.match(html, /src="\.\.\/assets\/icons\/social\/vumari-social-facebook\.png"/);
  assert.match(html, /href="\.\.\/cotizacion\.html">Solicita una cotización<\/a>/);
  assert.doesNotMatch(html, /type="file"|data-tool-controller|Procesar|Descargar/);
});

test('no publica Tools en navegación ni sitemap', async () => {
  const home = await readFile(path.join(dist, 'index.html'), 'utf8');
  const toolsPage = await readFile(path.join(dist, 'herramientas/index.html'), 'utf8');
  const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
  const mainNavigation = toolsPage.match(/<nav class="site-nav"[\s\S]*?<\/nav>/u)?.[0] ?? '';
  assert.doesNotMatch(home, /href="herramientas(?:\/|\.html)/);
  assert.doesNotMatch(mainNavigation, />Herramientas</);
  assert.doesNotMatch(sitemap, /\/herramientas\//);
  assert.match(toolsPage, /href="srt-a-vtt\/">Abrir herramienta experimental/);
});

test('mantiene la privacidad pública en la página experimental', async () => {
  const html = await readFile(path.join(dist, 'herramientas/index.html'), 'utf8');
  const withoutTechnicalUrls = html.replaceAll('david650991.github.io', '').replaceAll('github.com/David650991', '');
  assert.doesNotMatch(withoutTechnicalUrls, /David Vidal(?: Ramírez)?|Ulises Márquez González|David650991/);
});

test('el servidor local resuelve rutas de directorio mediante index.html', async () => {
  const source = await readFile(path.join(root, 'scripts/serve.mjs'), 'utf8');
  assert.match(source, /pathname\.endsWith\('\/'\) \? 'index\.html' : ''/);
});

test('genera la página funcional SRT a VTT como experimental y noindex', async () => {
  const file = path.join(dist, 'herramientas/srt-a-vtt/index.html');
  await assert.doesNotReject(access(file));
  const html = await readFile(file, 'utf8');
  assert.match(html, /<meta name="robots" content="noindex, follow">/);
  assert.match(html, /https:\/\/david650991\.github\.io\/vumari-studios\/herramientas\/srt-a-vtt\//);
  assert.match(html, /aria-label="Ruta de navegación"/);
  assert.match(html, /<h1>Convertir SRT a VTT<\/h1>/);
  assert.match(html, /El archivo se procesa localmente en este navegador/);
  assert.match(html, /type="file"[^>]+accept="\.srt/);
  assert.match(html, />Convertir a VTT<\/button>/);
  assert.match(html, />Descargar VTT<\/a>/);
  assert.match(html, /src="\.\.\/\.\.\/scripts\/tools\/tool-controller\.js"/);
  assert.match(html, /href="\.\.\/\.\.\/styles\/main\.css"/);
  assert.match(html, /Esta herramienta necesita JavaScript/);
  assert.doesNotMatch(await readFile(path.join(dist, 'sitemap.xml'), 'utf8'), /\/herramientas\/srt-a-vtt\//);
});

test('resuelve assets y navegación desde el segundo nivel', async () => {
  const html = await readFile(path.join(dist, 'herramientas/srt-a-vtt/index.html'), 'utf8');
  for (const reference of [
    '../../styles/main.css',
    '../../scripts/core/app.js',
    '../../scripts/tools/tool-controller.js',
    '../../assets/images/brand/vumari-logo-primary.png',
    '../../assets/icons/favicon.ico',
    '../../index.html',
    '../../servicios.html',
    '../../portafolio.html',
    '../../nosotros.html',
    '../../contacto.html',
    '../../privacidad.html',
    '../../cotizacion.html'
  ]) assert.ok(html.includes(reference), `Falta la referencia profunda: ${reference}`);
});
