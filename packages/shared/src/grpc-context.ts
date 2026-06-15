import * as grpc from '@grpc/grpc-js';
import { newRequestId } from './request-context';

export function getGrpcRequestId(call: { metadata?: grpc.Metadata }): string {
  const meta = call.metadata;
  if (!meta) return newRequestId();
  const id = meta.get('x-request-id')[0] || meta.get('x-correlation-id')[0];
  return id ? String(id) : newRequestId();
}

export function grpcMetadataWithRequestId(requestId: string): grpc.Metadata {
  const meta = new grpc.Metadata();
  meta.set('x-request-id', requestId);
  return meta;
}

export function wrapGrpcServerHandlers<T extends Record<string, grpc.handleUnaryCall<unknown, unknown>>>(
  handlers: T,
  onCall?: (method: string, requestId: string) => void
): T {
  const wrapped = {} as T;
  for (const [method, handler] of Object.entries(handlers)) {
    wrapped[method as keyof T] = ((call: grpc.ServerUnaryCall<unknown, unknown>, callback: grpc.sendUnaryData<unknown>) => {
      const requestId = getGrpcRequestId(call);
      onCall?.(method, requestId);
      return (handler as grpc.handleUnaryCall<unknown, unknown>).call(handlers, call, callback);
    }) as T[keyof T];
  }
  return wrapped;
}
