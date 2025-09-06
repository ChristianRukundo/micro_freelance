import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import config from '@config/index';
import errorHandler from '@shared/middleware/errorHandler';
import { apiRateLimiter } from '@shared/middleware/rateLimiter';
import AppError from '@shared/utils/appError';

import authRoutes from '@modules/auth/auth.route';
import userRoutes from '@modules/user/user.route';
import categoryRoutes from '@modules/categories/category.route';
import taskRoutes from '@modules/tasks/task.route';
import bidRoutes from '@modules/bids/bid.route';
import milestoneRoutes from '@modules/milestones/milestone.route';
import paymentRoutes from '@modules/payments/payment.route';
import messageRoutes from '@modules/messaging/message.route';
import notificationRoutes from '@modules/notifications/notification.route';
import adminRoutes from '@modules/admin/admin.route';
import uploadRoutes from '@modules/uploads/upload.route';
import freelancerRoutes from '@modules/freelancers/freelancer.route'; 

import swaggerDocument from '@docs/swagger.json';
import path from 'path';

const app = express();

app.use(helmet());

app.use(apiRateLimiter);

app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json({ limit: '10kb' })(req, res, next);
  }
});
app.use(express.static(path.join(__dirname, '../public')));


app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/freelancers', freelancerRoutes); 
app.use('/api/uploads', uploadRoutes);

app.all('*', (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;
