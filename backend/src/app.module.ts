import { ApiModule } from "@modules/api/api.module"
import { LedModule } from "@modules/Led/led.module"
import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

@Module({
  imports: [
    LedModule,
    ApiModule
    // TypeOrmModule.forRoot({
    //   name: "default",
    //   type: "mysql",
    //   host: "db",
    //   port: parseInt(process.env.DB_PORT_CONTAINER),
    //   username: process.env.DB_USER_BACKEND,
    //   password: process.env.DB_PASS_BACKEND,
    //   database: process.env.DB_NAME_BACKEND,
    //   synchronize: false,
    //   autoLoadEntities: true
    // })
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
