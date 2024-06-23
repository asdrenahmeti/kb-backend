import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuItem } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuDto: CreateMenuDto): Promise<MenuItem> {
    const { site_id, item_type, name, price } = createMenuDto;

    const site = await this.prisma.site.findUnique({
      where: { id: site_id },
    });
    if (!site) {
      throw new NotFoundException('Site not found');
    }

    return this.prisma.menuItem.create({
      data: { name, item_type, price, site_id },
    });
  }

  async findAll(): Promise<MenuItem[]> {
    return this.prisma.menuItem.findMany({ include: { site: true } });
  }

  async findOne(id: string): Promise<MenuItem> {
    const menu = await this.prisma.menuItem.findUnique({
      where: { id },
    });
    if (!menu) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }
    return menu;
  }

  async findBySiteId(siteId: string): Promise<MenuItem[]> {
    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
    });
    if (!site) {
      throw new NotFoundException(`Site with id ${siteId} not found`);
    }

    return this.prisma.menuItem.findMany({
      where: { site_id: siteId },
    });
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<MenuItem> {
    const menu = await this.prisma.menuItem.findUnique({
      where: { id },
    });
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    const { site_id } = updateMenuDto;
    if (site_id) {
      const site = await this.prisma.site.findUnique({
        where: { id: site_id },
      });
      if (!site) {
        throw new NotFoundException('Site not found');
      }
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: updateMenuDto,
    });
  }

  async remove(id: string): Promise<MenuItem> {
    const menu = await this.prisma.menuItem.findUnique({
      where: { id },
    });
    if (!menu) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }
    return this.prisma.menuItem.delete({
      where: { id },
    });
  }
}
