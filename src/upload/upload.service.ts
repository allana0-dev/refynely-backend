// src/upload/upload.service.ts - Updated for GPT-Image-1
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private openai: OpenAI;
  private supabase: SupabaseClient;

  constructor() {
    const openaiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!openaiKey || !supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables');
    }

    this.openai = new OpenAI({ apiKey: openaiKey });
    this.supabase = createClient(supabaseUrl, supabaseKey);

    this.logger.log('Upload service initialized with GPT-Image-1 support');
  }

  async generateAndUploadImage(
    prompt: string,
    deckId: string,
    slideIndex: number,
  ): Promise<string> {
    try {
      this.logger.log(
        `Generating image for deck ${deckId}, slide ${slideIndex} using GPT-Image-1`,
      );

      // 1. Generate image using GPT-Image-1 (more cost-effective)
      const response = await this.openai.images.generate({
        model: 'dall-e-2',
        prompt: `${prompt}. Professional business style, clean and modern, suitable for investor presentation.`,
        size: '1024x1024',
        response_format: 'b64_json',
        n: 1,
      });

      const imageData = response.data?.[0];
      if (!imageData?.b64_json) {
        throw new Error('Failed to generate image - no base64 data returned');
      }

      this.logger.log(
        'Image generated successfully with GPT-Image-1, uploading to Supabase...',
      );

      // 2. Convert base64 to buffer
      const imageBuffer = Buffer.from(imageData.b64_json, 'base64');

      // 3. Upload to Supabase Storage
      const fileName = `decks/${deckId}/slides/${slideIndex}/image-${Date.now()}.png`;

      const { data, error } = await this.supabase.storage
        .from('pitch-deck-images')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (error) {
        this.logger.error('Supabase upload error:', error);
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      // 4. Get the public URL
      const { data: publicUrlData } = this.supabase.storage
        .from('pitch-deck-images')
        .getPublicUrl(data.path);

      this.logger.log(
        `Image uploaded successfully: ${publicUrlData.publicUrl}`,
      );
      return publicUrlData.publicUrl;
    } catch (error) {
      this.logger.error('Error generating and uploading image:', error);
      throw new Error(`Failed to generate and upload image: ${error.message}`);
    }
  }

  /**
   * Handle base64 images from GPT-Image-1 (alternative to uploading to Supabase)
   */
  async generateBase64Image(prompt: string): Promise<string> {
    try {
      this.logger.log('Generating base64 image with GPT-Image-1');

      const response = await this.openai.images.generate({
        model: 'dall-e-2',
        prompt: `${prompt}. Professional business style, clean and modern, suitable for investor presentation.`,
        size: '1024x1024',
        response_format: 'b64_json',
        n: 1,
      });

      const imageData = response.data?.[0];
      if (!imageData?.b64_json) {
        throw new Error('Failed to generate image - no base64 data returned');
      }

      // Return as data URL (can be used directly in HTML)
      const dataUrl = `data:image/png;base64,${imageData.b64_json}`;
      this.logger.log('Base64 image generated successfully');
      return dataUrl;
    } catch (error) {
      this.logger.error('Error generating base64 image:', error);
      throw new Error(`Failed to generate base64 image: ${error.message}`);
    }
  }

  /**
   * Upload base64 image to Supabase (for when you want to convert data URLs to permanent URLs)
   */
  async uploadBase64Image(
    base64Data: string,
    deckId: string,
    slideIndex: number,
  ): Promise<string> {
    try {
      // Extract base64 data from data URL
      const base64String = base64Data.replace(
        /^data:image\/[a-z]+;base64,/,
        '',
      );
      const imageBuffer = Buffer.from(base64String, 'base64');

      const fileName = `decks/${deckId}/slides/${slideIndex}/image-${Date.now()}.png`;

      const { data, error } = await this.supabase.storage
        .from('pitch-deck-images')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      const { data: publicUrlData } = this.supabase.storage
        .from('pitch-deck-images')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (error) {
      this.logger.error('Error uploading base64 image:', error);
      throw new Error(`Failed to upload base64 image: ${error.message}`);
    }
  }

  async uploadExistingImage(
    imageBuffer: Buffer,
    deckId: string,
    slideIndex: number,
    contentType: string,
  ): Promise<string> {
    try {
      const extension = contentType.includes('png') ? 'png' : 'jpg';
      const fileName = `decks/${deckId}/slides/${slideIndex}/uploaded-${Date.now()}.${extension}`;

      this.logger.log(`Uploading existing image: ${fileName}`);

      const { data, error } = await this.supabase.storage
        .from('pitch-deck-images')
        .upload(fileName, imageBuffer, {
          contentType: contentType,
          upsert: true,
        });

      if (error) {
        this.logger.error('Supabase upload error:', error);
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      const { data: publicUrlData } = this.supabase.storage
        .from('pitch-deck-images')
        .getPublicUrl(data.path);

      this.logger.log(
        `Existing image uploaded successfully: ${publicUrlData.publicUrl}`,
      );
      return publicUrlData.publicUrl;
    } catch (error) {
      this.logger.error('Error uploading existing image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Skip deletion for base64 data URLs
      if (imageUrl.startsWith('data:image/')) {
        this.logger.log('Skipping deletion of base64 data URL');
        return;
      }

      // Extract file path from Supabase URL
      const urlParts = imageUrl.split(
        '/storage/v1/object/public/pitch-deck-images/',
      );
      if (urlParts.length < 2) {
        this.logger.warn(`Invalid Supabase URL format: ${imageUrl}`);
        return;
      }

      const filePath = urlParts[1];
      this.logger.log(`Deleting image: ${filePath}`);

      const { error } = await this.supabase.storage
        .from('pitch-deck-images')
        .remove([filePath]);

      if (error) {
        this.logger.error('Error deleting image from Supabase:', error);
      } else {
        this.logger.log('Image deleted successfully');
      }
    } catch (error) {
      this.logger.error('Error deleting image:', error);
      // Don't throw error for deletion failures
    }
  }
}
