import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity("songs", { schema: "ledroom" })
export class Songs {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number

  @Column("int", { name: "bpm", default: 0 })
  bpm?: number

  @Column("decimal", { name: "beat_offset", precision: 10, scale: 0, default: 0 })
  beatOffset?: number

  @Column("decimal", { name: "beat_around_end", precision: 10, scale: 0, default: 0 })
  beatAroundEnd?: number

  @Column("text", { name: "path" })
  path: string

  @Column("tinytext", { name: "name" })
  name: string
}
