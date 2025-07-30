import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { ReorderSlidesDto } from './dto/reorder-slides.dto';

@Injectable()
export class DeckService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDeckDto) {
    return this.prisma.deck.create({
      data: { title: dto.title, userId: userId },
    });
  }

  async findAll(userId: string) {
    return this.prisma.deck.findMany({
      where: { userId: userId },
      include: { slides: true },
    });
  }

  async findOne(userId: string, deckId: string) {
    return this.prisma.deck.findFirst({
      where: { id: deckId, userId: userId },
      include: { slides: true },
    });
  }

  async update(userId: string, deckId: string, dto: UpdateDeckDto) {
    return this.prisma.deck.update({
      where: { id: deckId },
      data: { title: dto.title },
    });
  }

  async remove(userId: string, deckId: string) {
    return this.prisma.deck.delete({ where: { id: deckId } });
  }

  async reorderSlides(userId: string, deckId: string, dto: ReorderSlidesDto) {
    return Promise.all(
      dto.order.map((slide_id, index) =>
        this.prisma.slide.update({
          where: { id: slide_id },
          data: { orderIndex: index },
        }),
      ),
    );
  }
}
