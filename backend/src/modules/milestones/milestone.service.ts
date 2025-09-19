import prisma from '@shared/database/prisma';
import AppError from '@shared/utils/appError';
import { Milestone, TaskStatus, MilestoneStatus } from '@prisma/client';
import { CreateMilestoneInput, SubmitMilestoneInput } from './milestone.validation';
import { createNotification } from '@modules/notifications/notification.service';
import { NotificationType } from '@prisma/client';
import { getSocketIO } from '../../socket';

class MilestoneService {
  public async createMilestones(
    clientId: string,
    taskId: string,
    milestonesData: CreateMilestoneInput[],
  ): Promise<Milestone[]> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, clientId: true, status: true, freelancerId: true, title: true },
    });

    if (!task) {
      throw new AppError('Task not found.', 404);
    }
    if (task.clientId !== clientId) {
      throw new AppError('You are not authorized to create milestones for this task.', 403);
    }
    if (task.status !== TaskStatus.IN_PROGRESS) {
      throw new AppError('Milestones can only be created for tasks that are IN_PROGRESS.', 400);
    }
    if (!task.freelancerId) {
      throw new AppError('A freelancer must be assigned to the task before creating milestones.', 400);
    }

    const createdMilestones = await prisma.$transaction(
      milestonesData.map((data) =>
        prisma.milestone.create({
          data: { ...data, taskId, dueDate: new Date(data.dueDate), status: MilestoneStatus.PENDING },
        }),
      ),
    );

    await createNotification(
      task.freelancerId,
      NotificationType.MILESTONE_CREATED,
      `New milestones have been created for your task "${task.title}".`,
      `/tasks/${taskId}`,
      taskId,
      undefined,
      undefined,
    );
    const io = getSocketIO();
    if (io) {
      io.to(task.freelancerId).emit('new_notification', {
        message: `New milestones for "${task.title}"`,
        type: NotificationType.MILESTONE_CREATED,
        url: `/tasks/${taskId}`,
      });
    }

    return createdMilestones;
  }

  public async getMilestonesForTask(requesterId: string, taskId: string): Promise<Milestone[]> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, clientId: true, freelancerId: true },
    });

    if (!task) {
      throw new AppError('Task not found.', 404);
    }
    if (task.clientId !== requesterId && task.freelancerId !== requesterId) {
      throw new AppError('You are not authorized to view milestones for this task.', 403);
    }

    return prisma.milestone.findMany({
      where: { taskId },
      include: { attachments: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  public async submitMilestone(
    freelancerId: string,
    milestoneId: string,
    attachments: SubmitMilestoneInput['attachments'],
    submissionNotes?: string,
  ): Promise<Milestone> {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { task: { select: { id: true, freelancerId: true, clientId: true, title: true } } },
    });

    if (!milestone) {
      throw new AppError('Milestone not found.', 404);
    }
    if (milestone.task.freelancerId !== freelancerId) {
      throw new AppError('You are not authorized to submit this milestone.', 403);
    }
    if (milestone.status !== MilestoneStatus.PENDING && milestone.status !== MilestoneStatus.REVISION_REQUESTED) {
      throw new AppError(`Milestone cannot be submitted in status: ${milestone.status}.`, 400);
    }

    const updatedMilestone = await prisma.$transaction(async (tx) => {
      await tx.milestoneAttachment.deleteMany({ where: { milestoneId } });
      await tx.milestoneAttachment.createMany({ data: attachments.map((att) => ({ ...att, milestoneId })) });
      return tx.milestone.update({
        where: { id: milestoneId },
        data: { status: MilestoneStatus.SUBMITTED, submissionNotes: submissionNotes },
      });
    });

    await createNotification(
      milestone.task.clientId,
      NotificationType.MILESTONE_SUBMITTED,
      `Freelancer submitted milestone "${milestone.description}" for task "${milestone.task.title}".`,
      `/tasks/${milestone.task.id}`,
      milestone.task.id,
      undefined,
      milestoneId,
    );
    const io = getSocketIO();
    if (io) {
      io.to(milestone.task.clientId).emit('new_notification', {
        message: `Milestone submitted for "${milestone.task.title}"`,
        type: NotificationType.MILESTONE_SUBMITTED,
        url: `/tasks/${milestone.task.id}`,
      });
    }

    return updatedMilestone;
  }

  public async requestMilestoneRevision(clientId: string, milestoneId: string, comments: string): Promise<Milestone> {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { task: { select: { id: true, clientId: true, freelancerId: true, title: true } } },
    });

    if (!milestone) {
      throw new AppError('Milestone not found.', 404);
    }
    if (milestone.task.clientId !== clientId) {
      throw new AppError('You are not authorized to request revision for this milestone.', 403);
    }
    if (milestone.status !== MilestoneStatus.SUBMITTED) {
      throw new AppError('Revision can only be requested for submitted milestones.', 400);
    }
    if (!milestone.task.freelancerId) {
      throw new AppError('Task has no assigned freelancer.', 400);
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: MilestoneStatus.REVISION_REQUESTED, revisionNotes: comments },
    });

    await createNotification(
      milestone.task.freelancerId,
      NotificationType.REVISION_REQUESTED,
      `Client requested revision for milestone "${milestone.description}" in task "${milestone.task.title}".`,
      `/tasks/${milestone.task.id}`,
      milestone.task.id,
      undefined,
      milestoneId,
    );
    const io = getSocketIO();
    if (io) {
      io.to(milestone.task.freelancerId).emit('new_notification', {
        message: `Revision requested for milestone "${milestone.task.title}"`,
        type: NotificationType.REVISION_REQUESTED,
        url: `/tasks/${milestone.task.id}`,
      });
    }

    return updatedMilestone;
  }

  public async approveMilestone(clientId: string, milestoneId: string): Promise<Milestone> {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        task: {
          select: {
            id: true,
            clientId: true,
            freelancerId: true,
            status: true,
            title: true,
            freelancer: { select: { stripeAccountCompleted: true } },
          },
        },
      },
    });

    if (!milestone) {
      throw new AppError('Milestone not found.', 404);
    }
    if (milestone.task.clientId !== clientId) {
      throw new AppError('You are not authorized to approve this milestone.', 403);
    }
    if (milestone.status !== MilestoneStatus.SUBMITTED && milestone.status !== MilestoneStatus.REVISION_REQUESTED) {
      throw new AppError(`Milestone cannot be approved in status: ${milestone.status}.`, 400);
    }
    if (!milestone.task.freelancerId) {
      throw new AppError('Task has no assigned freelancer.', 400);
    }

    const updatedMilestone = await prisma.$transaction(async (tx) => {
      const updated = await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: MilestoneStatus.APPROVED },
      });

      // try {
      //   await paymentService.processMilestonePayout(milestone.id);
      // } catch (paymentError) {
      //   throw new AppError('Payment processing failed. Please try again or contact support.', 500);
      // }

      const remainingPendingMilestones = await tx.milestone.count({
        where: { taskId: milestone.task.id, status: { notIn: [MilestoneStatus.APPROVED] } },
      });

      if (remainingPendingMilestones === 0) {
        await tx.task.update({ where: { id: milestone.task.id }, data: { status: TaskStatus.IN_REVIEW } });
        await createNotification(
          milestone.task.freelancerId!,
          NotificationType.MILESTONE_APPROVED,
          `All milestones for "${milestone.task.title}" are approved! The project is now in review.`,
          `/tasks/${milestone.task.id}`,
          milestone.task.id,
          undefined,
          milestoneId,
        );
      }
      return updated;
    });

    await createNotification(
      milestone.task.freelancerId,
      NotificationType.MILESTONE_APPROVED,
      `Your milestone "${milestone.description}" for task "${milestone.task.title}" has been approved and payment is on its way!`,
      `/tasks/${milestone.task.id}`,
      milestone.task.id,
      undefined,
      milestoneId,
    );
    const io = getSocketIO();
    if (io) {
      io.to(milestone.task.freelancerId).emit('new_notification', {
        message: `Milestone "${milestone.description}" approved for "${milestone.task.title}"!`,
        type: NotificationType.MILESTONE_APPROVED,
        url: `/tasks/${milestone.task.id}`,
      });
    }

    return updatedMilestone;
  }

  public async addCommentToAttachment(clientId: string, attachmentId: string, comment: string) {
    const attachment = await prisma.milestoneAttachment.findUnique({
      where: { id: attachmentId },
      include: { milestone: { include: { task: true } } },
    });

    if (!attachment) {
      throw new AppError('Attachment not found.', 404);
    }
    if (attachment.milestone.task.clientId !== clientId) {
      throw new AppError('You are not authorized to comment on this attachment.', 403);
    }

    const updatedAttachment = await prisma.milestoneAttachment.update({
      where: { id: attachmentId },
      data: { comments: comment },
    });

    await createNotification(
      attachment.milestone.task.freelancerId!,
      NotificationType.REVISION_REQUESTED,
      `Client commented on a file for milestone "${attachment.milestone.description}".`,
      `/tasks/${attachment.milestone.task.id}`,
      attachment.milestone.task.id,
      undefined,
      attachment.milestoneId,
    );

    return updatedAttachment;
  }
}

export default new MilestoneService();
