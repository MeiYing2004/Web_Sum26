import type { Request, Response, NextFunction } from 'express';
import { newRequestId, requestContext } from './request-context';

export function requestIdMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = newRequestId(
      (req.headers['x-request-id'] as string) || (req.headers['x-correlation-id'] as string)
    );
    res.setHeader('x-request-id', requestId);
    (req as Request & { requestId: string }).requestId = requestId;
    requestContext.run({ requestId }, () => next());
  };
}
