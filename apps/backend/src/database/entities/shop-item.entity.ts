import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ItemCategory } from "@nova/shared";

@Entity({ name: "shop_items" })
export class ShopItemEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ default: "" })
  description!: string;

  @Column({ type: "enum", enum: ItemCategory })
  category!: ItemCategory;

  @Column()
  priceCoins!: number;

  @Column({ default: "" })
  iconUrl!: string;

  @Column({ default: false })
  limited!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
