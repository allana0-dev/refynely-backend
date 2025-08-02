// src/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService], // CRITICAL: Export AiService so other modules can use it
})
export class AiModule {}
