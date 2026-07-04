import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "achievements" })
export class AchievementEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  key!: string;

  @Column()
  title!: string;

  @Column({ default: "" })
  description!: string;

  @Column({ default: "" })
  iconUrl!: string;

  @Column({ default: 0 })
  coinReward!: number;

  @Column({ default: 0 })
  xpReward!: number;
}
