import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Region } from "./Region.entity"

@Entity("songs", { schema: "ledroom" })
export class Song {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number

  @Column("int", { name: "bpm", default: () => "'0'" })
  bpm: number

  @Column("float", {
    name: "beat_offset",
    precision: 12,
    default: () => "'0'"
  })
  beatOffset: number

  @Column("float", {
    name: "beat_around_end",
    precision: 12,
    default: () => "'0'"
  })
  beatAroundEnd: number

  @Column("text", { name: "path" })
  path: string

  @Column("tinytext", { name: "name" })
  name: string

  @Column("varchar", { name: "selected_region_id", nullable: true, length: 21 })
  selectedRegionId: string | null

  @Column("float", {
    name: "last_time_position",
    nullable: true,
    precision: 12,
    default: () => "'0'"
  })
  lastTimePosition: number | null

  @Column("float", {
    name: "volume",
    nullable: true,
    precision: 12,
    default: () => "'0.1'"
  })
  volume: number | null

  @Column("tinyint", {
    name: "selected",
    nullable: true,
    width: 1,
    default: () => "'0'"
  })
  selected: boolean | null

  @OneToMany(() => Region, (regions) => regions.song, {
    onDelete: "CASCADE"
  })
  regions: Region[]
}
