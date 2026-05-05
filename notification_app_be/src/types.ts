export type NotificationType = 'Event' | 'Result' | 'Placement';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type Stack = 'backend' | 'frontend';

export interface Notification {
  _id?: string;
  ID?: string;
  studentID: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface CreateNotificationRequest {
  type: NotificationType;
  message: string;
  targetStudentIDs?: string[];
  priority?: number;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  ID: string;
  Type: NotificationType;
  Message: string;
  IsRead: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  Priority: number;
}

export interface PaginationParams {
  limit: number;
  page: number;
  skip: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestID?: string;
}

export interface BatchNotificationJob {
  batchID: string;
  studentID: string;
  notificationType: NotificationType;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
  maxRetries: number;
  error?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface NotificationMetadata {
  sourceID?: string;
  sourceType?: string;
  additionalData?: Record<string, any>;
}

export interface PriorityNotification extends NotificationResponse {
  priorityScore: number;
  recencyScore: number;
  typeWeight: number;
}
