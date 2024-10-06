import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Booking_note } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async addNote(bookingId: string, userId: string, content: string): Promise<Booking_note> {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    return this.prisma.booking_note.create({
      data: {
        content,
        booking: { connect: { id: bookingId } },
        user: { connect: { id: userId } },
      },
    });
  }

  async getNotesForBooking(bookingId: string): Promise<Booking_note[]> {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    return this.prisma.booking_note.findMany({
      where: { bookingId },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteNote(id: string): Promise<void> {
    const note = await this.prisma.booking_note.findUnique({ where: { id } });
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    await this.prisma.booking_note.delete({ where: { id } });
  }
}