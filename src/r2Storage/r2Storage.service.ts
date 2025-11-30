import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class R2StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  constructor(private readonly configService: ConfigService) {
    // Create S3Client
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('R2_API_ENDPOINT')!,
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'R2_SECRET_ACCESS_KEY',
        )!,
      },
    });
    // Get bucket name from account id
    this.bucketName = this.configService.get<string>('R2_ACCOUNT_ID')!;
  }

  // Hàm tạo pre-signed URL
  async generatePresignedUrl(
    fileName: string,
    contentType: string,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        ContentType: contentType,
      });
      // Generate presigned URL
      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 300, // 5 minutes
      });

      return presignedUrl;
    } catch (error) {
      console.error('Error generating signed URL', error);
      throw new Error('Could not generate presigned URL');
    }
  }
}
