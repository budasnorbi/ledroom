import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import * as cookieParser from "cookie-parser"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {})

  app.enableCors({
    origin: [process.env.FRONTEND_DOMAIN_FROM_PUBLIC],
    allowedHeaders: ["content-type"],
    credentials: true
  })

  app.use(cookieParser())
  await app.listen(process.env.BACKEND_PORT_CONTAINER)
}
bootstrap()
