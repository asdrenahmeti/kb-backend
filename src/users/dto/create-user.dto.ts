import { ApiProperty } from "@nestjs/swagger";
import { TypeUserRole } from "@prisma/client";
import { IsEmail, IsNotEmpty, IsUUID, IsEnum, IsString } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ type: 'string', description: 'The email of the user', uniqueItems: true })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @ApiProperty({ type: 'string', description: 'The name of the user' })
    @IsNotEmpty({ message: 'Name cannot be empty' })
    @IsString({ message: 'Name should be string' })
    name: string;

    @ApiProperty({ type: 'string', description: 'The HRM ID of the user', uniqueItems: true })
    @IsUUID('4', { message: 'Invalid UUID format' })
    hrm_id: string;

    @ApiProperty({ enum: TypeUserRole, description: 'The role of the user' })
    @IsEnum(TypeUserRole, { message: 'Invalid user role' })
    role: TypeUserRole;
}
