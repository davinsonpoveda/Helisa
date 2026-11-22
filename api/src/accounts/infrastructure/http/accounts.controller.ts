import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import type { AccountNode, CreateAccountInput } from '../../application/dto.js';
import { CreateAccountUseCase } from '../../application/use-cases/create-account.use-case.js';
import { DeleteAccountUseCase } from '../../application/use-cases/delete-account.use-case.js';
import { GetAccountTreeUseCase } from '../../application/use-cases/get-account-tree.use-case.js';

/** Traduce HTTP a casos de uso. Las reglas de negocio viven en dominio y aplicación. */
@Controller('accounts')
export class AccountsController {
  constructor(
    @Inject(CreateAccountUseCase) private readonly createAccount: CreateAccountUseCase,
    @Inject(GetAccountTreeUseCase) private readonly getAccountTree: GetAccountTreeUseCase,
    @Inject(DeleteAccountUseCase) private readonly deleteAccount: DeleteAccountUseCase,
  ) {}

  @Post()
  create(@Body() body: unknown): Promise<AccountNode> {
    return this.createAccount.execute(this.toCreateInput(body));
  }

  @Get()
  tree(): Promise<AccountNode[]> {
    return this.getAccountTree.execute();
  }

  @Delete(':code')
  @HttpCode(204)
  async remove(@Param('code') code: string): Promise<void> {
    await this.deleteAccount.execute(code);
  }

  /** Solo valida la forma del body; el significado de los valores lo valida el dominio. */
  private toCreateInput(body: unknown): CreateAccountInput {
    if (typeof body !== 'object' || body === null) {
      throw new BadRequestException('El cuerpo debe ser un objeto JSON');
    }
    const { code, name, nature } = body as Record<string, unknown>;
    if (typeof code !== 'string' || typeof name !== 'string') {
      throw new BadRequestException('"code" y "name" deben ser texto');
    }
    if (nature !== undefined && typeof nature !== 'string') {
      throw new BadRequestException('"nature" debe ser texto');
    }
    return { code, name, ...(nature !== undefined && { nature: nature as CreateAccountInput['nature'] }) };
  }
}
