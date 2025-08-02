import { SimpleLayout, ExportHints } from 'src/ai/dto';

// src/deck/dto/create-deck.dto.ts - Simple and frontend-friendly
export class CreateSlideDto {
  title: string;
  content: string; // Simple string content
  imagePrompt?: string;
  imageUrl?: string;
  speakerNotes?: string;
  slideType?: string;
  layout?: SimpleLayout;
  imageSuggestions?: string[];
  exportHints?: ExportHints;
}
export class CreateDeckDto {
  title: string;
  slides?: CreateSlideDto[];
}
