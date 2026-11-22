import type { AccountCode } from './account-code.js';
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
}
