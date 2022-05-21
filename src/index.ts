import { NestFactory } from "@nestjs/core";
import {
  ExpressAdapter,
  NestExpressApplication,
} from "@nestjs/platform-express";

async function bootstrap() {
  const { AppModule } = await import("$app.module");

  if (typeof process.env.NODE_ENV === "string") {
    process.env.NEST_DEBUG = `${
      process.env.NODE_ENV.toLowerCase() !== "production"
    }`;
  }

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
  );

  app.listen(3000);
}

bootstrap();
