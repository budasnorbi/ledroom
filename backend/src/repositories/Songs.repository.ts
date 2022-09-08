import { Repository, EntityRepository } from "typeorm"
import { Songs } from "@entities/Songs"
import { InternalServerErrorException } from "@nestjs/common"

@EntityRepository(Songs)
export class SongsRepository extends Repository<Songs> {
  getSongs() {
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
