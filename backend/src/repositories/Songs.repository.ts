import { Repository, EntityRepository } from "typeorm"
import { Songs } from "@entities/Songs"
import { InternalServerErrorException } from "@nestjs/common"

@EntityRepository(Songs)
export class SongsRepository extends Repository<Songs> {
  getSongs() {
    return this.find({ select: ["beatAroundEnd", "beatOffset", "bpm", "id", "name"] }).catch(
      (err) => {
        console.log(err)
        throw new InternalServerErrorException()
      }
    )
  }
}
