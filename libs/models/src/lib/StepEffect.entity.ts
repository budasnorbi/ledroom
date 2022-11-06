import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Region } from "./Region.entity";
import type { RGBColor } from "react-color";

@Entity("step_effects", { schema: "ledroom" })
export class StepEffect {
  @Column("varchar", { primary: true, length: 21 })
  id: string;

  @Column()
  regionId: string;

  @Column({ name: "ledColors", type: "json" })
  ledColors: RGBColor;

  @Column({ name: "barColor", type: "json" })
  barColor: RGBColor;

  @Column({ name: "clipColor", type: "json" })
  clipColor: RGBColor;

  @Column({ name: "speed", type: "double", default: 1, unsigned: true })
  speed: number;

  @Column({ name: "barCount", type: "smallint", default: 50, unsigned: true })
  barCount: number;

  @Column({ name: "direction", type: "char", length: 5, default: "left" })
  direction: "left" | "right";

  @Column({ name: "rangeStart", type: "smallint", unsigned: true, default: 0 })
  rangeStart: number;

  @Column({ name: "rangeEnd", type: "smallint", unsigned: true, default: 826 })
  rangeEnd: number;

  @OneToOne(() => Region, (region) => region.stepEffect, {
    cascade: true,
  })
  @JoinColumn()
  region: number;
}
