import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { catchErrorHandler } from 'src/common/helpers/error-handler.prisma';

@Injectable()
export class UsersService {
  constructor(readonly prisma: PrismaService) { }
  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: createUserDto
      })
      return user
    } catch (error) {
      catchErrorHandler(error)
    }
  }

  async findAll(filterQuery: any) {
    try {
      const employees = await this.prisma.user.findMany({
        where: {
          ...filterQuery
        }
      })
      return employees
    } catch (error) {
      catchErrorHandler(error)
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
