import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async createAccount(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, firstName, lastName, username, role } =
      createUserDto;

    const guestUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!guestUser) {
      throw new NotFoundException('Guest user not found');
    }

    if (guestUser.role !== UserRole.GUEST) {
      throw new ConflictException('User is already registered');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: guestUser.id },
      data: {
        password: await bcrypt.hash(password, 10),
        firstName,
        lastName,
        username,
        role: UserRole.CUSTOMER,
      },
    });

    return updatedUser;
  }

  findAll() {
    return `This action returns all users`;
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
