import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { Region } from "./Region.entity"

@Entity("step_effects", { schema: "ledroom" })
export class StepEffect {
  @Column("varchar", { primary: true, length: 21 })
  id: string

  @Column()
  regionId: string

  @Column({ name: "ledColors", type: "json" })
  ledColors: number[]

  @Column({ name: "barColor", type: "json" })
  barColor: [number, number, number]

  @Column({ name: "clipColor", type: "json" })
  clipColor: [number, number, number]

  @Column({ name: "speed", type: "double", default: 1, unsigned: true })
  speed: number

  @Column({ name: "barCount", type: "smallint", default: 50, unsigned: true })
  barCount: number

  @Column({ name: "direction", type: "char", length: 5, default: "left" })
  direction: "left" | "right"

  @Column({ name: "range", type: "json" })
  range: [number]

  @ManyToOne(() => Region, (region) => region.effects, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "regionId" })
  region: number
}
