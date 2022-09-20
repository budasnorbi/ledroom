import { Column, Entity, ManyToOne, OneToMany } from "typeorm"
import { Effect } from "./Effect.entity"
import { Song } from "./Song.entity"

@Entity("regions", { schema: "ledroom" })
export class Region {
  @Column("varchar", { primary: true, name: "id", length: 21 })
  id: string

  @ManyToOne(() => Song, (song) => song.regions)
  song: number

  @Column("float", {
    name: "start_time",
    precision: 12,
    default: () => "'0'"
  })
  startTime: number

  @Column("float", {
    name: "end_time",
    precision: 12,
    default: () => "'0'"
  })
  endTime: number

  @OneToMany(() => Effect, (effect) => effect.region, {
    onDelete: "CASCADE"
  })
  effects: Effect[]
}
