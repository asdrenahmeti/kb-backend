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
  constructor(private prisma: PrismaService) { }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async createAccount(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, firstName, lastName, username, role } =
      createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        firstName,
        lastName,
        username,
        role,
      },
    });

    return newUser;
  }

  async findByToken(token: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { token: token }, // Query using token
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    return user;
  }

  async changePassword(id: string, new_password: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });
  }

  async completeProfile(id: string, new_password: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    const hashedNewPassword = await bcrypt.hash(new_password, 10);
  
    // Update the user's password, clear token, and change role to CUSTOMER
    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword,
        token: null, // Empty the token
        role: 'CUSTOMER', // Change the role
      },
    });
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        phone_number: true,
        entryToken: true,
        token: true,
        profileImg: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }


  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.prisma.profile.findUnique({ where: { user_id: id } });

    if (profile) {
      await this.prisma.$transaction([
        this.prisma.profile.delete({ where: { user_id: id } }),
        this.prisma.user.delete({ where: { id } }),
      ]);
    } else {
      await this.prisma.user.delete({ where: { id } });
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { email, firstName, lastName, username, role } = updateUserDto;

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        email: email || user.email,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        username: username || user.username,
        role: role || user.role,
      },
    });

    return updatedUser;
  }
}
