import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { R2StorageService } from './r2Storage.service';

class GenerateUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;
}

@Controller('r2-storage')
export class R2StorageController {
  constructor(private readonly r2StorageService: R2StorageService) {}

  // Endpoint: POST /r2-storage/generate-upload-url
  @Post('generate-upload-url')
  @HttpCode(HttpStatus.OK)
  async generateUploadUrl(@Body() body: GenerateUrlDto) {
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      throw new HttpException(
        'Missing fileName or contentType',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const signedUrl = await this.r2StorageService.generatePresignedUrl(
        fileName,
        contentType,
      );
      return { signedUrl }; // Trả về cho React
    } catch (error) {
      throw new HttpException(
        (error as Error).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
