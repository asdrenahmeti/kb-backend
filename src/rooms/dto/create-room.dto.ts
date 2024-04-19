import { OpenHours } from '@prisma/client';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  capacity: number;

  @IsNotEmpty()
  @IsBoolean()
  available: boolean;

  @IsOptional()
  openingHours: OpenHours[];

  @IsNotEmpty()
  siteId: string;
}
