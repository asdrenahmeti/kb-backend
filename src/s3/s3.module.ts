import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3Controller } from './s3.controller';
import { PrismaService } from 'src/prisma.service';
import { S3Client } from '@aws-sdk/client-s3';
import { s3ClientProvider } from 'src/aws.config';

@Module({
  controllers: [S3Controller],
  providers: [S3Service, PrismaService, S3Client, s3ClientProvider],
})
export class S3Module {}
