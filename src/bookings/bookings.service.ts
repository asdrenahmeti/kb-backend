import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from '../prisma.service';
import { Booking, BookingStatus } from '@prisma/client';
import { DateTime } from 'luxon';
import { start } from 'node:repl';
import { catchErrorHandler } from 'src/common/helpers/error-handler.prisma';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}
  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { roomId, date, startTime, endTime } = createBookingDto;

    // Check if the room exists
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const bookingStartTime = DateTime.fromFormat(startTime, 'HH:mm', {
      zone: 'UTC',
    });
    const bookingEndTime = DateTime.fromFormat(endTime, 'HH:mm', {
      zone: 'UTC',
    });
    // Check if the slot is available
    const overlappingBookings = await this.prisma.booking.findMany({
      where: {
        roomId,
        date,
        OR: [
          {
            AND: [
              { startTime: { lt: bookingEndTime.toISO() } },
              { endTime: { gt: bookingStartTime.toISO() } },
            ],
          },
          {
            AND: [
              { startTime: { gt: bookingStartTime.toISO() } },
              { startTime: { lt: bookingEndTime.toISO() } },
            ],
          },
          {
            AND: [
              { endTime: { gt: bookingStartTime.toISO() } },
              { endTime: { lt: bookingEndTime.toISO() } },
            ],
          },
        ],
      },
    });

    if (overlappingBookings.length > 0) {
      const overlappingBooking = overlappingBookings[0];
      const overlappingBookingDetails = getBookingDetails(overlappingBooking);

      throw new ConflictException({
        message: 'Requested booking slot overlaps with existing bookings.',
        error: 'Conflict',
        statusCode: 409,
        overlappingBookingDetails: overlappingBookingDetails,
      });
    }

    // Create the booking
    return await this.prisma.booking.create({
      data: {
        roomId,
        date,
        startTime: bookingStartTime.toISO(),
        endTime: bookingEndTime.toISO(),
        status: BookingStatus.RESERVED,
      },
    });
  }

  async findAll({ filter, pagination, include }) {
    try {
      const bookings = await this.prisma.booking.findMany({
        where: filter,
        include,
        ...(pagination && { skip: pagination.skip }),
        ...(pagination && { take: pagination.take }),
      });
      if (pagination) {
        const all = await this.prisma.booking.count({ where: filter });
        return {
          total_pages: Math.ceil(all / pagination.take),
          current_page: pagination.skip / pagination.take + 1,
          per_page: pagination.take,
          data: bookings,
        };
      }
      return bookings;
    } catch (error) {
      catchErrorHandler(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}

function getBookingDetails(booking: Booking) {
  const { id, date, startTime, endTime, status } = booking;

  const parsedDate = DateTime.fromISO(date.toISOString(), {
    zone: 'UTC',
  }).toFormat('EEE MMM dd yyyy');
  const parsedStartTime = DateTime.fromISO(startTime.toISOString(), {
    zone: 'UTC',
  }).toFormat('HH:mm');
  const parsedEndTime = DateTime.fromISO(endTime.toISOString(), {
    zone: 'UTC',
  }).toFormat('HH:mm');
  return {
    id,
    date: parsedDate,
    startTime: parsedStartTime,
    endTime: parsedEndTime,
    status,
  };
}
