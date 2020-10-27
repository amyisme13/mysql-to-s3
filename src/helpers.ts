import S3 from 'aws-sdk/clients/s3';
import { spawn } from 'child_process';
import randomString from 'crypto-random-string';
import { format } from 'date-fns';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { pipeline } from 'stream';
import { createGzip } from 'zlib';

import { Instance } from './database/schema';

export const mysqldump = (instance: Instance): Promise<string> => {
  const filename = `${randomString({ length: 10 })}.sql`;
  const filepath = path.join(os.tmpdir(), filename);
  const stream = fs.createWriteStream(filepath);

  return new Promise((resolve, reject) => {
    spawn('mysqldump', [
      `--host=${instance.host}`,
      `--port=${instance.port}`,
      `--user=${instance.username}`,
      `--password=${instance.password}`,
      '--all-databases',
    ])
      .stdout.pipe(stream)
      .on('finish', () => {
        resolve(filepath);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

export const gzip = (filepath: string): Promise<string> => {
  const gzip = createGzip({ level: 9 });
  const source = fs.createReadStream(filepath);
  const dest = fs.createWriteStream(`${filepath}.gz`);

  return new Promise((resolve, reject) => {
    pipeline(source, gzip, dest, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(`${filepath}.gz`);
      }
    });
  });
};

export const storeToS3 = async (
  instance: Instance,
  sourceFile: string,
  bucket: string
): Promise<string> => {
  const s3 = new S3();
  const stream = fs.createReadStream(sourceFile);

  const date = new Date();
  const dateString = format(date, 'yyyy-MM-dd-HH-mm');
  const filename = `mts-${instance.name}-${dateString}.sql.gz`;

  return new Promise((resolve, reject) => {
    s3.upload(
      {
        Bucket: bucket,
        Body: stream,
        Key: filename,
        StorageClass: 'STANDARD_IA',
        Tagging: `Instance=${instance.name}`,
      },
      {
        partSize: 10 * 1024 * 1024,
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(filename);
        }
      }
    );
  });
};

export const mysqldumpToS3 = async (
  instance: Instance,
  bucket: string
): Promise<void> => {
  const dumpResult = await mysqldump(instance);
  const gzipResult = await gzip(dumpResult);
  await storeToS3(instance, gzipResult, bucket);

  await fs.unlink(dumpResult);
  await fs.unlink(gzipResult);
};
