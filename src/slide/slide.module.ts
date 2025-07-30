import { Module } from '@nestjs/common';
import { SlideService } from './slide.service';
import { SlideController } from './slide.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SlideService],
  controllers: [SlideController],
})
export class SlideModule {}
