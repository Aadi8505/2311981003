/**
 * Notification API Service
 * Frontend service for communicating with backend
 * 
 * Logging: uses custom FrontendLogger (no console.log/console.error)
 */

import axios, { AxiosInstance } from 'axios';
import { ApiResponse, PriorityNotification, NotificationType } from '../types';
import { logger } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class NotificationApiService {
  private httpClient: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.httpClient = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }

  /**
   * Get top priority notifications (all types)
   */
  async getPriorityNotifications(limit: number = 10): Promise<PriorityNotification[]> {
    try {
      logger.log('frontend', 'info', 'api', `Fetching priority notifications: limit=${limit}`);

      const response = await this.httpClient.get<ApiResponse<{ notifications: PriorityNotification[] }>>(
        '/notifications/priority',
        {
          params: { limit: Math.min(limit, 100) }
        }
      );

      if (response.data.success && response.data.data) {
        logger.log('frontend', 'info', 'api', `Received ${response.data.data.notifications.length} priority notifications`);
        return response.data.data.notifications;
      }

      const errMsg = response.data.error?.message || 'Failed to fetch priority notifications';
      logger.log('frontend', 'warn', 'api', `Non-success response: ${errMsg}`);
      throw new Error(errMsg);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error fetching priority notifications';
      logger.log('frontend', 'error', 'api', msg);
      throw error;
    }
  }

  /**
   * Get top priority notifications filtered by type
   */
  async getPriorityNotificationsByType(
    type: NotificationType,
    limit: number = 10
  ): Promise<PriorityNotification[]> {
    try {
      logger.log('frontend', 'info', 'api', `Fetching ${type} notifications: limit=${limit}`);

      const response = await this.httpClient.get<ApiResponse<{ notifications: PriorityNotification[] }>>(
        `/notifications/priority/${type}`,
        {
          params: { limit: Math.min(limit, 100) }
        }
      );

      if (response.data.success && response.data.data) {
        logger.log('frontend', 'info', 'api', `Received ${response.data.data.notifications.length} ${type} notifications`);
        return response.data.data.notifications;
      }

      const errMsg = response.data.error?.message || `Failed to fetch ${type} notifications`;
      logger.log('frontend', 'warn', 'api', `Non-success response for type=${type}: ${errMsg}`);
      throw new Error(errMsg);
    } catch (error) {
      const msg = error instanceof Error ? error.message : `Unknown error fetching ${type} notifications`;
      logger.log('frontend', 'error', 'api', msg);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getStats() {
    try {
      logger.log('frontend', 'info', 'api', 'Fetching notification statistics');
      const response = await this.httpClient.get('/notifications/stats');

      if (response.data.success) {
        return response.data.data;
      }

      const errMsg = response.data.error?.message || 'Failed to fetch statistics';
      logger.log('frontend', 'warn', 'api', errMsg);
      throw new Error(errMsg);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error fetching stats';
      logger.log('frontend', 'error', 'api', msg);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      logger.log('frontend', 'debug', 'api', 'Performing health check');
      const response = await this.httpClient.get('/notifications/health');
      return response.data.success === true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Health check failed';
      logger.log('frontend', 'warn', 'api', `Health check failed: ${msg}`);
      return false;
    }
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string): void {
    this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

export const notificationApi = new NotificationApiService();

export default NotificationApiService;
