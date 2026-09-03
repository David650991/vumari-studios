export class SubtitleConversionError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'SubtitleConversionError';
    this.code = code;
  }
}

const timestampPattern = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/;

function throwIfAborted(signal) {
  if (signal?.aborted) throw new DOMException('La operación fue cancelada.', 'AbortError');
}

function parseTimestamp(value) {
  const match = timestampPattern.exec(value);
  if (!match) {
    throw new SubtitleConversionError('invalid_timestamp', 'Encontramos una marca de tiempo que no pudimos interpretar.');
  }
  const [, hours, minutes, seconds, milliseconds] = match;
  const numeric = [hours, minutes, seconds, milliseconds].map(Number);
  if (numeric[1] > 59 || numeric[2] > 59) {
    throw new SubtitleConversionError('invalid_timestamp', 'Encontramos una marca de tiempo que no pudimos interpretar.');
  }
  return {
    milliseconds: (((numeric[0] * 60 + numeric[1]) * 60) + numeric[2]) * 1000 + numeric[3],
    vtt: `${hours}:${minutes}:${seconds}.${milliseconds}`
  };
}

export function parseSrt(source, {signal} = {}) {
  throwIfAborted(signal);
  if (typeof source !== 'string' || source.replace(/^\uFEFF/, '').trim() === '') {
    throw new SubtitleConversionError('empty_file', 'El archivo está vacío.');
  }

  const normalized = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim();
  const blocks = normalized.split(/\n{2,}/);
  const cues = blocks.map((block, blockIndex) => {
    throwIfAborted(signal);
    const lines = block.split('\n');
    if (!/^\d+$/.test(lines[0]?.trim() ?? '') || lines.length < 3) {
      throw new SubtitleConversionError('invalid_structure', 'El archivo no parece estar en formato SRT.');
    }
    const timing = lines[1].trim().split(/\s+-->\s+/);
    if (timing.length !== 2) {
      throw new SubtitleConversionError('invalid_timestamp', 'Encontramos una marca de tiempo que no pudimos interpretar.');
    }
    const start = parseTimestamp(timing[0]);
    const end = parseTimestamp(timing[1]);
    if (end.milliseconds < start.milliseconds) {
      throw new SubtitleConversionError('invalid_timestamp', 'La marca de tiempo final no puede ser anterior a la inicial.');
    }
    const textLines = lines.slice(2);
    if (!textLines.some(line => line.length > 0)) {
      throw new SubtitleConversionError('invalid_structure', 'No encontramos subtítulos SRT válidos.');
    }
    return {index: blockIndex + 1, start: start.vtt, end: end.vtt, text: textLines.join('\n')};
  });

  if (!cues.length) throw new SubtitleConversionError('invalid_structure', 'No encontramos subtítulos SRT válidos.');
  return cues;
}

export function createVtt(cues) {
  const body = cues.map(cue => `${cue.start} --> ${cue.end}\n${cue.text}`).join('\n\n');
  return `WEBVTT\n\n${body}\n`;
}

export function createVttFileName(inputName) {
  const safeName = typeof inputName === 'string' ? inputName : 'subtitulos.srt';
  return safeName.replace(/\.srt$/i, '') + '.vtt';
}

export const subtitleSrtToVttProcessor = {
  id: 'subtitle-srt-to-vtt',
  validate(input, context = {}) {
    const cues = parseSrt(input?.text, context);
    return {valid: true, cueCount: cues.length};
  },
  process(input, _options = {}, context = {}) {
    throwIfAborted(context.signal);
    const cues = parseSrt(input?.text, context);
    const text = createVtt(cues);
    return {
      text,
      blob: new Blob([text], {type: 'text/vtt'}),
      fileName: createVttFileName(input?.name),
      mimeType: 'text/vtt',
      cueCount: cues.length
    };
  }
};
