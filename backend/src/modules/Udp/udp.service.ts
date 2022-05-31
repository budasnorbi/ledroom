import { Injectable } from "@nestjs/common"
import * as dgram from "dgram"

@Injectable()
export class UdpService {
  private client: dgram.Socket = dgram.createSocket("udp4")

  public sendData(ledsColorsData: number[]): void {
    // Fixing rgb color order
    for (let i = 0; i < ledsColorsData.length; i += 3) {
      const red = ledsColorsData[i]
      const green = ledsColorsData[i + 1]

      ledsColorsData[i] = green
      ledsColorsData[i + 1] = red
    }
    const dataAsBuffer = Buffer.from(ledsColorsData)

    for (let i = 0; i < 6; i++) {
      const slice = dataAsBuffer.slice(450 * i, 450 + 450 * i)
      this.client.send(slice, 2210, `192.168.0.5${i}`)
    }
  }
}
