import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Region } from "./Region.entity"

@Entity("songs", { schema: "ledroom" })
export class Song {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number

  @Column("int", { default: () => "0" })
  bpm: number

  @Column("float", {
    precision: 12,
    default: () => "0"
  })
  beatOffset: number

  @Column("float", {
    precision: 12,
    default: () => "0"
  })
  beatAroundEnd: number

  @Column("text")
  path: string

  @Column("tinytext")
  name: string

  @Column("varchar", { length: 21, nullable: true })
  selectedRegionId: string | null

  @Column("float", {
    precision: 12,
    default: () => "0"
  })
  lastTimePosition: number

  @Column("float", {
    precision: 12,
    default: () => "0.15"
  })
  volume: number

  @Column("boolean", {
    default: () => "0"
  })
  selected: boolean

  @OneToMany(() => Region, (regions) => regions.song, {
    onDelete: "CASCADE"
  })
  regions: Region[]
}
