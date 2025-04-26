import { Test, TestingModule } from '@nestjs/testing';
import { AgeGroupService } from './age-group.service';

describe('AgeGroupService', () => {
  let service: AgeGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgeGroupService],
    }).compile();

    service = module.get<AgeGroupService>(AgeGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
