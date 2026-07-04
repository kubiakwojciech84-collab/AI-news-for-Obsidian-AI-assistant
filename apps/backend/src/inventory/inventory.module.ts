import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ShopItemEntity } from "../database/entities/shop-item.entity";
import { InventoryEntryEntity } from "../database/entities/inventory-entry.entity";
import { UsersModule } from "../users/users.module";
import { ShopService } from "./shop.service";
import { ShopController } from "./shop.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ShopItemEntity, InventoryEntryEntity]), UsersModule],
  providers: [ShopService],
  controllers: [ShopController],
  exports: [ShopService],
})
export class InventoryModule {}
