import { InvalidAccountCodeError } from './errors.js';
import { LEVEL_BY_LENGTH, VALID_CODE_LENGTHS } from './level.js';
import type { Level } from './level.js';

/**
 * Value object del código de cuenta (reglas 1, 2 y 3).
 * Nivel, padre y clase se derivan del código: no se guardan, así no pueden quedar incoherentes.
 */
export class AccountCode {
  private constructor(readonly value: string) {}

  /** Lanza InvalidAccountCodeError si no es numérico o su longitud no es 1, 2, 4 o 6. */
  static parse(raw: string): AccountCode {
    if (typeof raw !== 'string' || !/^\d+$/.test(raw)) {
      throw new InvalidAccountCodeError(
        `El código "${String(raw)}" debe ser numérico (solo dígitos).`,
      );
    }
    if (!(VALID_CODE_LENGTHS as readonly number[]).includes(raw.length)) {
      throw new InvalidAccountCodeError(
        `El código "${raw}" tiene longitud ${raw.length}; debe ser ${VALID_CODE_LENGTHS.join(', ')}.`,
      );
    }
    if (raw.startsWith('0')) {
      throw new InvalidAccountCodeError(
        `El código "${raw}" no puede empezar en 0: la clase debe ser 1-9.`,
      );
    }
    return new AccountCode(raw);
  }

  get level(): Level {
    return LEVEL_BY_LENGTH[this.value.length as keyof typeof LEVEL_BY_LENGTH];
  }

  /** Código del padre, o null si es una clase. Ej.: 110505 -> 1105 -> 11 -> 1 -> null. */
  get parentCode(): string | null {
    const index = VALID_CODE_LENGTHS.indexOf(
      this.value.length as (typeof VALID_CODE_LENGTHS)[number],
    );
    if (index <= 0) return null;
    return this.value.slice(0, VALID_CODE_LENGTHS[index - 1]);
  }

  /** Primer dígito: identifica la clase de la que se hereda la naturaleza (regla 8). */
  get classCode(): string {
    return this.value[0]!;
  }
}
