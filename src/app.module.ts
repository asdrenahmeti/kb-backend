import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { VideosModule } from './videos/videos.module';
import { S3Module } from './s3/s3.module';
import { ConfigModule } from '@nestjs/config';
import { s3ClientProvider } from './aws.config';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true,
  }),
  UsersModule, EmployeesModule, VideosModule, S3Module, TestModule],
  controllers: [AppController],
  providers: [AppService,s3ClientProvider],
})
export class AppModule { }
