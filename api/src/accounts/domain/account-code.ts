import type { Level } from './level.js';

/**
 * Value object del código de cuenta (reglas 1, 2 y 3).
 * CONTRATO: la implementación real es la tarea 1; por ahora solo fija la firma.
 */
export class AccountCode {
  private constructor(readonly value: string) {}

  /** Lanza InvalidAccountCodeError si no es numérico o su longitud no es 1, 2, 4 o 6. */
  static parse(_raw: string): AccountCode {
    throw new Error('Pendiente: tarea 1 (dominio)');
  }

  get level(): Level {
    throw new Error('Pendiente: tarea 1 (dominio)');
  }

  /** Código del padre, o null si es una clase. Ej.: 110505 -> 1105 -> 11 -> 1 -> null. */
  get parentCode(): string | null {
    throw new Error('Pendiente: tarea 1 (dominio)');
  }

  /** Primer dígito: identifica la clase de la que se hereda la naturaleza (regla 8). */
  get classCode(): string {
    throw new Error('Pendiente: tarea 1 (dominio)');
  }
}
