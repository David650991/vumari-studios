import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import { test } from 'node:test';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

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
    assert.match(html, /<meta name="author" content="VUMARI STUDIOS">/);
    assert.match(html, /<meta property="og:site_name" content="VUMARI STUDIOS">/);
    assert.match(html, /<link rel="canonical"/);
    assert.match(html, /<main id="contenido">/);
    assert.match(html, /aria-label="Navegación principal"/);
    assert.doesNotMatch(html, /Lorem ipsum/i);
    const publicPersonalName = ['David', 'Vidal'].join(' ');
    const privateName = [publicPersonalName, 'Ramírez'].join(' ');
    const removedOwnerName = ['Ulises', 'Márquez González'].join(' ');
    const withoutTechnicalUrls = html.replaceAll('david650991.github.io', '').replaceAll('github.com/David650991', '');
    assert.ok(!withoutTechnicalUrls.includes(publicPersonalName));
    assert.ok(!withoutTechnicalUrls.includes(privateName));
    assert.ok(!withoutTechnicalUrls.includes(removedOwnerName));
    assert.ok(!withoutTechnicalUrls.includes('David650991'));
    const schemaText = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/u)?.[1] ?? '';
    const schema = JSON.parse(schemaText);
    assert.equal(schema.name, 'VUMARI STUDIOS');
    assert.ok(!('founder' in schema));
    assert.doesNotMatch(schemaText, /"@type":"Person"/);
  }
});

test('utiliza únicamente la marca como identidad pública', async () => {
  const html = await readFile(path.join(dist, 'index.html'), 'utf8');
  assert.match(html, /<meta property="og:site_name" content="VUMARI STUDIOS">/);
  assert.match(html, /© 2026 VUMARI STUDIOS\. Todos los derechos reservados\./);
  assert.doesNotMatch(html, /Desarrollo técnico:/);
});

