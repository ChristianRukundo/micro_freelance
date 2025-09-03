import { Request, Response, NextFunction } from 'express';
import uploadService from './upload.service';
import { z } from 'zod';

const getSignedUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  folder: z.string().min(1, 'Upload folder is required'),
});

type GetSignedUrlInput = z.infer<typeof getSignedUrlSchema>;

class UploadController {
  public async getSignedUploadUrl(
    req: Request<unknown, unknown, GetSignedUrlInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { fileName, fileType, folder } = req.body;
      const { uploadUrl, key } = await uploadService.getPresignedUploadUrl(fileName, fileType, folder);
      res.status(200).json({ success: true, data: { uploadUrl, key } });
    } catch (error) {
      next(error);
    }
  }
}

export default new UploadController();
