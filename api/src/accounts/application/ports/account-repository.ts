import type { Account } from '../../domain/account.js';

/** Token de inyección: la aplicación depende del puerto, no de la implementación. */
export const ACCOUNT_REPOSITORY = Symbol('ACCOUNT_REPOSITORY');

export interface AccountRepository {
  save(account: Account): Promise<void>;
  findByCode(code: string): Promise<Account | null>;
  findAll(): Promise<Account[]>;
  /** Regla 5 y 6: true si existe alguna cuenta cuyo padre es `code`. */
  hasChildren(code: string): Promise<boolean>;
  deleteByCode(code: string): Promise<void>;
}
