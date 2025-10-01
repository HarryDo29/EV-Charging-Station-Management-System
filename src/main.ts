import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './interceptor/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- SWAGGER CONFIG ---
  const config = new DocumentBuilder()
    .setTitle('EV Charger System API Documentation') // Title of API
    .setDescription('The API description') // Description of API
    .setVersion('1.0') // Version
    // .addTag('api') // Add tag to group API
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // 'api' is the path to access, example: http://localhost:3000/api

  // --- SWAGGER CONFIG END ---

  // use Pipe at global for all controllers
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // use Interceptor at global for all controllers
  app.useGlobalInterceptors(new TransformInterceptor());
  // web port
  const port = process.env.PORT || 3000;
  // listen port
  await app.listen(port);
  // console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
