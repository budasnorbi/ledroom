import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { Song } from "./Song.entity";
import { StepEffect } from "./StepEffect.entity";

@Entity("regions", { schema: "ledroom" })
export class Region {
  @Column("varchar", { primary: true, length: 21 })
  id: string;

  @Column("varchar", { default: () => "''" })
  name: string;

  @Column()
  songId: number;

  @Column("float", {
    precision: 12,
    default: () => "0",
  })
  startTime: number;

  @Column("float", {
    precision: 12,
    default: () => "0",
  })
  endTime: number;

  @OneToOne(() => StepEffect, (stepEffect) => stepEffect.region, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  stepEffect: null | StepEffect;

  @ManyToOne(() => Song, (song) => song.regions, {
    onDelete: "CASCADE",
    cascade: true,
  })
  @JoinColumn({ name: "songId" })
  song: Song;
}
