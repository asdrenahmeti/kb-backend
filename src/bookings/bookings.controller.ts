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
import { CalculatePriceDto } from './dto/calculate-price-dto';

@Controller('bookings')
@ApiTags('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Post('calculate-price')
  calculatePrice(@Body() calculatePriceDto: CalculatePriceDto) {
    return this.bookingsService.calculatePrice(calculatePriceDto);
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
  update(
    @Param('id') id: string, 
    @Body() body: any
  ) {
    const updateBookingDto = new UpdateBookingDto(); 
    updateBookingDto.roomId = body.roomId;
    updateBookingDto.date = body.date;
    updateBookingDto.startTime = body.startTime;
    updateBookingDto.endTime = body.endTime;
  
    const userId = body.userId;
  
    return this.bookingsService.update(id, updateBookingDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
