import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('EV Charging Station API') // Tên dự án
    .setDescription('API documentation for EV Charging System') // Mô tả
    .setVersion('1.0') // Phiên bản
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // Đây là tên tham chiếu (security name)
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  //use cookie parser at global for all controllers
  app.use(cookieParser());
  // // use cors at global for all controllers
  app.use(
    cors({
      origin: [
        'http://localhost:5173',
        'https://accounts.google.com',
        'https://harydo.xyz',
      ],
      credentials: true,
    }),
  );
  // use Pipe at global for all controllers
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // use Interceptor at global for all controllers
  app.useGlobalInterceptors(new TransformInterceptor());
  // web port
  const port = process.env.PORT || 3000;
  // listen port
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
