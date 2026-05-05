/**
 * React Hook for logging
 * 
 * Usage:
 *   const logger = useLogger();
 *   logger.log("frontend", "info", "component", "Component mounted");
 */

import { useEffect, useRef, useCallback } from 'react';
import { Logger, getLogger } from './logger';

/**
 * React hook to use logger in components
 */
export function useLogger(): Logger {
  const loggerRef = useRef<Logger | null>(null);

  // Initialize or get existing logger
  useEffect(() => {
    if (!loggerRef.current) {
      // Get environment variables
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

/**
 * Hook to log component lifecycle events
 */
export function useComponentLogger(componentName: string) {
  const logger = useLogger();

  useEffect(() => {
    logger.log(
      'frontend',
      'debug',
      'component',
      `Component "${componentName}" mounted`
    );

    return () => {
      logger.log(
        'frontend',
        'debug',
        'component',
        `Component "${componentName}" unmounted`
      );
    };
  }, [componentName, logger]);

  return logger;
}

/**
 * Hook to log API calls
 */
export function useApiLogger() {
  const logger = useLogger();

  const logApiCall = useCallback(
    async (
      method: string,
      endpoint: string,
      fn: () => Promise<any>,
      metadata?: Record<string, any>
    ) => {
      const startTime = Date.now();

      try {
        logger.log(
          'frontend',
          'debug',
          'api',
          `API request: ${method} ${endpoint}`,
          { method, endpoint, ...metadata }
        );

        const result = await fn();
        const duration = Date.now() - startTime;

        logger.log(
          'frontend',
          'debug',
          'api',
          `API response: ${method} ${endpoint} (${duration}ms)`,
          { method, endpoint, duration, success: true }
        );

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        logger.log(
          'frontend',
          'error',
          'api',
          `API error: ${method} ${endpoint} (${duration}ms) - ${error instanceof Error ? error.message : 'Unknown error'}`,
          {
            method,
            endpoint,
            duration,
            error: error instanceof Error ? error.message : 'Unknown error',
            ...metadata
          }
        );

        throw error;
      }
    },
    [logger]
  );

  return { logger, logApiCall };
}

/**
 * Hook to log errors in components
 */
export function useErrorLogger(errorBoundaryName: string) {
  const logger = useLogger();

  const logError = useCallback(
    (error: Error, errorInfo?: Record<string, any>) => {
      logger.log(
        'frontend',
        'error',
        'component',
        `Error in ${errorBoundaryName}: ${error.message}`,
        {
          componentName: errorBoundaryName,
          errorMessage: error.message,
          errorStack: error.stack,
          ...errorInfo
        }
      );
    },
    [errorBoundaryName, logger]
  );

  return logError;
}

export default useLogger;
