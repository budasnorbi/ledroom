import { LedService } from "@modules/Led/led.service"
import { Logger } from "@nestjs/common"
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { ApiService } from "./api.service"

@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
export class ApiGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(private readonly appService: ApiService, private readonly ledService: LedService) {}

  private logger: Logger = new Logger("ApiGateway")

  afterInit() {
    this.logger.log("Socket Initialized")
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
  }

  @SubscribeMessage("start")
  start(@MessageBody() time: number) {
    this.ledService.start(time)
  }

  @SubscribeMessage("stop")
  stop() {
    this.ledService.stop()
  }

  @SubscribeMessage("seek")
  seek(@MessageBody() time: number) {
    this.ledService.seek(time)
  }

  @SubscribeMessage("timeupdate")
  timeUpdate(@MessageBody() time: number) {
    this.ledService.updateTime(time)
  }

  @SubscribeMessage("reset")
  reset() {
    this.ledService.reset()
  }
}
