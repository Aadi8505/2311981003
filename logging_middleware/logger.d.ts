export type Stack = 'backend' | 'frontend';
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type BackendPackage = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service' | 'auth' | 'config' | 'middleware' | 'utils';
export type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style' | 'auth' | 'config' | 'middleware' | 'utils';
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
export declare class Logger {
    private apiUrl;
    private accessToken;
    private httpClient;
    private logQueue;
    private isProcessing;
    private retryAttempts;
    private initialRetryDelay;
    private maxQueueSize;
    constructor(apiUrl?: string, accessToken?: string);
    log(stack: Stack, level: Level, pkg: Package, message: string, metadata?: Record<string, any>): Promise<void>;
    private enqueueLog;
    private processQueue;
    private sendLogToAPI;
    private localConsoleLog;
    private sleep;
    setAccessToken(token: string): void;
    getQueueSize(): number;
}
export declare function initializeLogger(apiUrl?: string, accessToken?: string): Logger;
export declare function getLogger(): Logger;
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map