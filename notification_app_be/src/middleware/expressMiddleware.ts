import { Request, Response, NextFunction } from 'express';
import { Logger } from './logger';

export function requestLoggingMiddleware(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestID = generateRequestID();
    const method = req.method;
    const path = req.path;
    const ip = req.ip;

    // Attach logger to request for use in handlers
    (req as any).logger = logger;
    (req as any).requestID = requestID;

    // Log incoming request
    logger.log(
      'backend',
      'info',
      'middleware',
      `[${requestID}] ${method} ${path} from ${ip}`,
      {
        method,
        path,
        ip,
        userAgent: req.get('user-agent'),
        requestID
      }
    );

    // Capture response
    const originalSend = res.send;

    res.send = function(data: any) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Determine log level based on status code
      let level: 'debug' | 'info' | 'warn' | 'error' = 'info';
      if (statusCode >= 500) {
        level = 'error';
      } else if (statusCode >= 400) {
        level = 'warn';
      } else if (statusCode === 200 || statusCode === 201) {
        level = 'debug';
      }

      logger.log(
        'backend',
        level,
        'middleware',
        `[${requestID}] ${method} ${path} completed with ${statusCode} (${duration}ms)`,
        {
          method,
          path,
          statusCode,
          duration,
          responseSize: typeof data === 'string' ? data.length : JSON.stringify(data).length,
          requestID
        }
      );

      return originalSend.call(this, data);
    };

    next();
  };
}

export function errorLoggingMiddleware(logger: Logger) {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    const requestID = (req as any).requestID || 'unknown';
    
    logger.log(
      'backend',
      'error',
      'middleware',
      `[${requestID}] Unhandled error: ${err.message}`,
      {
        error: err.message,
        stack: err.stack,
        requestID,
        path: req.path,
        method: req.method
      }
    );

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        requestID
      }
    });
  };
}

/**
 * Generate unique request ID
 */
function generateRequestID(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default requestLoggingMiddleware;
