import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ParamsToPaginationValidationPipe } from 'src/common/pipes/pagination.pipes';
import { ParamsToIncludeValidationPipe } from 'src/common/pipes/params_to_include.pipes';
import { ApiTags } from '@nestjs/swagger';

@Controller('bookings')
@ApiTags('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  findAll(
    @Query(new ParamsToIncludeValidationPipe('bookings')) include: any,
    @Query(ParamsToPaginationValidationPipe) pagination: any,
    @Query('gt') gt: string,
    @Query('lt') lt: string,
    @Query('siteId') siteId: string,
  ) {
    return this.bookingsService.findAll({
      include,
      pagination,
      gt: gt ? new Date(gt) : undefined,
      lt: lt ? new Date(lt) : undefined,
      siteId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(+id);
  }
}
