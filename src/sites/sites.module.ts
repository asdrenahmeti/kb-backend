import { Module } from '@nestjs/common';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SitesController],
  providers: [SitesService, PrismaService],
})
export class SitesModule {}
