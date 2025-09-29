import morgan from 'morgan';
import { Request, Response } from 'express';

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (_req: Request, res: Response) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom format for development
const developmentFormat = ':method :url :status :res[content-length] - :response-time ms';

// Custom format for production
const productionFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

export const logger = morgan(
  process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat
);

export default logger;