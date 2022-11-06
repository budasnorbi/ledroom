import { createLedsColorsArr } from "../../helpers/createLedsColorsArr";
import { EffectService } from "../Effect/effect.service";
import { Injectable } from "@nestjs/common";
import { Region } from "@ledroom2/models";
import { UdpService } from "../Udp/udp.service";
import { Server } from "socket.io";
import { fixColorOrder } from "../../helpers/fixLedColorOrder";
import { SongsRepository } from "../../repositories/Songs.repository";
import { Song } from "@ledroom2/models";

@Injectable()
export class LedService {
  private ledFrameIntervalID: undefined | NodeJS.Timeout;
  private fps = 60;
  private musicTime = 0;
  private blackBuffer = createLedsColorsArr([0, 0, 0]);
  private redBuffer = createLedsColorsArr([255, 0, 0]);
  private greenBuffer = createLedsColorsArr([0, 255, 0]);
  private blueBuffer = createLedsColorsArr([0, 0, 255]);
  private whiteBuffer = createLedsColorsArr([255, 255, 255]);

  private wholeRange: [number, number] = [0, 826];
  private agyFalRange: [number, number] = [75, 306];
  private ablakFalRange: [number, number] = [307, 493];
  private kanapeFalRange: [number, number] = [494, 681];
  private butonFalRange: [number, number] = [682, 780];
  private butorKilogasFalRange: [number, number] = [780, 815];
  private ajtoFalRange: [number, number] = [816, 74];
  private currentFrame: number[];
  regions: Region[];
  private song: Song | null;

  constructor(
    private udpService: UdpService,
    private effectService: EffectService,
    private songsRepository: SongsRepository
  ) {
    // const ledColors = this.effectService.step({
    //   ledColor: this.blackBuffer,
    //   barColor: [0, 0, 255],
    //   clipLed: [0, 0, 0],
    //   barCount: 50,
    //   direction: "left",
    //   speed: 1000 / 60,
    //   range: this.w1
    // })
  }

  handleSocketAfterInit(socket: Server) {
    const colors = createLedsColorsArr([0, 0, 0], this.wholeRange);
    const fixedColors = fixColorOrder(colors);

    /*     setTimeout(() => {
      const colors = createLedsColorsArr([0, 0, 0], this.wholeRange)
      const fixedColors = fixColorOrder(colors)
      socket.emit("frame", colors)
      this.udpService.sendData(fixedColors)
    }, 1500) */

    socket.emit("frame", colors);
    this.udpService.sendData(fixedColors);
  }

  updateTime(time: number) {
    this.musicTime = time;
  }

  async start(time: number, socket: Server) {
    this.song = await this.songsRepository.getSelectedSong();
    this.updateTime(time);

    if (!this.ledFrameIntervalID) {
      const fpsTick = () => {
        const colors = this.songEffect(this.song.regions, this.musicTime);

        socket.emit("frame", colors);
        this.udpService.sendData(fixColorOrder(colors));
      };

      this.ledFrameIntervalID = setInterval(fpsTick, 1000 / this.fps);
    }
  }

  private x = 0;

  songEffect(regions: Region[], time: number) {
    let ledColors = this.blackBuffer;

    /* for (let i = 0; i < regions.length; i++) {
      if (time >= regions[i].startTime && time <= regions[i].endTime) {
        const region = regions[i]
        for (let k = 0; k < region.effects.length; k++) {
          const effect = region.effects[k]

          ledColors = this.effectService.step({
            ledColors: effect.ledColors,
            barColor: effect.barColor,
            clipLed: effect.clipColor,
            barCount: effect.barCount,
            direction: effect.direction,
            speed: effect.speed
          })
        }
      }
    } */

    // ledColors = this.effectService.blink({
    //   currentColorOrLed: ledColors,
    //   toColor: [0, 0, 255],
    //   watchOnlyColored: true,
    //   duration: 1
    // })

    return ledColors;
  }

  stop() {
    this.clearIntervals();
  }

  seek(time: number, socket: Server) {
    this.updateTime(time);
    this.clearIntervals();
    this.effectService.clearInternals();

    const colors = this.songEffect(this.song.regions, this.musicTime);

    socket.emit("frame", colors);
    this.udpService.sendData(fixColorOrder(colors));
  }

  reset() {
    this.song = null;
    this.regions = [];
    this.clearIntervals();
    this.musicTime = 0;
  }

  private clearIntervals() {
    clearInterval(this.ledFrameIntervalID);
    this.ledFrameIntervalID = undefined;
  }

  public updateRegions(regions: Region[]) {
    this.regions = regions;
  }
}
