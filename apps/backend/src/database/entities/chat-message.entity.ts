import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "chat_messages" })
export class ChatMessageEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  channel!: string;

  @Column()
  fromUserId!: string;

  @Column()
  fromUsername!: string;

  @Column("text")
  body!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
