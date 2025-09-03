import http from 'http';
import app from './app';
import config from '@config/index';
import { initSocket } from './socket';

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1); 
});

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(config.PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
  console.log(`Frontend URL: ${config.FRONTEND_URL}`);
  console.log(`API Docs: http://localhost:${config.PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1); 
  });
});

// Graceful shutdown on SIGTERM (e.g., from Docker)
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});