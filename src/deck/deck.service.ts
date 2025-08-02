import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { ReorderSlidesDto } from './dto/reorder-slides.dto';

@Injectable()
export class DeckService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async create(userId: string, dto: CreateDeckDto) {
    try {
      return await this.prisma.deck.create({
        data: {
          title: dto.title,
          user: {
            connect: { id: userId },
          },
          slides: {
            create:
              dto.slides?.map((slide, index) => ({
                title: slide.title,
                content: slide.content,
                speakerNotes: slide.speakerNotes || '',
                layout: {
                  elements: [
                    {
                      type: 'title',
                      content: slide.title,
                      position: { x: 50, y: 40 },
                      size: { width: 800, height: 60 },
                      style: { fontSize: 32, fontWeight: 'bold' },
                    },
                    {
                      type: 'text',
                      content: slide.content,
                      position: { x: 50, y: 120 },
                      size: { width: 800, height: 300 },
                      style: { fontSize: 16 },
                    },
                    // Base64 image (data URL) - no external storage needed
                    ...(slide.imageUrl
                      ? [
                          {
                            type: 'image',
                            imagePrompt: slide.imagePrompt || '',
                            position: { x: 50, y: 450 },
                            size: { width: 400, height: 200 },
                            url: slide.imageUrl,
                          },
                        ]
                      : []),
                    {
                      type: 'imageSuggestions',
                      suggestions: slide.imageSuggestions,
                      imagePrompt: slide.imagePrompt || '',
                      position: { x: 50, y: 450 },
                      size: { width: 400, height: 120 },
                      style: {
                        fontSize: 14,
                        backgroundColor: '#f8f9fa',
                        border: '2px dashed #dee2e6',
                        padding: '16px',
                        borderRadius: '8px',
                      },
                    },
                  ],
                },
                orderIndex: index,
              })) || [],
          },
        },
        include: {
          slides: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });
    } catch (error) {
      console.error('Error creating deck:', error);
      throw new Error(`Failed to create deck: ${error.message}`);
    }
  }

  // Generate image directly as base64 data URL
  async generateSlideImage(
    userId: string,
    deckId: string,
    slideId: string,
    imagePrompt: string,
  ) {
    await this.findOne(userId, deckId);

    const slide = await this.prisma.slide.findFirst({
      where: { id: slideId, deckId: deckId },
    });

    if (!slide) {
      throw new Error('Slide not found');
    }

    try {
      // Generate base64 image directly
      const imageDataUrl = await this.aiService.generateSlideImage(imagePrompt);

      // Update slide layout with the base64 image
      const currentLayout = slide.layout as any;

      // Remove image suggestions and add actual image
      const updatedElements = currentLayout.elements
        .filter((el: any) => el.type !== 'imageSuggestions')
        .concat([
          {
            type: 'image',
            imagePrompt: imagePrompt,
            position: { x: 50, y: 450 },
            size: { width: 400, height: 200 },
            url: imageDataUrl,
          },
        ]);

      const updatedLayout = {
        ...currentLayout,
        elements: updatedElements,
      };

      return await this.prisma.slide.update({
        where: { id: slideId },
        data: { layout: updatedLayout },
      });
    } catch (error) {
      console.error('Error generating slide image:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  async findAll(userId: string) {
    return this.prisma.deck.findMany({
      where: { user: { id: userId } },
      include: {
        slides: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, deckId: string) {
    const deck = await this.prisma.deck.findFirst({
      where: { id: deckId, user: { id: userId } },
      include: {
        slides: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!deck) {
      throw new Error('Deck not found or access denied');
    }

    return deck;
  }

  async update(userId: string, deckId: string, dto: UpdateDeckDto) {
    await this.findOne(userId, deckId);

    return this.prisma.deck.update({
      where: { id: deckId },
      data: { title: dto.title },
      include: {
        slides: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  async remove(userId: string, deckId: string) {
    await this.findOne(userId, deckId);

    return this.prisma.deck.delete({
      where: { id: deckId },
    });
  }

  async reorderSlides(userId: string, deckId: string, dto: ReorderSlidesDto) {
    await this.findOne(userId, deckId);

    const updates = dto.order.map((slide_id, index) =>
      this.prisma.slide.update({
        where: { id: slide_id },
        data: { orderIndex: index },
      }),
    );

    return Promise.all(updates);
  }

  // Fixed updateSlides method - handle the entire layout object properly
  async updateSlides(userId: string, deckId: string, slides: any[]) {
    await this.findOne(userId, deckId);

    const updates = slides.map((slide) => {
      // Prepare the layout data correctly
      const layoutData = slide.layout || {};

      // If slide.elements exists (from frontend), convert to layout.elements
      if (slide.elements && !layoutData.elements) {
        layoutData.elements = slide.elements;
      }

      return this.prisma.slide.update({
        where: { id: slide.id },
        data: {
          title: slide.title,
          content: slide.content,
          speakerNotes: slide.speakerNotes || '',
          layout: layoutData, // Store the entire layout object
        },
      });
    });

    return Promise.all(updates);
  }

  // Fixed regenerateSlide method - preserve existing layout structure
  async regenerateSlide(
    userId: string,
    deckId: string,
    slideId: string,
    body: {
      currentContent?: string;
      slideTitle?: string;
      prompt?: string;
      speakerNotes?: string;
    },
  ) {
    await this.findOne(userId, deckId);

    const slide = await this.prisma.slide.findFirst({
      where: { id: slideId, deckId: deckId },
    });

    if (!slide) {
      throw new Error('Slide not found');
    }

    // Get current layout and preserve it
    const currentLayout = slide.layout as any;

    // Update text elements in the layout if they exist
    let updatedLayout = currentLayout;
    if (currentLayout?.elements) {
      updatedLayout = {
        ...currentLayout,
        elements: currentLayout.elements.map((element: any) => {
          if (element.type === 'title' && body.slideTitle) {
            return { ...element, content: body.slideTitle };
          }
          if (element.type === 'text' && body.currentContent) {
            return { ...element, content: body.currentContent };
          }
          return element;
        }),
      };
    }

    const updatedSlide = await this.prisma.slide.update({
      where: { id: slideId },
      data: {
        title: body.slideTitle || slide.title,
        content: body.currentContent || slide.content,
        speakerNotes: body.speakerNotes || slide.speakerNotes,
        layout: updatedLayout, // Use the updated layout
      },
    });

    return updatedSlide;
  }

  // New method to update a single slide's content
  async updateSlideContent(
    userId: string,
    slideId: string,
    updates: {
      title?: string;
      content?: string;
      speakerNotes?: string;
      layout?: any;
    },
  ) {
    // Find the slide and verify user access
    const slide = await this.prisma.slide.findFirst({
      where: {
        id: slideId,
        deck: { user: { id: userId } },
      },
    });

    if (!slide) {
      throw new Error('Slide not found or access denied');
    }

    // Update the slide
    return await this.prisma.slide.update({
      where: { id: slideId },
      data: {
        ...(updates.title && { title: updates.title }),
        ...(updates.content && { content: updates.content }),
        ...(updates.speakerNotes && { speakerNotes: updates.speakerNotes }),
        ...(updates.layout && { layout: updates.layout }),
      },
    });
  }
}
