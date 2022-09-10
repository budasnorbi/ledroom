import { Repository } from "typeorm"
import { Injectable, InternalServerErrorException } from "@nestjs/common"
import { DataSource } from "typeorm/data-source/DataSource"
import { Regions } from "@entities/Regions"

@Injectable()
export class RegionsRepository extends Repository<Regions> {
  constructor(dataSource: DataSource) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /* @ts-ignore */
    super(Regions, dataSource.createEntityManager())
  }

  async getRegionsBySongId(songId: number) {
    return this.find({
      where: { songId }
    }).catch((err) => {
      console.log(err)
      throw new InternalServerErrorException()
    })
  }
}
