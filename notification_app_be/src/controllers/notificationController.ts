import { Request, Response } from 'express';
import { Logger } from '../middleware/logger';
import PriorityNotificationService from '../services/priorityNotificationService';
import { config } from '../config';
import { NotificationType } from '../types';

interface RequestWithLogger extends Request {
  logger?: Logger;
  requestID?: string;
}

export class NotificationController {
  private priorityService: PriorityNotificationService;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.priorityService = new PriorityNotificationService(logger);
  }

  async getPriorityNotifications(req: RequestWithLogger, res: Response): Promise<void> {
    try {
      const limit = Math.min(
        parseInt(req.query.limit as string) || config.DEFAULT_LIMIT,
        config.MAX_LIMIT
      );

      const logger = req.logger || this.logger;

      logger.log(
        'backend',
        'info',
        'controller',
        `[${req.requestID}] Priority notifications requested: limit=${limit}`
      );

      const notifications = await this.priorityService.getTopNotifications(limit);

      const responseData = {
        success: true,
        data: {
          notifications,
          count: notifications.length,
          algorithm: 'Priority Score = (Type Weight × 10) + Recency Score',
          breakdown: {
            typeWeights: { 'Placement': 5, 'Result': 3, 'Event': 1 },
            recencyScores: { '0-6h': 9, '6-24h': 7, '24-48h': 5, '48h+': 1 }
          }
        },
        timestamp: new Date().toISOString(),
        requestID: req.requestID
      };

      logger.log(
        'backend',
        'info',
        'controller',
        `[${req.requestID}] Sent ${notifications.length} priority notifications`
      );

      res.status(200).json(responseData);

    } catch (error) {
      const logger = req.logger || this.logger;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      logger.log(
        'backend',
        'error',
        'controller',
        `[${req.requestID}] Error fetching priority notifications: ${errorMsg}`
      );

      res.status(500).json({
        success: false,
        error: {
          code: 'PRIORITY_FETCH_ERROR',
          message: 'Failed to fetch priority notifications',
          requestID: req.requestID
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  async getPriorityByType(req: RequestWithLogger, res: Response): Promise<void> {
    try {
      const type = req.params.type as NotificationType;
      const validTypes: NotificationType[] = ['Placement', 'Result', 'Event'];

      if (!validTypes.includes(type)) {
        const logger = req.logger || this.logger;

        logger.log(
          'backend',
          'warn',
          'controller',
          `[${req.requestID}] Invalid notification type: ${type}`
        );

        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: `Invalid notification type. Must be one of: ${validTypes.join(', ')}`,
            requestID: req.requestID
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const limit = Math.min(
        parseInt(req.query.limit as string) || config.DEFAULT_LIMIT,
        config.MAX_LIMIT
      );

      const logger = req.logger || this.logger;

      logger.log(
        'backend',
        'info',
        'controller',
        `[${req.requestID}] Priority ${type} notifications requested: limit=${limit}`
      );

      const notifications = await this.priorityService.getTopNotificationsByType(type, limit);

      const responseData = {
        success: true,
        data: {
          notifications,
          count: notifications.length,
          type,
          timestamp: new Date().toISOString()
        },
        requestID: req.requestID
      };

      logger.log(
        'backend',
        'info',
        'controller',
        `[${req.requestID}] Sent ${notifications.length} ${type} notifications`
      );

      res.status(200).json(responseData);

    } catch (error) {
      const logger = req.logger || this.logger;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const type = req.params.type || 'unknown';

      logger.log(
        'backend',
        'error',
        'controller',
        `[${req.requestID}] Error fetching ${type} notifications: ${errorMsg}`
      );

      res.status(500).json({
        success: false,
        error: {
          code: 'TYPE_FETCH_ERROR',
          message: `Failed to fetch ${type} notifications`,
          requestID: req.requestID
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  async healthCheck(req: RequestWithLogger, res: Response): Promise<void> {
    try {
      const logger = req.logger || this.logger;

      logger.log(
        'backend',
        'debug',
        'controller',
        `[${req.requestID}] Health check requested`
      );

      res.status(200).json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage()
        },
        requestID: req.requestID
      });

    } catch (error) {
      const logger = req.logger || this.logger;

      logger.log(
        'backend',
        'error',
        'controller',
        `[${req.requestID}] Health check failed`
      );

      res.status(500).json({
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: 'Health check failed'
        }
      });
    }
  }

  async getStats(req: RequestWithLogger, res: Response): Promise<void> {
    try {
      const logger = req.logger || this.logger;

      logger.log(
        'backend',
        'info',
        'controller',
        `[${req.requestID}] Statistics requested`
      );

      const allNotifications = await this.priorityService.getTopNotifications(1000);

      const stats = {
        total: allNotifications.length,
        byType: {
          Placement: allNotifications.filter(n => n.Type === 'Placement').length,
          Result: allNotifications.filter(n => n.Type === 'Result').length,
          Event: allNotifications.filter(n => n.Type === 'Event').length
        },
        averagePriority: allNotifications.length > 0
          ? (allNotifications.reduce((sum, n) => sum + n.priorityScore, 0) / allNotifications.length).toFixed(2)
          : 0
      };

      logger.log(
        'backend',
        'info',
        'controller',
        `[${req.requestID}] Statistics calculated: ${stats.total} notifications`
      );

      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
        requestID: req.requestID
      });

    } catch (error) {
      const logger = req.logger || this.logger;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      logger.log(
        'backend',
        'error',
        'controller',
        `[${req.requestID}] Error calculating statistics: ${errorMsg}`
      );

      res.status(500).json({
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: 'Failed to calculate statistics',
          requestID: req.requestID
        },
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default NotificationController;
