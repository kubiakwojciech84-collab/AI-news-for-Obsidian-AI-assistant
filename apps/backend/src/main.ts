import "reflect-metadata";
import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads" });
  app.enableCors({
    origin: config.get<string[]>("corsOrigins"),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix("api");

  const swaggerConfig = new DocumentBuilder()
    .setTitle("NovaWorlds API")
    .setDescription("REST API for the NovaWorlds Roblox-like platform: accounts, games catalog, social graph, economy, moderation and AI NPC dialogue.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  const port = config.get<number>("port") ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`NovaWorlds backend listening on :${port} (docs at /api/docs)`);
}

bootstrap();
