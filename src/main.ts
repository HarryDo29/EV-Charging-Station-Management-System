import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- BẮT ĐẦU PHẦN CẤU HÌNH SWAGGER ---

  const config = new DocumentBuilder()
    .setTitle('EV Charger System API Documentation') // Tiêu đề của API
    .setDescription('The API description') // Mô tả
    .setVersion('1.0') // Phiên bản
    // .addTag('api') // Thêm tag để gom nhóm API
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // 'api' là đường dẫn để truy cập, ví dụ: http://localhost:3000/api

  // --- KẾT THÚC PHẦN CẤU HÌNH SWAGGER ---
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
