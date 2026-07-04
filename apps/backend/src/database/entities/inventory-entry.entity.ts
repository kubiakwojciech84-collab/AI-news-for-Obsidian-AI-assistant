import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { ShopItemEntity } from "./shop-item.entity";

@Entity({ name: "inventory_entries" })
export class InventoryEntryEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => UserEntity, (user) => user.inventory, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: UserEntity;

  @Column()
  userId!: string;

  @ManyToOne(() => ShopItemEntity, { eager: true })
  @JoinColumn({ name: "itemId" })
  item!: ShopItemEntity;

  @Column()
  itemId!: string;

  @Column({ default: false })
  equipped!: boolean;

  @CreateDateColumn()
  acquiredAt!: Date;
}
