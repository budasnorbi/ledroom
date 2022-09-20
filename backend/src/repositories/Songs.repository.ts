import { Repository } from "typeorm"
import { Song } from "@entities/Song.entity"
import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm/data-source/DataSource"

@Injectable()
export class SongsRepository extends Repository<Song> {
  constructor(dataSource: DataSource) {
    super(Song, dataSource.createEntityManager())
  }

  async getSongs(): Promise<Omit<Song, "path">[]> {
    return this.find({
      select: [
        "id",
        "bpm",
        "beatOffset",
        "beatAroundEnd",
        "name",
        "selectedRegionId",
        "lastTimePosition",
        "volume",
        "selected"
      ],
      relations: ["regions", "regions.effects"]
    })
  }
}
