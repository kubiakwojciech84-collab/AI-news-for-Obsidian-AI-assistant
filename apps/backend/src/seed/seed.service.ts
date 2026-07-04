import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { GameGenre, GameStatus, ItemCategory, UserRole, createEmptyScene } from "@nova/shared";
import { UserEntity } from "../database/entities/user.entity";
import { GameEntity } from "../database/entities/game.entity";
import { ShopItemEntity } from "../database/entities/shop-item.entity";
import { AchievementEntity } from "../database/entities/achievement.entity";
import { NpcEntity } from "../database/entities/npc.entity";
import { QuestEntity } from "../database/entities/quest.entity";
import { QuestObjectiveType } from "@nova/shared";
import { buildObbyScene } from "@nova/game-obby";
import { buildShooterScene } from "@nova/game-shooter-fps";

const PROTOTYPE_GAMES: Array<{ slug: string; title: string; description: string; genre: GameGenre }> = [
  { slug: "survival-island", title: "Survival Island", description: "Zbieraj zasoby, buduj schronienie i przetrwaj noc.", genre: GameGenre.SURVIVAL },
  { slug: "tower-tycoon", title: "Tower Tycoon", description: "Buduj i rozwijaj swój biznes, zarabiaj coraz więcej monet.", genre: GameGenre.TYCOON },
  { slug: "hide-and-seek", title: "Hide and Seek", description: "Jedna osoba szuka, reszta się chowa. Klasyka w 3D.", genre: GameGenre.HIDE_AND_SEEK },
  { slug: "speed-racing", title: "Speed Racing", description: "Wyścigi torowe z checkpointami i najlepszymi czasami okrążeń.", genre: GameGenre.RACING },
  { slug: "sandbox-world", title: "Sandbox World", description: "Wolna budowa - stawiaj bloki i twórz własne konstrukcje.", genre: GameGenre.SANDBOX },
  { slug: "fantasy-rpg", title: "Fantasy RPG", description: "Questy, NPC i eksploracja świata fantasy.", genre: GameGenre.RPG },
  { slug: "cafe-simulator", title: "Cafe Simulator", description: "Prowadź własną kawiarnię i obsługuj klientów.", genre: GameGenre.SIMULATOR },
];

const SHOP_ITEMS: Array<{ name: string; description: string; category: ItemCategory; priceCoins: number }> = [
  { name: "Czerwona Czapka", description: "Klasyczna czerwona czapka.", category: ItemCategory.HAT, priceCoins: 50 },
  { name: "Cylinder", description: "Elegancki cylinder.", category: ItemCategory.HAT, priceCoins: 150 },
  { name: "Koszulka Pro Gamer", description: "Dla prawdziwych zawodowców.", category: ItemCategory.SHIRT, priceCoins: 75 },
  { name: "Spodnie Kamuflaż", description: "Idealne do gier akcji.", category: ItemCategory.PANTS, priceCoins: 60 },
  { name: "Okulary Przeciwsłoneczne", description: "Wygląda świetnie w słońcu.", category: ItemCategory.FACE, priceCoins: 40 },
  { name: "Skrzydła Anioła", description: "Rzadki dodatek na plecy.", category: ItemCategory.ACCESSORY, priceCoins: 500, },
  { name: "Miecz Startowy", description: "Podstawowa broń do RPG.", category: ItemCategory.GEAR, priceCoins: 100 },
  { name: "Odznaka Beta Testera", description: "Dla najwcześniejszych graczy.", category: ItemCategory.BADGE, priceCoins: 0 },
];

