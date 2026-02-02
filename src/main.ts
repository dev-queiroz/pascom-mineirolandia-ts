import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: ['https://pascompnsps.vercel.app/', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger personalizado
  const config = new DocumentBuilder()
    .setTitle('PASCOM API - Pastoral da Comunicação')
    .setDescription(
      'API completa do sistema PASCOM (autenticação, usuários, eventos/escalas, financeiro, dashboard, PDF, ICS, WhatsApp). ' +
        'Todas rotas protegidas por JWT. Admin requer funcao = "admin". ' +
        'Ambiente: NestJS 11 + Prisma 5.18.0 + Neon PostgreSQL + Render.',
    )
    .setVersion('1.0.0')
    .setContact(
      'Douglas',
      'https://github.com/dev-queiroz',
      'douglas@example.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido em POST /auth/login',
      },
      'JWT',
    )
    .addTag('auth', 'Autenticação e perfil')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('events', 'Eventos e escalas')
    .addTag('financial', 'Financeiro e contribuições')
    .addTag('dashboard', 'Dashboard admin')
    .addTag('pdf', 'Geração de PDF')
    .addTag('extras', 'ICS e WhatsApp')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => {
      return `${controllerKey}_${methodKey}`;
    },
  });

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
    },
    customSiteTitle: 'PASCOM API Docs',
    customCss: '.swagger-ui .topbar { background-color: #2596be; }',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
