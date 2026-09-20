import path from 'path';
import winston from 'winston';
import expressWinston from 'express-winston';

const tempDir = path.join(__dirname, '..', 'public', 'temp');

export const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({
      filename: path.join(tempDir, 'request.log'),
    }),
  ],
  format: winston.format.json(),
});

export const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
      filename: path.join(tempDir, 'error.log'),
    }),
  ],
  format: winston.format.json(),
});