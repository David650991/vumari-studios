import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import path from 'node:path';
import {readFileAsUtf8, validateFileSelection} from '../src/scripts/tools/file-validation.js';
import {
  createSrtFileName,
  parseVtt,
  subtitleVttToSrtProcessor
} from '../src/scripts/tools/processors/subtitle-vtt-to-srt.js';

const fixtures = path.join(process.cwd(), 'tests/fixtures/subtitles');
const fixture = name => readFile(path.join(fixtures, name), 'utf8');
const expectCode = async (name, code) => {
  const source = await fixture(name);
  assert.throws(() => parseVtt(source), error => error.code === code);
};

test('convierte WebVTT básico a SRT, con Blob y MIME correctos', async () => {
  const output = subtitleVttToSrtProcessor.process({name: 'subtitulos.vtt', text: await fixture('valid-vtt-basic.vtt')});
  assert.equal(output.fileName, 'subtitulos.srt');
  assert.equal(output.mimeType, 'application/x-subrip');
  assert.equal(output.blob.type, 'application/x-subrip');
  assert.equal(await output.blob.text(), output.text);
  assert.equal(output.text, '1\n00:00:01,000 --> 00:00:04,000\nHola.\n');
});

test('normaliza timestamps cortos agregando horas', async () => {
  const output = subtitleVttToSrtProcessor.process({name: 'corto.vtt', text: await fixture('valid-vtt-short-timestamp.vtt')});
  assert.match(output.text, /00:01:02,003 --> 00:02:03,004/);
});

test('numera múltiples cues desde 1 y conserva su orden', async () => {
  const output = subtitleVttToSrtProcessor.process({name: 'varios.vtt', text: await fixture('valid-vtt-multiple.vtt')});
  assert.equal(output.cueCount, 2);
  assert.match(output.text, /^1\n/);
  assert.match(output.text, /\n\n2\n00:00:05,500/);
});

test('preserva texto multilínea y termina con salto de línea', async () => {
  const output = subtitleVttToSrtProcessor.process({name: 'lineas.vtt', text: await fixture('valid-vtt-multiline.vtt')});
  assert.match(output.text, /Primera línea\.\nSegunda línea\./);
  assert.ok(output.text.endsWith('\n'));
});

test('acepta UTF-8 con BOM inicial', async () => {
  const output = subtitleVttToSrtProcessor.process({name: 'bom.vtt', text: await fixture('valid-vtt-bom.vtt')});
  assert.match(output.text, /Texto UTF-8 con BOM\./);
  assert.doesNotMatch(output.text, /\uFEFF/);
});

test('acepta y normaliza CRLF', async () => {
  const source = (await fixture('valid-vtt-crlf.vtt')).replace(/\n/g, '\r\n');
  const output = subtitleVttToSrtProcessor.process({name: 'crlf.vtt', text: source});
  assert.doesNotMatch(output.text, /\r/);
});

test('rechaza archivo vacío y cue sin texto', async () => {
  await expectCode('empty.vtt', 'empty_file');
  assert.throws(() => parseVtt('WEBVTT\n\n00:00:01.000 --> 00:00:02.000\n'), error => error.code === 'invalid_structure');
});

test('distingue cabecera ausente y cabecera avanzada', async () => {
  await expectCode('invalid-vtt-header.vtt', 'missing_header');
  assert.throws(() => parseVtt('WEBVTT descripción\n\n00:00:01.000 --> 00:00:02.000\nTexto.'), error => error.code === 'unsupported_header');
});

test('exige línea vacía después de WEBVTT', async () => {
  await expectCode('invalid-vtt-structure.vtt', 'invalid_structure');
});

test('rechaza timestamps inválidos y orden temporal inverso', async () => {
  await expectCode('invalid-vtt-timestamp.vtt', 'invalid_timestamp');
  await expectCode('invalid-vtt-order.vtt', 'invalid_order');
});

test('rechaza identifiers y settings WebVTT', async () => {
  await expectCode('unsupported-vtt-identifier.vtt', 'unsupported_identifier');
  await expectCode('unsupported-vtt-settings.vtt', 'unsupported_settings');
});

test('rechaza bloques NOTE, STYLE y REGION con códigos específicos', async () => {
  await expectCode('unsupported-vtt-note.vtt', 'unsupported_note');
  await expectCode('unsupported-vtt-style.vtt', 'unsupported_style');
  await expectCode('unsupported-vtt-region.vtt', 'unsupported_region');
});

test('rechaza marcado WebVTT avanzado para evitar pérdida', () => {
  assert.throws(
    () => parseVtt('WEBVTT\n\n00:00:01.000 --> 00:00:02.000\n<c.red>Texto</c>'),
    error => error.code === 'invalid_structure'
  );
});

test('genera nombres SRT reemplazando únicamente la última extensión', () => {
  assert.equal(createSrtFileName('subtitulos.vtt'), 'subtitulos.srt');
  assert.equal(createSrtFileName('archivo.final.vtt'), 'archivo.final.srt');
  assert.equal(createSrtFileName('CLASE.VTT'), 'CLASE.srt');
});

test('valida selección VTT mediante configuración compartida', () => {
  const file = {name: 'subtitulos.vtt', size: 20, type: ''};
  const options = {extension: '.vtt', formatLabel: 'VTT'};
  assert.equal(validateFileSelection([file], options), file);
  assert.throws(() => validateFileSelection([], options), error => error.code === 'no_file');
  assert.throws(() => validateFileSelection([file, file], options), error => error.code === 'multiple_files');
  assert.throws(() => validateFileSelection([{name: 'subtitulos.srt', size: 20}], options), error => error.code === 'unsupported_file');
  assert.throws(() => validateFileSelection([{name: 'vacio.vtt', size: 0}], options), error => error.code === 'empty_file');
});

test('rechaza UTF-8 inválido mediante la lectura compartida', async () => {
  const invalid = {arrayBuffer: async () => Uint8Array.from([0xc3, 0x28]).buffer};
  await assert.rejects(() => readFileAsUtf8(invalid), error => error.code === 'invalid_encoding');
});

test('respeta AbortSignal antes y durante el procesamiento', async () => {
  const source = await fixture('valid-vtt-basic.vtt');
  const controller = new AbortController();
  controller.abort();
  assert.throws(
    () => subtitleVttToSrtProcessor.process({name: 'clase.vtt', text: source}, {}, {signal: controller.signal}),
    error => error.name === 'AbortError'
  );
  assert.throws(() => parseVtt(source, {signal: controller.signal}), error => error.name === 'AbortError');
});
