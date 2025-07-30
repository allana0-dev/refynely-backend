import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

describe('AiController', () => {
  let controller: AiController;
  let mockAiService: Partial<AiService>;

  beforeEach(async () => {
    mockAiService = {
      generateDeckOutline: jest.fn().mockResolvedValue('Mocked outline'),
      refineSlide: jest.fn().mockResolvedValue('Mocked refined slide'),
    };
    const mockFirebaseAuthGuard = {
      canActivate: jest.fn(() => true),
    };
    const mockPrismaService = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        { provide: AiService, useValue: mockAiService },
        { provide: FirebaseAuthGuard, useValue: mockFirebaseAuthGuard },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call generateDeckOutline and return result', async () => {
    const body = {
      company: 'Refynly',
      industry: 'SaaS',
      problem: 'Inefficient pitch creation',
      solution: 'AI-powered generation',
    };

    const result = await controller.generateOutline(undefined, body);

    expect(mockAiService.generateDeckOutline).toHaveBeenCalledWith(body);
    expect(result).toBe('Mocked outline');
  });

  it('should call refineSlide and return result', async () => {
    const refineBody = {
      title: 'Problem',
      content: 'Old content',
      feedback: 'Be more concise',
    };

    const result = await controller.refineSlide(refineBody);

    expect(mockAiService.refineSlide).toHaveBeenCalledWith(
      refineBody.title,
      refineBody.content,
      refineBody.feedback,
    );
    expect(result).toBe('Mocked refined slide');
  });
});
