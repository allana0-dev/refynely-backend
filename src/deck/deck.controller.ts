// src/deck/deck.controller.ts - Proper user access from Firebase Auth Guard
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { ReorderSlidesDto } from './dto/reorder-slides.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

// Define the user interface for type safety
interface AuthenticatedUser {
  id: string;
  email: string;
  uid: string; // Firebase UID
  // Add other user properties as needed
}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('decks')
@UseGuards(FirebaseAuthGuard)
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createDeckDto: CreateDeckDto,
  ) {
    const userId = req.user.id; // or req.user.uid depending on your setup
    console.log('Creating deck for user:', userId, req.user.email);
    return this.deckService.create(userId, createDeckDto);
  }

  @Get()
  findAll(@Request() req: RequestWithUser) {
    const userId = req.user.id;
    console.log('Finding decks for user:', userId);
    return this.deckService.findAll(userId);
  }

  @Get(':id')
  findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.id;
    console.log('Finding deck:', id, 'for user:', userId);
    return this.deckService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateDeckDto: UpdateDeckDto,
  ) {
    const userId = req.user.id;
    console.log('Updating deck:', id, 'for user:', userId);
    return this.deckService.update(userId, id, updateDeckDto);
  }

  @Delete(':id')
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.id;
    console.log('Deleting deck:', id, 'for user:', userId);
    return this.deckService.remove(userId, id);
  }

  @Put(':id/reorder')
  reorderSlides(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() reorderSlidesDto: ReorderSlidesDto,
  ) {
    const userId = req.user.id;
    console.log('Reordering slides for deck:', id, 'user:', userId);
    return this.deckService.reorderSlides(userId, id, reorderSlidesDto);
  }

  @Post(':deckId/slides/:slideId/generate-image')
  generateSlideImage(
    @Request() req: RequestWithUser,
    @Param('deckId') deckId: string,
    @Param('slideId') slideId: string,
    @Body() body: { imagePrompt: string },
  ) {
    const userId = req.user.id;
    console.log(
      'Generating image for slide:',
      slideId,
      'deck:',
      deckId,
      'user:',
      userId,
    );

    if (!body.imagePrompt) {
      throw new Error('Image prompt is required');
    }

    return this.deckService.generateSlideImage(
      userId,
      deckId,
      slideId,
      body.imagePrompt,
    );
  }

  // Additional endpoint for debugging user info
  @Get('user/me')
  getCurrentUser(@Request() req: RequestWithUser) {
    return {
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }

  // Endpoint for updating multiple slides at once
  @Patch(':id/slides')
  updateSlides(
    @Request() req: RequestWithUser,
    @Param('id') deckId: string,
    @Body() body: { slides: any[] },
  ) {
    const userId = req.user.id;
    console.log('Updating slides for deck:', deckId, 'user:', userId);
    return this.deckService.updateSlides(userId, deckId, body.slides);
  }

  // AI regeneration endpoint
  @Post(':deckId/slides/:slideId/regenerate')
  regenerateSlide(
    @Request() req: RequestWithUser,
    @Param('deckId') deckId: string,
    @Param('slideId') slideId: string,
    @Body()
    body: {
      currentContent?: string;
      slideTitle?: string;
      prompt?: string;
    },
  ) {
    const userId = req.user.id;
    console.log(
      'Regenerating slide:',
      slideId,
      'for deck:',
      deckId,
      'user:',
      userId,
    );

    return this.deckService.regenerateSlide(userId, deckId, slideId, body);
  }
}
