import { Test, TestingModule } from '@nestjs/testing';
import { ReferencesController } from './references.controller';
import { ReferencesService } from './references.service';

describe('ReferencesController', () => {
  let referencesController: ReferencesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ReferencesController],
      providers: [ReferencesService],
    }).compile();

    referencesController = app.get<ReferencesController>(ReferencesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(referencesController.getHello()).toBe('Hello World!');
    });
  });
});
