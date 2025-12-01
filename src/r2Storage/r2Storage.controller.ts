import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { R2StorageService } from './r2Storage.service';

class GenerateUrlDto {
  /**
   * Name of the file to upload
   * @example "avatar.jpg"
   */
  @IsString()
  @IsNotEmpty()
  fileName: string;

  /**
   * MIME type of the file
   * @example "image/jpeg"
   */
  @IsString()
  @IsNotEmpty()
  contentType: string;
}

@ApiTags('R2 Storage')
@Controller('r2-storage')
export class R2StorageController {
  constructor(private readonly r2StorageService: R2StorageService) {}

  @Post('generate-upload-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a presigned URL for file upload to R2 storage' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated successfully' })
  @ApiResponse({ status: 400, description: 'Missing fileName or contentType' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
