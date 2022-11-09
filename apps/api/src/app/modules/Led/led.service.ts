import { createLedsColorsArr } from "../../utils/createLedsColorsArr";
import { EffectService } from "../Effect/effect.service";
import { Injectable } from "@nestjs/common";
import { Region } from "@ledroom2/models";
import { UdpService } from "../Udp/udp.service";
import { Server } from "socket.io";
import { fixColorOrder } from "../../utils/fixLedColorOrder";
import { SongsRepository } from "../../repositories/Songs.repository";
import { RegionWithRelation, SongsWithRelation } from "@ledroom2/types";
import { rgba2rgb } from "../../utils/rgbaToRgb";

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

  private wholeRange: [number, number] = [0, 900];
  private agyFalRange: [number, number] = [75, 306];
  private ablakFalRange: [number, number] = [307, 493];
  private kanapeFalRange: [number, number] = [494, 681];
  private butonFalRange: [number, number] = [682, 780];
  private butorKilogasFalRange: [number, number] = [780, 815];
  private ajtoFalRange: [number, number] = [816, 74];
  private currentFrame: number[];
  regions: Region[];
  private song: SongsWithRelation | null;

  constructor(
    private udpService: UdpService,
    private effectService: EffectService,
    private songsRepository: SongsRepository
  ) {}

  async handleSocketAfterInit(socket: Server) {
    await this.renderEffectChange(socket);
  }

  updateTime(time: number) {
    this.musicTime = time;
  }

  async start(time: number, socket: Server) {
    await this.syncSongDetails();
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

  songEffect(regions: RegionWithRelation[], time: number) {
    let ledColors = this.blackBuffer;

    for (let i = 0; i < regions.length; i++) {
      if (time >= regions[i].startTime && time <= regions[i].endTime) {
        const region = regions[i];
        if (region.stepEffect) {
          const effect = region.stepEffect;

          return this.effectService.step({
            ledColors,
            barColor: effect.barColor,
            clipColor: effect.clipColor,
            barCount: effect.barCount,
            direction: effect.direction,
            speed: 1000 / 60 / effect.speed,
            rangeStart: effect.rangeStart,
            rangeEnd: effect.rangeEnd,
          });
        }
      }
    }

    return ledColors;
  }

  stop() {
    this.clearIntervals();
  }

  async seek(time: number, socket: Server) {
    this.updateTime(time);
    this.clearIntervals();
    this.effectService.clearInternals();

    this.renderEffectChange(socket);
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

  async syncSongDetails() {
    this.song =
      (await this.songsRepository.getSelectedSong()) as SongsWithRelation;
  }

  async renderEffectChange(socket: Server) {
    await this.syncSongDetails();
    const colors = this.songEffect(this.song.regions, this.musicTime);

    socket.emit("frame", colors);
    this.udpService.sendData(fixColorOrder(colors));
  }
}
