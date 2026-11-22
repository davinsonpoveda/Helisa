import { describe, expect, it } from 'vitest';
import type { AccountNode } from '../dto.js';
import { FakeAccountRepository, seedExampleCatalog } from './fake-account-repository.js';
import { GetAccountTreeUseCase } from './get-account-tree.use-case.js';

async function buildTree(): Promise<AccountNode[]> {
  const repository = new FakeAccountRepository();
  await seedExampleCatalog(repository);
  return new GetAccountTreeUseCase(repository).execute();
}

const flatten = (nodes: AccountNode[]): AccountNode[] =>
  nodes.flatMap((n) => [n, ...flatten(n.children)]);

describe('GetAccountTreeUseCase', () => {
  it('devuelve lista vacía con un catálogo vacío', async () => {
    const useCase = new GetAccountTreeUseCase(new FakeAccountRepository());
    expect(await useCase.execute()).toEqual([]);
  });

  it('arma el árbol anidado del catálogo de ejemplo', async () => {
    const tree = await buildTree();

    expect(tree.map((n) => n.code)).toEqual(['1', '2']);
    const activo = tree[0]!;
    expect(activo.children.map((n) => n.code)).toEqual(['11']);
    expect(activo.children[0]!.children.map((n) => n.code)).toEqual(['1105']);
    expect(activo.children[0]!.children[0]!.children.map((n) => n.code)).toEqual([
      '110505',
      '110510',
    ]);
    expect(tree[1]!.children[0]!.children[0]!.code).toBe('2105');
  });

  it('hereda la naturaleza de la clase en todos los descendientes (regla 8)', async () => {
    const tree = await buildTree();
    expect(flatten([tree[0]!]).map((n) => n.nature)).toEqual(Array(5).fill('debit'));
    expect(flatten([tree[1]!]).map((n) => n.nature)).toEqual(Array(3).fill('credit'));
  });

  it('solo las cuentas sin hijas admiten movimientos (regla 6)', async () => {
    const tree = await buildTree();
    const byCode = Object.fromEntries(flatten(tree).map((n) => [n.code, n.acceptsMovements]));
    expect(byCode).toEqual({
      '1': false,
      '11': false,
      '1105': false,
      '110505': true,
      '110510': true,
      '2': false,
      '21': false,
      '2105': true,
    });
  });

  it('informa el nivel de cada nodo', async () => {
    const tree = await buildTree();
    const group = tree[0]!.children[0]!;
    expect(tree[0]!.level).toBe('class');
    expect(group.level).toBe('group');
    expect(group.children[0]!.level).toBe('account');
    expect(group.children[0]!.children[0]!.level).toBe('subaccount');
  });
});
