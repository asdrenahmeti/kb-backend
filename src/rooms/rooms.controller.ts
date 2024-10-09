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
  Query,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { roomImageFile } from '../common/utils/upload-file-config';

@Controller('rooms')
@ApiTags('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @UseInterceptors(FileInterceptor('file', roomImageFile))
  @Post()
  create(
    @Body() createRoomDto: CreateRoomDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const createdRoom = this.roomsService.create(createRoomDto, file);
      return createdRoom;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('available')
  async getAvailableRooms(
    @Query('siteId') siteId: string,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('persons') persons: string,
  ) {
    return await this.roomsService.findAvailableRooms(
      siteId,
      date,
      startTime,
      endTime,
      persons,
    );
  }

  @Get()
  findAll() {
    try {
      const rooms = this.roomsService.findAll();
      return rooms;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('open-hours')
  findOpeningHours() {
    return this.roomsService.findOpeningHours();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    try {
      const room = this.roomsService.findOne(id);
      return room;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}
