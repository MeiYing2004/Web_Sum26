const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_DIR = path.join(__dirname, '..', 'proto');

const loaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

function loadProto(filename) {
  const packageDefinition = protoLoader.loadSync(
    path.join(PROTO_DIR, filename),
    loaderOptions
  );
  return grpc.loadPackageDefinition(packageDefinition);
}

const tripProto = loadProto('trip.proto');
const seatProto = loadProto('seat.proto');
const bookingProto = loadProto('booking.proto');
const paymentProto = loadProto('payment.proto');
const authProto = loadProto('auth.proto');
const analyticsProto = loadProto('analytics.proto');

module.exports = {
  tripProto,
  seatProto,
  bookingProto,
  paymentProto,
  authProto,
  analyticsProto,
  TripService: tripProto.bus.trip.v1.TripService,
  SeatInventoryService: seatProto.bus.seat.v1.SeatInventoryService,
  BookingService: bookingProto.bus.booking.v1.BookingService,
  PaymentService: paymentProto.bus.payment.v1.PaymentService,
  AuthService: authProto.bus.auth.v1.AuthService,
  AnalyticsService: analyticsProto.bus.analytics.v1.AnalyticsService,
};
