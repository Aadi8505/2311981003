import { Logger } from './logger';
export declare function useLogger(): Logger;
export declare function useComponentLogger(componentName: string): Logger;
/**
 * Hook to log API calls
 */
export declare function useApiLogger(): {
    logger: Logger;
    logApiCall: any;
};
/**
 * Hook to log errors in components
 */
export declare function useErrorLogger(errorBoundaryName: string): any;
export default useLogger;
//# sourceMappingURL=useLogger.d.ts.map