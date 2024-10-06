import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaService } from '../prisma.service';
import { EmailsService } from 'src/emails/emails.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, PrismaService, EmailsService],
})
export class BookingsModule {}
