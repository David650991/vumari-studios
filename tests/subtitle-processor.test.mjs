import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import path from 'node:path';
import {readFileAsUtf8, validateFileSelection} from '../src/scripts/tools/file-validation.js';
import {
  createVttFileName,
  parseSrt,
  subtitleSrtToVttProcessor
} from '../src/scripts/tools/processors/subtitle-srt-to-vtt.js';

const fixtures = path.join(process.cwd(), 'tests/fixtures/subtitles');
const fixture = name => readFile(path.join(fixtures, name), 'utf8');

test('convierte un SRT básico y genera la cabecera WEBVTT', async () => {
  const output = subtitleSrtToVttProcessor.process({name: 'clase.srt', text: await fixture('valid-basic.srt')});
  assert.equal(output.fileName, 'clase.vtt');
  assert.equal(output.mimeType, 'text/vtt');
  assert.equal(output.blob.type, 'text/vtt');
  assert.equal(await output.blob.text(), output.text);
  assert.match(output.text, /^WEBVTT\n\n/);
  assert.match(output.text, /00:00:01\.000 --> 00:00:04\.000\nHola\./);
  assert.doesNotMatch(output.text, /\n1\n/);
});

test('preserva múltiples bloques y líneas de subtítulo', async () => {
  const output = subtitleSrtToVttProcessor.process({name: 'dialogo.srt', text: await fixture('valid-multiline.srt')});
  assert.equal(output.cueCount, 2);
  assert.match(output.text, /Segunda línea\.\nCon múltiples líneas\./);
  assert.match(output.text, /00:00:08\.500/);
});

test('normaliza saltos CRLF sin alterar el texto visible', async () => {
  const source = await fixture('valid-crlf.srt');
  const output = subtitleSrtToVttProcessor.process({name: 'crlf.srt', text: source});
  assert.match(output.text, /Texto con saltos CRLF\./);
  assert.doesNotMatch(output.text, /\r/);
});

test('retira un BOM UTF-8 inicial', async () => {
  const source = await fixture('valid-bom.srt');
  const output = subtitleSrtToVttProcessor.process({name: 'bom.srt', text: source});
  assert.match(output.text, /Texto UTF-8 con BOM\./);
  assert.doesNotMatch(output.text, /\uFEFF/);
});

test('valida minutos, segundos, milisegundos y orden temporal', async () => {
  const invalidTimestamp = await fixture('invalid-timestamp.srt');
  assert.throws(
    () => parseSrt(invalidTimestamp),
    error => error.code === 'invalid_timestamp'
  );
  assert.throws(
    () => parseSrt('1\n00:00:05,000 --> 00:00:04,000\nOrden inválido.'),
    error => error.code === 'invalid_timestamp'
  );
  assert.throws(
    () => parseSrt('1\n00:00:01,00 --> 00:00:04,000\nMilisegundos inválidos.'),
    error => error.code === 'invalid_timestamp'
  );
});

test('rechaza archivos vacíos y estructuras desconocidas con errores controlados', async () => {
  const empty = await fixture('empty.srt');
  const invalidStructure = await fixture('invalid-structure.srt');
  assert.throws(() => parseSrt(empty), error => error.code === 'empty_file');
  assert.throws(() => parseSrt(invalidStructure), error => error.code === 'invalid_structure');
});

test('preserva nombres base con varios puntos', () => {
  assert.equal(createVttFileName('archivo.final.srt'), 'archivo.final.vtt');
  assert.equal(createVttFileName('CLASE.SRT'), 'CLASE.vtt');
  assert.notEqual(createVttFileName('archivo.srt'), 'archivo.srt.vtt');
});

test('valida selección, extensión y archivo no vacío sin depender del MIME', () => {
  const file = {name: 'subtitulos.srt', size: 20, type: ''};
  assert.equal(validateFileSelection([file]), file);
  assert.throws(() => validateFileSelection([]), error => error.code === 'no_file');
  assert.throws(() => validateFileSelection([file, file]), error => error.code === 'multiple_files');
  assert.throws(() => validateFileSelection([{name: 'subtitulos.txt', size: 20}]), error => error.code === 'unsupported_file');
  assert.throws(() => validateFileSelection([{name: 'vacio.srt', size: 0}]), error => error.code === 'empty_file');
});

test('lee UTF-8 estricto y rechaza secuencias inválidas', async () => {
  const valid = {arrayBuffer: async () => new TextEncoder().encode('\uFEFFHola').buffer};
  assert.equal(await readFileAsUtf8(valid), 'Hola');
  const invalid = {arrayBuffer: async () => Uint8Array.from([0xc3, 0x28]).buffer};
  await assert.rejects(() => readFileAsUtf8(invalid), error => error.code === 'invalid_encoding');
});

test('respeta AbortSignal antes del procesamiento', async () => {
  const controller = new AbortController();
  const source = await fixture('valid-basic.srt');
  controller.abort();
  assert.throws(
    () => subtitleSrtToVttProcessor.process({name: 'clase.srt', text: source}, {}, {signal: controller.signal}),
    error => error.name === 'AbortError'
  );
});