const ACHIEVEMENTS: Array<{ key: string; title: string; description: string; coinReward: number; xpReward: number }> = [
  { key: "first_login", title: "Witaj w NovaWorlds!", description: "Zaloguj się po raz pierwszy.", coinReward: 50, xpReward: 25 },
  { key: "obby_complete", title: "Parkour Master", description: "Ukończ grę Obby.", coinReward: 100, xpReward: 100 },
  { key: "shooter_first_kill", title: "Pierwsza Krew", description: "Wyeliminuj pierwszego przeciwnika w Shooter FPS.", coinReward: 50, xpReward: 50 },
  { key: "shop_first_purchase", title: "Shopaholic", description: "Kup swój pierwszy przedmiot w sklepie.", coinReward: 25, xpReward: 25 },
  { key: "made_a_friend", title: "Nowy Znajomy", description: "Dodaj pierwszego znajomego.", coinReward: 25, xpReward: 25 },
  { key: "quest_complete", title: "Questowicz", description: "Ukończ swój pierwszy quest u NPC.", coinReward: 75, xpReward: 75 },
];

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(UserEntity) private users: Repository<UserEntity>,
    @InjectRepository(GameEntity) private games: Repository<GameEntity>,
    @InjectRepository(ShopItemEntity) private shopItems: Repository<ShopItemEntity>,
    @InjectRepository(AchievementEntity) private achievements: Repository<AchievementEntity>,
    @InjectRepository(NpcEntity) private npcs: Repository<NpcEntity>,
    @InjectRepository(QuestEntity) private quests: Repository<QuestEntity>
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedUsersAndGames();
    await this.seedShop();
    await this.seedAchievements();
  }

  private async seedUsersAndGames(): Promise<void> {
    const existingAdmin = await this.users.findOne({ where: { username: "admin" } });
    let admin = existingAdmin;
    if (!admin) {
      admin = await this.users.save(
        this.users.create({
          username: "admin",
          email: "admin@novaworlds.local",
          passwordHash: await bcrypt.hash("Admin123!", 10),
          displayName: "Administrator",
          role: UserRole.ADMIN,
          coins: 100000,
        })
      );
      this.logger.log("Seeded default admin user (admin / Admin123!)");
    }

    const existingMod = await this.users.findOne({ where: { username: "moderator" } });
    if (!existingMod) {
      await this.users.save(
        this.users.create({
          username: "moderator",
          email: "moderator@novaworlds.local",
          passwordHash: await bcrypt.hash("Moderator123!", 10),
          displayName: "Moderator",
          role: UserRole.MODERATOR,
          coins: 1000,
        })
      );
      this.logger.log("Seeded default moderator user (moderator / Moderator123!)");
    }

    const gameCount = await this.games.count();
    if (gameCount > 0) return;

    await this.games.save(
      this.games.create({
        slug: "obby",
        title: "Obby - Tower of Trials",
        description: "Klasyczny parkour: skacz od checkpointu do checkpointu aż na szczyt wieży.",
        genre: GameGenre.OBBY,
        status: GameStatus.PLAYABLE,
        published: true,
        authorId: admin.id,
        maxPlayers: 20,
        scene: buildObbyScene(),
      })
    );

    await this.games.save(
      this.games.create({
        slug: "shooter-fps",
        title: "Shooter FPS Arena",
        description: "Drużynowa strzelanka FPS z botami AI patrolującymi mapę.",
        genre: GameGenre.SHOOTER,
        status: GameStatus.PLAYABLE,
        published: true,
        authorId: admin.id,
        maxPlayers: 16,
        scene: buildShooterScene(),
      })
    );

    for (const proto of PROTOTYPE_GAMES) {
      await this.games.save(
        this.games.create({
          slug: proto.slug,
          title: proto.title,
          description: proto.description,
          genre: proto.genre,
          status: GameStatus.PROTOTYPE,
          published: true,
          authorId: admin.id,
          maxPlayers: 12,
          scene: createEmptyScene(proto.slug),
        })
      );
    }

    const rpgGame = await this.games.findOne({ where: { slug: "fantasy-rpg" } });
    if (rpgGame) {
      const npc = await this.npcs.save(
        this.npcs.create({
          gameId: rpgGame.id,
          name: "Stary Kowal Boris",
          persona: "Zgorzkniały, ale życzliwy kowal, który uwielbia opowiadać o dawnych bitwach i zawsze ma dla podróżnych jakieś zadanie.",
          spawnNodeId: "root",
        })
      );
      const quest = await this.quests.save(
        this.quests.create({
          npcId: npc.id,
          title: "Zaginione Narzędzia",
          description: "Znajdź 3 zagubione młoty kowalskie rozrzucone po wiosce.",
          objectives: [{ id: "collect-hammers", type: QuestObjectiveType.COLLECT, description: "Zbierz młoty kowalskie", targetId: "hammer", targetCount: 3 }],
          coinReward: 150,
          xpReward: 200,
        })
      );
      npc.questId = quest.id;
      await this.npcs.save(npc);
    }

    this.logger.log("Seeded game catalog (2 playable, 7 prototypes)");
  }

  private async seedShop(): Promise<void> {
    const count = await this.shopItems.count();
    if (count > 0) return;
    await this.shopItems.save(SHOP_ITEMS.map((item) => this.shopItems.create(item)));
    this.logger.log("Seeded shop catalog");
  }

  private async seedAchievements(): Promise<void> {
    const count = await this.achievements.count();
    if (count > 0) return;
    await this.achievements.save(ACHIEVEMENTS.map((a) => this.achievements.create(a)));
    this.logger.log("Seeded achievements");
  }
}
