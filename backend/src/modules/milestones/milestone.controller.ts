import { Request, Response, NextFunction } from 'express';
import milestoneService from './milestone.service';
import {
  CreateMultipleMilestonesInput,
  taskIdParamSchema,
  milestoneIdParamSchema,
  RequestRevisionInput,
  SubmitMilestoneInput,
  attachmentIdParamSchema, // ADDED
  addAttachmentCommentSchema, // ADDED
} from './milestone.validation';
import { z } from 'zod';

class MilestoneController {
  public async createMilestones(
    req: Request<z.infer<typeof taskIdParamSchema>, unknown, CreateMultipleMilestonesInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { taskId } = req.params;
      const milestones = await milestoneService.createMilestones(req.user!.id, taskId, req.body.milestones);
      res.status(201).json({ success: true, message: 'Milestones created successfully.', data: milestones });
    } catch (error) {
      next(error);
    }
  }

  public async getMilestonesForTask(
    req: Request<z.infer<typeof taskIdParamSchema>>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { taskId } = req.params;
      const milestones = await milestoneService.getMilestonesForTask(req.user!.id, taskId);
      res.status(200).json({ success: true, data: milestones });
    } catch (error) {
      next(error);
    }
  }

  public async submitMilestone(
    req: Request<z.infer<typeof milestoneIdParamSchema>, unknown, SubmitMilestoneInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { milestoneId } = req.params;
      const { attachments, submissionNotes } = req.body;
      const milestone = await milestoneService.submitMilestone(req.user!.id, milestoneId, attachments, submissionNotes);
      res.status(200).json({ success: true, message: 'Milestone submitted for review.', data: milestone });
    } catch (error) {
      next(error);
    }
  }

  public async requestMilestoneRevision(
    req: Request<z.infer<typeof milestoneIdParamSchema>, unknown, RequestRevisionInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { milestoneId } = req.params;
      const { comments } = req.body;
      const milestone = await milestoneService.requestMilestoneRevision(req.user!.id, milestoneId, comments);
      res.status(200).json({ success: true, message: 'Revision requested for milestone.', data: milestone });
    } catch (error) {
      next(error);
    }
  }

  public async approveMilestone(
    req: Request<z.infer<typeof milestoneIdParamSchema>>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { milestoneId } = req.params;
      const milestone = await milestoneService.approveMilestone(req.user!.id, milestoneId);
      res.status(200).json({ success: true, message: 'Milestone approved.', data: milestone });
    } catch (error) {
      next(error);
    }
  }

  public async addCommentToAttachment(
    req: Request<z.infer<typeof attachmentIdParamSchema>, unknown, z.infer<typeof addAttachmentCommentSchema>>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { attachmentId } = req.params;
      const { comment } = req.body;
      const updatedAttachment = await milestoneService.addCommentToAttachment(req.user!.id, attachmentId, comment);
      res.status(200).json({ success: true, message: 'Comment added successfully.', data: updatedAttachment });
    } catch (error) {
      next(error);
    }
  }
}

export default new MilestoneController();
