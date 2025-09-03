import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '@config/index';
import AppError from '@shared/utils/appError';
import { v4 as uuidv4 } from 'uuid';

class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = config.AWS_S3_BUCKET_NAME;
  }

  /**
   * Generates a pre-signed URL for uploading a file to S3.
   * The client will use this URL to directly upload the file.
   * @param originalFileName The original name of the file (for S3 key suffix)
   * @param fileType The MIME type of the file (e.g., 'image/jpeg')
   * @param folder The folder inside the S3 bucket (e.g., 'task-attachments', 'avatars')
   * @returns An object containing the pre-signed URL and the S3 key (path)
   */
  public async getSignedUploadUrl(
    originalFileName: string,
    fileType: string,
    folder: string,
  ): Promise<{ uploadUrl: string; key: string }> {
    try {
      const fileExtension = originalFileName.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${uniqueFileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: fileType,
        ACL: 'private',
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

      return { uploadUrl, key };
    } catch (error: any) {
      console.error('Error generating S3 pre-signed URL:', error);
      throw new AppError(`Failed to generate upload URL: ${error.message}`, 500);
    }
  }

  /**
   * Generates a pre-signed URL for downloading a private file from S3.
   * @param key The S3 key (path) of the file.
   * @returns A pre-signed download URL.
   */
  public async getSignedDownloadUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      return downloadUrl;
    } catch (error: any) {
      console.error('Error generating S3 pre-signed download URL:', error);
      throw new AppError(`Failed to generate download URL: ${error.message}`, 500);
    }
  }
}

export default new S3Service();
