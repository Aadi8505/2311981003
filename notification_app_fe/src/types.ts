/**
 * Frontend Types and Interfaces
 */

export type NotificationType = 'Event' | 'Result' | 'Placement';

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
  IsRead?: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
  Priority?: number;
}

export interface PriorityNotification extends Notification {
  priorityScore?: number;
  recencyScore?: number;
  typeWeight?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp?: string;
}

export interface NotificationListResponse {
  notifications: PriorityNotification[];
  count: number;
  algorithm?: string;
}

export interface FilterOptions {
  type: 'All' | NotificationType;
  limit: number;
}
