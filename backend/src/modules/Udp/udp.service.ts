import { Injectable } from "@nestjs/common"
import * as dgram from "dgram"

@Injectable()
export class UdpService {
  private client: dgram.Socket = dgram.createSocket("udp4")

  public sendData(data: number[]): void {
    const dataAsBuffer = Buffer.from(data)
    for (let i = 0; i < 6; i++) {
      const slice = dataAsBuffer.slice(450 * i, 450 + 450 * i)
      this.client.send(slice, 2210, `192.168.0.5${i}`)
    }
  }
}
