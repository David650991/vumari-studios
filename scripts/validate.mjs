import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const readJson = async file => {
  try { return JSON.parse(await readFile(path.join(root, 'src/data', file), 'utf8')); }
  catch (error) { errors.push(`${file}: ${error.message}`); return null; }
};
const [company, author, legal, services, portfolio, site, socialLinks, contactChannels, toolsData] = await Promise.all([
  readJson('company.json'), readJson('author.json'), readJson('legal.json'),
  readJson('services.json'), readJson('portfolio.json'), readJson('site.json'),
  readJson('social-links.json'), readJson('contact-channels.json'), readJson('tools.json')
]);

for (const file of ['src/assets/images/brand/vumari-logo-primary.png', 'src/assets/icons/favicon.svg']) {
  try { await access(path.join(root, file)); } catch { errors.push(`Falta el recurso requerido: ${file}`); }
}
for (const file of [
  'src/assets/icons/tools/vumari-tool-canva.png',
  'src/assets/icons/tools/vumari-tool-capcut.png',
  'src/assets/icons/tools/vumari-tool-youtube.png',
  'src/assets/icons/tools/vumari-tool-meta.png',
  'src/assets/icons/tools/vumari-tool-google.png',
  'src/assets/icons/tools/vumari-tool-github.png',
  'src/assets/icons/platforms/vumari-platform-youtube-shorts.png'
]) {
  try { await access(path.join(root, file)); }
  catch { errors.push(`Falta el recurso visual requerido: ${file}`); }
}
if (company) {
  for (const key of ['brand', 'slogan', 'siteUrl']) if (!company[key]) errors.push(`company.json requiere ${key}`);
  if (!/^https:\/\//.test(company.siteUrl)) errors.push('siteUrl debe usar HTTPS');
}
if (author) {
  if (author.name !== 'David Vidal Ramírez') errors.push('El autor técnico debe ser David Vidal Ramírez');
  if (author.publicName !== 'David Vidal') errors.push('El nombre público del autor debe ser David Vidal');
  if (author.signature !== 'David650991') errors.push('La firma técnica debe ser David650991');
  if (author.github !== 'David650991') errors.push('El usuario público del autor debe ser David650991');
}
if (legal) {
  if (legal.copyrightYear !== 2026) errors.push('El año de copyright debe ser 2026');
  if (legal.copyrightHolder !== author?.name) errors.push('El titular de copyright debe coincidir con el autor técnico');
  if (legal.licenseStatus !== 'PROPRIETARY' || legal.licenseIdentifier !== 'UNLICENSED') errors.push('La licencia debe conservar la decisión propietaria actual');
}
if (!Array.isArray(services) || services.length < 1) errors.push('services.json debe incluir servicios');
if (Array.isArray(services) && new Set(services.map(x => x.slug)).size !== services.length) errors.push('Los slugs de servicios deben ser únicos');
const validStatuses = new Set(['client', 'internal', 'concept']);
if (Array.isArray(portfolio)) for (const project of portfolio) {
  if (!validStatuses.has(project.status)) errors.push(`Estado inválido en proyecto: ${project.slug}`);
  if (project.result && typeof project.result !== 'string') errors.push(`Resultado inválido en proyecto: ${project.slug}`);
  const resources = project.media?.flatMap(item => [item.src, item.poster]) ?? [project.image];
  for (const resource of resources.filter(Boolean)) {
    try { await access(path.join(root, 'src', resource)); }
    catch { errors.push(`Falta recurso del portafolio ${project.slug}: ${resource}`); }
  }
}
if (!site?.navigation?.length) errors.push('site.json requiere navegación');
const allowedToolStatuses = new Set(['planned', 'experimental', 'beta', 'stable']);
const allowedProcessingModes = new Set(['browser', 'desktop', 'hybrid']);
if (!Array.isArray(toolsData?.families) || toolsData.families.length < 1) errors.push('tools.json requiere familias');
if (!Array.isArray(toolsData?.tools) || toolsData.tools.length < 1) errors.push('tools.json requiere herramientas');
if (Array.isArray(toolsData?.tools)) {
  const familyIds = new Set((toolsData.families ?? []).map(family => family.id));
  const ids = toolsData.tools.map(tool => tool.id);
  const slugs = toolsData.tools.map(tool => tool.slug);
  if (new Set(ids).size !== ids.length) errors.push('Los IDs de herramientas deben ser únicos');
  if (new Set(slugs).size !== slugs.length) errors.push('Los slugs de herramientas deben ser únicos');
  for (const tool of toolsData.tools) {
    if (!familyIds.has(tool.family)) errors.push(`Familia inválida en herramienta: ${tool.id}`);
    if (!allowedToolStatuses.has(tool.status)) errors.push(`Estado inválido en herramienta: ${tool.id}`);
    if (!allowedProcessingModes.has(tool.processingMode)) errors.push(`Modo de procesamiento inválido en herramienta: ${tool.id}`);
    if (!Array.isArray(tool.input?.formats) || tool.input.formats.length < 1) errors.push(`Formatos de entrada requeridos: ${tool.id}`);
    if (!Array.isArray(tool.output?.formats) || tool.output.formats.length < 1) errors.push(`Formatos de salida requeridos: ${tool.id}`);
    if (typeof tool.seo?.indexable !== 'boolean') errors.push(`indexable debe ser booleano: ${tool.id}`);
    if ('order' in tool && typeof tool.order !== 'number') errors.push(`order debe ser numérico: ${tool.id}`);
  }
}
if (!Array.isArray(socialLinks) || socialLinks.length < 1) errors.push('social-links.json debe incluir canales');
if (Array.isArray(socialLinks)) for (const item of socialLinks) {
  if (!item.id || !item.label || !item.icon) errors.push('Cada red requiere id, label e icon');
  if (item.url && !/^https:\/\//.test(item.url)) errors.push(`URL social inválida: ${item.id}`);
  try { await access(path.join(root, 'src', item.icon)); }
  catch { errors.push(`Falta el icono social: ${item.icon}`); }
}
if (!Array.isArray(contactChannels) || contactChannels.length < 1) errors.push('contact-channels.json debe incluir canales');
if (Array.isArray(contactChannels)) for (const item of contactChannels) {
  if (!item.id || !item.label || !item.icon) errors.push('Cada canal de contacto requiere id, label e icon');
  if (item.url && !/^https:\/\//.test(item.url) && !/^mailto:/.test(item.url)) errors.push(`URL de contacto inválida: ${item.id}`);
  try { await access(path.join(root, 'src', item.icon)); }
  catch { errors.push(`Falta el icono de contacto: ${item.icon}`); }
}

const packageData = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
if (packageData.author !== author?.name) errors.push('package.json tiene un autor inconsistente');
if (packageData.private !== true || packageData.license !== legal?.licenseIdentifier) errors.push('package.json tiene una configuración de licencia inconsistente');
const licenseText = await readFile(path.join(root, 'LICENSE'), 'utf8');
if (!licenseText.includes(`Copyright (c) 2026 ${author?.name}`)) errors.push('LICENSE no contiene el copyright requerido');

const publicSources = [
  'README.md', 'scripts/build.mjs', 'src/data/company.json', 'src/data/author.json',
  'src/data/legal.json', 'src/data/services.json', 'src/data/portfolio.json',
  'src/data/site.json', 'src/data/social-links.json', 'src/data/contact-channels.json',
  'src/data/tools.json'
];
const forbiddenAuthors = /(?:author|autor|desarrollo|developed|created|creado)[^\n]{0,50}(ChatGPT|OpenAI|Claude|Gemini|Copilot|Artificial Intelligence|\bAI\b)/i;
for (const file of publicSources) {
  const content = await readFile(path.join(root, file), 'utf8');
  if (forbiddenAuthors.test(content)) errors.push(`Atribución técnica incorrecta en ${file}`);
  if (/Lorem ipsum/i.test(content)) errors.push(`Texto placeholder detectado en ${file}`);
}

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}
console.log('Datos y recursos validados correctamente.');
