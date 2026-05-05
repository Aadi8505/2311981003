import { useEffect, useRef, useCallback } from 'react';
import { getLogger } from './logger';
export function useLogger() {
    const loggerRef = useRef(null);
    useEffect(() => {
        if (!loggerRef.current) {
            const apiUrl = process.env.REACT_APP_LOG_API_URL ||
                'http://20.207.122.201/evaluation-service/logs';
            const accessToken = process.env.REACT_APP_ACCESS_TOKEN || '';
            const logger = getLogger();
            if (accessToken) {
                logger.setAccessToken(accessToken);
            }
            loggerRef.current = logger;
        }
    }, []);
    return loggerRef.current || getLogger();
}
export function useComponentLogger(componentName) {
    const logger = useLogger();
    useEffect(() => {
        logger.log('frontend', 'debug', 'component', `Component "${componentName}" mounted`);
        return () => {
            logger.log('frontend', 'debug', 'component', `Component "${componentName}" unmounted`);
        };
    }, [componentName, logger]);
    return logger;
}
/**
 * Hook to log API calls
 */
export function useApiLogger() {
    const logger = useLogger();
    const logApiCall = useCallback(async (method, endpoint, fn, metadata) => {
        const startTime = Date.now();
        try {
            logger.log('frontend', 'debug', 'api', `API request: ${method} ${endpoint}`, { method, endpoint, ...metadata });
            const result = await fn();
            const duration = Date.now() - startTime;
            logger.log('frontend', 'debug', 'api', `API response: ${method} ${endpoint} (${duration}ms)`, { method, endpoint, duration, success: true });
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.log('frontend', 'error', 'api', `API error: ${method} ${endpoint} (${duration}ms) - ${error instanceof Error ? error.message : 'Unknown error'}`, {
                method,
                endpoint,
                duration,
                error: error instanceof Error ? error.message : 'Unknown error',
                ...metadata
            });
            throw error;
        }
    }, [logger]);
    return { logger, logApiCall };
}
/**
 * Hook to log errors in components
 */
export function useErrorLogger(errorBoundaryName) {
    const logger = useLogger();
    const logError = useCallback((error, errorInfo) => {
        logger.log('frontend', 'error', 'component', `Error in ${errorBoundaryName}: ${error.message}`, {
            componentName: errorBoundaryName,
            errorMessage: error.message,
            errorStack: error.stack,
            ...errorInfo
        });
    }, [errorBoundaryName, logger]);
    return logError;
}
export default useLogger;
//# sourceMappingURL=useLogger.js.map