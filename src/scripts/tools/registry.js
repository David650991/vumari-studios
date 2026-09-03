import {subtitleSrtToVttProcessor} from './processors/subtitle-srt-to-vtt.js';

const processors = new Map([
  [subtitleSrtToVttProcessor.id, subtitleSrtToVttProcessor]
]);

export function getProcessor(id) {
  const processor = processors.get(id);
  if (!processor) throw new Error('Procesador no disponible.');
  return processor;
}
