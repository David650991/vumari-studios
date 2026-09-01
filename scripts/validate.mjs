import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const readJson = async file => {
  try { return JSON.parse(await readFile(path.join(root, 'src/data', file), 'utf8')); }
  catch (error) { errors.push(`${file}: ${error.message}`); return null; }
};
const [company, services, portfolio, site] = await Promise.all([
  readJson('company.json'), readJson('services.json'), readJson('portfolio.json'), readJson('site.json')
]);

for (const file of ['src/assets/images/brand/vumari-logo-primary.png', 'src/assets/icons/favicon.svg']) {
  try { await access(path.join(root, file)); } catch { errors.push(`Falta el recurso requerido: ${file}`); }
}
if (company) {
  for (const key of ['brand', 'slogan', 'siteUrl']) if (!company[key]) errors.push(`company.json requiere ${key}`);
  if (!/^https:\/\//.test(company.siteUrl)) errors.push('siteUrl debe usar HTTPS');
  for (const [network, url] of Object.entries(company.social ?? {})) {
    if (url && !/^https:\/\//.test(url)) errors.push(`URL social inválida: ${network}`);
  }
}
if (!Array.isArray(services) || services.length < 1) errors.push('services.json debe incluir servicios');
if (Array.isArray(services) && new Set(services.map(x => x.slug)).size !== services.length) errors.push('Los slugs de servicios deben ser únicos');
const validStatuses = new Set(['client', 'internal', 'concept']);
if (Array.isArray(portfolio)) for (const project of portfolio) {
  if (!validStatuses.has(project.status)) errors.push(`Estado inválido en proyecto: ${project.slug}`);
  if (project.result && typeof project.result !== 'string') errors.push(`Resultado inválido en proyecto: ${project.slug}`);
}
if (!site?.navigation?.length) errors.push('site.json requiere navegación');

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}
console.log('Datos y recursos validados correctamente.');
