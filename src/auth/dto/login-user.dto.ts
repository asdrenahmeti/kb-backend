import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({ required: true, example: 'johndoe@gmail.com' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  password: string;
}
