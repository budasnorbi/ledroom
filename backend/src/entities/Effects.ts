import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Songs } from "./Songs"

@Index("region_id", ["regionId"], {})
@Entity("effects", { schema: "ledroom" })
export class Effects {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number

  @Column("int", { name: "effect_id" })
  effectId: number

  @Column("int", { name: "region_id", nullable: true })
  regionId: number | null

  @ManyToOne(() => Songs, (songs) => songs.effects, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION"
  })
  @JoinColumn([{ name: "region_id", referencedColumnName: "id" }])
  region: Songs
}
