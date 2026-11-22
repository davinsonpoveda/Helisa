import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import {
  ACCOUNT_REPOSITORY,
  type AccountRepository,
} from '../application/ports/account-repository.js';
import { CreateAccountUseCase } from '../application/use-cases/create-account.use-case.js';
import { DeleteAccountUseCase } from '../application/use-cases/delete-account.use-case.js';
import { GetAccountTreeUseCase } from '../application/use-cases/get-account-tree.use-case.js';
import { AccountsController } from './http/accounts.controller.js';
import { DomainExceptionFilter } from './http/domain-exception.filter.js';
import { InMemoryAccountRepository, seedAccounts } from './in-memory-account.repository.js';

/** Composition root: aquí se enlaza el puerto con su implementación concreta. */
@Module({
  controllers: [AccountsController],
  providers: [
    {
      provide: ACCOUNT_REPOSITORY,
      useFactory: async (): Promise<AccountRepository> => {
        const repository = new InMemoryAccountRepository();
        await seedAccounts(repository);
        return repository;
      },
    },
    {
      provide: CreateAccountUseCase,
      useFactory: (repository: AccountRepository) => new CreateAccountUseCase(repository),
      inject: [ACCOUNT_REPOSITORY],
    },
    {
      provide: GetAccountTreeUseCase,
      useFactory: (repository: AccountRepository) => new GetAccountTreeUseCase(repository),
      inject: [ACCOUNT_REPOSITORY],
    },
    {
      provide: DeleteAccountUseCase,
      useFactory: (repository: AccountRepository) => new DeleteAccountUseCase(repository),
      inject: [ACCOUNT_REPOSITORY],
    },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
  ],
})
export class AccountsModule {}
