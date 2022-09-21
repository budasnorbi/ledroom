import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm"
import { Effect } from "./Effect.entity"
import { Song } from "./Song.entity"

@Entity("regions", { schema: "ledroom" })
export class Region {
  @Column("varchar", { primary: true, length: 21 })
  id: string

  @Column()
  songId: number

  @Column("float", {
    precision: 12,
    default: () => "0"
  })
  startTime: number

  @Column("float", {
    precision: 12,
    default: () => "0"
  })
  endTime: number

  @OneToMany(() => Effect, (effect) => effect.region, {
    onDelete: "CASCADE"
  })
  effects: Effect[]

  @ManyToOne(() => Song, (song) => song.regions, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "songId" })
  song: Song
}
