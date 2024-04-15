import { Injectable } from '@nestjs/common';
import { CreateS3Dto } from './dto/create-s3.dto';
import { UpdateS3Dto } from './dto/update-s3.dto';
import { Readable } from 'stream';
import { CompleteMultipartUploadCommand, CreateMultipartUploadCommand, S3Client, UploadPartCommand } from '@aws-sdk/client-s3';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  constructor(private readonly s3Client: S3Client) {}
  async uploadFile(file: Express.Multer.File) {
    try {
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null); // Mark the end of the stream

      const createMultipartUploadCommand = new CreateMultipartUploadCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: file.originalname,
      });
      const { UploadId } = await this.s3Client.send(
        createMultipartUploadCommand,
      );

      const parts = [];
      let partNumber = 0;

      for await (const chunks of stream) {
        partNumber++;
        const uploadPartCommand = new UploadPartCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: file.originalname,
          PartNumber: partNumber,
          UploadId,
          Body: String(chunks),
        });

        const { ETag } = await this.s3Client.send(uploadPartCommand);
        console.log(ETag);
        parts.push({ ETag, PartNumber: partNumber });
      }
      const completeMultipartUploadCommand = new CompleteMultipartUploadCommand(
        {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: file.originalname,
          MultipartUpload: { Parts: parts },
          UploadId,
        },
      );

      const result = await this.s3Client.send(completeMultipartUploadCommand);
      return { filename: file.originalname, location: result.Location };
    } catch (err) {
      console.log(err);
      return { message: 'File upload failed' };
    }
  }
  create(createS3Dto: CreateS3Dto) {
    return 'This action adds a new s3';
  }

  findAll() {
    return `This action returns all s3`;
  }

  findOne(id: number) {
    return `This action returns a #${id} s3`;
  }

  update(id: number, updateS3Dto: UpdateS3Dto) {
    return `This action updates a #${id} s3`;
  }

  remove(id: number) {
    return `This action removes a #${id} s3`;
  }
}
