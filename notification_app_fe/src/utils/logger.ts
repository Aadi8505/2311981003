import axios, { AxiosInstance } from 'axios';

export type Stack = 'backend' | 'frontend';
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type Package =
  | 'cache' | 'controller' | 'cron_job' | 'db' | 'domain'
  | 'handler' | 'repository' | 'route' | 'service'
  | 'api' | 'component' | 'hook' | 'page' | 'state' | 'style'
  | 'auth' | 'config' | 'middleware' | 'utils';

interface LogRequest {
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
}

const LOG_API_URL =
  import.meta.env.VITE_LOG_API_URL ||
  'http://20.207.122.201/evaluation-service/logs';
const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN || '';

class FrontendLogger {
  private httpClient: AxiosInstance;
  private logQueue: LogRequest[] = [];
  private isProcessing = false;

  constructor() {
    this.httpClient = axios.create({
      baseURL: LOG_API_URL,
      headers: {
        'Content-Type': 'application/json',
        ...(ACCESS_TOKEN && { Authorization: `Bearer ${ACCESS_TOKEN}` }),
      },
      timeout: 5000,
    });
  }

  async log(
    stack: Stack,
    level: Level,
    pkg: Package,
    message: string
  ): Promise<void> {
    const entry: LogRequest = { stack, level, package: pkg, message };
    this.logQueue.push(entry);
    this.processQueue().catch(() => {});
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.logQueue.length > 0) {
      const entry = this.logQueue.shift();
      if (!entry) break;
      try {
      } catch {
      }
    }

    this.isProcessing = false;
  }
}

export const logger = new FrontendLogger();
export default logger;
