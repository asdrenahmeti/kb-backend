import { Injectable } from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SongsService {
  constructor(private prisma: PrismaService) {}
  async create(createSongDto: CreateSongDto) {
    const { artistName, songName, duration } = createSongDto;
    return this.prisma.song.create({
      data: {
        artistName,
        songName,
        duration,
      },
    });
  }

  async findAll() {
    return this.prisma.song.findMany();
  }

  async findOne(id: string) {
    return this.prisma.song.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateSongDto: UpdateSongDto) {
    return this.prisma.song.update({
      where: { id },
      data: updateSongDto,
    });
  }

  async remove(id: string) {
    return this.prisma.song.delete({
      where: { id },
    });
  }
}
