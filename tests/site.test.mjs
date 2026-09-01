import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { test, before } from 'node:test';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
before(() => execFileSync(process.execPath, ['scripts/build.mjs'], {cwd: root}));

test('genera todas las páginas públicas', async () => {
  const files = await readdir(dist);
  for (const expected of ['index.html','servicios.html','portafolio.html','nosotros.html','cotizacion.html','contacto.html','privacidad.html']) {
    assert.ok(files.includes(expected), `Falta ${expected}`);
  }
});

test('cada página tiene estructura, metadata y navegación accesible', async () => {
  const files = (await readdir(dist)).filter(file => file.endsWith('.html'));
  for (const file of files) {
    const html = await readFile(path.join(dist, file), 'utf8');
    assert.match(html, /<html lang="es-MX">/);
    assert.match(html, /<meta name="description"/);
    assert.match(html, /<meta name="author" content="David Vidal Ramírez">/);
    assert.match(html, /<meta property="og:site_name" content="VUMARI STUDIOS">/);
    assert.match(html, /<link rel="canonical"/);
    assert.match(html, /<main id="contenido">/);
    assert.match(html, /aria-label="Navegación principal"/);
    assert.doesNotMatch(html, /Lorem ipsum/i);
  }
});

test('separa la marca pública de la autoría técnica', async () => {
  const html = await readFile(path.join(dist, 'index.html'), 'utf8');
  assert.match(html, /<meta property="og:site_name" content="VUMARI STUDIOS">/);
  assert.match(html, /Desarrollo técnico: David Vidal Ramírez/);
  assert.doesNotMatch(html, /Desarrollo técnico: VUMARI STUDIOS/);
});

test('los enlaces internos HTML tienen destino generado', async () => {
  const files = (await readdir(dist)).filter(file => file.endsWith('.html'));
  const available = new Set(files);
  for (const file of files) {
    const html = await readFile(path.join(dist, file), 'utf8');
    for (const match of html.matchAll(/href="([^":#]+\.html)"/g)) {
      assert.ok(available.has(match[1]), `${file} enlaza a ${match[1]}, que no existe`);
    }
  }
});

test('no presenta contactos ni redes sin URL configurada', async () => {
  const company = JSON.parse(await readFile(path.join(root, 'src/data/company.json'), 'utf8'));
  const socialLinks = JSON.parse(await readFile(path.join(root, 'src/data/social-links.json'), 'utf8'));
  const contactChannels = JSON.parse(await readFile(path.join(root, 'src/data/contact-channels.json'), 'utf8'));
  const html = await readFile(path.join(dist, 'contacto.html'), 'utf8');
  assert.equal(company.email, null);
  assert.equal(company.whatsapp, null);
  assert.ok(socialLinks.every(item => item.url === null));
  assert.equal((html.match(/social-item--pending/g) ?? []).length, socialLinks.length * 2 + contactChannels.filter(item => !item.url).length);
  assert.doesNotMatch(html, /href="null"/);
});

test('incluye todos los canales sociales desde una fuente modular', async () => {
  const socialLinks = JSON.parse(await readFile(path.join(root, 'src/data/social-links.json'), 'utf8'));
  const html = await readFile(path.join(dist, 'contacto.html'), 'utf8');
  for (const item of socialLinks) {
    assert.match(html, new RegExp(`>${item.label}<`));
    assert.match(html, new RegExp(item.icon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('incluye los canales de contacto sin inventar datos', async () => {
  const channels = JSON.parse(await readFile(path.join(root, 'src/data/contact-channels.json'), 'utf8'));
  const html = await readFile(path.join(dist, 'contacto.html'), 'utf8');
  for (const item of channels) {
    assert.match(html, new RegExp(`>${item.label}<`));
    assert.match(html, new RegExp(item.icon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(html, /href="null"/);
});
