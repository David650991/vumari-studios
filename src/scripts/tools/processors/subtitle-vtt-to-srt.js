import {ToolProcessingError} from '../tool-error.js';

const longTimestampPattern = /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/;
const shortTimestampPattern = /^(\d{2}):(\d{2})\.(\d{3})$/;

function throwIfAborted(signal) {
  if (signal?.aborted) throw new DOMException('La operación fue cancelada.', 'AbortError');
}

function parseTimestamp(value) {
  const long = longTimestampPattern.exec(value);
  const short = shortTimestampPattern.exec(value);
  if (!long && !short) {
    throw new ToolProcessingError('invalid_timestamp', 'Encontramos una marca de tiempo que no pudimos interpretar.');
  }
  const [hours, minutes, seconds, milliseconds] = long ? long.slice(1) : ['00', ...short.slice(1)];
  if (Number(minutes) > 59 || Number(seconds) > 59) {
    throw new ToolProcessingError('invalid_timestamp', 'Encontramos una marca de tiempo que no pudimos interpretar.');
  }
  return {
    millisecondsValue: (((Number(hours) * 60 + Number(minutes)) * 60) + Number(seconds)) * 1000 + Number(milliseconds),
    srt: `${hours}:${minutes}:${seconds},${milliseconds}`
  };
}

function rejectUnsupportedBlock(block) {
  const firstLine = block.split('\n', 1)[0].trim();
  for (const [keyword, code, message] of [
    ['NOTE', 'unsupported_note', 'Esta versión todavía no admite bloques `NOTE`.'],
    ['STYLE', 'unsupported_style', 'Esta versión todavía no admite bloques `STYLE`.'],
    ['REGION', 'unsupported_region', 'Esta versión todavía no admite bloques `REGION`.']
  ]) {
    if (firstLine === keyword || firstLine.startsWith(`${keyword} `)) throw new ToolProcessingError(code, message);
  }
}

export function parseVtt(source, {signal} = {}) {
  throwIfAborted(signal);
  if (typeof source !== 'string' || source.replace(/^\uFEFF/, '').trim() === '') {
    throw new ToolProcessingError('empty_file', 'El archivo está vacío.');
  }
  const normalized = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  if (lines[0] !== 'WEBVTT') {
    if (lines[0]?.startsWith('WEBVTT')) {
      throw new ToolProcessingError('unsupported_header', 'Esta versión necesita una cabecera `WEBVTT` sin información adicional.');
    }
    throw new ToolProcessingError('missing_header', 'No encontramos la cabecera `WEBVTT`.');
  }
  if (lines[1] !== '') throw new ToolProcessingError('invalid_structure', 'El archivo no tiene la estructura WebVTT simple esperada.');

  const body = lines.slice(2).join('\n').trim();
  if (!body) throw new ToolProcessingError('invalid_structure', 'Encontramos un subtítulo incompleto o sin texto.');
  return body.split(/\n{2,}/).map((block, blockIndex) => {
    throwIfAborted(signal);
    rejectUnsupportedBlock(block);
    const cueLines = block.split('\n');
    if (!cueLines[0]?.includes('-->')) {
      if (cueLines[1]?.includes('-->')) {
        throw new ToolProcessingError('unsupported_identifier', 'Esta versión todavía no admite identificadores de subtítulo.');
      }
      throw new ToolProcessingError('invalid_structure', 'Encontramos un subtítulo incompleto o sin texto.');
    }
    const timing = cueLines[0].trim().split(/\s+-->\s+/);
    if (timing.length !== 2) throw new ToolProcessingError('invalid_timestamp', 'Encontramos una marca de tiempo que no pudimos interpretar.');
    if (/\s/.test(timing[1])) {
      throw new ToolProcessingError('unsupported_settings', 'Esta versión todavía no admite posición, alineación ni otros ajustes WebVTT.');
    }
    const start = parseTimestamp(timing[0]);
    const end = parseTimestamp(timing[1]);
    if (end.millisecondsValue < start.millisecondsValue) {
      throw new ToolProcessingError('invalid_order', 'La marca de tiempo final no puede ser anterior a la inicial.');
    }
    const textLines = cueLines.slice(1);
    if (!textLines.some(line => line.length > 0)) {
      throw new ToolProcessingError('invalid_structure', 'Encontramos un subtítulo incompleto o sin texto.');
    }
    if (textLines.some(line => /<[^>]+>/.test(line))) {
      throw new ToolProcessingError('invalid_structure', 'Esta versión todavía no admite marcado WebVTT avanzado.');
    }
    return {index: blockIndex + 1, start: start.srt, end: end.srt, text: textLines.join('\n')};
  });
}

export function createSrt(cues) {
  return `${cues.map(cue => `${cue.index}\n${cue.start} --> ${cue.end}\n${cue.text}`).join('\n\n')}\n`;
}

export function createSrtFileName(inputName) {
  const safeName = typeof inputName === 'string' ? inputName : 'subtitulos.vtt';
  return safeName.replace(/\.vtt$/i, '') + '.srt';
}

export const subtitleVttToSrtProcessor = {
  id: 'subtitle-vtt-to-srt',
  validate(input, context = {}) {
    const cues = parseVtt(input?.text, context);
    return {valid: true, cueCount: cues.length};
  },
  process(input, _options = {}, context = {}) {
    throwIfAborted(context.signal);
    const cues = parseVtt(input?.text, context);
    throwIfAborted(context.signal);
    const text = createSrt(cues);
    return {
      text,
      blob: new Blob([text], {type: 'application/x-subrip'}),
      fileName: createSrtFileName(input?.name),
      mimeType: 'application/x-subrip',
      cueCount: cues.length
    };
  }
};
