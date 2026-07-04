import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { AchievementEntity } from "./achievement.entity";

@Entity({ name: "user_achievements" })
export class UserAchievementEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: UserEntity;

  @Column()
  userId!: string;

  @ManyToOne(() => AchievementEntity, { eager: true })
  @JoinColumn({ name: "achievementId" })
  achievement!: AchievementEntity;

  @Column()
  achievementId!: string;

  @CreateDateColumn()
  unlockedAt!: Date;
}
