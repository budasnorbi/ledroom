import { Repository, EntityRepository } from "typeorm"
import { Songs } from "@entities/Songs"
import { InternalServerErrorException } from "@nestjs/common"

@EntityRepository(Songs)
export class SongsRepository extends Repository<Songs> {
  getAllSongName() {
    return this.find({ select: ["name", "id"] }).catch((err) => {
      console.log(err)
      throw new InternalServerErrorException()
    })
  }
}
