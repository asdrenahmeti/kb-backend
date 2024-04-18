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
import { ParamsToQueryValidationPipe } from 'src/common/pipes/params_to_query.pipes';
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
    @Query(new ParamsToQueryValidationPipe('bookings')) filter: any,
  ) {
    return this.bookingsService.findAll({ filter, include, pagination });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(+id);
  }
}
