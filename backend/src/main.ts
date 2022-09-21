import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {})

  app.enableCors({
    origin: [process.env.FRONTEND_DOMAIN_FROM_PUBLIC],
    allowedHeaders: ["content-type"],
    credentials: true
  })

  await app.listen(process.env.BACKEND_PORT_CONTAINER)
}
bootstrap()
