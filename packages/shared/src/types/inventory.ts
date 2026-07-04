export enum ItemCategory {
  HAT = "hat",
  SHIRT = "shirt",
  PANTS = "pants",
  FACE = "face",
  ACCESSORY = "accessory",
  GEAR = "gear",
  BADGE = "badge",
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  priceCoins: number;
  iconUrl: string;
  limited: boolean;
  createdAt: string;
}

export interface InventoryEntry {
  id: string;
  userId: string;
  item: ShopItem;
  acquiredAt: string;
  equipped: boolean;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  iconUrl: string;
  coinReward: number;
  xpReward: number;
}

export interface UserAchievement {
  achievement: Achievement;
  unlockedAt: string;
}
