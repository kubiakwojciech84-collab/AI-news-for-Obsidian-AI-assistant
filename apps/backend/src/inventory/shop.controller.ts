import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, RequestUser } from "../common/current-user.decorator";
import { ShopService } from "./shop.service";

class SetEquippedDto {
  @IsBoolean()
  equipped!: boolean;
}

@ApiTags("shop")
@Controller()
export class ShopController {
  constructor(private shop: ShopService) {}

  @Get("shop/items")
  listItems() {
    return this.shop.listItems();
  }

  @Post("shop/items/:id/purchase")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  purchase(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.shop.purchase(user.userId, id);
  }

  @Get("inventory")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  myInventory(@CurrentUser() user: RequestUser) {
    return this.shop.myInventory(user.userId);
  }

  @Patch("inventory/:entryId")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  setEquipped(@CurrentUser() user: RequestUser, @Param("entryId") entryId: string, @Body() dto: SetEquippedDto) {
    return this.shop.setEquipped(user.userId, entryId, dto.equipped);
  }
}
