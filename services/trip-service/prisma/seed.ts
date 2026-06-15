import { PrismaClient } from '@prisma/client';

import { DEFAULT_LAYOUTS } from '@bus/shared';

const prisma = new PrismaClient();

const LOCATIONS = [
  { name: 'TP.HCM', type: 'CITY' },
  { name: 'Đà Lạt', type: 'CITY' },
  { name: 'Nha Trang', type: 'CITY' },
  { name: 'Cần Thơ', type: 'CITY' },
  { name: 'Đà Nẵng', type: 'CITY' },
  { name: 'Hà Nội', type: 'CITY' },
  { name: 'Miền Đông', type: 'STATION' },
  { name: 'Miền Tây', type: 'STATION' },
  { name: 'Liên tỉnh Đà Lạt', type: 'STATION' },
  { name: 'Nha Trang phía Nam', type: 'STATION' },
];

const OPERATORS = ['Phương Trang Demo', 'Thành Bưởi Demo', 'Kumho Demo'];

async function main() {
  for (const loc of LOCATIONS) {
    await prisma.location.upsert({
      where: { name: loc.name },
      update: {},
      create: loc,
    });
  }

  const operators = [];
  for (const name of OPERATORS) {
    const op = await prisma.operator.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    operators.push(op);
  }

  const buses = [];
  const busConfigs = [
    { plate: '51B-12345', busType: 'ghế ngồi 29 chỗ', seatCount: 29, layoutType: 'bus-29' },
    { plate: '51B-67890', busType: 'giường nằm 34 chỗ', seatCount: 34, layoutType: 'bus-34' },
    { plate: '51B-11111', busType: 'limousine 22 chỗ', seatCount: 22, layoutType: 'bus-22' },
  ];

  for (let i = 0; i < busConfigs.length; i++) {
    const cfg = busConfigs[i];
    const bus = await prisma.bus.upsert({
      where: { plate: cfg.plate },
      update: { seatLayoutJson: DEFAULT_LAYOUTS[cfg.layoutType] },
      create: { ...cfg, seatLayoutJson: DEFAULT_LAYOUTS[cfg.layoutType], operatorId: operators[i % operators.length].id },
    });
    buses.push(bus);
  }

  const routes = [
    { name: 'TP.HCM - Đà Lạt', origin: 'TP.HCM', destination: 'Đà Lạt' },
    { name: 'TP.HCM - Nha Trang', origin: 'TP.HCM', destination: 'Nha Trang' },
    { name: 'TP.HCM - Cần Thơ', origin: 'TP.HCM', destination: 'Cần Thơ' },
    { name: 'Hà Nội - Đà Nẵng', origin: 'Hà Nội', destination: 'Đà Nẵng' },
  ];

  for (const r of routes) {
    const route = await prisma.route.upsert({
      where: { id: `route-${r.origin}-${r.destination}` },
      update: {},
      create: {
        id: `route-${r.origin}-${r.destination}`,
        name: r.name,
        origin: r.origin,
        destination: r.destination,
        stops: {
          create: [
            { name: r.origin, order: 1 },
            { name: r.destination, order: 2 },
          ],
        },
      },
    });

    for (let day = 0; day < 7; day++) {
      for (const hour of [6, 8, 14, 20, 22]) {
        const dep = new Date();
        dep.setDate(dep.getDate() + day);
        dep.setHours(hour, 0, 0, 0);
        const arr = new Date(dep);
        arr.setHours(dep.getHours() + (r.destination === 'Đà Lạt' ? 8 : 6));

        const tripId = `trip-${route.id}-d${day}-h${hour}`;
        await prisma.trip.upsert({
          where: { id: tripId },
          update: {},
          create: {
            id: tripId,
            routeId: route.id,
            busId: buses[day % buses.length].id,
            operatorId: operators[day % operators.length].id,
            departureTime: dep,
            arrivalTime: arr,
            price: 150000 + hour * 5000,
            pickupPoint: r.origin === 'TP.HCM' ? 'Bến xe Miền Đông' : `Bến xe ${r.origin}`,
            dropoffPoint: `Bến xe ${r.destination}`,
            status: 'ACTIVE',
          },
        });
      }
    }
  }

  console.log('Trip service seeded');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
