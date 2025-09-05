// File: hooks/useUpload.ts

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface UploadResult {
  url: string; // Public URL of the uploaded file
  key: string; // Path of the uploaded file on the server
  fileName: string;
  fileType: string;
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(async (files: File[], folder: string = 'general'): Promise<UploadResult[]> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('folder', folder); // Send the folder destination to the backend
    files.forEach(file => {
      formData.append('files', file); // 'files' must match the field name in multer config
    });

    try {
      const response = await api.post<{ data: { files: UploadResult[] } }>(
        '/uploads',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentage);
            }
          },
        }
      );

      toast.success(`${files.length} file(s) uploaded successfully!`);
      return response.data.data.files;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'File upload failed.';
      setError(errorMessage);
      // The global API interceptor will already show a toast, so this is optional
      // toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const removeFile = useCallback(async (key?: string) => {
    if (!key) return;
    toast.info(`File remove action triggered for: ${key}. Deletion on server is not implemented in this version.`);
  }, []);

  return { isUploading, uploadProgress, error, uploadFiles, removeFile };
}