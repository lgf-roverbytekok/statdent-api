import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma-health.indicator';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    TerminusModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // The time-to-live for each request count record (in milliseconds)
        limit: 10, // The maximum number of requests allowed in the given time period
      },
    ]),
  ],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {}
