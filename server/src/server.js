import app from './app.js';
import { env, validateEnv } from './config/env.js';
import { logger } from './utils/logger.js';

validateEnv();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Koko AI Backend running on http://localhost:${env.PORT}`);
  logger.info(`🌍 Allowed Client URL: ${env.CLIENT_URL}`);
  logger.info(`🤖 Default AI Provider: ${env.DEFAULT_TEXT_PROVIDER} (${env.DEFAULT_TEXT_MODEL})`);
});

// Graceful Shutdown
function handleShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forceful shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
