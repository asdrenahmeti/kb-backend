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

      // const siteOpeningTime = DateTime.fromISO(site.openingHours);
      // const siteClosingTime = DateTime.fromISO(site.closingHours);

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

      if (openingHours && openingHours.length > 0) {
        for (const slot of openingHours) {
          // const startTime = DateTime.fromFormat(slot.startTime, 'HH:mm');
          // const endTime = DateTime.fromFormat(slot.endTime, 'HH:mm');

          // if (startTime < siteOpeningTime || endTime > siteClosingTime) {
          //   throw new Error('Slot falls outside of site opening hours');
          // }

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
