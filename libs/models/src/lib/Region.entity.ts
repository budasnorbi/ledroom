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

  @Column("varchar", { length: 21, default: null })
  selectedEffect: string | null;

  @OneToOne(() => StepEffect, (stepEffect) => stepEffect.region, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  stepEffect: null | StepEffect;

  @ManyToOne(() => Song, (song) => song.regions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "songId" })
  song: Song;
}
