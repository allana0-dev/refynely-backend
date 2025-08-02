import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';
import { VersionService } from '../version/version.service';

@Injectable()
export class SlideService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly versionService: VersionService,
  ) {}

  async findAll(userId: string, deckId: string) {
    // optionally verify user owns the deck
    return this.prisma.slide.findMany({
      where: { deckId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  /** new */
  async findOne(userId: string, deckId: string, slideId: string) {
    const slide = await this.prisma.slide.findFirst({
      where: { id: slideId, deckId },
    });
    if (!slide) throw new NotFoundException('Slide not found');
    return slide;
  }

  async create(userId: string, deckId: string, dto: CreateSlideDto) {
    return this.prisma.slide.create({ data: { ...dto, deckId } });
  }

  async update(userId: string, slideId: string, dto: UpdateSlideDto) {
    // Snapshot existing slide before updating
    const original = await this.prisma.slide.findUnique({
      where: { id: slideId },
    });
    if (!original) throw new NotFoundException('Slide not found');

    await this.versionService.revertVersion(
      userId,
      slideId,
      await this.prisma.slideVersion
        .create({
          data: {
            slideId,
            content: original.content,
            speakerNotes: original.speakerNotes,
          },
        })
        .then((v) => v.id),
    );

    return this.prisma.slide.update({ where: { id: slideId }, data: dto });
  }

  async remove(userId: string, slideId: string) {
    return this.prisma.slide.delete({ where: { id: slideId } });
  }
}
