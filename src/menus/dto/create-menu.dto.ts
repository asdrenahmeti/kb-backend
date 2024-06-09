import { MenuItemType } from '@prisma/client';
import { IsString, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateMenuDto {
  @IsNotEmpty()
  item_type: MenuItemType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsUUID()
  site_id: string;
}
