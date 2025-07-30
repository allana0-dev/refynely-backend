// ai.service.ts
import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Extract text from PDF or DOCX buffer.
   */
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

  /**
   * Generate deck outline from either structured inputs or a free-form description.
   */
  async generateDeckOutline(input: {
    company?: string;
    industry?: string;
    problem?: string;
    solution?: string;
    businessModel?: string;
    financials?: string;
    description?: string;
  }): Promise<string> {
    let prompt: string;
    if (input.description) {
      prompt = `
Extract key business details (Company, Industry, Problem, Solution, Business Model, Financials) from the following text, then generate a pitch deck outline as a JSON array of {title, description} slides:

${input.description}
`;
    } else {
      prompt = `Generate a startup pitch deck outline for:
- Company: ${input.company}
- Industry: ${input.industry}
- Problem: ${input.problem}
- Solution: ${input.solution}
${input.businessModel ? `- Business Model: ${input.businessModel}` : ''}
${input.financials ? `- Financials: ${input.financials}` : ''}

Return a JSON array of slide titles and brief descriptions.`;
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt.trim() }],
    });
    return response.choices[0].message.content!;
  }

  /**
   * Refine slide content based on feedback.
   */
  async refineSlide(
    title: string,
    content: string,
    feedback: string,
  ): Promise<string> {
    const prompt = `Refine the following slide based on feedback:

Title: ${title}
Content: ${content}
Feedback: ${feedback}

Return the improved content and speaker notes.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content!;
  }
}
