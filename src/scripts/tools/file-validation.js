import {ToolProcessingError} from './tool-error.js';

export function validateFileSelection(files, {extension = '.srt', formatLabel = 'SRT'} = {}) {
  const selected = Array.from(files ?? []);
  if (selected.length === 0) throw new ToolProcessingError('no_file', `Selecciona un archivo ${formatLabel}.`);
  if (selected.length !== 1) throw new ToolProcessingError('multiple_files', `Selecciona únicamente un archivo ${formatLabel}.`);
  const [file] = selected;
  if (!String(file.name).toLowerCase().endsWith(extension.toLowerCase())) {
    throw new ToolProcessingError('unsupported_file', `El archivo debe tener extensión \`${extension}\`.`);
  }
  if (file.size === 0) throw new ToolProcessingError('empty_file', 'El archivo está vacío.');
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
    throw new ToolProcessingError('invalid_encoding', 'No fue posible leer el archivo como texto UTF-8.');
  }
}
