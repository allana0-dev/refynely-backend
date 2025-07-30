// src/deck/deck.module.ts
import { Module } from '@nestjs/common';
import { DeckService } from './deck.service';
import { DeckController } from './deck.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DeckService],
  controllers: [DeckController],
})
export class DeckModule {}