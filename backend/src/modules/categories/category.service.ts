import prisma from '@shared/database/prisma';
import AppError from '@shared/utils/appError';

class CategoryService {
  public async getAllCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // Admin-only: Create Category
  public async createCategory(name: string) {
    const existingCategory = await prisma.category.findUnique({ where: { name } });
    if (existingCategory) {
      throw new AppError('Category with this name already exists.', 409);
    }
    return prisma.category.create({ data: { name } });
  }

  // Admin-only: Update Category
  public async updateCategory(id: string, name: string) {
    const existingCategory = await prisma.category.findUnique({ where: { name } });
    if (existingCategory && existingCategory.id !== id) {
      throw new AppError('Another category with this name already exists.', 409);
    }
    return prisma.category.update({
      where: { id },
      data: { name },
    });
  }

  // Admin-only: Delete Category
  public async deleteCategory(id: string) {
    const categoryUsedInTasks = await prisma.task.count({ where: { categoryId: id } });
    if (categoryUsedInTasks > 0) {
      throw new AppError('Cannot delete category as it is associated with existing tasks.', 400);
    }
    await prisma.category.delete({ where: { id } });
  }
}

export default new CategoryService();