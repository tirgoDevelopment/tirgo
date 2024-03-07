// mail.service.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AwsService {

  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
        region: 'ap-south-1', // Use the correct region code
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
        },
    });
    // this.s3Client = new S3Client({ region: 'ap-south-1' }); 
  }

  async uploadFile(keyName: string, file: any): Promise<boolean>{
    try {
        const s3Params = {
            Bucket: 'tirgo-bucket',
            Key: `${keyName}/${file.originalname.split(' ').join('').trim()}`,
            Body: file.buffer,
          };
          // Perform the PutObject operation
          const command = new PutObjectCommand(s3Params);
          const res = await this.s3Client.send(command);
          if(res['$metadata'].httpStatusCode) {
              return true
          } else {
              return false
          }
    } catch(err: any) {
        console.log('AWS buket error: ', err)
        return false
    }
  }

  async deleteFile(keyName: string, fileName: string): Promise<boolean> {
    const s3Params = {
      Bucket: 'tirgo-bucket',
      Key: `${keyName}/${fileName}`,
  };

  try {
      const command = new DeleteObjectCommand(s3Params);
      console.log('delete', `${keyName}/${fileName}`);
      const res = await this.s3Client.send(command);
      console.log('delete successful');
      return true;
  } catch (error) {
      console.error('AWS buket delete error ', error);
      return false;
  }
  }

  async getFileStream(keyName: string, fileName: string) {
   try {
    const s3Params = {
      Bucket: 'tirgo-bucket',
      Key: `${keyName}/${fileName}`,
    };
    const command = new GetObjectCommand(s3Params);
    const response = await this.s3Client.send(command);
    return response.Body;
   } catch(err: any) {
    console.log(err)
   }
  }

}
