/**
 * Centralized Logging Middleware
 * 
 * Provides production-grade structured logging for both backend and frontend
 * Sends logs to the evaluation service API
 * 
 * Usage:
 *   logger.log("backend", "info", "handler", "Request received")
 *   logger.log("frontend", "error", "component", "Failed to fetch data")
 */

import axios, { AxiosInstance } from 'axios';

export type Stack = 'backend' | 'frontend';
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type BackendPackage = 
  | 'cache' | 'controller' | 'cron_job' | 'db' | 'domain'
  | 'handler' | 'repository' | 'route' | 'service'
  | 'auth' | 'config' | 'middleware' | 'utils';
export type FrontendPackage = 
  | 'api' | 'component' | 'hook' | 'page' | 'state' | 'style'
  | 'auth' | 'config' | 'middleware' | 'utils';
export type Package = BackendPackage | FrontendPackage;

export interface LogEntry {
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface LogResponse {
  logID: string;
  message: string;
}

export interface LogError {
  code: string;
  message: string;
  details?: any;
}

interface LogRequest {
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
}

/**
 * Logger Class
 * 
 * Implements production-grade logging with:
 * - Structured log format
 * - API integration
 * - Retry logic with exponential backoff
 * - Queue for offline scenarios
 * - Local logging fallback
 */
export class Logger {
  private apiUrl: string;
  private accessToken: string;
  private httpClient: AxiosInstance;
  private logQueue: LogRequest[] = [];
  private isProcessing: boolean = false;
  private retryAttempts: number = 3;
  private initialRetryDelay: number = 1000; // 1 second
  private maxQueueSize: number = 1000;

  constructor(apiUrl: string = 'http://20.207.122.201/evaluation-service/logs', accessToken: string = '') {
    this.apiUrl = apiUrl;
    this.accessToken = accessToken;
    
    this.httpClient = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
      },
      timeout: 5000
    });
  }

  /**
   * Main logging method - sends logs to the evaluation service
   * 
   * @param stack - 'backend' or 'frontend'
   * @param level - Log severity level
   * @param pkg - Package/module name
   * @param message - Log message
   * @param metadata - Optional additional data
   */
  async log(
    stack: Stack,
    level: Level,
    pkg: Package,
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const logEntry: LogRequest = {
      stack,
      level,
      package: pkg,
      message
    };

    // Validate log level for severity warnings
    if (level === 'fatal' || level === 'error') {
      this.localConsoleLog(stack, level, pkg, message, metadata);
    }

    // Add to queue
    this.enqueueLog(logEntry);

    // Try to send immediately
    await this.processQueue();
  }

  /**
   * Add log to queue for batch processing
   */
  private enqueueLog(logEntry: LogRequest): void {
    if (this.logQueue.length >= this.maxQueueSize) {
      // Remove oldest entry if queue is full
      this.logQueue.shift();
      this.localConsoleLog('backend', 'warn', 'middleware', 'Log queue exceeded max size, dropping oldest entry');
    }
    
    this.logQueue.push(logEntry);
  }

  /**
   * Process log queue with retry logic
   */
  private async processQueue(): Promise<void> {
    // Prevent concurrent processing
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.logQueue.length > 0) {
      const logEntry = this.logQueue.shift();
      
      if (!logEntry) break;

      let retryCount = 0;
      let success = false;

      while (retryCount < this.retryAttempts && !success) {
        try {
          await this.sendLogToAPI(logEntry);
          success = true;
        } catch (error) {
          retryCount++;

          if (retryCount >= this.retryAttempts) {
            // Final attempt failed - log locally
            this.localConsoleLog(
              'backend',
              'warn',
              'middleware',
              `Failed to send log after ${this.retryAttempts} attempts: ${logEntry.message}`
            );
          } else {
            // Exponential backoff before retry
            const delay = this.initialRetryDelay * Math.pow(2, retryCount - 1);
            await this.sleep(delay);
          }
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Send individual log to API with retry logic
   */
  private async sendLogToAPI(logEntry: LogRequest): Promise<LogResponse> {
    try {
      const response = await this.httpClient.post<LogResponse>('', logEntry);
      
      if (!response.data.logID) {
        throw new Error('No logID in response');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Local console logging fallback
   * Used for critical errors and debugging
   */
  private localConsoleLog(
    stack: Stack,
    level: Level,
    pkg: Package,
    message: string,
    metadata?: Record<string, any>
  ): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${stack.toUpperCase()}] [${level.toUpperCase()}] [${pkg}]`;
    const fullMessage = `${prefix} ${message}`;

    // Use appropriate console method based on level
    switch (level) {
      case 'debug':
        if (typeof console !== 'undefined') console.debug(fullMessage, metadata || '');
        break;
      case 'info':
        if (typeof console !== 'undefined') console.log(fullMessage, metadata || '');
        break;
      case 'warn':
        if (typeof console !== 'undefined') console.warn(fullMessage, metadata || '');
        break;
      case 'error':
        if (typeof console !== 'undefined') console.error(fullMessage, metadata || '');
        break;
      case 'fatal':
        if (typeof console !== 'undefined') console.error(`🔴 FATAL ${fullMessage}`, metadata || '');
        break;
      default:
        if (typeof console !== 'undefined') console.log(fullMessage, metadata || '');
    }
  }

  /**
   * Utility: Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
    this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.logQueue.length;
  }

  /**
   * Force flush all logs in queue
   */
  async flush(): Promise<void> {
    await this.processQueue();
  }

  /**
   * Clear all queued logs (use with caution)
   */
  clear(): void {
    this.logQueue = [];
  }
}

/**
 * Singleton instance for global usage
 */
let loggerInstance: Logger | null = null;

/**
 * Initialize and get logger instance
 */
export function initializeLogger(
  apiUrl?: string,
  accessToken?: string
): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger(apiUrl, accessToken);
  }
  return loggerInstance;
}

/**
 * Get existing logger instance
 */
export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger();
  }
  return loggerInstance;
}

export default Logger;
