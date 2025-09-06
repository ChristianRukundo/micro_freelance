import { Request, Response, NextFunction } from 'express';
import taskService from './task.service';
import { CreateTaskInput, GetTasksQueryInput, UpdateTaskInput, taskIdSchema } from './task.validation';
import { z } from 'zod';

class TaskController {
  public async createTask(req: Request<unknown, unknown, CreateTaskInput>, res: Response, next: NextFunction) {
    try {
      const { task, attachments } = await taskService.createTask(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Task created successfully and is now open for bids.',
        data: { task, attachments },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getTasks(
    req: Request<unknown, unknown, unknown, GetTasksQueryInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const queryParams = req.query;
      const tasksData = await taskService.getTasks(queryParams);
      res.status(200).json({ success: true, data: tasksData });
    } catch (error) {
      next(error);
    }
  }

 public async getTaskById(req: Request<z.infer<typeof taskIdSchema>>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
    
      const requesterId = req.user!.id;
      const requesterRole = req.user!.role;

      const task = await taskService.getTaskById(id, requesterId, requesterRole);
      
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }


  public async updateTask(
    req: Request<z.infer<typeof taskIdSchema>, unknown, UpdateTaskInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const updatedTask = await taskService.updateTask(req.user!.id, id, req.body);
      res.status(200).json({ success: true, message: 'Task updated successfully.', data: updatedTask });
    } catch (error) {
      next(error);
    }
  }

  public async deleteTask(req: Request<z.infer<typeof taskIdSchema>>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await taskService.deleteTask(req.user!.id, id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  public async cancelTask(req: Request<z.infer<typeof taskIdSchema>>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cancelledTask = await taskService.cancelTask(req.user!.id, id);
      res.status(200).json({ success: true, message: 'Task cancelled successfully.', data: cancelledTask });
    } catch (error) {
      next(error);
    }
  }

  public async completeTask(req: Request<z.infer<typeof taskIdSchema>>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const completedTask = await taskService.completeTask(req.user!.id, id);
      res.status(200).json({ success: true, message: 'Task marked as completed.', data: completedTask });
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();
