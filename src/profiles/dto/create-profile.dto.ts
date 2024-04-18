import { IsNotEmpty, IsOptional, IsString, IsDate } from 'class-validator';

export class CreateProfileDto {
  @IsDate()
  dateOfBirth: Date;

  @IsString()
  phoneNumber: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsString()
  zipCode: string;
}
