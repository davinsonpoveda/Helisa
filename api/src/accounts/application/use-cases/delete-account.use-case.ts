import { AccountHasChildrenError, AccountNotFoundError } from '../../domain/errors.js';
import type { AccountRepository } from '../ports/account-repository.js';

export class DeleteAccountUseCase {
  constructor(private readonly repository: AccountRepository) {}

  async execute(code: string): Promise<void> {
    if (!(await this.repository.findByCode(code))) {
      throw new AccountNotFoundError(`No existe la cuenta ${code}.`);
    }

    // Regla 5: no se elimina una cuenta con hijas.
    if (await this.repository.hasChildren(code)) {
      throw new AccountHasChildrenError(`La cuenta ${code} tiene cuentas hijas y no se puede eliminar.`);
    }

    await this.repository.deleteByCode(code);
  }
}
