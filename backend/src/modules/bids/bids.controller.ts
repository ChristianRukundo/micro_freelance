import { Request, Response, NextFunction } from 'express';
import bidService from './bid.service';
import { SubmitBidInput, taskIdParamSchema, bidIdSchema, updateBidSchema } from './bid.validation';
import { z } from 'zod';

class BidController {
  public async submitBid(
    req: Request<z.infer<typeof taskIdParamSchema>, unknown, SubmitBidInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { taskId } = req.params;
      const { proposal, amount } = req.body;
      const bid = await bidService.submitBid(req.user!.id, taskId, proposal, amount);
      res.status(201).json({ success: true, message: 'Bid submitted successfully.', data: bid });
    } catch (error) {
      next(error);
    }
  }

  public async getBidsForTask(req: Request<z.infer<typeof taskIdParamSchema>>, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const bids = await bidService.getBidsForTask(taskId, req.user!.id);
      res.status(200).json({ success: true, data: bids });
    } catch (error) {
      next(error);
    }
  }

  public async acceptBid(req: Request<z.infer<typeof bidIdSchema>>, res: Response, next: NextFunction) {
    try {
      const { bidId } = req.params;
      const acceptedBid = await bidService.acceptBid(bidId, req.user!.id);
      res.status(200).json({ success: true, message: 'Bid accepted successfully.', data: acceptedBid });
    } catch (error) {
      next(error);
    }
  }

   public async updateBid(
    req: Request<z.infer<typeof bidIdSchema>, unknown, z.infer<typeof updateBidSchema >>,
    res: Response,
    next: NextFunction,
  ) {
    try {
        const { bidId } = req.params;
        const updatedBid = await bidService.updateBid(bidId, req.user!.id, req.body);
        res.status(200).json({ success: true, message: 'Bid updated successfully.', data: updatedBid });
    } catch (error) {
        next(error);
    }
  }

  // --- NEW: Withdraw Bid Controller ---
  public async withdrawBid(req: Request<z.infer<typeof bidIdSchema>>, res: Response, next: NextFunction) {
    try {
        const { bidId } = req.params;
        await bidService.withdrawBid(bidId, req.user!.id);
        res.status(204).send(); // 204 No Content for successful deletion
    } catch (error) {
        next(error);
    }
  }
}

export default new BidController();
