import { describe, expect, it } from 'vitest';
import {
  AccountAlreadyExistsError,
  InvalidAccountCodeError,
  NatureRequiredError,
  ParentNotFoundError,
} from '../../domain/errors.js';
import { CreateAccountUseCase } from './create-account.use-case.js';
import { FakeAccountRepository, seedExampleCatalog } from './fake-account-repository.js';

async function setup() {
  const repository = new FakeAccountRepository();
  await seedExampleCatalog(repository);
  return { repository, useCase: new CreateAccountUseCase(repository) };
}

describe('CreateAccountUseCase', () => {
  it('crea una clase con su naturaleza, sin padre', async () => {
    const { useCase, repository } = await setup();
    const node = await useCase.execute({ code: '3', name: 'Patrimonio', nature: 'credit' });
    expect(node).toMatchObject({ code: '3', level: 'class', nature: 'credit', children: [] });
    expect(await repository.findByCode('3')).not.toBeNull();
  });

  it('crea una subcuenta cuando su padre existe y hereda la naturaleza de la clase (regla 8)', async () => {
    const { useCase } = await setup();
    const node = await useCase.execute({ code: '110515', name: 'Caja auxiliar' });
    expect(node).toMatchObject({
      code: '110515',
      level: 'subaccount',
      nature: 'debit',
      acceptsMovements: true,
    });
  });

  it('rechaza una cuenta cuyo padre no existe (regla 4)', async () => {
    const { useCase } = await setup();
    await expect(useCase.execute({ code: '1205', name: 'Bancos' })).rejects.toBeInstanceOf(
      ParentNotFoundError,
    );
    await expect(useCase.execute({ code: '33', name: 'Grupo huérfano' })).rejects.toBeInstanceOf(
      ParentNotFoundError,
    );
  });

  it('rechaza un código duplicado (regla 7)', async () => {
    const { useCase } = await setup();
    await expect(useCase.execute({ code: '1105', name: 'Otra caja' })).rejects.toBeInstanceOf(
      AccountAlreadyExistsError,
    );
  });

  it('rechaza una clase sin naturaleza (regla 8)', async () => {
    const { useCase } = await setup();
    await expect(useCase.execute({ code: '4', name: 'Ingresos' })).rejects.toBeInstanceOf(
      NatureRequiredError,
    );
  });

  it('rechaza códigos no numéricos o de longitud inválida (reglas 1 y 2)', async () => {
    const { useCase } = await setup();
    await expect(useCase.execute({ code: '11A5', name: 'x' })).rejects.toBeInstanceOf(
      InvalidAccountCodeError,
    );
    await expect(useCase.execute({ code: '110', name: 'x' })).rejects.toBeInstanceOf(
      InvalidAccountCodeError,
    );
  });

  it('no guarda nada cuando falla una validación', async () => {
    const { useCase, repository } = await setup();
    const before = (await repository.findAll()).length;
    await useCase.execute({ code: '1205', name: 'Bancos' }).catch(() => undefined);
    expect((await repository.findAll()).length).toBe(before);
  });
});
