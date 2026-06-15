declare module '@bus/proto' {
  import * as grpc from '@grpc/grpc-js';

  interface GrpcService {
    service: grpc.ServiceDefinition;
    new (url: string, creds: grpc.ChannelCredentials): grpc.Client & Record<string, Function>;
  }

  export const TripService: GrpcService;
  export const SeatInventoryService: GrpcService;
  export const BookingService: GrpcService;
  export const PaymentService: GrpcService;
  export const AuthService: GrpcService;
  export const AnalyticsService: GrpcService;
}
