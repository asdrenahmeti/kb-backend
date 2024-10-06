import { Injectable, HttpException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Prisma, User } from '@prisma/client';
import { catchErrorHandler } from '../common/helpers/error-handler.prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (user && bcrypt.compareSync(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const user_id = user.id
    const name = user.firstName
    const surname = user.lastName
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      token: this.jwtService.sign(payload),
      role: user.role,
      id: user_id,
      name: name,
      surname: surname
    };
  }

  // async signUp(createAuthDto: CreateAuthDto) {
  //   const { email, password, role } = createAuthDto;
  //   const hashedPassword = await bcrypt.hash(password, 10);
  //   const user = await this.prisma.user.create({
  //     data: {
  //       email,
  //       password: hashedPassword,
  //       role: role,
  //     },
  //   });
  //   return user;
  // }
  async signUp(createAuthDto: CreateAuthDto) {
    try {
      const { email, password, role } = createAuthDto;
      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        email,
        password: hashedPassword,
        role: role || 'STAFF',
        firstName: '',
      };

      const user = await this.prisma.user.create({
        data: userData,
      });
      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'The email address is already registered. Please use a different email or log in.',
        );
      } else {
        catchErrorHandler(error);
      }
    }
  }
}
