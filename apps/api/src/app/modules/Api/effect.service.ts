import {
  PartialStepEffectSchema,
  StepEffectSchema,
} from "@ledroom2/validations";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { StepEffectRepository } from "../../repositories/StepEffect.repository";
import { nanoid } from "nanoid";
import { RegionsRepository } from "../../repositories/Regions.repository";

@Injectable()
export class EffectService {
  constructor(
    private stepEffectRepository: StepEffectRepository,
    private regionsRepository: RegionsRepository
  ) {}

  async addStepEffect(body: StepEffectSchema) {
    const id = nanoid();

    const newStepEffect = this.stepEffectRepository.create({ ...body, id });
    await this.stepEffectRepository.save(newStepEffect).catch((error: any) => {
      console.log(error.driverError.errno);
    });

    await this.regionsRepository
      .update({ id: body.regionId }, { stepEffect: newStepEffect })
      .catch((err) => {
        console.log(err);
      });

    return { id };
  }

  async patchStepEffect(id: string, body: PartialStepEffectSchema) {
    if (!isNaN(body.rangeEnd) && !isNaN(body.rangeStart)) {
      if (body.rangeStart >= body.rangeEnd) {
        throw new BadRequestException(
          "Range start can't be higher than rangeEnd"
        );
      }
      if (body.rangeEnd <= body.rangeStart) {
        throw new BadRequestException(
          "Range end can't be lower than range start"
        );
      }
    }

    if (!isNaN(body.rangeStart)) {
      const effect = await this.stepEffectRepository
        .findOne({
          where: { id, regionId: body.regionId },
        })
        .catch((err) => {
          console.log(err);
          throw new InternalServerErrorException();
        });

      if (!effect) {
        throw new BadRequestException(`There is no such a step effect`);
      }

      if (body.rangeStart >= effect.rangeEnd) {
        throw new BadRequestException(
          "Range start can't be higher than rangeEnd"
        );
      }
    }

    if (!isNaN(body.rangeEnd)) {
      const effect = await this.stepEffectRepository
        .findOne({
          where: { id, regionId: body.regionId },
        })
        .catch((err) => {
          console.log(err);
          throw new InternalServerErrorException();
        });

      if (!effect) {
        throw new BadRequestException(`There is no such a step effect`);
      }

      if (body.rangeEnd <= effect.rangeStart) {
        throw new BadRequestException(
          "Range end can't be lower than rangeStart"
        );
      }
    }

    const { regionId, ...restBody } = body;
    await this.stepEffectRepository
      .update({ id, regionId }, restBody)
      .catch((err) => {
        console.log(err);
        throw new InternalServerErrorException();
      });
  }
}
