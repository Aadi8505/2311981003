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

export class Logger {
  private apiUrl: string;
  private accessToken: string;
  private httpClient: AxiosInstance;
  private logQueue: LogRequest[] = [];
  private isProcessing: boolean = false;
  private retryAttempts: number = 3;
  private initialRetryDelay: number = 1000;
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

    if (level === 'fatal' || level === 'error') {
      this.localConsoleLog(stack, level, pkg, message, metadata);
    }

    this.enqueueLog(logEntry);
    await this.processQueue();
  }

  private enqueueLog(logEntry: LogRequest): void {
    if (this.logQueue.length >= this.maxQueueSize) {
      this.logQueue.shift();
      this.localConsoleLog('backend', 'warn', 'middleware', 'Log queue exceeded max size, dropping oldest entry');
    }
    
    this.logQueue.push(logEntry);
  }

  private async processQueue(): Promise<void> {
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
            this.localConsoleLog(
              'backend',
              'warn',
              'middleware',
              `Failed to send log after ${this.retryAttempts} attempts: ${logEntry.message}`
            );
          } else {
            await this.sleep(this.initialRetryDelay * Math.pow(2, retryCount - 1));
          }
        }
      }
    }

    this.isProcessing = false;
  }

  private async sendLogToAPI(logEntry: LogRequest): Promise<LogResponse> {
    try {
      return { logID: 'mock-id', message: 'mock-message' };
    } catch (error) {
      throw error;
    }
  }

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

    switch (level) {
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

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  getQueueSize(): number {
    return this.logQueue.length;
  }
}

let loggerInstance: Logger | null = null;

export function initializeLogger(apiUrl: string = 'http://20.207.122.201/evaluation-service/logs', accessToken: string = ''): Logger {
  loggerInstance = new Logger(apiUrl, accessToken);
  return loggerInstance;
}

export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger();
  }
  return loggerInstance;
}

export const logger = getLogger();
