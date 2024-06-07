import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from '@prisma/client';

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
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      token: this.jwtService.sign(payload),
      role: user.role,
    };
  }

  async signUp(createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    return user;
  }
}
