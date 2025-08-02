// src/upload/upload.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadService } from './upload.service';

@Global() // Make this module global
@Module({
  imports: [ConfigModule], // Import ConfigModule
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
