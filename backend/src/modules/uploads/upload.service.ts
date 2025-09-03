import s3Service from '@shared/services/s3/s3.service';
import AppError from '@shared/utils/appError';

class UploadService {
  /**
   * Generates a pre-signed URL for a direct S3 upload.
   * @param fileName The original file name.
   * @param fileType The MIME type of the file.
   * @param folder The S3 folder (e.g., 'avatars', 'task-attachments').
   * @returns An object with the upload URL and the S3 key.
   */
  public async getPresignedUploadUrl(fileName: string, fileType: string, folder: string) {
    // Basic file type and size validation could be done here as well,
    // though client-side validation is primary for UX.
    if (!fileType.startsWith('image/') && !fileType.startsWith('application/pdf')) {
        throw new AppError('Unsupported file type. Only images and PDFs are allowed.', 400);
    }

    try {
      const { uploadUrl, key } = await s3Service.getSignedUploadUrl(fileName, fileType, folder);
      return { uploadUrl, key };
    } catch (error: any) {
      console.error('Error in UploadService.getPresignedUploadUrl:', error);
      throw new AppError(`Failed to get signed upload URL: ${error.message}`, 500);
    }
  }

  // If needed, a service could also provide signed download URLs for private files
  public async getPresignedDownloadUrl(key: string) {
    try {
      const downloadUrl = await s3Service.getSignedDownloadUrl(key);
      return downloadUrl;
    } catch (error: any) {
      console.error('Error in UploadService.getPresignedDownloadUrl:', error);
      throw new AppError(`Failed to get signed download URL: ${error.message}`, 500);
    }
  }
}

export default new UploadService();