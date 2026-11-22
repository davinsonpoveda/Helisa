import { Account } from '../../domain/account.js';
import type { Nature } from '../../domain/nature.js';
import type { AccountRepository } from '../ports/account-repository.js';

/** Repositorio falso solo para los tests de los casos de uso. */
export class FakeAccountRepository implements AccountRepository {
  private readonly items = new Map<string, Account>();

  async save(account: Account): Promise<void> {
    this.items.set(account.code.value, account);
  }

  async findByCode(code: string): Promise<Account | null> {
    return this.items.get(code) ?? null;
  }

  async findAll(): Promise<Account[]> {
    return [...this.items.values()];
  }

  async hasChildren(code: string): Promise<boolean> {
    return [...this.items.values()].some((a) => a.code.parentCode === code);
  }

  async deleteByCode(code: string): Promise<void> {
    this.items.delete(code);
  }
}

/** Catálogo de ejemplo del enunciado. */
export async function seedExampleCatalog(repository: AccountRepository): Promise<void> {
  const rows: [string, string, Nature?][] = [
    ['1', 'Activo', 'debit'],
    ['11', 'Disponible'],
    ['1105', 'Caja'],
    ['110505', 'Caja general'],
    ['110510', 'Caja menor'],
    ['2', 'Pasivo', 'credit'],
    ['21', 'Obligaciones financieras'],
    ['2105', 'Bancos nacionales'],
  ];
  for (const [code, name, nature] of rows) {
    await repository.save(Account.create(code, name, nature));
  }
}
