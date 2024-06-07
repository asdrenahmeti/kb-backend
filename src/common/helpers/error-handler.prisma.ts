import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export const catchErrorHandler = (error: any) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const errMsgArr = error.message.split('\n');
    const errMsg = errMsgArr[errMsgArr.length - 1];
    if (error.code === 'P2002') {
      throw new ConflictException(`${errMsg}`);
    } else if (error.code === 'P2025') {
      throw new NotFoundException(`${errMsg}`);
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    const errMsg = error.message.split('Invalid')[2];
    throw new BadRequestException(`Invalid ${errMsg}`);
  }
  throw new HttpException(error.message, error.status);
};
