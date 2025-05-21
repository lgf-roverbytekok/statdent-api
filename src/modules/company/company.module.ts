import { Module } from '@nestjs/common';

import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService], // Export the service if needed in other modules
})
export class CompanyModule {}
