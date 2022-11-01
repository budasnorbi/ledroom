import { Repository } from "typeorm"
import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm/data-source/DataSource"
import { StepEffect } from "@ledroom2/models"

@Injectable()
export class StepEffectRepository extends Repository<StepEffect> {
  constructor(dataSource: DataSource) {
    super(StepEffect, dataSource.createEntityManager())
  }
}
