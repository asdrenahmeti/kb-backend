import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject } from 'class-validator';

export class CreateSiteImageDto {
  @ApiProperty({ type: 'string' })
  @Type(() => Object)
  file: Express.Multer.File;
}

export default CreateSiteImageDto;
