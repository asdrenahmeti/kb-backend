import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CalculatePriceDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;
}
