import { Account } from '../../domain/account.js';
import { AccountAlreadyExistsError, ParentNotFoundError } from '../../domain/errors.js';
import type { AccountNode, CreateAccountInput } from '../dto.js';
import type { AccountRepository } from '../ports/account-repository.js';

export class CreateAccountUseCase {
  constructor(private readonly repository: AccountRepository) {}

  async execute(input: CreateAccountInput): Promise<AccountNode> {
    // Reglas 1, 2 y 8 (formato, nivel y naturaleza): las valida el dominio.
    const account = Account.create(input.code, input.name, input.nature);

    // Regla 7: el código es único.
    if (await this.repository.findByCode(account.code.value)) {
      throw new AccountAlreadyExistsError(`Ya existe una cuenta con el código ${account.code.value}.`);
    }

    // Regla 4: el padre debe existir (las clases no tienen padre).
    const parentCode = account.code.parentCode;
    if (parentCode !== null && !(await this.repository.findByCode(parentCode))) {
      throw new ParentNotFoundError(
        `No se puede crear ${account.code.value}: el padre ${parentCode} no existe.`,
      );
    }

    await this.repository.save(account);

    // Regla 8: la naturaleza se hereda de la clase.
    const nature = account.nature ?? (await this.repository.findByCode(account.code.classCode))?.nature;

    return {
      code: account.code.value,
      name: account.name,
      level: account.code.level,
      nature: nature!,
      acceptsMovements: true, // recién creada: no tiene hijas (regla 6)
      children: [],
    };
  }
}
