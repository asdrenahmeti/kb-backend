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
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EmailsModule } from './emails/emails.module';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    UsersModule,
    SitesModule,
    RoomsModule,
    BookingsModule,
    ProfilesModule,
    AuthModule,
    MenusModule,
    EmailsModule,
    NotesModule,
    NotesModule
  ],
  controllers: [AppController],
  providers: [AppService, s3ClientProvider, PrismaService],
})
export class AppModule {}
