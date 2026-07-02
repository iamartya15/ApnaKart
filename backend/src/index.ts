import dotenv from 'dotenv';
import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { Server as SocketIOServer } from 'socket.io';
import { configureAISocket } from './services/ai/ai.socket';

// Load environmental variables
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to DB and Cache
  await connectDB();
  await connectRedis();

  // Create HTTP Server
  const server = http.createServer(app);

  // Initialize Socket.io
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  configureAISocket(io);

  server.listen(PORT, () => {
    console.log(
      `[ApnaKart Backend] running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`,
    );
  });
};

startServer().catch((error) => {
  console.error('Fatal server boot failure:', error);
  process.exit(1);
});
