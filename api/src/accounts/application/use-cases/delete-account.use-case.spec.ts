import { describe, expect, it } from 'vitest';
import { AccountHasChildrenError, AccountNotFoundError } from '../../domain/errors.js';
import { DeleteAccountUseCase } from './delete-account.use-case.js';
import { FakeAccountRepository, seedExampleCatalog } from './fake-account-repository.js';

async function setup() {
  const repository = new FakeAccountRepository();
  await seedExampleCatalog(repository);
  return { repository, useCase: new DeleteAccountUseCase(repository) };
}

describe('DeleteAccountUseCase', () => {
  it('elimina una cuenta sin hijas', async () => {
    const { useCase, repository } = await setup();
    await useCase.execute('110510');
    expect(await repository.findByCode('110510')).toBeNull();
    expect(await repository.findByCode('110505')).not.toBeNull();
  });

  it('rechaza eliminar una cuenta con hijas (regla 5)', async () => {
    const { useCase, repository } = await setup();
    await expect(useCase.execute('1105')).rejects.toBeInstanceOf(AccountHasChildrenError);
    await expect(useCase.execute('1')).rejects.toBeInstanceOf(AccountHasChildrenError);
    expect(await repository.findByCode('1105')).not.toBeNull();
  });

  it('permite eliminar un padre cuando ya no le quedan hijas', async () => {
    const { useCase, repository } = await setup();
    await useCase.execute('2105');
    await useCase.execute('21');
    expect(await repository.findByCode('21')).toBeNull();
  });

  it('rechaza una cuenta inexistente', async () => {
    const { useCase } = await setup();
    await expect(useCase.execute('9999')).rejects.toBeInstanceOf(AccountNotFoundError);
  });
});
