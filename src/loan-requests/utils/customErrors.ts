export class UpdateError extends Error {
  codigo: number;
  constructor(mensaje: string, codigo: number) {
    super(mensaje);
    this.name = 'UpdateError';
    this.codigo = codigo;
    // Esto es opcional, mejora la pila de llamadas del error
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UpdateError);
    }
  }
}
