import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

let server: any;

async function bootstrap() {
  const app = express();

  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(app));

  await nestApp.init();

  server = serverlessExpress({ app });
}

export const handler = async (event: any, context: any) => {
  if (!server) {
    await bootstrap();
  }
  return server(event, context);
};
