import {subtitleSrtToVttProcessor} from './processors/subtitle-srt-to-vtt.js';
import {subtitleVttToSrtProcessor} from './processors/subtitle-vtt-to-srt.js';

const processors = new Map([
  [subtitleSrtToVttProcessor.id, subtitleSrtToVttProcessor],
  [subtitleVttToSrtProcessor.id, subtitleVttToSrtProcessor]
]);

export function getProcessor(id) {
  const processor = processors.get(id);
  if (!processor) throw new Error('Procesador no disponible.');
  return processor;
}
