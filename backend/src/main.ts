import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {})

  app.enableCors({
    origin: [process.env.FRONTEND_DOMAIN_FROM_PUBLIC],
    allowedHeaders: ["content-type"],
    credentials: true
  })

  const config = new DocumentBuilder()
    .setTitle("Ledroom api")
    .setDescription("Ledroom endpoints")
    .setVersion("1.0")
    .addTag("cats")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api", app, document)

  await app.listen(process.env.BACKEND_PORT_CONTAINER)
}
bootstrap()
