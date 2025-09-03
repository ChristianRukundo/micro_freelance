import { Request, Response, NextFunction } from 'express';
import categoryService from './category.service';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').trim(),
});
type CreateCategoryBody = z.infer<typeof createCategorySchema>;

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').trim(),
});
type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;

const categoryIdParamSchema = z.object({
  id: z.string().cuid('Invalid category ID format'),
});
type CategoryIdParams = z.infer<typeof categoryIdParamSchema>;

class CategoryController {
  public async getAllCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  public async createCategory(req: Request<unknown, unknown, CreateCategoryBody>, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const category = await categoryService.createCategory(name);
      res.status(201).json({ success: true, message: 'Category created successfully.', data: category });
    } catch (error) {
      next(error);
    }
  }

  public async updateCategory(
    req: Request<CategoryIdParams, unknown, UpdateCategoryBody>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const category = await categoryService.updateCategory(id, name);
      res.status(200).json({ success: true, message: 'Category updated successfully.', data: category });
    } catch (error) {
      next(error);
    }
  }

  public async deleteCategory(req: Request<CategoryIdParams>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
