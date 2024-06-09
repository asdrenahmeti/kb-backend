import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { s3ClientProvider } from './aws.config';
import { UsersModule } from './users/users.module';
import { SitesModule } from './sites/sites.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { ProfilesModule } from './profiles/profiles.module';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { MenusModule } from './menus/menus.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    SitesModule,
    RoomsModule,
    BookingsModule,
    ProfilesModule,
    AuthModule,
    MenusModule,
  ],
  controllers: [AppController],
  providers: [AppService, s3ClientProvider, PrismaService],
})
export class AppModule {}
