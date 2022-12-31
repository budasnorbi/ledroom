import { ApiModule } from "./modules/Api/api.module"
import { LedModule } from "./modules/Led/led.module"
import { Module } from "@nestjs/common"

@Module({
  imports: [LedModule, ApiModule]
})
export class AppModule {}
