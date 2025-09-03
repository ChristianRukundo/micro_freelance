import { Router } from 'express';
import categoryController from './category.controller';
import { protect, authorize } from '@shared/middleware/auth.middleware';
import { adminProtect } from '@shared/middleware/admin.middleware';
import { validateRequest } from '@shared/middleware/validateRequest';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const router = Router();

const categoryIdSchema = z.object({
  id: z.string().cuid('Invalid category ID format'),
});

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').trim(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').trim(),
});

router.get('/', categoryController.getAllCategories);

// Admin routes
router.use(protect, authorize(UserRole.ADMIN), adminProtect);
router.post('/', validateRequest({ body: createCategorySchema }), categoryController.createCategory);
router.put('/:id', validateRequest({ params: categoryIdSchema, body: updateCategorySchema }), categoryController.updateCategory);
router.delete('/:id', validateRequest({ params: categoryIdSchema }), categoryController.deleteCategory);

export default router;