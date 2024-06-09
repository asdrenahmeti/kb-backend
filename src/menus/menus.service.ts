import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const { site_id, item_type, name, price } = createMenuDto;

    const site = await this.prisma.site.findUnique({
      where: { id: site_id },
    });
    if (!site) {
      throw new NotFoundException('Site not found');
    }

    return this.prisma.menu.create({
      data: { name, item_type, price, site_id },
    });
  }

  async findAll(): Promise<Menu[]> {
    return this.prisma.menu.findMany({ include: { site: true } });
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    });
    if (!menu) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }
    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.prisma.menu.findUnique({
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

    return this.prisma.menu.update({
      where: { id },
      data: updateMenuDto,
    });
  }

  async remove(id: string): Promise<Menu> {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    });
    if (!menu) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }
    return this.prisma.menu.delete({
      where: { id },
    });
  }
}
