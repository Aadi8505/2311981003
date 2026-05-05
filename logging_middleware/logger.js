import axios from 'axios';
export class Logger {
    constructor(apiUrl = 'http://20.207.122.201/evaluation-service/logs', accessToken = '') {
        this.logQueue = [];
        this.isProcessing = false;
        this.retryAttempts = 3;
        this.initialRetryDelay = 1000;
        this.maxQueueSize = 1000;
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
    async log(stack, level, pkg, message, metadata) {
        const logEntry = {
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
    enqueueLog(logEntry) {
        if (this.logQueue.length >= this.maxQueueSize) {
            this.logQueue.shift();
            this.localConsoleLog('backend', 'warn', 'middleware', 'Log queue exceeded max size, dropping oldest entry');
        }
        this.logQueue.push(logEntry);
    }
    async processQueue() {
        if (this.isProcessing || this.logQueue.length === 0) {
            return;
        }
        this.isProcessing = true;
        while (this.logQueue.length > 0) {
            const logEntry = this.logQueue.shift();
            if (!logEntry)
                break;
            let retryCount = 0;
            let success = false;
            while (retryCount < this.retryAttempts && !success) {
                try {
                    await this.sendLogToAPI(logEntry);
                    success = true;
                }
                catch (error) {
                    retryCount++;
                    if (retryCount >= this.retryAttempts) {
                        this.localConsoleLog('backend', 'warn', 'middleware', `Failed to send log after ${this.retryAttempts} attempts: ${logEntry.message}`);
                    }
                    else {
                        await this.sleep(this.initialRetryDelay * Math.pow(2, retryCount - 1));
                    }
                }
            }
        }
        this.isProcessing = false;
    }
    async sendLogToAPI(logEntry) {
        try {
            const response = await this.httpClient.post('', logEntry);
            if (!response.data.logID) {
                throw new Error('No logID in response');
            }
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
    localConsoleLog(stack, level, pkg, message, metadata) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${stack.toUpperCase()}] [${level.toUpperCase()}] [${pkg}]`;
        const fullMessage = `${prefix} ${message}`;
        switch (level) {
            case 'error':
                if (typeof console !== 'undefined')
                    console.error(fullMessage, metadata || '');
                break;
            case 'fatal':
                if (typeof console !== 'undefined')
                    console.error(`🔴 FATAL ${fullMessage}`, metadata || '');
                break;
            default:
                if (typeof console !== 'undefined')
                    console.log(fullMessage, metadata || '');
        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    setAccessToken(token) {
        this.accessToken = token;
        this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    getQueueSize() {
        return this.logQueue.length;
    }
}
let loggerInstance = null;
export function initializeLogger(apiUrl = 'http://20.207.122.201/evaluation-service/logs', accessToken = '') {
    loggerInstance = new Logger(apiUrl, accessToken);
    return loggerInstance;
}
export function getLogger() {
    if (!loggerInstance) {
        loggerInstance = new Logger();
    }
    return loggerInstance;
}
export const logger = getLogger();
//# sourceMappingURL=logger.js.map