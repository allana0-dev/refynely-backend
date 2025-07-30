import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';

jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: { content: 'Mocked response' },
              },
            ],
          }),
        },
      },
    })),
  };
});

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate deck outline', async () => {
    const result = await service.generateDeckOutline({
      company: 'Refynly',
      industry: 'SaaS',
      problem: 'Inefficient pitch creation',
      solution: 'AI-powered deck generation',
    });

    expect(result).toBe('Mocked response');
  });

  it('should refine slide', async () => {
    const result = await service.refineSlide(
      'Solution',
      'We use AI to generate slides.',
      'Make it more concise.',
    );

    expect(result).toBe('Mocked response');
  });
});
