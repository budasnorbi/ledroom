import { NestFactory } from "@nestjs/core"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { Logger } from "@nestjs/common"
import { AppModule } from "./app/app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: [process.env.NX_CLIENT_URL]
  })

  const config = new DocumentBuilder()
    .setTitle("Ledroom api")
    .setDescription("Ledroom endpoints")
    .setVersion("1.0")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("docs", app, document)

  await app.listen(process.env.BACKEND_PORT, () => {
    Logger.log(`Backend is listening on port ${process.env.BACKEND_PORT}`)
  })
}
bootstrap()
