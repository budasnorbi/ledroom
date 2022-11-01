import { ApiModule } from "./modules/Api/api.module"
import { LedModule } from "./modules/Led/led.module"
import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

@Module({
  imports: [
    TypeOrmModule.forRoot({
      name: "default",
      type: "mysql",
      host: "localhost",
      port: parseInt(process.env.DB_PORT_PUBLIC),
      username: process.env.DB_ROOT_PASS,
      password: process.env.DB_ROOT_PASS,
      database: process.env.DB_NAME_BACKEND,
      synchronize: true,
      autoLoadEntities: true,
      extra: {
        decimalNumbers: true
      }
    }),
    LedModule,
    ApiModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
