import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm"
import { Song } from "./Song.entity"
import { StepEffect } from "./StepEffect.entity"

@Entity("regions", { schema: "ledroom" })
export class Region {
  @Column("varchar", { primary: true, length: 21 })
  id: string

  @Column("varchar", { default: () => "''" })
  name: string

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

  @OneToMany(() => StepEffect, (effect) => effect.region, {
    onDelete: "CASCADE"
  })
  effects: StepEffect[]

  @ManyToOne(() => Song, (song) => song.regions, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "songId" })
  song: Song
}
