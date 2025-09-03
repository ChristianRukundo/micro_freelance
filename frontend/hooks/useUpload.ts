import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import api from '@/lib/api';

interface UploadResult {
  url: string; // Public URL of the uploaded file
  key: string; // S3 key (path) of the uploaded file
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Ensure these are accessed correctly from environment variables
  const awsRegion = process.env.NEXT_PUBLIC_AWS_REGION;
  const s3BucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;

  const uploadFiles = useCallback(async (files: File[], folder: string = 'general'): Promise<UploadResult[]> => {
    if (!awsRegion || !s3BucketName) {
      const configError = 'AWS S3 configuration missing. Check NEXT_PUBLIC_AWS_REGION and NEXT_PUBLIC_AWS_S3_BUCKET_NAME in .env.local';
      toast.error(configError);
      setError(configError);
      throw new Error(configError);
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const results: UploadResult[] = [];
    let completedUploads = 0;

    try {
      for (const file of files) {
        const fileName = file.name;
        const fileType = file.type;

        const signedUrlResponse = await api.post<{ data: { uploadUrl: string; key: string } }>(
          '/uploads/signed-url',
          { fileName, fileType, folder },
        );
        const { uploadUrl, key } = signedUrlResponse.data.data;

        await axios.put(uploadUrl, file, {
          headers: {
            'Content-Type': fileType,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              // You might want to store per-file progress if multiple files
              setUploadProgress(percentage);
            }
          },
        });

        // Reconstruct public URL based on S3 naming convention
        const publicUrl = `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com/${key}`;

        results.push({ url: publicUrl, key });
        completedUploads++;
        // Update overall progress if multiple files
        setUploadProgress(Math.round((completedUploads / files.length) * 100));
      }

      toast.success(`${files.length} file(s) uploaded successfully!`);
      return results;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'File upload failed.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [awsRegion, s3BucketName]); // Depend on env vars

  const removeFile = useCallback(async (s3Key?: string) => {
    if (!s3Key) return;
    try {
      // In a real application, you would call a backend endpoint here
      // to securely delete the file from S3 using the S3Key.
      // E.g., await api.delete(`/uploads/s3-delete?key=${s3Key}`);
      toast.info(`File ${s3Key.split('/').pop()} removed locally. (S3 deletion not implemented in frontend)`);
    } catch (err: any) {
      toast.error(`Failed to initiate file deletion: ${err.response?.data?.message || err.message}`);
    }
  }, []);

  return { isUploading, uploadProgress, error, uploadFiles, removeFile };
}