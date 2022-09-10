import { Repository } from "typeorm"
import { Songs } from "@entities/Songs"
import { Injectable, InternalServerErrorException } from "@nestjs/common"
import { DataSource } from "typeorm/data-source/DataSource"

@Injectable()
export class SongsRepository extends Repository<Songs> {
  constructor(dataSource: DataSource) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /* @ts-ignore */
    super(Songs, dataSource.createEntityManager())
  }

  async getSongs() {
    return (
      this.find()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .then((rows) => rows.map(({ path, ...rest }) => rest))
        .catch((err) => {
          console.log(err)
          throw new InternalServerErrorException()
        })
    )
  }
}
