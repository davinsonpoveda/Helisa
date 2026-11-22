import type { Account } from '../../domain/account.js';
import type { Nature } from '../../domain/nature.js';
import type { AccountNode } from '../dto.js';
import type { AccountRepository } from '../ports/account-repository.js';

export class GetAccountTreeUseCase {
  constructor(private readonly repository: AccountRepository) {}

  async execute(): Promise<AccountNode[]> {
    const accounts = [...(await this.repository.findAll())].sort((a, b) =>
      a.code.value.localeCompare(b.code.value),
    );

    // Regla 8: la naturaleza solo vive en las clases; el resto la hereda.
    const natureByClass = new Map<string, Nature>();
    for (const account of accounts) {
      if (account.nature) natureByClass.set(account.code.value, account.nature);
    }

    const nodes = new Map<string, AccountNode>();
    for (const account of accounts) {
      nodes.set(account.code.value, this.toNode(account, natureByClass));
    }

    const roots: AccountNode[] = [];
    for (const account of accounts) {
      const node = nodes.get(account.code.value)!;
      const parent = account.code.parentCode === null ? undefined : nodes.get(account.code.parentCode);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }

    // Regla 6: solo las cuentas sin hijas admiten movimientos.
    for (const node of nodes.values()) node.acceptsMovements = node.children.length === 0;

    return roots;
  }

  private toNode(account: Account, natureByClass: Map<string, Nature>): AccountNode {
    return {
      code: account.code.value,
      name: account.name,
      level: account.code.level,
      nature: natureByClass.get(account.code.classCode)!,
      acceptsMovements: true,
      children: [],
    };
  }
}
