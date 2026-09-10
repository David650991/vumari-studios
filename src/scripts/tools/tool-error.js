export class ToolProcessingError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ToolProcessingError';
    this.code = code;
  }
}
