import {
  Controller,
  Post,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AiService } from './ai.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { GenerateOutlineDto } from './dto';

@Controller('ai')
@UseGuards(FirebaseAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-outline')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async generateOutline(
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: Partial<GenerateOutlineDto> & { description?: string },
  ) {
    try {
      let combinedInput: string | undefined;

      if (file) {
        combinedInput = await this.aiService.extractTextFromFile(file);
      }

      if (body?.description) {
        combinedInput = combinedInput
          ? `${combinedInput}\n\n${body.description}`
          : body.description;
      }

      let generateParams: GenerateOutlineDto;

      if (combinedInput) {
        generateParams = {
          tone: 'professional',
          company: combinedInput,
          industry: combinedInput,
          problem: combinedInput,
          solution: combinedInput,
        };
      } else if (
        body?.company &&
        body?.industry &&
        body?.problem &&
        body?.solution
      ) {
        generateParams = {
          tone: body.tone!,
          company: body.company,
          industry: body.industry,
          problem: body.problem,
          solution: body.solution,
          businessModel: body.businessModel || '',
          financials: body.financials || '',
          tagline: body.tagline,
          elevatorPitch: body.elevatorPitch,
          targetCustomer: body.targetCustomer,
          differentiator: body.differentiator,
          goal: body.goal,
          slideCount: body.slideCount,
        };
      } else {
        throw new HttpException(
          'Missing required fields: company, industry, problem, and solution are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('Generating outline for:', generateParams.company);
      const outline = await this.aiService.generateOutline(generateParams);

      console.log(`Generated ${outline.length} slides successfully`);
      return outline;
    } catch (error) {
      console.error('Generate outline error:', error);
      throw new HttpException(
        error.message || 'Failed to generate outline',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate-image')
  async generateImage(@Body() body: { imagePrompt: string }) {
    try {
      const { imagePrompt } = body;

      if (!imagePrompt) {
        throw new HttpException(
          'Image prompt is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const imageUrl = await this.aiService.generateSlideImage(imagePrompt);

      return { imageUrl };
    } catch (error) {
      console.error('Generate image error:', error);
      throw new HttpException(
        error.message || 'Failed to generate image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('refine-slide')
  async refineSlide(
    @Body() body: { title: string; content: string; feedback: string },
  ) {
    // try {
    //   const { title, content, feedback } = body;
    //   if (!title || !content || !feedback) {
    //     throw new HttpException(
    //       'Title, content, and feedback are required',
    //       HttpStatus.BAD_REQUEST,
    //     );
    //   }
    //   return await this.aiService.refineSlide(title, content, feedback);
    // } catch (error) {
    //   console.error('Refine slide error:', error);
    //   throw new HttpException(
    //     error.message || 'Failed to refine slide',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }
}
