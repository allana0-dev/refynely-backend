import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { DeckService } from '../deck/deck.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DeckModule } from '../deck/deck.module';

@Module({
  imports: [PrismaModule, DeckModule],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
