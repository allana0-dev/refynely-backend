export class CreateSlideDto {
  title: string;
  content: string;
  speakerNotes?: string;
  orderIndex?: number;
  deckId: string;
}
