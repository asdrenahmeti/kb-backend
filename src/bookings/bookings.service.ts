import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from '../prisma.service';
import { Booking, BookingStatus, Menu_order, UserRole } from '@prisma/client';
import { DateTime, Interval } from 'luxon';
import { catchErrorHandler } from 'src/common/helpers/error-handler.prisma';
import { HttpException } from '@nestjs/common';
import { CalculatePriceDto } from './dto/calculate-price-dto';

export type BookingData = {
  roomId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  userId?: string; // Optional userId
  menuOrders?: Menu_order[]; // Optional menu orders
};

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}
  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    try {
      const {
        roomId,
        date,
        startTime,
        endTime,
        menuOrders,
        email,
        phoneNumber,
        firstName,
        lastName,
      } = createBookingDto;

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

      let userId: string | undefined = undefined;
      if (email) {
        let user = await this.prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await this.prisma.user.create({
            data: {
              email,
              phone_number: phoneNumber,
              firstName,
              lastName,
              role: UserRole.GUEST,
            },
          });
        }

        userId = user.id;
      }

      const newBooking: Booking = await this.prisma.booking.create({
        data: {
          room: { connect: { id: roomId } },
          date,
          startTime: startTime,
          endTime: endTime,
          status: BookingStatus.RESERVED,
          user: userId ? { connect: { id: userId } } : undefined,
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
          user: true,
        },
      });

      return newBooking;
    } catch (error) {
      catchErrorHandler(error);
    }
  }

  async calculatePrice(calculatePriceDto: CalculatePriceDto): Promise<number> {
    const { roomId, startTime, endTime } = calculatePriceDto;

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { slots: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const start = DateTime.fromISO(startTime, { zone: 'UTC' });
    const end = DateTime.fromISO(endTime, { zone: 'UTC' });


    let totalPrice = 0;

    for (const slot of room.slots) {
      let slotStart = DateTime.fromFormat(slot.startTime, 'HH:mm', {
        zone: 'UTC',
      });
      let slotEnd = DateTime.fromFormat(slot.endTime, 'HH:mm', { zone: 'UTC' });

      // Handle overnight slots
      if (slotEnd < slotStart) {
        slotEnd = slotEnd.plus({ days: 1 });
      }

      // Handle bookings that span midnight
      let bookingStart = start;
      let bookingEnd = end;
      if (bookingEnd < bookingStart) {
        bookingEnd = bookingEnd.plus({ days: 1 });
      }

      // Adjust booking start time to map to the correct slot
      if (bookingStart < slotEnd && bookingEnd > slotStart) {
        const overlapStart =
          bookingStart > slotStart ? bookingStart : slotStart;
        const overlapEnd = bookingEnd < slotEnd ? bookingEnd : slotEnd;
        const duration = overlapEnd.diff(overlapStart, 'hours').hours;

        // Ensure the duration is at least 1 hour
        const roundedDuration = Math.ceil(duration);
        totalPrice += roundedDuration * slot.pricing;

      }
    }

    return totalPrice;
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
              slots: {
                select: { startTime: true, endTime: true, pricing: true },
              },
              bookings: {
                where: {
                  OR: [
                    {
                      startTime: {
                        gte: openingHour.toISO(),
                        lt: closingHour.toISO(),
                      },
                    },
                    {
                      endTime: {
                        gt: openingHour.toISO(),
                        lte: closingHour.toISO(),
                      },
                    },
                    {
                      AND: [
                        { startTime: { lt: openingHour.toISO() } },
                        { endTime: { gt: closingHour.toISO() } },
                      ],
                    },
                  ],
                },
                include: {
                  user: true,
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
