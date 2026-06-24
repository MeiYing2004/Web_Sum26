import * as grpc from '@grpc/grpc-js';

export function mapAuthError(err: unknown): Error {
  if (err && typeof err === 'object' && 'code' in err) {
    const grpcErr = err as grpc.ServiceError;
    switch (grpcErr.code) {
      case grpc.status.ALREADY_EXISTS:
        return new Error('Email đã được đăng ký');
      case grpc.status.NOT_FOUND:
        return new Error('Tài khoản không tồn tại');
      case grpc.status.UNAUTHENTICATED:
        return new Error('Sai mật khẩu');
      case grpc.status.INVALID_ARGUMENT:
        return new Error(grpcErr.message || 'Dữ liệu không hợp lệ');
      case grpc.status.UNAVAILABLE:
      case grpc.status.DEADLINE_EXCEEDED:
        return new Error('Lỗi máy chủ xác thực. Vui lòng thử lại sau.');
      default:
        return new Error(grpcErr.message || 'Lỗi máy chủ');
    }
  }

  if (err instanceof Error) {
    if (/ECONNREFUSED|UNAVAILABLE|deadline/i.test(err.message)) {
      return new Error('Lỗi máy chủ xác thực. Vui lòng thử lại sau.');
    }
    return err;
  }

  return new Error('Lỗi máy chủ');
}
