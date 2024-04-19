import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { Site } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SitesService {
  constructor(private prisma: PrismaService) {}
  async create(
    createSiteDto: CreateSiteDto,
    file: Express.Multer.File,
  ): Promise<Site> {
    const { name, openingHours, closingHours } = createSiteDto;

    const image = file?.filename;

    const site = await this.prisma.site.create({
      data: {
        name,
        image,
        openingHours,
        closingHours,
      },
    });

    return site;
  }

  async findAll() {
    return await this.prisma.site.findMany();
  }

  async findOne(id: string) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: { rooms: true },
    });
    if (!site) {
      throw new BadRequestException(`Site not found`);
    }
    return site;
  }

  async update(
    id: string,
    updateSiteDto: UpdateSiteDto,
    file: Express.Multer.File,
  ): Promise<Site> {
    const { name, openingHours, closingHours } = updateSiteDto;
    const image = file?.filename;

    const updatedSite = await this.prisma.site.update({
      where: { id },
      data: { name, openingHours, closingHours, image },
    });
    return updatedSite;
  }

  async deactivate(id: string): Promise<Site> {
    const updatedSite = await this.prisma.site.update({
      where: { id },
      data: { status: false },
    });
    return updatedSite;
  }

  async remove(id: string) {
    const deletedSite = await this.prisma.site.delete({
      where: { id },
    });
    return deletedSite;
  }
}
