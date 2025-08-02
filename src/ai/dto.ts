export class GenerateOutlineDto {
  company: string;
  industry: string;
  problem: string;
  solution: string;
  businessModel?: string;
  financials?: string;
  tagline?: string;
  elevatorPitch?: string;
  targetCustomer?: string;
  differentiator?: string;
  goal?: string;
  tone: string;
  slideCount?: number;
}
export interface SimpleLayout {
  type:
    | 'title_slide'
    | 'content'
    | 'two_column'
    | 'image_focus'
    | 'chart'
    | 'closing';
  hasImage: boolean;
  imagePosition?: 'right' | 'left' | 'top' | 'bottom' | 'center' | 'none';
}
export interface ExportHints {
  layout:
    | 'title_and_content'
    | 'two_content'
    | 'title_only'
    | 'content_with_caption'
    | 'blank';
  imagePosition?:
    | 'right'
    | 'left'
    | 'top'
    | 'bottom'
    | 'background'
    | 'center'
    | 'none';
  emphasize?: 'title' | 'content' | 'image' | 'balanced';
  hasChart?: boolean;
  chartType?: 'bar' | 'line' | 'pie' | 'none';
}

export class SlideOutlineDto {
  title: string;
  content: string;
  imagePrompt?: string;
  imageUrl?: string;
  imageSuggestions?: string[];
  speakerNotes?: string;
  slideType?:
    | 'title_slide'
    | 'content'
    | 'two_column'
    | 'image_focus'
    | 'chart'
    | 'closing';
  layout?: SimpleLayout;
  exportHints?: ExportHints;
}
