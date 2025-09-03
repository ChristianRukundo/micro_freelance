import { Router } from 'express';
import uploadController from './upload.controller';
import { protect } from '@shared/middleware/auth.middleware';
import { validateRequest } from '@shared/middleware/validateRequest';
import { z } from 'zod';

const router = Router();

const getSignedUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  folder: z.string().min(1, 'Upload folder is required').regex(/^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/, 'Invalid folder name'),
});

router.use(protect); // All routes below this require authentication

router.post('/signed-url', validateRequest({ body: getSignedUrlSchema }), uploadController.getSignedUploadUrl);

export default router;