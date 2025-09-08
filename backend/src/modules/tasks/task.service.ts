import prisma from '@shared/database/prisma';
import AppError from '@shared/utils/appError';
import { Attachment, Prisma, TaskStatus, UserRole } from '@prisma/client';
import { CreateTaskInput, GetTasksQueryInput, UpdateTaskInput } from './task.validation';
import { createNotification } from '@modules/notifications/notification.service';
import { NotificationType } from '@prisma/client';

class TaskService {
  public async createTask(clientId: string, data: CreateTaskInput): Promise<{ task: any; attachments: Attachment[] }> {
    const { attachments, deadline, skills, ...taskData } = data;

    const task = await prisma.task.create({
      data: {
        ...taskData,
        deadline: deadline ? new Date(deadline) : null, // ✅ pass null instead of undefined
        clientId,
        status: TaskStatus.OPEN,
        skills: skills,
      },
    });

    let createdAttachments: Attachment[] = [];
    if (attachments && attachments.length > 0) {
      createdAttachments = await Promise.all(
        attachments.map((att) =>
          prisma.attachment.create({
            data: {
              ...att,
              taskId: task.id,
            },
          }),
        ),
      );
    }

    return { task, attachments: createdAttachments };
  }

  public async getTasks(query: GetTasksQueryInput, user?: { id: string; role: UserRole }) {
    const { page = 1, limit = 10, categoryId, minBudget, maxBudget, status, q, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {};

    // --- SECURE USER-SPECIFIC FILTERING ---
    // If a user object is passed, filter tasks specifically for them.
    if (user) {
      if (user.role === UserRole.CLIENT) {
        where.clientId = user.id;
      } else if (user.role === UserRole.FREELANCER) {
        where.freelancerId = user.id;
      }
    } else {
      // For public 'browse tasks' page, default to OPEN
      where.status = status ? (status as TaskStatus) : TaskStatus.OPEN;
    }

    // Allow filtering by status for all users if provided.
    // If multiple statuses are passed, ensure they are handled correctly.
    if (status) {

      where.status = status as TaskStatus;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (minBudget !== undefined || maxBudget !== undefined) {
      where.budget = {};
      if (minBudget !== undefined) where.budget.gte = minBudget;
      if (maxBudget !== undefined) where.budget.lte = maxBudget;
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy || 'createdAt']: sortOrder || 'desc',
      },
      include: {
        client: {
          select: { id: true, email: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        freelancer: {
          select: { id: true, email: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        category: { select: { id: true, name: true } },
        _count: {
          select: { bids: true },
        },
      },
    });

    const totalTasks = await prisma.task.count({ where });

    return {
      tasks,
      totalTasks,
      page,
      limit,
      totalPages: Math.ceil(totalTasks / limit),
    };
  }
  // ADDED: New service to get task stats for the current user
  public async getMyTaskStats(userId: string, role: UserRole) {
    const commonWhere = role === UserRole.CLIENT ? { clientId: userId } : { freelancerId: userId };

    const statusCounts = await prisma.task.groupBy({
      by: ['status'],
      where: commonWhere,
      _count: {
        status: true,
      },
    });

    // Initialize all stats to 0
    const stats = {
      [TaskStatus.OPEN]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.IN_REVIEW]: 0,
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.CANCELLED]: 0,
      TOTAL: 0,
    };

    // Populate stats with actual counts
    statusCounts.forEach((item) => {
      stats[item.status] = item._count.status;
    });

    stats.TOTAL = Object.values(stats).reduce((sum, count) => sum + count, 0);

    return stats;
  }

  public async getTaskById(taskId: string, requesterId: string, _requesterRole: string) {
    // FIX: A single, powerful Prisma query that handles all logic.
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        client: {
          select: { id: true, email: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        freelancer: {
          select: { id: true, email: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        category: { select: { id: true, name: true } },
        attachments: true,
        _count: {
          select: { bids: true },
        },
        // This is the core of the fix: A conditional include for bids.
        bids: {
          // The 'where' clause filters which bids are returned based on the user's role.
          where: {
            // Logic:
            // OR:
            // 1. The requester is the client of the task (show all bids).
            // 2. The requester is the freelancer who made the bid (show only their bid).
            OR: [{ task: { clientId: requesterId } }, { freelancerId: requesterId }],
          },
          include: {
            freelancer: {
              select: {
                id: true,
                email: true,
                profile: { select: { firstName: true, lastName: true, avatarUrl: true, skills: true } },
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    return task;
  }

  public async updateTask(userId: string, taskId: string, data: UpdateTaskInput) {
    const existingTask = await prisma.task.findUnique({ where: { id: taskId } });

    if (!existingTask) {
      throw new AppError('Task not found.', 404);
    }
    if (existingTask.clientId !== userId) {
      throw new AppError('You are not authorized to update this task.', 403);
    }
    if (existingTask.status !== TaskStatus.OPEN && existingTask.status !== TaskStatus.IN_PROGRESS) {
      if (data.budget || data.categoryId) {
        throw new AppError('Cannot update budget or category for a task that is not OPEN.', 400);
      }
    }
    if (existingTask.status === TaskStatus.COMPLETED || existingTask.status === TaskStatus.CANCELLED) {
      throw new AppError('Cannot update a completed or cancelled task.', 400);
    }

    const { deadline, attachments, skills, ...updateData } = data;
    const dataToUpdate: Prisma.TaskUpdateInput = {};
    if (updateData.title) dataToUpdate.title = updateData.title;
    if (updateData.description) dataToUpdate.description = updateData.description;
    if (updateData.budget) dataToUpdate.budget = updateData.budget;
    if (updateData.status) dataToUpdate.status = updateData.status as TaskStatus;
    if (deadline) dataToUpdate.deadline = new Date(deadline);
    if (updateData.categoryId) {
      dataToUpdate.category = { connect: { id: updateData.categoryId } };
    }
    if (skills) {
      dataToUpdate.skills = skills;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: dataToUpdate,
    });

    if (attachments !== undefined) {
      await prisma.attachment.deleteMany({ where: { taskId } });
      if (attachments.length > 0) {
        await prisma.attachment.createMany({
          data: attachments.map((att) => ({ ...att, taskId: updatedTask.id })), // Use updatedTask.id
        });
      }
    }

    return updatedTask;
  }

  public async deleteTask(userId: string, taskId: string) {
    const existingTask = await prisma.task.findUnique({ where: { id: taskId } });

    if (!existingTask) {
      throw new AppError('Task not found.', 404);
    }
    if (existingTask.clientId !== userId) {
      throw new AppError('You are not authorized to delete this task.', 403);
    }
    if (existingTask.status !== TaskStatus.OPEN) {
      throw new AppError('Only tasks with OPEN status can be deleted.', 400);
    }

    const bidsCount = await prisma.bid.count({ where: { taskId } });
    if (bidsCount > 0) {
      throw new AppError('Cannot delete task as it has existing bids. Consider cancelling instead.', 400);
    }

    await prisma.task.delete({ where: { id: taskId } });
  }

  public async cancelTask(userId: string, taskId: string) {
    const existingTask = await prisma.task.findUnique({ where: { id: taskId } });

    if (!existingTask) {
      throw new AppError('Task not found.', 404);
    }
    if (existingTask.clientId !== userId && userId !== UserRole.ADMIN) {
      // Admin can also cancel
      throw new AppError('You are not authorized to cancel this task.', 403);
    }
    if (existingTask.status === TaskStatus.COMPLETED || existingTask.status === TaskStatus.CANCELLED) {
      throw new AppError('Task is already completed or cancelled.', 400);
    }

    const cancelledTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.CANCELLED },
    });

    if (cancelledTask.freelancerId) {
      await createNotification(
        cancelledTask.freelancerId,
        NotificationType.TASK_CANCELLED,
        `Task "${cancelledTask.title}" has been cancelled by the client.`,
        `/dashboard/tasks/${taskId}`,
        taskId,
      );
    }

    // TODO: Implement refund logic for any escrowed funds if task was in progress

    return cancelledTask;
  }

  public async completeTask(clientId: string, taskId: string): Promise<any> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, clientId: true, status: true },
    });

    if (!task) {
      throw new AppError('Task not found.', 404);
    }
    if (task.clientId !== clientId) {
      throw new AppError('You are not authorized to complete this task.', 403);
    }
    if (task.status !== TaskStatus.IN_REVIEW) {
      throw new AppError('Task can only be completed when it is in the IN_REVIEW state.', 400);
    }

    return prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.COMPLETED },
    });
  }
}

export default new TaskService();
