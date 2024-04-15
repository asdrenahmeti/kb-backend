import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsUUID, IsInt, Min } from 'class-validator';
export class CreateEmployeeDto {
    @ApiProperty({ description: 'The email of the employee', uniqueItems: true })
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @ApiProperty({ description: 'The name of the employee' })
    @IsNotEmpty({ message: 'Name cannot be empty' })
    name: string;

    @ApiProperty({ description: 'The HRM ID of the employee', uniqueItems: true })
    @IsNotEmpty({ message: 'HRM ID cannot be empty' })
    @IsUUID('4', { message: 'Invalid UUID format' })
    hrm_id: string;

    @ApiProperty({ description: 'The points of the employee' })
    @IsNotEmpty({ message: 'Points cannot be empty' })
    @IsInt({ message: 'Points should be an integer' })
    @Min(0, { message: 'Points should be greater than or equal to 0' })
    points: number;
}
