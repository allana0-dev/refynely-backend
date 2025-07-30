import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { DeckService } from './deck.service';
import { ExportService } from '../export/export.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { ReorderSlidesDto } from './dto/reorder-slides.dto';

@Controller('decks')
@UseGuards(FirebaseAuthGuard)
export class DeckController {
  constructor(
    private readonly deckService: DeckService,
    private readonly exportService: ExportService,
  ) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateDeckDto) {
    return this.deckService.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.deckService.findAll(userId);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') deckId: string) {
    return this.deckService.findOne(userId, deckId);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') deckId: string,
    @Body() dto: UpdateDeckDto,
  ) {
    return this.deckService.update(userId, deckId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') deckId: string) {
    return this.deckService.remove(userId, deckId);
  }

  @Patch(':id/reorder')
  reorder(
    @CurrentUser('id') userId: string,
    @Param('id') deckId: string,
    @Body() dto: ReorderSlidesDto,
  ) {
    return this.deckService.reorderSlides(userId, deckId, dto);
  }
  @Get(':id/export')
  async export(
    @Param('id') deckId: string,
    @Query('format') format: 'pdf' | 'pptx',
    @Res() res: Response,
  ) {
    if (format === 'pdf') {
      const pdfBuffer = await this.exportService.toPdf(deckId);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${deckId}.pdf"`,
      });
      return res.send(pdfBuffer);
    }

    const pptxBuffer = await this.exportService.toPptx(deckId);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': `attachment; filename="${deckId}.pptx"`,
    });
    return res.send(pptxBuffer);
  }
}
