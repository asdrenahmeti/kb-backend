import { BookingStatus, Menu_order } from '@prisma/client';
import { IsNotEmpty, IsDateString, IsUUID, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsUUID()
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

  @IsOptional()
  user: string;

  @IsOptional()
  menuOrders: Menu_order[];
}
