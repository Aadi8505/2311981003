import { Router } from 'express';
import { Logger } from '../middleware/logger';
import NotificationController from '../controllers/notificationController';

export function createNotificationRoutes(logger: Logger): Router {
  const router = Router();
  const controller = new NotificationController(logger);

  router.get('/priority', (req, res) => {
    controller.getPriorityNotifications(req, res);
  });

  router.get('/priority/:type', (req, res) => {
    controller.getPriorityByType(req, res);
  });

  router.get('/stats', (req, res) => {
    controller.getStats(req, res);
  });

  router.get('/health', (req, res) => {
    controller.healthCheck(req, res);
  });
  return router;
}

export default createNotificationRoutes;
