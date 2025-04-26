import { Module } from '@nestjs/common';
import { AgeGroupService } from './age-group.service';
import { AgeGroupController } from './age-group.controller';

@Module({
  controllers: [AgeGroupController],
  providers: [AgeGroupService],
})
export class AgeGroupModule {}
