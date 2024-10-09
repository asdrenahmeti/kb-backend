import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma.service';
import { Room, OpenHours } from '@prisma/client';
import { HttpStatus, HttpException } from '@nestjs/common';
import { catchErrorHandler } from '../common/helpers/error-handler.prisma';
import { DateTime } from 'luxon';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createRoomDto: CreateRoomDto,
    file?: Express.Multer.File,
  ): Promise<Room | Error> {
    try {
      const { openingHours, capacity, ...roomData } = createRoomDto;

      const site = await this.prisma.site.findFirst({
        where: { id: roomData.siteId },
        select: { openingHours: true, closingHours: true, name: true },
      });

      if (!site) {
        throw new NotFoundException('No site found with that ID');
      }

      if (!site.openingHours || !site.closingHours) {
        throw new Error(`Please provide business hours for site: ${site.name}`);
      }

      const data: any = {
        ...roomData,
        capacity: Number(capacity),
      };

      if (file) {
        data.image = file.filename;
      }

      const room = await this.prisma.room.create({ data });

      let parsedOpeningHours: Array<any> = [];
      if (typeof openingHours === 'string') {
        try {
          parsedOpeningHours = JSON.parse(openingHours);
        } catch (error) {
          throw new BadRequestException('Invalid format for opening hours');
        }
      } else {
        parsedOpeningHours = openingHours;
      }

      if (parsedOpeningHours && parsedOpeningHours.length > 0) {
        for (const slot of parsedOpeningHours) {
          await this.prisma.openHours.create({
            data: {
              ...slot,
              roomId: room.id,
              startTime: slot.startTime,
              endTime: slot.endTime,
            },
          });
        }
      }

      return room;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<Room[]> {
    const rooms = await this.prisma.room.findMany({
      include: {
        site: { select: { name: true } },
        slots: { select: { startTime: true, endTime: true, pricing: true } },
        bookings: true,
      },
    });

    const formattedRooms = rooms.map((room) => {
      const formattedSlots = room.slots.map((slot) => ({
        // startTime: DateTime.fromISO(slot.startTime).toFormat('HH:mm'),
        // endTime: DateTime.fromISO(slot.endTime).toFormat('HH:mm'),
        startTime: slot.startTime,
        endTime: slot.endTime,
        pricing: slot.pricing,
      }));
      return { ...room, slots: formattedSlots };
    });

    return formattedRooms;
  }

  async findOpeningHours() {
    return await this.prisma.openHours.findMany({
      include: { room: { select: { name: true } } },
    });
  }

  async findAvailableRooms(
    siteId: string,
    date: string,
    startTime: string,
    endTime: string,
    persons: string,
  ) {
    // Parse and validate date
    const parsedDate = DateTime.fromISO(date, { zone: 'utc' });
    if (!parsedDate.isValid) {
      throw new BadRequestException('Invalid date format. Expected format: YYYY-MM-DD');
    }
  
    // Parse and validate times
    const parsedStartTime = DateTime.fromFormat(startTime, 'HH:mm', { zone: 'utc' });
    const parsedEndTime = DateTime.fromFormat(endTime, 'HH:mm', { zone: 'utc' });
    if (!parsedStartTime.isValid || !parsedEndTime.isValid) {
      throw new BadRequestException('Invalid time format. Expected format: HH:mm');
    }
  
    // Combine date and time in UTC
    const requestedStart = DateTime.fromISO(`${date}T${startTime}`, { zone: 'utc' });
    const requestedEnd = DateTime.fromISO(`${date}T${endTime}`, { zone: 'utc' });
  
    if (requestedEnd <= requestedStart) {
      throw new BadRequestException('End time must be after start time');
    }
  
    // Parse and validate persons (capacity)
    let minCapacity: number;
    let maxCapacity: number;
    if (persons.includes('-')) {
      const [minStr, maxStr] = persons.split('-');
      minCapacity = parseInt(minStr, 10);
      maxCapacity = parseInt(maxStr, 10);
    } else {
      minCapacity = maxCapacity = parseInt(persons, 10);
    }
  
    if (isNaN(minCapacity) || isNaN(maxCapacity)) {
      throw new BadRequestException('Invalid persons capacity format');
    }
  
    // Fetch rooms at the site with capacity within the range
    const rooms = await this.prisma.room.findMany({
      where: {
        siteId: siteId,
        capacity: {
          gte: minCapacity,
          lte: maxCapacity,
        },
      },
      include: {
        bookings: true,
        slots: true,
      },
    });
  
    if (!rooms.length) {
      throw new NotFoundException('No rooms found matching the criteria');
    }
  
    const availableRooms = [];
  
    for (const room of rooms) {
      // Check if the room is open during the requested time
      const isOpen = room.slots.some((slot) => {
        const slotStart = DateTime.fromFormat(slot.startTime, 'HH:mm', { zone: 'utc' });
        const slotEnd = DateTime.fromFormat(slot.endTime, 'HH:mm', { zone: 'utc' });
        return (
          slotStart <= parsedStartTime &&
          slotEnd >= parsedEndTime
        );
      });
  
      if (!isOpen) {
        continue;
      }
  
      // Check for overlapping bookings
      const hasOverlap = room.bookings.some((booking) => {
        const bookingStart = DateTime.fromJSDate(booking.startTime).setZone('utc');
        const bookingEnd = DateTime.fromJSDate(booking.endTime).setZone('utc');
  
        return (
          bookingStart < requestedEnd &&
          bookingEnd > requestedStart
        );
      });
  
      if (!hasOverlap) {
        availableRooms.push(room);
      }
    }
  
    return availableRooms;
  }
  
  

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        site: { select: { name: true } },
        slots: { select: { startTime: true, endTime: true, pricing: true } },
      },
    });

    if (!room) {
      throw new NotFoundException('No room found with that ID');
    }

    const formattedSlots = room.slots.map((slot) => ({
      // startTime: DateTime.fromISO(slot.startTime).toFormat('HH:mm'),
      // endTime: DateTime.fromISO(slot.endTime).toFormat('HH:mm'),
      startTime: slot.startTime,
      endTime: slot.endTime,
      pricing: slot.pricing,
    }));

    return { ...room, slots: formattedSlots };
  }

  async update(
    id: string,
    updateRoomDto: UpdateRoomDto,
  ): Promise<Room | Error> {
    try {
      const { openingHours, ...roomData } = updateRoomDto;

      const room = await this.prisma.room.findUnique({
        where: { id },
        include: { slots: true },
      });

      if (!room) {
        throw new NotFoundException('No room found with that ID');
      }

      // Update room data
      const updatedRoom = await this.prisma.room.update({
        where: { id },
        data: roomData,
      });

      if (openingHours && openingHours.length > 0) {
        const formattedSlots = openingHours.map((slot) => ({
          // startTime: DateTime.fromFormat(slot.startTime, 'HH:mm').toISO(),
          // endTime: DateTime.fromFormat(slot.endTime, 'HH:mm').toISO(),
          startTime: slot.startTime,
          endTime: slot.endTime,
          pricing: slot.pricing,
        }));

        await this.prisma.openHours.deleteMany({
          where: { roomId: id },
        });

        await this.prisma.openHours.createMany({
          data: formattedSlots.map((slot) => ({
            ...slot,
            roomId: id,
          })),
        });
      }

      return updatedRoom;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  remove(id: string) {
    return `This action removes a #${id} room`;
  }
}
