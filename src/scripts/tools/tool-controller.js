import {prepareDownload} from './download.js';
import {readFileAsUtf8, validateFileSelection} from './file-validation.js';
import {getProcessor} from './registry.js';

const publicErrors = new Set([
  'no_file', 'multiple_files', 'unsupported_file', 'empty_file',
  'invalid_encoding', 'invalid_structure', 'invalid_timestamp'
]);

function initTool(root) {
  const form = root.querySelector('[data-tool-form]');
  const fileInput = root.querySelector('[data-tool-file]');
  const submit = root.querySelector('[data-tool-submit]');
  const status = root.querySelector('[data-tool-status]');
  const result = root.querySelector('[data-tool-result]');
  const resultText = root.querySelector('[data-tool-result-text]');
  const download = root.querySelector('[data-tool-download]');
  const processor = getProcessor(root.dataset.processor);
  let preparedInput = null;
  let releaseDownload = null;
  let operation = null;

  const setState = (state, message) => {
    root.dataset.state = state;
    status.textContent = message;
    status.dataset.error = state === 'failed' ? 'true' : 'false';
  };

  const resetResult = () => {
    releaseDownload?.();
    releaseDownload = null;
    result.hidden = true;
    resultText.textContent = '';
  };

  const showError = error => {
    const message = publicErrors.has(error?.code)
      ? error.message
      : 'No pudimos completar la conversión. Revisa el archivo e inténtalo nuevamente.';
    preparedInput = null;
    submit.disabled = true;
    resetResult();
    setState('failed', message);
  };

  root.hidden = false;
  setState('idle', 'Selecciona un archivo SRT para comenzar.');

  fileInput.addEventListener('change', async () => {
    operation?.abort();
    operation = new AbortController();
    preparedInput = null;
    submit.disabled = true;
    resetResult();
    try {
      setState('validating', 'Leyendo archivo…');
      const file = validateFileSelection(fileInput.files);
      const text = await readFileAsUtf8(file, {signal: operation.signal});
      setState('validating', 'Validando subtítulos…');
      processor.validate({name: file.name, text}, {signal: operation.signal});
      preparedInput = {name: file.name, text};
      submit.disabled = false;
      setState('ready', 'Archivo válido. Puedes convertirlo a VTT.');
    } catch (error) {
      if (error?.name !== 'AbortError') showError(error);
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!preparedInput) {
      showError({code: 'no_file', message: 'Selecciona un archivo SRT válido.'});
      return;
    }
    operation?.abort();
    operation = new AbortController();
    submit.disabled = true;
    resetResult();
    try {
      setState('processing', 'Convirtiendo a WebVTT…');
      const output = processor.process(preparedInput, {}, {signal: operation.signal});
      resultText.textContent = output.text;
      releaseDownload = prepareDownload(download, output);
      result.hidden = false;
      submit.disabled = false;
      setState('completed', `Conversión terminada. ${output.cueCount} subtítulo${output.cueCount === 1 ? '' : 's'} convertido${output.cueCount === 1 ? '' : 's'}.`);
      result.focus();
    } catch (error) {
      if (error?.name !== 'AbortError') showError(error);
    }
  });

  window.addEventListener('pagehide', () => {
    operation?.abort();
    releaseDownload?.();
  }, {once: true});
}

document.querySelectorAll('[data-tool-controller]').forEach(initTool);
