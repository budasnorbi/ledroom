import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity("songs", { schema: "ledroom" })
export class Songs {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number

  @Column("int", { name: "bpm", nullable: true, default: () => "'0'" })
  bpm: number | null

  @Column("float", {
    name: "beat_offset",
    nullable: true,
    precision: 12,
    default: () => "'0'"
  })
  beatOffset: number | null

  @Column("float", {
    name: "beat_around_end",
    nullable: true,
    precision: 12,
    default: () => "'0'"
  })
  beatAroundEnd: number | null

  @Column("text", { name: "path" })
  path: string

  @Column("tinytext", { name: "name" })
  name: string

  @Column("varchar", { name: "selected_region_id", length: 36, default: null })
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
}
