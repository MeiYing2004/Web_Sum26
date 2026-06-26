/**
 * Test đồng bộ booking: tạo → thanh toán → my-tickets → chi tiết → tra cứu
 * Chạy: npx tsx scripts/test-booking-sync.ts
 */
const GRAPHQL_URL = process.env.GRAPHQL_URL || 'http://localhost:4000/graphql';

type GqlResult<T> = { data?: T; errors?: Array<{ message: string }> };

async function gql<T>(query: string, variables?: Record<string, unknown>, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as GqlResult<T>;
  if (!res.ok || json.errors?.length) {
    throw new Error(json.errors?.[0]?.message || `HTTP ${res.status}`);
  }
  if (!json.data) throw new Error('Không có data');
  return json.data;
}

function assert(name: string, condition: boolean) {
  if (condition) {
    console.log(`✅ PASS: ${name}`);
  } else {
    console.log(`❌ FAIL: ${name}`);
    process.exitCode = 1;
  }
}

async function main() {
  const stamp = Date.now();
  const email = `sync_test_${stamp}@test.local`;
  const password = 'TestPass123!';
  const fullName = 'Sync Test User';

  console.log('='.repeat(60));
  console.log('Booking Sync Test');
  console.log('GraphQL:', GRAPHQL_URL);
  console.log('='.repeat(60));

  const reg = await gql<{ register: { token: string; userId: string } }>(
    `mutation($email:String!,$password:String!,$fullName:String!){
      register(email:$email,password:$password,fullName:$fullName){token userId}
    }`,
    { email, password, fullName }
  );
  const token = reg.register.token;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const travelDate = tomorrow.toISOString().slice(0, 10);

  let trips = await gql<{ searchTrips: Array<{ id: string; bookable: boolean }> }>(
    `query($origin:String!,$destination:String!,$travelDate:String!){
      searchTrips(origin:$origin,destination:$destination,travelDate:$travelDate){id bookable}
    }`,
    { origin: 'Hà Nội', destination: 'Đà Nẵng', travelDate },
    token
  );
  if (!trips.searchTrips.some((t) => t.bookable)) {
    const today = new Date().toISOString().slice(0, 10);
    trips = await gql<{ searchTrips: Array<{ id: string; bookable: boolean }> }>(
      `query($origin:String!,$destination:String!,$travelDate:String!){
        searchTrips(origin:$origin,destination:$destination,travelDate:$travelDate){id bookable}
      }`,
      { origin: 'TP.HCM', destination: 'Đà Lạt', travelDate: today },
      token
    );
  }
  const bookableTrip = trips.searchTrips.find((t) => t.bookable) || trips.searchTrips[0];
  assert('Có chuyến xe', !!bookableTrip);
  const tripId = bookableTrip.id;

  const seatMapData = await gql<{
    seatMap: { seats: Array<{ seatId: string; status: string }> };
  }>(
    `query($tripId:ID!){ seatMap(tripId:$tripId){ seats { seatId status } } }`,
    { tripId },
    token
  );
  const seatId =
    seatMapData.seatMap.seats.find((s) => s.status === 'AVAILABLE')?.seatId ||
    seatMapData.seatMap.seats[0]?.seatId ||
    'A01';

  const hold = await gql<{ holdSeats: { success: boolean; holdToken: string } }>(
    `mutation($tripId:ID!,$seatIds:[ID!]!,$sessionId:String!){
      holdSeats(tripId:$tripId,seatIds:$seatIds,sessionId:$sessionId){success holdToken}
    }`,
    { tripId, seatIds: [seatId], sessionId: `test-${stamp}` },
    token
  );
  assert('Giữ ghế thành công', hold.holdSeats.success && !!hold.holdSeats.holdToken);

  const released = await gql<{ releaseSeats: boolean }>(
    `mutation($tripId:ID!,$seatIds:[ID!]!,$holdToken:String!){
      releaseSeats(tripId:$tripId,seatIds:$seatIds,holdToken:$holdToken)
    }`,
    { tripId, seatIds: [seatId], holdToken: hold.holdSeats.holdToken },
    token
  );
  assert('Nhả ghế thành công', released.releaseSeats === true);

  const holdAgain = await gql<{ holdSeats: { success: boolean; holdToken: string } }>(
    `mutation($tripId:ID!,$seatIds:[ID!]!,$sessionId:String!){
      holdSeats(tripId:$tripId,seatIds:$seatIds,sessionId:$sessionId){success holdToken}
    }`,
    { tripId, seatIds: [seatId], sessionId: `test-${stamp}-2` },
    token
  );
  assert('Giữ ghế lại sau release', holdAgain.holdSeats.success && !!holdAgain.holdSeats.holdToken);

  const session = await gql<{ session: { valid: boolean; userId: string } }>(
    `query { session { valid userId } }`,
    undefined,
    token
  );
  assert('Session hợp lệ', session.session.valid && session.session.userId === reg.register.userId);

  const saved = await gql<{ savedPassengers: Array<{ fullName: string }> }>(
    `query { savedPassengers { fullName } }`,
    undefined,
    token
  );
  assert('savedPassengers query OK', Array.isArray(saved.savedPassengers));

  const suggest = await gql<{ suggestNearestDate: string | null }>(
    `query($origin:String!,$destination:String!,$travelDate:String!){
      suggestNearestDate(origin:$origin,destination:$destination,travelDate:$travelDate)
    }`,
    { origin: 'TP.HCM', destination: 'Đà Lạt', travelDate: '2099-01-01' },
    token
  );
  assert('suggestNearestDate trả về chuỗi hoặc null', suggest.suggestNearestDate === null || typeof suggest.suggestNearestDate === 'string');

  const created = await gql<{
    createBooking: { bookingId: string; bookingCode: string };
  }>(
    `mutation($tripId:ID!,$holdToken:String!,$passengers:[PassengerInput!]!,$guestEmail:String!){
      createBooking(tripId:$tripId,holdToken:$holdToken,passengers:$passengers,guestEmail:$guestEmail){
        bookingId bookingCode
      }
    }`,
    {
      tripId,
      holdToken: holdAgain.holdSeats.holdToken,
      guestEmail: email,
      passengers: [{ fullName, phone: '0901234567', email, seatId }],
    },
    token
  );
  assert('Tạo booking trong DB', !!created.createBooking.bookingId);
  const { bookingId, bookingCode } = created.createBooking;
  console.log(`   bookingId=${bookingId} bookingCode=${bookingCode}`);

  const paid = await gql<{
    processPayment: { success: boolean; bookingCode: string };
  }>(
    `mutation($bookingId:ID!,$guestEmail:String!){
      processPayment(bookingId:$bookingId,guestEmail:$guestEmail){success bookingCode}
    }`,
    { bookingId, guestEmail: email },
    token
  );
  assert('Thanh toán thành công', paid.processPayment.success);

  const myTickets = await gql<{
    myTickets: Array<{ bookingCode: string; bookingId: string }>;
  }>(
    `query{ myTickets{ bookingCode bookingId } }`,
    {},
    token
  );
  const foundInList = myTickets.myTickets.some((t) => t.bookingCode === bookingCode);
  assert('Vé xuất hiện trong myTickets', foundInList);

  const detail = await gql<{
    ticketsForBooking: Array<{ bookingCode: string; seatId: string }>;
  }>(
    `query($bookingId:ID!){ ticketsForBooking(bookingId:$bookingId){ bookingCode seatId } }`,
    { bookingId: bookingCode },
    token
  );
  assert('Chi tiết vé từ DB', detail.ticketsForBooking.length > 0 && detail.ticketsForBooking[0].bookingCode === bookingCode);

  const lookup = await gql<{
    bookingByCode: { bookingCode: string; id: string } | null;
  }>(
    `query($bookingCode:String!){ bookingByCode(bookingCode:$bookingCode){ id bookingCode } }`,
    { bookingCode },
    token
  );
  assert('Tra cứu vé bằng mã', lookup.bookingByCode?.bookingCode === bookingCode);

  const lookupLower = await gql<{
    bookingByCode: { bookingCode: string } | null;
  }>(
    `query($bookingCode:String!){ bookingByCode(bookingCode:$bookingCode){ bookingCode } }`,
    { bookingCode: bookingCode.toLowerCase() },
    token
  );
  assert('Tra cứu không phân biệt hoa thường', lookupLower.bookingByCode?.bookingCode === bookingCode);

  const cancelled = await gql<{ cancelBooking: { success: boolean; message: string } }>(
    `mutation($bookingId:ID!){ cancelBooking(bookingId:$bookingId){ success message } }`,
    { bookingId },
    token
  );
  assert('Hủy booking thành công', cancelled.cancelBooking.success);

  const afterCancel = await gql<{
    myTickets: Array<{ bookingCode: string; bookingStatus: string }>;
  }>(
    `query($email:String){ myTickets(email:$email){ bookingCode bookingStatus } }`,
    { email },
    token
  );
  const cancelledTicket = afterCancel.myTickets.find((t) => t.bookingCode === bookingCode);
  assert('Trạng thái vé sau hủy', cancelledTicket?.bookingStatus === 'CANCELLED');

  console.log('='.repeat(60));
  console.log(process.exitCode ? 'CÓ LỖI' : 'TẤT CẢ TEST PASS');
}

main().catch((err) => {
  console.error('Lỗi:', err.message);
  process.exit(1);
});
