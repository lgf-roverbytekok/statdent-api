import { Test, TestingModule } from '@nestjs/testing';
import { AgeGroupController } from './age-group.controller';
import { AgeGroupService } from './age-group.service';

describe('AgeGroupController', () => {
  let controller: AgeGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgeGroupController],
      providers: [AgeGroupService],
    }).compile();

    controller = module.get<AgeGroupController>(AgeGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
