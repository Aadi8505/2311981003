export function requestLoggingMiddleware(logger) {
    return (req, res, next) => {
        const startTime = Date.now();
        const requestID = generateRequestID();
        const method = req.method;
        const path = req.path;
        const ip = req.ip;
        req.logger = logger;
        req.requestID = requestID;
        logger.log('backend', 'info', 'middleware', `[${requestID}] ${method} ${path} from ${ip}`, {
            method,
            path,
            ip,
            userAgent: req.get('user-agent'),
            requestID
        });
        const originalSend = res.send;
        res.send = function (data) {
            const duration = Date.now() - startTime;
            const statusCode = res.statusCode;
            let level = 'info';
            if (statusCode >= 500) {
                level = 'error';
            }
            else if (statusCode >= 400) {
                level = 'warn';
            }
            else if (statusCode === 200 || statusCode === 201) {
                level = 'debug';
            }
            logger.log('backend', level, 'middleware', `[${requestID}] ${method} ${path} completed with ${statusCode} (${duration}ms)`, {
                method,
                path,
                statusCode,
                duration,
                responseSize: typeof data === 'string' ? data.length : JSON.stringify(data).length,
                requestID
            });
            return originalSend.call(this, data);
        };
        next();
    };
}
export function errorLoggingMiddleware(logger) {
    return (err, req, res, next) => {
        const requestID = req.requestID || generateRequestID();
        logger.log('backend', 'error', 'middleware', `[${requestID}] Unhandled error: ${err.message}`, {
            error: err.message,
            stack: err.stack,
            requestID,
            path: req.path,
            method: req.method
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred',
                requestID
            }
        });
    };
}
function generateRequestID() {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
export default requestLoggingMiddleware;
//# sourceMappingURL=expressMiddleware.js.map