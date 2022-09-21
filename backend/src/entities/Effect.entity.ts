import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Region } from "./Region.entity"

@Entity("effects", { schema: "ledroom" })
export class Effect {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number

  @Column()
  regionId: string

  @ManyToOne(() => Region, (region) => region.effects, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "regionId" })
  region: number
}
