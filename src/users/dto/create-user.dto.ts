import { UserRole } from '@prisma/client';
import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  password: string;

  @IsOptional()
  entryToken: string;

  @IsOptional()
  @IsString()
  profileImg?: string;

  @IsString()
  @IsOptional()
  role: UserRole;
}
