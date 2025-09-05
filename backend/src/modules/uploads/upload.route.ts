import express, { Request, Response, Router } from 'express';
import upload from '@config/multer.config';
import { protect } from '@shared/middleware/auth.middleware';

const router: Router = express.Router();

router.post('/', protect, upload.array('files', 5), (req: Request, res: Response): Response => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files were uploaded.',
    });
  }

  try {
    const files = req.files as Express.Multer.File[];
    const folder = req.body.folder || 'general';
    const backendUrl = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;

    const uploadedFiles = files.map((file) => {
      const publicUrl = `${backendUrl}/uploads/${folder}/${file.filename}`;

      return {
        url: publicUrl,
        fileName: file.originalname,
        fileType: file.mimetype,
        key: `${folder}/${file.filename}`,
      };
    });

    return res.status(201).json({
      success: true,
      message: 'Files uploaded successfully!',
      data: { files: uploadedFiles },
    });
  } catch (error) {
    console.error('File upload processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing uploaded files.',
    });
  }
});

export default router;
