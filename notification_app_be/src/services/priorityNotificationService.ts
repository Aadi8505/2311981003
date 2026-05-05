import axios, { AxiosError } from 'axios';
import { Logger } from '../middleware/logger';
import { config } from '../config';
import {
  Notification,
  NotificationType,
  PriorityNotification,
  NotificationResponse,
} from '../types';

interface ExternalNotification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

export class PriorityNotificationService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  private calculateRecencyScore(timestamp: string): number {
    const notificationTime = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours <= 6) return 9;
    if (diffHours <= 24) return 7;
    if (diffHours <= 48) return 5;
    return 1;
  }

  private getTypeWeight(type: string): number {
    const weights = {
      'Placement': 5,
      'Result': 3,
      'Event': 1
    };
    return weights[type as keyof typeof weights] || 0;
  }

  private calculatePriorityScore(notification: ExternalNotification): number {
    const typeWeight = this.getTypeWeight(notification.Type);
    const recencyScore = this.calculateRecencyScore(notification.Timestamp);
    return (typeWeight * 10) + recencyScore;
  }

  async fetchNotificationsFromAPI(
    limit: number = 100,
    page: number = 1,
    notificationType?: NotificationType
  ): Promise<ExternalNotification[]> {
    try {
      this.logger.log('backend', 'info', 'service', `Fetching notifications from external API: limit=${limit}, page=${page}, type=${notificationType || 'all'}`);

      const params = new URLSearchParams({
        limit: Math.min(limit, 100).toString(),
        page: page.toString(),
        ...(notificationType && { notification_type: notificationType })
      });

      const response = await axios.get(
        `${config.NOTIFICATION_API_URL}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${config.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const notifications = response.data.notifications || [];

      this.logger.log('backend', 'info', 'service', `Successfully fetched ${notifications.length} notifications from external API`);

      return notifications;

    } catch (error) {
      const errorMsg = error instanceof AxiosError
        ? `API Error: ${error.response?.status} - ${error.message}`
        : (error instanceof Error ? error.message : 'Unknown error');

      this.logger.log('backend', 'warn', 'service', `Failed to fetch notifications from external API: ${errorMsg}, using mock data as fallback`);

      return this.getMockNotifications(limit, notificationType);
    }
  }
  private getMockNotifications(limit: number, type?: NotificationType): ExternalNotification[] {
    const allMock: ExternalNotification[] = [
      {
        ID: '1',
        Type: 'Placement',
        Message: 'Interview scheduled with Google for Software Engineer position',
        Timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        ID: '2',
        Type: 'Result',
        Message: 'DSA Quiz Results: You scored 92/100 - Excellent performance!',
        Timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        ID: '3',
        Type: 'Placement',
        Message: 'Amazon on-campus recruitment drive - Registration open now',
        Timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        ID: '4',
        Type: 'Event',
        Message: 'Tech Talk: Future of AI in 2026 - Join us tomorrow at 3 PM',
        Timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        ID: '5',
        Type: 'Result',
        Message: 'Internship Program Selection: Congratulations! You are selected',
        Timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
      },
      {
        ID: '6',
        Type: 'Placement',
        Message: 'Microsoft internship opportunity - Deadline: Tomorrow',
        Timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        ID: '7',
        Type: 'Event',
        Message: 'Career Fair 2026 - Meet 50+ companies this weekend',
        Timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
      },
      {
        ID: '8',
        Type: 'Result',
        Message: 'Web Dev Project Submission: Grade A+ received!',
        Timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      }
    ];

    const filtered = type ? allMock.filter(n => n.Type === type) : allMock;
    return filtered.slice(0, limit);
  }

  async getTopNotifications(topN: number = 10): Promise<PriorityNotification[]> {
    try {
      this.logger.log('backend', 'info', 'service', `Starting priority calculation for top ${topN} notifications`);

      const notifications = await this.fetchNotificationsFromAPI(topN * 2);

      if (notifications.length === 0) {
        this.logger.log('backend', 'warn', 'service', 'No notifications found from external API');
        return [];
      }

      const priorityNotifications: PriorityNotification[] = notifications.map(notif => {
        const typeWeight = this.getTypeWeight(notif.Type);
        const recencyScore = this.calculateRecencyScore(notif.Timestamp);
        const priorityScore = this.calculatePriorityScore(notif);

        return {
          ID: notif.ID,
          Type: notif.Type,
          Message: notif.Message,
          Timestamp: notif.Timestamp,
          IsRead: false,
          CreatedAt: notif.Timestamp,
          UpdatedAt: notif.Timestamp,
          Priority: priorityScore,
          priorityScore,
          recencyScore,
          typeWeight
        };
      });

      const sorted = priorityNotifications
        .sort((a, b) => {
          if (b.priorityScore !== a.priorityScore) {
            return b.priorityScore - a.priorityScore;
          }
          return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
        })
        .slice(0, Math.min(topN, 100));

      this.logger.log('backend', 'info', 'service', `Priority notifications calculated. Top ${sorted.length} selected.`);

      sorted.slice(0, 5).forEach((n, index) => {
        this.logger.log('backend', 'debug', 'service', `Priority #${index + 1}: Type=${n.Type}, Score=${n.priorityScore}, Message="${n.Message.substring(0, 50)}..."`);
      });

      return sorted;

    } catch (error) {
      this.logger.log('backend', 'error', 'service', `Error in getTopNotifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async getTopNotificationsByType(
    notificationType: NotificationType,
    topN: number = 10
  ): Promise<PriorityNotification[]> {
    try {
      this.logger.log('backend', 'info', 'service', `Fetching top ${topN} ${notificationType} notifications`);

      const notifications = await this.fetchNotificationsFromAPI(topN * 3, 1, notificationType);

      const priorityNotifications: PriorityNotification[] = notifications.map(notif => {
        const typeWeight = this.getTypeWeight(notif.Type);
        const recencyScore = this.calculateRecencyScore(notif.Timestamp);
        const priorityScore = this.calculatePriorityScore(notif);

        return {
          ID: notif.ID,
          Type: notif.Type,
          Message: notif.Message,
          Timestamp: notif.Timestamp,
          IsRead: false,
          CreatedAt: notif.Timestamp,
          UpdatedAt: notif.Timestamp,
          Priority: priorityScore,
          priorityScore,
          recencyScore,
          typeWeight
        };
      });

      const sorted = priorityNotifications
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, Math.min(topN, 100));

      this.logger.log('backend', 'info', 'service', `Retrieved top ${sorted.length} ${notificationType} notifications`);

      return sorted;

    } catch (error) {
      this.logger.log('backend', 'error', 'service', `Error fetching ${notificationType} notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}

export default PriorityNotificationService;