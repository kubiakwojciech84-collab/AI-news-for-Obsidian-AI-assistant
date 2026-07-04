import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "npcs" })
export class NpcEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  gameId!: string;

  @Column()
  name!: string;

  @Column("text")
  persona!: string;

  @Column({ type: "varchar", nullable: true })
  questId!: string | null;

  @Column({ default: "root" })
  spawnNodeId!: string;
}
