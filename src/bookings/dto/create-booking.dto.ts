import { BookingStatus, Menu_order } from '@prisma/client';
import {
  IsNotEmpty,
  IsDateString,
  IsUUID,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';

export class CreateBookingDto {
  @IsOptional()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  startTime: string;

  @IsNotEmpty()
  endTime: string;

  // @IsNotEmpty()
  // status: BookingStatus;

  @IsString()
  email: string;

  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  firstName: string;

  @IsOptional()
  lastName: string;

  @IsOptional()
  user: string;

  @IsOptional()
  menuOrders: Menu_order[];

  @IsOptional()
  @IsBoolean()
  makeMeMember?: boolean = false;
}
