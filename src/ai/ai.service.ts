// Enhanced ai.service.ts that ensures complete PowerPoint-ready slides
import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { GenerateOutlineDto, SlideOutlineDto } from './dto';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async extractTextFromFile(file: Express.Multer.File): Promise<string> {
    if (file.mimetype === 'application/pdf') {
      const data = await pdf(file.buffer);
      return data.text;
    } else if (
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    }
    throw new Error('Unsupported file type');
  }

  async generateOutline(input: GenerateOutlineDto): Promise<SlideOutlineDto[]> {
    // Build comprehensive context
    const context = [
      `Company: ${input.company}`,
      `Industry: ${input.industry}`,
      `Problem: ${input.problem}`,
      `Solution: ${input.solution}`,
    ];

    // Add optional fields if provided
    if (input.tagline) context.push(`Tagline: ${input.tagline}`);
    if (input.elevatorPitch)
      context.push(`Elevator Pitch: ${input.elevatorPitch}`);
    if (input.targetCustomer)
      context.push(`Target Customer: ${input.targetCustomer}`);
    if (input.differentiator)
      context.push(`Key Differentiator: ${input.differentiator}`);
    if (input.businessModel)
      context.push(`Business Model: ${input.businessModel}`);
    if (input.financials) context.push(`Financials: ${input.financials}`);
    if (input.goal) context.push(`Funding Goal: ${input.goal}`);

    const slideCount = input.slideCount || 10;

    const system = `
You are an expert pitch deck strategist creating professional PowerPoint presentations. 

CRITICAL REQUIREMENTS:
1. Respond with ONLY a valid JSON array - no markdown, no explanations
2. Every slide MUST have comprehensive speaker notes (minimum 3-4 sentences)
3. Every slide MUST have multiple image suggestions (3-5 options)
4. Content must be PowerPoint-optimized with proper hierarchy

Required JSON format for each slide:
{
  "title": "Compelling slide title (max 60 characters)",
  "content": "Well-structured content with bullet points using • symbol. Include specific data, percentages, or examples where relevant.",
  "imagePrompt": "Primary detailed description for professional image generation",
  "imageSuggestions": [
    "Alternative image concept 1",
    "Alternative image concept 2", 
    "Alternative image concept 3",
    "Alternative image concept 4"
  ],
  "speakerNotes": "Comprehensive speaker notes with key talking points, context, examples, and potential investor questions to address. Minimum 3-4 sentences with actionable presentation guidance.",
  "slideType": "title_slide|content|two_column|image_focus|chart|closing",
  "exportHints": {
    "layout": "title_and_content|two_content|title_only|content_with_caption",
    "imagePosition": "right|left|top|bottom|center",
    "emphasize": "title|content|image|balanced",
    "hasChart": false,
    "chartType": "bar|line|pie|none"
  }
}

Content Guidelines:
- Use bullet points with • symbol for lists
- Include specific numbers, percentages, market data
- Keep bullet points concise but informative (2-3 lines max each)
- Structure content for professional presentation delivery
- Add call-out boxes or key statistics where relevant

Speaker Notes Requirements:
- Explain the slide's purpose and key message
- Provide context and background information
- Include specific examples or anecdotes to share
- Anticipate and address potential investor questions
- Suggest smooth transitions to next slides
- Include timing guidance (2-3 minutes per slide)

Image Suggestions Requirements:
- Provide 3-5 different visual concepts per slide
- Include both conceptual and data-driven options
- Consider professional business imagery
- Suggest charts, infographics, or diagrams where appropriate
- Ensure images support the narrative flow
`;

    const user = `
Create a ${slideCount}-slide investor pitch deck for:
${context.join('\n')}

ENSURE EVERY SLIDE HAS:
✓ Comprehensive speaker notes (minimum 3-4 sentences)
✓ Multiple image suggestions (3-5 options)
✓ Rich content with specific data points
✓ Professional PowerPoint structure

Focus on investor-grade content with clear value propositions and compelling narratives.
`;

    try {
      const resp = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: system.trim() },
          { role: 'user', content: user.trim() },
        ],
        temperature: 0.7,
        max_tokens: 6000, // Increased for comprehensive content
      });

      const text = resp.choices[0].message.content!;
      console.log('Enhanced AI Response Length:', text.length);

      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanedText) as SlideOutlineDto[];

      if (!Array.isArray(parsed)) {
        throw new Error('AI response is not an array');
      }

      // Validate and enhance slides to ensure all requirements are met
      const processedSlides = parsed.map((slide, index) =>
        this.ensureCompleteSlide(slide, index, input),
      );

      console.log(
        `Successfully generated ${processedSlides.length} complete PowerPoint slides`,
      );
      return processedSlides;
    } catch (error) {
      console.error('Enhanced AI Generation Error:', error);
      return this.generateEnhancedFallbackSlides(input);
    }
  }

  /**
   * Ensure every slide has all required elements for PowerPoint
   */
  private ensureCompleteSlide(
    slide: any,
    index: number,
    input: GenerateOutlineDto,
  ): SlideOutlineDto {
    // Ensure speaker notes exist and are comprehensive
    const speakerNotes =
      slide.speakerNotes ||
      this.generateComprehensiveSpeakerNotes(slide, index, input);

    // Ensure image suggestions exist (3-5 options)
    const imageSuggestions =
      slide.imageSuggestions && slide.imageSuggestions.length >= 3
        ? slide.imageSuggestions
        : this.generateImageSuggestions(slide, index);

    // Ensure primary image prompt exists
    const imagePrompt =
      slide.imagePrompt ||
      imageSuggestions[0] ||
      this.getDefaultImagePrompt(slide.title);

    return {
      title: slide.title || `Slide ${index + 1}`,
      content: slide.content || 'Slide content here.',
      imagePrompt,
      imageSuggestions,
      imageUrl: '', // Will be populated when images are generated
      speakerNotes,
      slideType: slide.slideType || 'content',
      exportHints: slide.exportHints || {
        layout: 'title_and_content',
        imagePosition: 'right',
        emphasize: 'balanced',
        hasChart: false,
        chartType: 'none',
      },
      layout: {
        type: slide.slideType || 'content',
        hasImage: true, // Always enable images for PowerPoint
        imagePosition: slide.exportHints?.imagePosition || 'right',
      },
    };
  }

  /**
   * Generate comprehensive speaker notes for effective presentation delivery
   */
  private generateComprehensiveSpeakerNotes(
    slide: any,
    index: number,
    input: GenerateOutlineDto,
  ): string {
    const title = slide.title || `Slide ${index + 1}`;
    const baseNotes: string[] = [];

    // Opening context
    baseNotes.push(`**Slide ${index + 1}: ${title}**`);

    // Key message and purpose
    if (title.toLowerCase().includes('problem')) {
      baseNotes.push(
        `Start by establishing the pain point that ${input.company} addresses. Use specific examples from your target market to make this relatable. `,
        `Quantify the problem with market data or customer feedback. `,
        `Transition by saying: "This widespread challenge creates a significant opportunity for innovation."`,
      );
    } else if (title.toLowerCase().includes('solution')) {
      baseNotes.push(
        `Clearly explain how ${input.company}'s approach uniquely solves the established problem. `,
        `Highlight your key differentiators and why existing solutions fall short. `,
        `Use concrete examples or case studies to demonstrate effectiveness. `,
        `Address the question: "Why is your solution 10x better than alternatives?"`,
      );
    } else if (title.toLowerCase().includes('market')) {
      baseNotes.push(
        `Present compelling market size data (TAM, SAM, SOM) with credible sources. `,
        `Explain market trends that favor your solution and timing. `,
        `Identify your beachhead market and expansion strategy. `,
        `Anticipate questions about market competition and your positioning.`,
      );
    } else if (title.toLowerCase().includes('business model')) {
      baseNotes.push(
        `Walk through your revenue streams and pricing strategy clearly. `,
        `Explain unit economics and path to profitability. `,
        `Compare your model to successful companies in adjacent markets. `,
        `Be prepared to defend your assumptions and discuss scalability.`,
      );
    } else if (title.toLowerCase().includes('team')) {
      baseNotes.push(
        `Introduce key team members and highlight relevant experience. `,
        `Explain why this team is uniquely positioned to execute this vision. `,
        `Mention advisors, board members, or key hires that add credibility. `,
        `Address any obvious gaps and your hiring roadmap.`,
      );
    } else if (
      title.toLowerCase().includes('funding') ||
      title.toLowerCase().includes('investment')
    ) {
      baseNotes.push(
        `Clearly state your funding ask and use of funds breakdown. `,
        `Explain key milestones you'll achieve with this investment. `,
        `Discuss your exit strategy and potential returns for investors. `,
        `Be ready for questions about valuation and terms.`,
      );
    } else {
      baseNotes.push(
        `Focus on the key message of this slide and how it supports your overall narrative. `,
        `Provide specific examples and data to support your claims. `,
        `Connect this slide to your overall business strategy and vision. `,
        `Prepare for follow-up questions about implementation and timeline.`,
      );
    }

    // Timing and transition guidance
    baseNotes.push(
      `**Timing:** 2-3 minutes. **Transition:** Connect to next slide by [specific bridge statement].`,
    );

    return baseNotes.join('\n');
  }

  /**
   * Generate multiple image suggestions for each slide
   */
  private generateImageSuggestions(slide: any, index: number): string[] {
    const title = (slide.title || '').toLowerCase();

    if (title.includes('problem') || title.includes('challenge')) {
      return [
        'Business challenge infographic with icons and statistics',
        'Before/after comparison showing current pain points',
        'Market research data visualization with charts',
        'Customer frustration journey map or workflow diagram',
        'Industry pain points illustrated with professional graphics',
      ];
    } else if (title.includes('solution')) {
      return [
        'Product demo screenshot or interface mockup',
        'Solution architecture diagram with clear flow',
        'Before/after transformation visual comparison',
        'Technology stack illustration with modern design',
        'Innovation concept with lightbulb and gears imagery',
      ];
    } else if (title.includes('market') || title.includes('opportunity')) {
      return [
        'Market size visualization with TAM/SAM/SOM breakdown',
        'Geographic market expansion map with growth indicators',
        'Industry growth trends chart with projections',
        'Competitive landscape positioning matrix',
        'Market timing diagram showing opportunity window',
      ];
    } else if (title.includes('business model') || title.includes('revenue')) {
      return [
        'Revenue streams flowchart with multiple channels',
        'Unit economics breakdown with key metrics',
        'Pricing strategy comparison table',
        'Business model canvas or framework diagram',
        'Financial projections chart with growth trajectory',
      ];
    } else if (title.includes('team')) {
      return [
        'Professional team photos with roles and experience',
        'Organizational chart with key positions',
        'Team expertise matrix showing complementary skills',
        'Advisory board and investor logos',
        'Company culture and values visual representation',
      ];
    } else if (title.includes('traction') || title.includes('growth')) {
      return [
        'Growth metrics dashboard with KPIs',
        'Customer testimonials and success stories',
        'Product milestones timeline with achievements',
        'User adoption curve with engagement metrics',
        'Partnership logos and strategic relationships',
      ];
    } else if (title.includes('funding') || title.includes('investment')) {
      return [
        'Use of funds pie chart with allocation breakdown',
        'Funding timeline with milestones and goals',
        'ROI projection chart for investors',
        'Comparable company valuations and exits',
        'Investment terms and equity structure diagram',
      ];
    } else {
      return [
        'Professional business concept illustration',
        'Data visualization chart or infographic',
        'Process flow diagram with clear steps',
        'Industry-specific imagery with modern design',
        'Abstract concept art supporting the slide theme',
      ];
    }
  }

  /**
   * Generate a single image optimized for PowerPoint presentations
   */
  async generateSlideImage(imagePrompt: string): Promise<string> {
    try {
      console.log('Generating PowerPoint-optimized image:', imagePrompt);

      const enhancedPrompt = `${imagePrompt}. Professional business presentation graphic, clean white/light background, high contrast for visibility, PowerPoint-friendly layout, corporate color scheme, 16:9 aspect ratio optimized, vector-style illustration, minimal text overlay, suitable for projection screens.`;

      const imageResponse = await this.openai.images.generate({
        model: 'dall-e-2',
        prompt: enhancedPrompt,
        size: '1024x1024',
        response_format: 'b64_json',
        n: 1,
      });

      const imageData = imageResponse.data?.[0];
      if (!imageData?.b64_json) {
        throw new Error('No base64 image data returned');
      }

      const dataUrl = `data:image/png;base64,${imageData.b64_json}`;
      console.log('Generated PowerPoint-optimized image successfully');
      return dataUrl;
    } catch (error) {
      console.error('PowerPoint image generation error:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  private getDefaultImagePrompt(slideTitle: string): string {
    const title = slideTitle.toLowerCase();

    if (title.includes('problem') || title.includes('challenge')) {
      return 'Business challenge visualization with professional icons, problem-solution concept, corporate infographic style';
    } else if (title.includes('solution')) {
      return 'Innovation and solution concept, modern technology illustration, professional business graphic with clean design';
    } else if (title.includes('market') || title.includes('opportunity')) {
      return 'Market growth visualization, global business expansion chart, professional data visualization with clean graphics';
    } else if (title.includes('team')) {
      return 'Professional business team collaboration, diverse group in corporate setting, modern office environment';
    } else if (title.includes('business model') || title.includes('revenue')) {
      return 'Business model flowchart, revenue streams visualization, financial growth concept with professional design';
    } else if (title.includes('traction') || title.includes('growth')) {
      return 'Growth metrics visualization, upward trend charts, business success indicators with professional styling';
    } else if (title.includes('funding') || title.includes('investment')) {
      return 'Investment and funding concept, financial growth visualization, professional money and charts illustration';
    } else {
      return 'Professional business concept illustration, corporate presentation graphic, modern clean design suitable for PowerPoint';
    }
  }

  private generateEnhancedFallbackSlides(
    input: GenerateOutlineDto,
  ): SlideOutlineDto[] {
    return [
      {
        title: input.company || 'Company Name',
        content: `${input.company} is revolutionizing the ${input.industry} industry.\n\n• ${input.elevatorPitch || 'Innovative solutions for market challenges'}\n• Addressing significant market opportunities with proven approach\n• Strong team and clear vision for sustainable growth\n• Positioned to capture substantial market share`,
        imagePrompt:
          'Modern corporate branding concept, professional business logo design with clean typography',
        imageSuggestions: [
          'Corporate logo and branding concept with modern design',
          'Company mission statement visual with professional typography',
          'Industry leadership positioning graphic',
          'Brand identity showcase with corporate colors',
          'Executive team introduction slide with professional photos',
        ],
        imageUrl: '',
        speakerNotes: `**Slide 1: Company Introduction**\nStart with confidence and establish your company's vision immediately. Share the elevator pitch with passion and conviction. Explain why you started this company and what drives your mission. Connect personally with the audience by sharing your "why." Be prepared to expand on your industry experience and what makes your team uniquely qualified. **Timing:** 2-3 minutes. **Transition:** "Let me show you the significant problem we're solving..."`,
        slideType: 'title_slide',
        exportHints: {
          layout: 'title_only',
          imagePosition: 'center',
          emphasize: 'title',
          hasChart: false,
          chartType: 'none',
        },
        layout: {
          type: 'title_slide',
          hasImage: true,
          imagePosition: 'center',
        },
      },
      {
        title: 'The Problem',
        content: `${input.problem || 'Significant market challenges exist that need innovative solutions.'}\n\n• Current solutions are inadequate, expensive, or inaccessible\n• Large addressable market affected by these critical pain points\n• Growing demand for better, more efficient alternatives\n• Existing players have failed to address core user needs\n• Market timing is perfect for disruptive innovation`,
        imagePrompt:
          'Business problem illustration, market challenge visualization, professional pain points infographic',
        imageSuggestions: [
          'Market pain points infographic with statistics and icons',
          'Customer journey map showing frustration points',
          'Industry challenge visualization with data charts',
          'Before-state illustration showing current problems',
          'Market research data showing unmet needs',
        ],
        imageUrl: '',
        speakerNotes: `**Slide 2: The Problem**\nEstablish the problem clearly with specific, relatable examples. Use market data and customer research to quantify the pain. Share real customer stories or quotes that highlight frustration with current solutions. Explain why this problem matters now and why it's getting worse. Address the cost of inaction for your target market. **Timing:** 2-3 minutes. **Transition:** "Here's how we're uniquely positioned to solve this challenge..."`,
        slideType: 'content',
        exportHints: {
          layout: 'title_and_content',
          imagePosition: 'right',
          emphasize: 'content',
        },
        layout: {
          type: 'content',
          hasImage: true,
          imagePosition: 'right',
        },
      },
      {
        title: 'Our Solution',
        content: `${input.solution || 'Our innovative approach solves these challenges effectively.'}\n\n• Revolutionary technology and methodology that addresses root causes\n• Addresses core market needs directly with measurable impact\n• Scalable and sustainable approach with competitive advantages\n• Proven results with early customers and pilot programs\n• Clear differentiation from existing market alternatives`,
        imagePrompt:
          'Innovation solution concept, modern technology illustration, professional solution architecture diagram',
        imageSuggestions: [
          'Solution architecture diagram with clear workflow',
          'Product interface mockup or demo screenshot',
          'Technology innovation concept with modern graphics',
          'Before/after comparison showing transformation',
          'Solution benefits infographic with key advantages',
        ],
        imageUrl: '',
        speakerNotes: `**Slide 3: Our Solution**\nClearly articulate how your solution uniquely addresses the established problem. Walk through the key features and benefits, focusing on outcomes rather than features. Share early customer results or pilot program success stories. Explain your competitive advantages and why existing solutions can't replicate your approach. Be specific about how you measure success and impact. **Timing:** 3-4 minutes. **Transition:** "Let me show you the market opportunity this creates..."`,
        slideType: 'content',
        exportHints: {
          layout: 'title_and_content',
          imagePosition: 'right',
          emphasize: 'balanced',
        },
        layout: {
          type: 'content',
          hasImage: true,
          imagePosition: 'right',
        },
      },
    ];
  }
}
