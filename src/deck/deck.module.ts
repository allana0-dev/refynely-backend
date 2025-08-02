// src/deck/deck.module.ts
import { Module } from '@nestjs/common';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdmin } from '../firebase/firebase-admin';
import { FirebaseService } from '../firebase/firebase.service';
import { UploadService } from '../upload/upload.service';
import { AiService } from '../ai/ai.service';

@Module({
  controllers: [DeckController],
  providers: [
    DeckService,
    PrismaService,
    FirebaseAdmin,
    FirebaseService,
    UploadService,
    AiService,
  ],
  exports: [DeckService],
})
export class DeckModule {}
