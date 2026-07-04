import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameEntity } from "../database/entities/game.entity";
import { GamesService } from "./games.service";
import { GamesController } from "./games.controller";

@Module({
  imports: [TypeOrmModule.forFeature([GameEntity])],
  providers: [GamesService],
  controllers: [GamesController],
  exports: [GamesService],
})
export class GamesModule {}
