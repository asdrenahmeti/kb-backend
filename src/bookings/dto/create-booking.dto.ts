import { BookingStatus } from '@prisma/client';
import { IsNotEmpty, IsDateString, IsUUID } from 'class-validator';

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
}
