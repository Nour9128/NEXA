import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './prisma.js';

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Verify DB connectivity
    await prisma.$connect();
    console.log(' Successfully connected to PostgreSQL database.');

    const server = app.listen(PORT, () => {
      console.log(` NEXA Server running at http://localhost:${PORT}`);
      console.log(` API Docs available at http://localhost:${PORT}/api/docs`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('PostgreSQL client disconnected. Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start NEXA backend server:', error);
    process.exit(1);
  }
}

startServer();
