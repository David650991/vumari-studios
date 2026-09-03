import {SubtitleConversionError} from './processors/subtitle-srt-to-vtt.js';

export function validateFileSelection(files) {
  const selected = Array.from(files ?? []);
  if (selected.length === 0) throw new SubtitleConversionError('no_file', 'Selecciona un archivo SRT.');
  if (selected.length !== 1) throw new SubtitleConversionError('multiple_files', 'Selecciona únicamente un archivo SRT.');
  const [file] = selected;
  if (!/\.srt$/i.test(file.name)) throw new SubtitleConversionError('unsupported_file', 'El archivo debe tener extensión .srt.');
  if (file.size === 0) throw new SubtitleConversionError('empty_file', 'El archivo está vacío.');
  return file;
}

export async function readFileAsUtf8(file, {signal} = {}) {
  if (signal?.aborted) throw new DOMException('La operación fue cancelada.', 'AbortError');
  try {
    const buffer = await file.arrayBuffer();
    if (signal?.aborted) throw new DOMException('La operación fue cancelada.', 'AbortError');
    return new TextDecoder('utf-8', {fatal: true}).decode(buffer).replace(/^\uFEFF/, '');
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new SubtitleConversionError('invalid_encoding', 'No fue posible leer el archivo como texto UTF-8.');
  }
}
