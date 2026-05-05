import { Request, Response, NextFunction } from 'express';
import { Logger } from './logger';
export declare function requestLoggingMiddleware(logger: Logger): (req: Request, res: Response, next: NextFunction) => void;
export declare function errorLoggingMiddleware(logger: Logger): (err: any, req: Request, res: Response, next: NextFunction) => void;
export default requestLoggingMiddleware;
//# sourceMappingURL=expressMiddleware.d.ts.map