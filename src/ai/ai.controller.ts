// ai.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AiService } from './ai.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('ai')
@UseGuards(FirebaseAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Generate deck outline from structured input, free-form description, or uploaded file.
   */
  @Post('generate-outline')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async generateOutline(
    @UploadedFile() file?: Express.Multer.File,
    @Body()
    body?: {
      description?: string;
      company?: string;
      industry?: string;
      problem?: string;
      solution?: string;
      businessModel?: string;
      financials?: string;
    },
  ) {
    let combinedInput: string | undefined;
    if (file) {
      combinedInput = await this.aiService.extractTextFromFile(file);
    }

    if (body?.description) {
      combinedInput = combinedInput
        ? `${combinedInput}\n\n${body.description}`
        : body.description;
    }

    if (combinedInput) {
      return this.aiService.generateDeckOutline({ description: combinedInput });
    } else if (body) {
      const {
        company,
        industry,
        problem,
        solution,
        businessModel,
        financials,
      } = body;
      return this.aiService.generateDeckOutline({
        company,
        industry,
        problem,
        solution,
        businessModel,
        financials,
      });
    } else {
      throw new Error(
        'Please provide file upload, description, or structured inputs',
      );
    }
  }

  /**
   * Refine an existing slide based on user feedback.
   */
  @Post('refine-slide')
  async refineSlide(
    @Body() body: { title: string; content: string; feedback: string },
  ) {
    const { title, content, feedback } = body;
    return this.aiService.refineSlide(title, content, feedback);
  }
}
