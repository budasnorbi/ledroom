import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm"
import { Songs } from "./Songs"

@Index("song_id", ["songId"], {})
@Entity("regions", { schema: "ledroom" })
export class Regions {
  @Column("varchar", { primary: true, name: "id", length: 36 })
  id: string

  @Column("int", { name: "song_id", nullable: true })
  songId: number | null

  @Column("float", {
    name: "start_time",
    nullable: true,
    precision: 12,
    default: () => "'0'"
  })
  startTime: number | null

  @Column("float", {
    name: "end_time",
    nullable: true,
    precision: 12,
    default: () => "'0'"
  })
  endTime: number | null

  @ManyToOne(
    () => Songs /*, (songs) => songs.regions, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION"
  }*/
  )
  @JoinColumn([{ name: "song_id", referencedColumnName: "id" }])
  song: Songs
}
