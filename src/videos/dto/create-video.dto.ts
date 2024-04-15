import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateVideoDto {
    @ApiProperty({ type: String, description: 'The title of the video' })
    @IsNotEmpty({ message: 'Title cannot be empty' })
    @IsString({ message: 'Title should be a string' })
    title: string;

    @ApiProperty({ type: String, description: 'The description of the video' })
    @IsNotEmpty({ message: 'Description cannot be empty' })
    @IsString({ message: 'Description should be a string' })
    description: string;

    @ApiProperty({ type: String, description: 'The URL of the video thumbnail' })
    @IsNotEmpty({ message: 'Thumbnail URL cannot be empty' })
    @IsString({ message: 'Thumbnail URL should be a string' })
    thumbnail: string;

    @ApiProperty({ type: String, description: 'The URL of the video' })
    @IsNotEmpty({ message: 'Video URL cannot be empty' })
    @IsString({ message: 'Video URL should be a string' })
    url: string;

    @ApiProperty({ type: Number, description: 'The points associated with the video' })
    @IsNotEmpty({ message: 'Points cannot be empty' })
    @IsInt({ message: 'Points should be an integer' })
    points: number;

    @ApiProperty({ type: Number, description: 'The ID of the video category' })
    @IsNotEmpty({ message: 'Category ID cannot be empty' })
    @IsInt({ message: 'Category ID should be an integer' })
    category_id: number;
}


