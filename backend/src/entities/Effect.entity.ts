import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Region } from "./Region.entity"

@Entity("effects", { schema: "ledroom" })
export class Effect {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number

  @ManyToOne(() => Region, (region) => region.effects)
  region: number
}
