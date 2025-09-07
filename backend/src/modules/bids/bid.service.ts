import prisma from '@shared/database/prisma';
import AppError from '@shared/utils/appError';
import { Bid, TaskStatus } from '@prisma/client';
import { createNotification } from '@modules/notifications/notification.service';
import { NotificationType } from '@prisma/client';
import { getSocketIO } from '../../socket';

class BidService {
  public async submitBid(freelancerId: string, taskId: string, proposal: string, amount: number): Promise<Bid> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, status: true, clientId: true, title: true },
    });

    if (!task) {
      throw new AppError('Task not found.', 404);
    }
    if (task.status !== TaskStatus.OPEN) {
      throw new AppError('Bids can only be submitted for OPEN tasks.', 400);
    }

    const existingBid = await prisma.bid.findUnique({
      where: {
        freelancerId_taskId: {
          freelancerId,
          taskId,
        },
      },
    });

    if (existingBid) {
      throw new AppError('You have already submitted a bid for this task.', 409);
    }

    const bid = await prisma.bid.create({
      data: {
        freelancerId,
        taskId,
        proposal,
        amount,
      },
      include: {
        freelancer: {
          select: { profile: { select: { firstName: true, lastName: true } }, email: true },
        },
      },
    });

    const freelancerName = bid.freelancer.profile?.firstName || bid.freelancer.email;

    await createNotification(
      task.clientId,
      NotificationType.NEW_BID,
      `${freelancerName} submitted a new bid for your task "${task.title}".`,
      `/dashboard/tasks/${taskId}`,
      taskId,
      bid.id,
    );

    const io = getSocketIO();
    if (io) {
      io.to(task.clientId).emit('new_notification', {
        message: `${freelancerName} submitted a new bid for "${task.title}"`,
        type: NotificationType.NEW_BID,
        url: `/dashboard/tasks/${taskId}`,
      });
    }
    return bid;
  }

  public async getBidsForTask(taskId: string, userId: string): Promise<Bid[]> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, clientId: true },
    });

    if (!task) {
      throw new AppError('Task not found.', 404);
    }
    if (task.clientId !== userId) {
      throw new AppError('You are not authorized to view bids for this task.', 403);
    }

    return prisma.bid.findMany({
      where: { taskId },
      include: {
        freelancer: {
          select: {
            id: true,
            email: true,
            profile: { select: { firstName: true, lastName: true, avatarUrl: true, skills: true, bio: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async acceptBid(bidId: string, clientId: string): Promise<Bid> {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        task: {
          select: { id: true, clientId: true, status: true, title: true, freelancerId: true },
        },
        freelancer: {
          select: { id: true, email: true, profile: { select: { firstName: true } } },
        },
      },
    });

    if (!bid) {
      throw new AppError('Bid not found.', 404);
    }
    if (bid.task.clientId !== clientId) {
      throw new AppError('You are not authorized to accept this bid.', 403);
    }
    if (bid.task.status !== TaskStatus.OPEN) {
      throw new AppError('This task is not open for new bids or has already been assigned.', 400);
    }

    const acceptedBid = await prisma.$transaction(async (tx) => {
      const updatedBid = await tx.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' },
      });

      await tx.task.update({
        where: { id: bid.taskId },
        data: {
          freelancerId: bid.freelancerId,
          status: TaskStatus.IN_PROGRESS,
        },
      });

      await tx.bid.updateMany({
        where: {
          taskId: bid.taskId,
          id: { not: bidId },
          status: 'PENDING',
        },
        data: {
          status: 'REJECTED',
        },
      });

      return updatedBid;
    });

    await createNotification(
      bid.freelancerId,
      NotificationType.BID_ACCEPTED,
      `Your bid for task "${bid.task.title}" has been accepted!`,
      `/dashboard/tasks/${bid.taskId}`,
      bid.taskId,
      bid.id,
    );

    const io = getSocketIO();
    if (io) {
      io.to(bid.freelancerId).emit('new_notification', {
        message: `Your bid for "${bid.task.title}" was accepted!`,
        type: NotificationType.BID_ACCEPTED,
        url: `/dashboard/tasks/${bid.taskId}`,
      });
    }

    return acceptedBid;
  }

  public async updateBid(
    bidId: string,
    freelancerId: string,
    data: { proposal?: string; amount?: number },
  ): Promise<Bid> {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { task: { select: { status: true } } },
    });

    if (!bid) {
      throw new AppError('Bid not found.', 404);
    }
    if (bid.freelancerId !== freelancerId) {
      throw new AppError('You are not authorized to update this bid.', 403);
    }
    if (bid.task.status !== TaskStatus.OPEN) {
      throw new AppError('Bids can only be updated while the task is open.', 400);
    }

    return prisma.bid.update({
      where: { id: bidId },
      data,
    });
  }

  // --- NEW: Withdraw Bid Method ---
  public async withdrawBid(bidId: string, freelancerId: string): Promise<void> {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { task: { select: { status: true } } },
    });

    if (!bid) {
      throw new AppError('Bid not found.', 404);
    }
    if (bid.freelancerId !== freelancerId) {
      throw new AppError('You are not authorized to withdraw this bid.', 403);
    }
    if (bid.task.status !== TaskStatus.OPEN) {
      throw new AppError('Bids can only be withdrawn while the task is open.', 400);
    }

    await prisma.bid.delete({ where: { id: bidId } });
  }
}

export default new BidService();
