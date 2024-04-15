import { S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import {NodeHttpHandler} from '@smithy/node-http-handler';
import {Agent} from 'node:https';
config();
const credentials = {
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_KEY_SECRET,
};

const region = process.env.AWS_S3_LOCATION
export const s3ClientProvider = {
  provide: S3Client,
  useValue: new S3Client({credentials,region }),
};