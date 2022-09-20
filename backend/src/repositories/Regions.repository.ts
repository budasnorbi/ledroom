import { Repository } from "typeorm"
import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm/data-source/DataSource"
import { Region } from "@entities/Region.entity"

@Injectable()
export class RegionsRepository extends Repository<Region> {
  constructor(dataSource: DataSource) {
    super(Region, dataSource.createEntityManager())
  }

  async getRegions() {
    return this.find()
  }

  async getRegionsBySongId(songId: number) {
    return this.find({ where: { song: songId } })
  }
}
