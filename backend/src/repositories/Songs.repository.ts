import { Repository } from "typeorm"
import { Song } from "@entities/Song.entity"
import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm/data-source/DataSource"
import { SongsWithRelation } from "@type/db-response"

@Injectable()
export class SongsRepository extends Repository<Song> {
  constructor(dataSource: DataSource) {
    super(Song, dataSource.createEntityManager())
  }

  async getSongs(): Promise<SongsWithRelation[]> {
    return this.find({
      select: [
        "id",
        "bpm",
        "beatOffset",
        "beatAroundEnd",
        "name",
        "selectedRegionId",
        "lastTimePosition",
        "volume"
      ],
      relations: ["regions", "regions.effects"]
    }) as any
  }

  async getSelectedSongId(): Promise<number | null> {
    const song = await this.findOne({ where: { selected: true } })

    if (!song) {
      return null
    }

    return song.id
  }
}
