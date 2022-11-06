import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm/data-source/DataSource";
import { Region } from "@ledroom2/models";

@Injectable()
export class RegionsRepository extends Repository<Region> {
  constructor(dataSource: DataSource) {
    super(Region, dataSource.createEntityManager());
  }

  async getRegions() {
    return this.find();
  }
}
