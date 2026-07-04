import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ShopItemEntity } from "../database/entities/shop-item.entity";
import { InventoryEntryEntity } from "../database/entities/inventory-entry.entity";
import { UsersService } from "../users/users.service";

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(ShopItemEntity) private items: Repository<ShopItemEntity>,
    @InjectRepository(InventoryEntryEntity) private inventory: Repository<InventoryEntryEntity>,
    private users: UsersService
  ) {}

  async listItems(): Promise<ShopItemEntity[]> {
    return this.items.find({ order: { createdAt: "DESC" } });
  }

  async purchase(userId: string, itemId: string): Promise<InventoryEntryEntity> {
    const item = await this.items.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException("Item not found");

    const alreadyOwned = await this.inventory.findOne({ where: { userId, itemId } });
    if (alreadyOwned) throw new BadRequestException("You already own this item");

    const paid = await this.users.spendCoins(userId, item.priceCoins);
    if (!paid) throw new BadRequestException("Not enough coins");

    return this.inventory.save(this.inventory.create({ userId, itemId }));
  }

  async myInventory(userId: string): Promise<InventoryEntryEntity[]> {
    return this.inventory.find({ where: { userId }, order: { acquiredAt: "DESC" } });
  }

  async setEquipped(userId: string, entryId: string, equipped: boolean): Promise<InventoryEntryEntity> {
    const entry = await this.inventory.findOne({ where: { id: entryId, userId } });
    if (!entry) throw new NotFoundException("Inventory entry not found");
    entry.equipped = equipped;
    return this.inventory.save(entry);
  }
}
