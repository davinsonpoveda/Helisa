import type { AccountRepository } from '../application/ports/account-repository.js';
import { Account } from '../domain/account.js';

export class InMemoryAccountRepository implements AccountRepository {
  private readonly accounts = new Map<string, Account>();

  async save(account: Account): Promise<void> {
    this.accounts.set(account.code.value, account);
  }

  async findByCode(code: string): Promise<Account | null> {
    return this.accounts.get(code) ?? null;
  }

  async findAll(): Promise<Account[]> {
    return [...this.accounts.values()];
  }

  async hasChildren(code: string): Promise<boolean> {
    for (const account of this.accounts.values()) {
      if (account.code.parentCode === code) return true;
    }
    return false;
  }

  async deleteByCode(code: string): Promise<void> {
    this.accounts.delete(code);
  }
}

/** Catálogo de ejemplo del enunciado. Se aplica al arrancar la app. */
export async function seedAccounts(repository: AccountRepository): Promise<void> {
  const seed: Account[] = [
    Account.create('1', 'Activo', 'debit'),
    Account.create('11', 'Disponible'),
    Account.create('1105', 'Caja'),
    Account.create('110505', 'Caja general'),
    Account.create('110510', 'Caja menor'),
    Account.create('2', 'Pasivo', 'credit'),
    Account.create('21', 'Obligaciones financieras'),
    Account.create('2105', 'Bancos nacionales'),
  ];
  for (const account of seed) {
    await repository.save(account);
  }
}
