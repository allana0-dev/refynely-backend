import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VersionService {
  constructor(private readonly prisma: PrismaService) {}

  // List all versions of a slide, ensuring ownership
  async listVersions(userId: string, slideId: string) {
    // Ensure slide belongs to user
    const slide = await this.prisma.slide.findFirst({
      where: { id: slideId, deck: { userId } },
    });
    if (!slide) throw new NotFoundException('Slide not found');

    return this.prisma.slideVersion.findMany({
      where: { slideId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Revert slide to a specific version
  async revertVersion(userId: string, slideId: string, versionId: string) {
    // Validate version exists and ownership
    const version = await this.prisma.slideVersion.findUnique({
      where: { id: versionId },
      include: { slide: { include: { deck: true } } },
    });
    if (!version) throw new NotFoundException('Version not found');
    if (version.slide.deck.userId !== userId)
      throw new ForbiddenException('Not authorized');

    // Update slide to content of version
    return this.prisma.slide.update({
      where: { id: slideId },
      data: { content: version.content, speakerNotes: version.speakerNotes },
    });
  }
}
