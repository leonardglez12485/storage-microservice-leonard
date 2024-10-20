import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

const PORT = process.env.PORT || 3005;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const log = new Logger('Bootstrap');
  const config = new DocumentBuilder()
    .setTitle('Image Repository')
    .setDescription('A repository of images in Firebase')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  document.tags = [
    { name: 'Authorize', description: 'Authorization related endpoints' },
    ...document.tags.filter((tag) => tag.name !== 'Authorize'),
  ];
  SwaggerModule.setup('api', app, document);
  await app.listen(PORT);
  log.log(`Server running on port: ${PORT}`);
}
bootstrap();

