import { UserRole } from '@prisma/client';
import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsString()
  entryToken: string;

  @IsOptional()
  @IsString()
  profileImg?: string;

  @IsNotEmpty()
  @IsString()
  role: UserRole;
}
