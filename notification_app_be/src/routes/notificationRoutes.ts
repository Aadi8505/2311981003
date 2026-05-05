/**
 * Routes for Notification API
 */

import { Router } from 'express';
import { Logger } from '../middleware/logger';
import NotificationController from '../controllers/notificationController';

export function createNotificationRoutes(logger: Logger): Router {
  const router = Router();
  const controller = new NotificationController(logger);

  /**
   * Priority Notifications Routes
   */

  // Get top N priority notifications (all types)
  router.get('/priority', (req, res) => {
    controller.getPriorityNotifications(req, res);
  });

  // Get top N priority notifications filtered by type
  router.get('/priority/:type', (req, res) => {
    controller.getPriorityByType(req, res);
  });

  /**
   * Statistics Routes
   */

  // Get notification statistics
  router.get('/stats', (req, res) => {
    controller.getStats(req, res);
  });

  /**
   * Health Check Route
   */

  // Health check
  router.get('/health', (req, res) => {
    controller.healthCheck(req, res);
  });

  return router;
}

export default createNotificationRoutes;
