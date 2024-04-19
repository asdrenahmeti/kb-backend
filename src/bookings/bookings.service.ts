import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from '../prisma.service';
import { Booking, BookingStatus } from '@prisma/client';
import { DateTime, Interval } from 'luxon';
import { catchErrorHandler } from 'src/common/helpers/error-handler.prisma';
import { HttpException } from '@nestjs/common';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}
  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { roomId, date, startTime, endTime } = createBookingDto;

    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const overlappingBookings = await this.prisma.booking.findMany({
      where: {
        roomId,
        date,
        OR: [
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { gt: startTime } },
              { startTime: { lt: endTime } },
            ],
          },
          {
            AND: [{ endTime: { gt: startTime } }, { endTime: { lt: endTime } }],
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

    return await this.prisma.booking.create({
      data: {
        roomId,
        date,
        startTime: startTime,
        endTime: endTime,
        status: BookingStatus.RESERVED,
      },
    });
  }

  async findAll({ pagination, include, gt, lt, siteId }) {
    try {
      const siteTimes = await this.prisma.site.findUnique({
        where: { id: siteId },
        select: { openingHours: true, closingHours: true },
      });

      if (!siteTimes) {
        throw new NotFoundException('No site found');
      }

      const queryDate = gt;

      const { openingHour, closingHour } = calculateBusinessHours(
        queryDate,
        siteTimes.openingHours,
        siteTimes.closingHours,
      );

      const site = await this.prisma.site.findUnique({
        where: { id: siteId },
        include: {
          rooms: {
            include: {
              bookings: {
                where: {
                  // date: { gte: openingHour.toISO(), lte: closingHour.toISO() },
                  startTime: {
                    gte: openingHour.toISO(),
                    lte: closingHour.toISO(),
                  },
                  endTime: {
                    gte: openingHour.toISO(),
                    lte: closingHour.toISO(),
                  },
                },
              },
            },
          },
        },
      });

      return site;
    } catch (error) {}
  }

  findOne(id: string) {
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

function calculateBusinessHours(queryDate, openHour, closeHour) {
  const queryDateTime = DateTime.fromISO(queryDate.toISOString());

  const year = queryDateTime.year;
  const month = queryDateTime.month;
  const day = queryDateTime.day;

  const startTime = parseInt(openHour.split(':')[0]);
  const endTime = parseInt(closeHour.split(':')[0]);

  const openingHour = DateTime.utc(year, month, day, startTime, 0, 0);

  const closingHour = openingHour
    .plus({ days: 1 })
    .set({ hour: endTime, minute: 0, second: 0, millisecond: 0 });

  return { openingHour, closingHour };
}
