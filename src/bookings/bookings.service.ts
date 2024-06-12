import {
  BadRequestException,
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
    try {
      const { roomId, date, startTime, endTime, menuOrders } = createBookingDto;

      const room = await this.prisma.room.findUnique({
        where: { id: roomId },
        include: { site: true },
      });
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      const { year, month, day } = DateTime.fromISO(date);

      const siteOpenTime = parseInt(room.site.openingHours.split(':')[0]);
      const siteCloseTime = parseInt(room.site.closingHours.split(':')[0]);

      const openingHour = DateTime.utc(year, month, day, siteOpenTime, 0, 0);
      const closingHour = DateTime.utc(year, month, day, siteCloseTime, 0, 0);

      if (
        (startTime < openingHour.toISO() && startTime > closingHour.toISO()) ||
        (endTime > closingHour.toISO() && endTime < openingHour.toISO())
      ) {
        throw new BadRequestException('You cannot book outside business hours');
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
              AND: [
                { endTime: { gt: startTime } },
                { endTime: { lt: endTime } },
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
      // const menuOrdersData = menuOrders.map((order) => ({
      //   menu: { connect: { id: order.menu_id } },
      // }));

      return await this.prisma.booking.create({
        data: {
          roomId,
          date,
          startTime: startTime,
          endTime: endTime,
          status: BookingStatus.RESERVED,
          menu_orders: menuOrders
            ? {
                create: menuOrders.map((order) => ({
                  quantity: order.quantity,
                  menu: { connect: { id: order.menu_id } },
                })),
              }
            : undefined,
        },
        include: {
          menu_orders: true,
        },
      });
    } catch (error) {
      catchErrorHandler(error);
    }
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
                include: {
                  menu_orders: {
                    include: { menu: { select: { name: true, price: true } } },
                  },
                },
              },
            },
          },
        },
      });

      return site;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findOne(id: string) {
    return await this.prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    });
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const { roomId, date, startTime, endTime } = updateBookingDto;

    // Find booking
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // If roomId is provided
    if (roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: roomId },
        include: { site: true },
      });
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      // Validate booking time
      validateBookingTime(room, date, startTime, endTime);

      // Check for overlapping bookings
      const overlappingBookings = await this.prisma.booking.findMany({
        where: {
          roomId,
          date,
          id: {
            not: id,
          },
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
              AND: [
                { endTime: { gt: startTime } },
                { endTime: { lt: endTime } },
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
          overlappingBookingDetails,
        });
      }
    }

    return await this.prisma.booking.update({
      where: { id },
      data: {
        roomId,
        date,
        startTime,
        endTime,
      },
    });
  }

  async remove(id: string) {
    const removeBooking = await this.prisma.booking.delete({
      where: { id },
    });
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

//

function validateBookingTime(
  room,
  date: string,
  startTime: string,
  endTime: string,
) {
  const { openingHours, closingHours } = room.site;

  let year, month, day;
  if (date) {
    ({ year, month, day } = DateTime.fromISO(date));
  } else {
    ({ year, month, day } = DateTime.fromISO(startTime));
  }

  const siteOpenTime = parseInt(openingHours.split(':')[0]);
  const siteCloseTime = parseInt(closingHours.split(':')[0]);

  const openingHour = DateTime.utc(year, month, day, siteOpenTime, 0, 0);
  const closingHour = DateTime.utc(year, month, day, siteCloseTime, 0, 0);

  if (
    (DateTime.fromISO(startTime) < openingHour &&
      DateTime.fromISO(startTime) > closingHour) ||
    (DateTime.fromISO(endTime) > closingHour &&
      DateTime.fromISO(endTime) < openingHour)
  ) {
    throw new BadRequestException('You cannot book outside business hours');
  }
}
