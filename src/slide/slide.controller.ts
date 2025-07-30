// src/slide/slide.controller.ts
import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SlideService } from './slide.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';

@Controller('decks/:deckId/slides')
@UseGuards(FirebaseAuthGuard)
export class SlideController {
  constructor(private readonly slideService: SlideService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Param('deckId') deckId: string,
    @Body() dto: CreateSlideDto,
  ) {
    return this.slideService.create(userId, deckId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('deckId') deckId: string,
    @Param('id') slideId: string,
    @Body() dto: UpdateSlideDto,
  ) {
    return this.slideService.update(userId, slideId, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser('id') userId: string,
    @Param('deckId') deckId: string,
    @Param('id') slideId: string,
  ) {
    return this.slideService.remove(userId, slideId);
  }
}
