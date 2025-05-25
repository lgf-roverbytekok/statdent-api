import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AppConfigModule } from 'src/app-config/app-config.module';
import { PaginationBuilderService } from 'src/core/builders/pagination-builder.service';

@Module({
  imports: [AppConfigModule],
  controllers: [UserController],
  providers: [UserService, PaginationBuilderService],
  exports: [
    UserService, // Export UserService so it can be used in other modules
  ],
})
export class UserModule {}
