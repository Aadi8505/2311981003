/**
 * Campus Notification System - Backend
 * Production-Grade Express.js Application
 * 
 * Run: npm run dev (development)
 * Run: npm start (production)
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Logger, initializeLogger } from './middleware/logger';
import { requestLoggingMiddleware, errorLoggingMiddleware } from './middleware/expressMiddleware';
import { config, validateConfig } from './config';
import { createNotificationRoutes } from './routes/notificationRoutes';

// ============================================================================
// INITIALIZATION
// ============================================================================

class NotificationBackend {
  private app: Express;
  private logger: Logger;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.PORT as number;

    // Initialize logger with API credentials
    this.logger = initializeLogger(config.LOG_API_URL, config.ACCESS_TOKEN);

    // Validate configuration
    validateConfig();
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // Body parser middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // CORS middleware
    this.app.use(cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Request/Response logging middleware
    this.app.use(requestLoggingMiddleware(this.logger));

    // Custom middleware to attach logger and requestID to request
    this.app.use((req: any, _res: Response, next: NextFunction) => {
      req.logger = this.logger;
      next();
    });

    this.logger.log(
      'backend',
      'info',
      'middleware',
      'All middleware configured'
    );
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({
        message: 'Campus Notification System Backend',
        version: '1.0.0',
        status: 'operational',
        documentation: '/api/docs',
        endpoints: {
          priority: '/api/notifications/priority',
          byType: '/api/notifications/priority/:type',
          stats: '/api/notifications/stats',
          health: '/api/notifications/health'
        }
      });
    });

    // API Routes
    this.app.use('/api/notifications', createNotificationRoutes(this.logger));

    // Root API endpoint
    this.app.get('/api', (req: Request, res: Response) => {
      res.status(200).json({
        message: 'Campus Notification System API',
        version: '1.0.0',
        status: 'operational'
      });
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      this.logger.log(
        'backend',
        'warn',
        'route',
        `404 Not Found: ${req.method} ${req.path}`
      );

      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint not found',
          path: req.path,
          method: req.method
        }
      });
    });

    // Error handler (must be last)
    this.app.use(errorLoggingMiddleware(this.logger));

    this.logger.log(
      'backend',
      'info',
      'route',
      'All routes configured'
    );
  }

  /**
   * Start server
   */
  async start(): Promise<void> {
    try {
      this.setupMiddleware();
      this.setupRoutes();

      this.app.listen(this.port, () => {
        this.logger.log(
          'backend',
          'info',
          'config',
          `🚀 Notification Backend Server started on http://localhost:${this.port}`
        );

        this.logger.log(
          'backend',
          'info',
          'config',
          `📡 Environment: ${config.NODE_ENV}`
        );

        this.logger.log(
          'backend',
          'info',
          'config',
          `📝 Logging API: ${config.LOG_API_URL}`
        );

        this.logger.log(
          'backend',
          'info',
          'config',
          `🔗 External Notification API: ${config.NOTIFICATION_API_URL}`
        );
      });

      // Graceful shutdown
      process.on('SIGTERM', async () => {
        this.logger.log(
          'backend',
          'info',
          'config',
          'SIGTERM received, shutting down gracefully'
        );

        // Flush any pending logs
        await this.logger.flush();
        process.exit(0);
      });

      process.on('SIGINT', async () => {
        this.logger.log(
          'backend',
          'info',
          'config',
          'SIGINT received, shutting down gracefully'
        );

        // Flush any pending logs
        await this.logger.flush();
        process.exit(0);
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      this.logger.log(
        'backend',
        'fatal',
        'config',
        `Failed to start server: ${errorMsg}`
      );

      process.exit(1);
    }
  }
}

// ============================================================================
// START APPLICATION
// ============================================================================

const backend = new NotificationBackend();
backend.start().catch((error) => {
  process.stderr.write(`❌ Fatal error: ${error}\n`);
  process.exit(1);
});

export default NotificationBackend;
