import { Reflector } from '@nestjs/core';
import {
  DiskHealthIndicator,
  HealthCheckService,
  HealthCheckStatus,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { mockDeep, MockProxy } from 'jest-mock-extended';

import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma-health.indicator';

describe('HealthController', () => {
  let healthController: HealthController;
  let healthCheckService: MockProxy<HealthCheckService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 10,
          },
        ]),
      ],
      providers: [
        {
          provide: DiskHealthIndicator,
          useValue: mockDeep<DiskHealthIndicator>(),
        },
        {
          provide: HealthCheckService,
          useValue: mockDeep<HealthCheckService>(),
        },
        {
          provide: MemoryHealthIndicator,
          useValue: mockDeep<MemoryHealthIndicator>(),
        },
        {
          provide: PrismaHealthIndicator,
          useValue: mockDeep<PrismaHealthIndicator>(),
        },
        Reflector,
        ThrottlerGuard,
      ],
    }).compile();

    healthController = module.get<HealthController>(HealthController);
    healthCheckService = module.get(HealthCheckService);
  });

  it('should be defined', () => {
    expect(healthController).toBeDefined();
  });

  describe('check', () => {
    it('should return the health of various components', async () => {
      const mockResult = {
        storage: { status: 'up' },
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' },
        details: {},
        status: 'ok' as HealthCheckStatus,
      };

      healthCheckService.check.mockImplementation(async () => mockResult);

      const result = await healthController.check();

      expect(result).toEqual(mockResult);
    });

    it('should handle health check failures', async () => {
      const mockResult = {
        storage: { status: 'down' },
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' },
        details: {},
        status: 'error' as HealthCheckStatus,
      };

      healthCheckService.check.mockImplementation(async () => mockResult);

      const result = await healthController.check();

      expect(result).toEqual(mockResult);
    });
  });
});
