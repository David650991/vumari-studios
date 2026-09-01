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
    assert.match(html, /<link rel="canonical"/);
    assert.match(html, /<main id="contenido">/);
    assert.match(html, /aria-label="Navegación principal"/);
    assert.doesNotMatch(html, /Lorem ipsum/i);
  }
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
  assert.equal(company.email, null);
  assert.equal(company.whatsapp, null);
  assert.ok(Object.values(company.social).every(value => value === null));
});
