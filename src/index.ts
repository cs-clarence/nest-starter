import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "$app.module";

export const app = NestFactory.create<NestExpressApplication>(AppModule);

async function bootstrap() {
  process.env.NEST_DEBUG = `${
    process.env.NODE_ENV?.toLowerCase() !== "production"
  }`;

  (await app).listen(3000);
}

if (import.meta.env.PROD) {
  bootstrap();
}
