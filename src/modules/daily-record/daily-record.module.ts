import { Module } from '@nestjs/common';

import { PrismaService } from 'nestjs-prisma';

import { DailyRecordService } from './daily-record.service';
import { DailyRecordController } from './daily-record.controller';

@Module({
  controllers: [DailyRecordController],
  providers: [DailyRecordService, PrismaService],
})
export class DailyRecordModule {}
