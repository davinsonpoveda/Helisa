import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/infrastructure/accounts.module.js';

@Module({
  imports: [AccountsModule],
})
export class AppModule {}
