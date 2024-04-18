import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PrismaClient, UserRole } from '@prisma/client';
export type CurrentUserType = {
  id: string;
  email: string;
  role: UserRole;
};
const prisma = new PrismaClient();
export const CurrentUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext): Promise<CurrentUserType> => {
    const request = ctx.switchToHttp().getRequest();
    return {
      id: request.user.id,
      email: request.user.email,
      role: request.user.role,
    };
  },
);
