// src/export/export.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DeckService } from '../deck/deck.service';
import PDFDocument from 'pdfkit';
import { WritableStreamBuffer } from 'stream-buffers';
import PptxGenJS from 'pptxgenjs';

@Injectable()
export class ExportService {
  constructor(private readonly deckService: DeckService) {}

  /**
   * Generate PDF buffer for a given deck
   */
  async toPdf(deckId: string): Promise<Buffer> {
    const deck = await this.deckService.findOne('', deckId);
    if (!deck) throw new NotFoundException('Deck not found');

    // Create PDF document without default page
    const doc = new PDFDocument({ autoFirstPage: false });
    const bufferStream = new WritableStreamBuffer();
    doc.pipe(bufferStream);

    // Cover page: manual centering
    doc.addPage();
    const { width, height } = doc.page;
    const titleFontSize = 24;
    doc.fontSize(titleFontSize);
    const textWidth = doc.widthOfString(deck.title);
    const x = (width - textWidth) / 2;
    const y = (height - titleFontSize) / 2;
    doc.text(deck.title, x, y);

    // Slides
    deck.slides.forEach((slide) => {
      doc.addPage().fontSize(20).text(slide.title);

      doc.moveDown().fontSize(12).text(slide.content);

      if (slide.speakerNotes) {
        doc
          .addPage()
          .fontSize(14)
          .fillColor('gray')
          .text('Speaker Notes:', { underline: true });
        doc.moveDown().fontSize(10).text(slide.speakerNotes);
      }
    });

    doc.end();
    await new Promise((resolve) => bufferStream.on('finish', resolve));
    return bufferStream.getContents() as Buffer;
  }

  /**
   * Generate PPTX buffer for a given deck
   */
  async toPptx(deckId: string): Promise<Buffer> {
    const deck = await this.deckService.findOne('', deckId);
    if (!deck) throw new NotFoundException('Deck not found');

    const pptx = new PptxGenJS();
    // Cover slide
    let slide = pptx.addSlide();
    slide.addText(deck.title, {
      x: 1.5,
      y: 1.5,
      fontSize: 36,
      align: 'center',
    });

    // Slides
    deck.slides.forEach((s) => {
      const sld = pptx.addSlide();
      sld.addText(s.title, { x: 0.5, y: 0.5, fontSize: 28 });
      sld.addText(s.content, { x: 0.5, y: 1.5, fontSize: 18 });
      if (s.speakerNotes) {
        sld.addNotes(s.speakerNotes);
      }
    });

    // Write as node buffer
    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    return buffer as Buffer;
  }
}
