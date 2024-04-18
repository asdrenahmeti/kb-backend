import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OpenHours } from '@prisma/client';

export class CreateSiteDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  openingHours: string;

  @IsString()
  closingHours: string;
}