test('conserva la identidad técnica completa sólo en la configuración del repositorio', async () => {
  const author = JSON.parse(await readFile(path.join(root, 'src/data/author.json'), 'utf8'));
  assert.equal(author.name, 'David Vidal Ramírez');
  assert.equal(author.publicName, 'David Vidal');
  assert.equal(author.signature, 'David650991');
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

test('los recursos locales referenciados existen en la salida', async () => {
  const files = (await readdir(dist)).filter(file => file.endsWith('.html'));
  for (const file of files) {
    const html = await readFile(path.join(dist, file), 'utf8');
    for (const match of html.matchAll(/(?:src|poster|href)="([^"#?]+)"/g)) {
      const reference = match[1];
      if (/^(?:https?:|mailto:|tel:)/.test(reference) || reference.endsWith('.html')) continue;
      await assert.doesNotReject(
        access(path.join(dist, reference.replace(/^\/+/, ''))),
        `${file} referencia un recurso inexistente: ${reference}`
      );
    }
  }
});

test('los enlaces internos con fragmento apuntan a un id existente', async () => {
  const files = (await readdir(dist)).filter(file => file.endsWith('.html'));
  for (const file of files) {
    const html = await readFile(path.join(dist, file), 'utf8');
    for (const match of html.matchAll(/href="([^"#]*\.html)?#([^"?]+)"/g)) {
      const targetFile = match[1] || file;
      const targetHtml = await readFile(path.join(dist, targetFile), 'utf8');
      assert.ok(targetHtml.includes(`id="${match[2]}"`), `${file} apunta a ${targetFile}#${match[2]}, que no existe`);
    }
  }
});

test('cada canonical coincide con la URL pÃºblica configurada', async () => {
  const company = JSON.parse(await readFile(path.join(root, 'src/data/company.json'), 'utf8'));
  const files = (await readdir(dist)).filter(file => file.endsWith('.html'));
  for (const file of files) {
    const html = await readFile(path.join(dist, file), 'utf8');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/u)?.[1];
    const expected = new URL(file === 'index.html' ? '' : file, company.siteUrl).href;
    assert.equal(canonical, expected, `Canonical incorrecto en ${file}`);
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
    if (item.url !== null) assert.doesNotThrow(() => new URL(item.url), `URL social invÃ¡lida: ${item.id}`);
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

test('publica el trabajo audiovisual con carga de video bajo demanda', async () => {
  const portfolio = JSON.parse(await readFile(path.join(root, 'src/data/portfolio.json'), 'utf8'));
  const project = portfolio.find(item => item.slug === 'contenido-centro-rehabilitacion-la-luz-y-la-esperanza');
  const html = await readFile(path.join(dist, 'portafolio.html'), 'utf8');
  assert.equal(project.status, 'client');
  assert.equal(project.client, 'La Luz Y La Esperanza Que Necesito — Centro de Rehabilitación');
  assert.doesNotMatch(html, /La Luz y la Esperanza que Anhelo/i);
  assert.equal(project.media.length, 6);
  assert.equal((html.match(/<video controls preload="none"/g) ?? []).length, project.media.length);
  assert.equal((html.match(/data-video/g) ?? []).length, project.media.length);
  const videoScript = await readFile(path.join(dist, 'scripts/components/videos.js'), 'utf8');
  assert.match(videoScript, /IntersectionObserver/);
  assert.match(videoScript, /preload = 'metadata'/);
  for (const item of project.media) {
    assert.ok(html.includes(item.src));
    assert.ok(html.includes(item.poster));
  }
});

test('mantiene la nueva jerarquía visual y comunicación de capacidades', async () => {
  const html = await readFile(path.join(dist, 'index.html'), 'utf8');
  const css = await readFile(path.join(dist, 'styles/pages/home.css'), 'utf8');
  for (const text of [
    'Marketing, contenido y producción digital',
    'Marketing y posicionamiento',
    'Contenido para donde está tu audiencia',
    'Creamos contenido en distintos formatos',
    'Herramientas que forman parte de nuestro trabajo',
    'Una buena idea merece una estrategia'
  ]) assert.ok(html.includes(text), `Falta el mensaje visual: ${text}`);
  assert.match(css, /@media \(max-width: 27rem\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('asocia cada herramienta y plataforma con su icono modular', async () => {
  const html = await readFile(path.join(dist, 'index.html'), 'utf8');
  for (const file of [
    'assets/icons/tools/vumari-tool-canva.png',
    'assets/icons/tools/vumari-tool-capcut.png',
    'assets/icons/tools/vumari-tool-youtube.png',
    'assets/icons/tools/vumari-tool-meta.png',
    'assets/icons/tools/vumari-tool-google.png',
    'assets/icons/tools/vumari-tool-github.png',
    'assets/icons/platforms/vumari-platform-youtube-shorts.png'
  ]) assert.ok(html.includes(file), `Falta el icono modular: ${file}`);
});

test('presenta una galería editorial sin confundir conceptos con clientes reales', async () => {
  const html = await readFile(path.join(dist, 'index.html'), 'utf8');
  assert.equal((html.match(/<article class="project-card/g) ?? []).length, 6);
  assert.match(html, /Proyecto propio/);
  assert.match(html, /Trabajo para cliente/);
  assert.match(html, /Proyecto demostrativo/);
  assert.match(html, /Concepto visual/);
  assert.doesNotMatch(html, /class="idea-list"/);
});

test('ofrece estados de teclado y detalle legible para plataformas y herramientas', async () => {
  const html = await readFile(path.join(dist, 'index.html'), 'utf8');
  const css = await readFile(path.join(dist, 'styles/pages/home.css'), 'utf8');
  assert.equal((html.match(/class="platform-card" tabindex="0"/g) ?? []).length, 7);
  for (const detail of ['Diseño y piezas publicitarias.', 'Edición y contenido vertical.', 'Desarrollo y soluciones digitales.']) {
    assert.ok(html.includes(detail));
  }
  assert.match(css, /\.platform-card:is\(:hover, :focus-visible\)/);
  assert.match(css, /@media \(max-width: 27rem\)/);
});
