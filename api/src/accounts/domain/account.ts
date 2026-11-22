import { AccountCode } from './account-code.js';
import {
  InvalidAccountNameError,
  NatureNotAllowedError,
  NatureRequiredError,
} from './errors.js';
import { NATURES } from './nature.js';
import type { Nature } from './nature.js';

/**
 * Cuenta del catálogo. La naturaleza solo se guarda en las clases;
 * en los demás niveles se hereda de su clase y se resuelve al consultar (regla 8).
 */
export class Account {
  constructor(
    readonly code: AccountCode,
    readonly name: string,
    readonly nature: Nature | null,
  ) {}

  /** Crea una cuenta válida o lanza el error de dominio correspondiente. */
  static create(rawCode: string, name: string, nature?: Nature): Account {
    const code = AccountCode.parse(rawCode);

    const cleanName = typeof name === 'string' ? name.trim() : '';
    if (cleanName.length === 0) {
      throw new InvalidAccountNameError('El nombre de la cuenta no puede estar vacío.');
    }

    if (code.level === 'class') {
      if (nature === undefined || !NATURES.includes(nature)) {
        throw new NatureRequiredError(
          `La clase ${code.value} requiere naturaleza: ${NATURES.join(' o ')}.`,
        );
      }
      return new Account(code, cleanName, nature);
    }

    if (nature !== undefined) {
      throw new NatureNotAllowedError(
        `La naturaleza solo se define en la clase; ${code.value} la hereda de la clase ${code.classCode}.`,
      );
    }
    return new Account(code, cleanName, null);
  }
}
