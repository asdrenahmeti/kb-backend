import { IsString, IsNotEmpty } from 'class-validator';

export class CompleteProfileDto {
  @IsString()
  @IsNotEmpty()
  new_password: string; // Make sure this field is defined
}
