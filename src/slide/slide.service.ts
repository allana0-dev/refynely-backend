// src/slide/slide.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';

@Injectable()
export class SlideService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, deckId: string, dto: CreateSlideDto) {
    return this.prisma.slide.create({
      data: { ...dto, deckId: deckId },
    });
  }

  async update(userId: string, slideId: string, dto: UpdateSlideDto) {
    return this.prisma.slide.update({ where: { id: slideId }, data: dto });
  }

  async remove(userId: string, slideId: string) {
    return this.prisma.slide.delete({ where: { id: slideId } });
  }
}
