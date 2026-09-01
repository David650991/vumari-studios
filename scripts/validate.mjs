import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const readJson = async file => {
  try { return JSON.parse(await readFile(path.join(root, 'src/data', file), 'utf8')); }
  catch (error) { errors.push(`${file}: ${error.message}`); return null; }
};
const [company, author, legal, services, portfolio, site, socialLinks, contactChannels] = await Promise.all([
  readJson('company.json'), readJson('author.json'), readJson('legal.json'),
  readJson('services.json'), readJson('portfolio.json'), readJson('site.json'),
  readJson('social-links.json'), readJson('contact-channels.json')
]);

for (const file of ['src/assets/images/brand/vumari-logo-primary.png', 'src/assets/icons/favicon.svg']) {
  try { await access(path.join(root, file)); } catch { errors.push(`Falta el recurso requerido: ${file}`); }
}
if (company) {
  for (const key of ['brand', 'slogan', 'siteUrl']) if (!company[key]) errors.push(`company.json requiere ${key}`);
  if (!/^https:\/\//.test(company.siteUrl)) errors.push('siteUrl debe usar HTTPS');
}
if (author) {
  if (author.name !== 'David Vidal Ramírez') errors.push('El autor técnico debe ser David Vidal Ramírez');
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
}
if (!site?.navigation?.length) errors.push('site.json requiere navegación');
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
  'src/data/site.json', 'src/data/social-links.json', 'src/data/contact-channels.json'
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
