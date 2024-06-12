import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { siteImageFile } from 'src/common/utils/upload-file-config';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('sites')
@ApiTags('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERVISOR, UserRole.STAFF)
  @Post()
  @UseInterceptors(FileInterceptor('file', siteImageFile))
  async create(
    @Body() createSiteDto: CreateSiteDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    try {
      // if (!file) {
      //   throw new HttpException(
      //     'Please upload an image for your site! Format accepted: jpg, png, heic',
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }

      const createdSite = await this.sitesService.create(createSiteDto, file);
      return createdSite;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  findAll() {
    return this.sitesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sitesService.findOne(id);
  }

  @Get(':id/rooms')
  findRooms(@Param('id') id: string) {
    return this.sitesService.findRooms(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', siteImageFile))
  async update(
    @Param('id') id: string,
    @Body() updateSiteDto: UpdateSiteDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const updatedSite = await this.sitesService.update(
        id,
        updateSiteDto,
        file,
      );
      return updatedSite;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<any> {
    try {
      const deactivatedSite = await this.sitesService.deactivate(id);
      return deactivatedSite;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sitesService.remove(id);
  }
}
