import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateSongDto {
  @IsString()
  artistName: string;

  @IsString()
  songName: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;  // Duration in seconds, optional field
}
