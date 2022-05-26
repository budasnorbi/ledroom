import { Injectable } from "@nestjs/common"
import { LedService } from "../Led/led.service"

@Injectable()
export class ApiService {
  constructor(private ledService: LedService) {}
}
