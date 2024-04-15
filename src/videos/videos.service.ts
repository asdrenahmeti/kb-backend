import { Injectable } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { catchErrorHandler } from 'src/common/helpers/error-handler.prisma';
import { PrismaService } from 'src/prisma.service';
import { ServiceProps } from 'src/common/datatypes/types';
import { ApiTags } from '@nestjs/swagger';


@Injectable()
@ApiTags("Videos")
export class VideosService {
  constructor(readonly prisma: PrismaService) { }
  async create(createVideoDto: CreateVideoDto) {
    try {
      const video = await this.prisma.video.create({
        data: createVideoDto
      })
      return video
    } catch (error) {
      catchErrorHandler(error)
    }
  }

  async findAll({ filter, pagination, include }: ServiceProps) {
    try {
      const videos = await this.prisma.video.findMany({
        where: filter,
        include,
        ...(pagination && { skip: pagination.skip }),
        ...(pagination && { take: pagination.take })
      })
      if (pagination) {
        const all = await this.prisma.video.count({ where: filter })
        return {
          total_pages: Math.ceil(all / pagination.take),
          current_page: pagination.skip / pagination.take + 1,
          per_page: pagination.take,
          data: videos,
        };
      }
      return videos
    } catch (error) {
      catchErrorHandler(error)
    }
  }

  async findOne(id: number, { include }: ServiceProps) {
    try {
      const video = await this.prisma.video.findUnique({
        where: { id },
        include
      })
      return video
    } catch (error) {
      catchErrorHandler(error)
    }
  }

  async update(id: number, updateVideoDto: UpdateVideoDto) {
    try {
      const video = await this.prisma.video.update({
        where: { id },
        data: updateVideoDto
      })
      return video
    } catch (error) {
      catchErrorHandler(error)
    }
  }

  async remove(id: number) {
    try {
      const video = await this.prisma.video.delete({
        where: { id },
      })
      return video
    } catch (error) {
      catchErrorHandler(error)
    }
  }
}
