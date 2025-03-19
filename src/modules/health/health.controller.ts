import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ThrottlerGuard } from '@nestjs/throttler';

import { PrismaHealthIndicator } from './prisma-health.indicator';

/**
 *  The HealthController class checks the health of various components
 *  including the memory and disk.
 */
@Controller('health')
@UseGuards(ThrottlerGuard)
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private prismaHealthIndicator: PrismaHealthIndicator,
  ) {}

  /**
   * The function checks the health of various components including the database, memory, and storage.
   * @returns The `check()` function is returning the result of calling the `health.check()` method
   * with an array of functions as arguments. Each function in the array is a check for a different
   * aspect of the system's health, including the status of the database, memory usage, and disk
   * storage. The `health.check()` method will return a Promise that resolves with an array of objects
   * representing the results of each check
   */
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      // The used disk storage should not exceed 80% of the full disk size
      async () =>
        this.disk.checkStorage('disk health', {
          thresholdPercent: 0.8,
          path: '/',
        }),
      // The process should not use more than 150MB memory
      async () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      // The process should not have more than 150MB allocated
      async () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      // Ensure that the connection to the database is established.
      async () => this.prismaHealthIndicator.isHealthy('prisma'),
    ]);
  }
}
