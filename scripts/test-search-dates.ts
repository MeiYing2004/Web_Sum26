/**

 * Automated search date tests — Asia/Ho_Chi_Minh

 * Run: npx tsx scripts/test-search-dates.ts

 */

import {

  parseTravelDate,

  todayVN,

  addDaysVN,

  getTripAvailability,

  isDepartureOnTravelDate,

  filterByDepartureDate,

  departureDateVN,

} from '@bus/shared';



const ROUTES = [

  { origin: 'TP.HCM', destination: 'Đà Lạt' },

  { origin: 'TP.HCM', destination: 'Nha Trang' },

  { origin: 'TP.HCM', destination: 'Cần Thơ' },

  { origin: 'Đà Nẵng', destination: 'Hà Nội' },

];



const DATE_PHRASES = [

  { phrase: 'hôm qua', expected: () => addDaysVN(todayVN(), -1) },

  { phrase: 'hôm nay', expected: () => todayVN() },

  { phrase: 'ngày mai', expected: () => addDaysVN(todayVN(), 1) },

];



const GRAPHQL_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000/graphql';



let passed = 0;

let failed = 0;



function assert(name: string, ok: boolean) {

  if (ok) {

    console.log(`✅ ${name}`);

    passed++;

  } else {

    console.log(`❌ ${name}`);

    failed++;

  }

}



async function searchTrips(origin: string, destination: string, travelDate: string) {

  const res = await fetch(GRAPHQL_URL, {

    method: 'POST',

    headers: { 'Content-Type': 'application/json' },

    body: JSON.stringify({

      query: `query($o:String!,$d:String!,$t:String!){searchTrips(origin:$o,destination:$d,travelDate:$t){id departureTime}}`,

      variables: { o: origin, d: destination, t: travelDate },

    }),

  });

  const json = await res.json();

  if (json.errors) throw new Error(json.errors[0].message);

  return json.data.searchTrips as Array<{ id: string; departureTime: string }>;

}



async function main() {

  console.log(`\n=== Search date tests (VN today: ${todayVN()}) ===\n`);



  for (const { phrase, expected } of DATE_PHRASES) {

    const parsed = parseTravelDate(phrase);

    assert(`parseTravelDate("${phrase}")`, parsed === expected());

  }



  assert('parseTravelDate tối nay', parseTravelDate('tối nay') === todayVN());



  const travelDate = '2026-06-25';

  const prevNight = `${addDaysVN(travelDate, -1)}T20:00:00+07:00`;

  const earlyMorning = `${travelDate}T00:30:00+07:00`;

  const morning = `${travelDate}T06:00:00+07:00`;

  const lateNight = `${travelDate}T23:30:00+07:00`;



  assert('departs prev day 20:00 → not on 25/06', !isDepartureOnTravelDate(prevNight, travelDate));

  assert('departs 00:30 on 25/06 → on 25/06', isDepartureOnTravelDate(earlyMorning, travelDate));

  assert('departs 06:00 on 25/06 → on 25/06', isDepartureOnTravelDate(morning, travelDate));

  assert('departs 23:30 on 25/06 → on 25/06', isDepartureOnTravelDate(lateNight, travelDate));

  assert(

    'filter keeps only same departure day',

    filterByDepartureDate(

      [

        { departureTime: prevNight },

        { departureTime: earlyMorning },

        { departureTime: morning },

        { departureTime: lateNight },

      ],

      travelDate

    ).length === 3

  );



  const today = todayVN();

  const yesterday = addDaysVN(today, -1);

  const tomorrow = addDaysVN(today, 1);

  const pastDayTrip = getTripAvailability(yesterday, `${yesterday}T13:00:00+07:00`);

  assert('past day → Chuyến đã kết thúc', !pastDayTrip.bookable && pastDayTrip.availabilityLabel === 'Chuyến đã kết thúc');

  const futureDayTrip = getTripAvailability(tomorrow, `${tomorrow}T13:00:00+07:00`);

  assert('future day → bookable', futureDayTrip.bookable);

  const todayPastDep = getTripAvailability(today, `${today}T00:00:00+07:00`);

  assert('today past departure → Đã khởi hành', !todayPastDep.bookable && todayPastDep.availabilityLabel === 'Đã khởi hành');

  const soldOut = getTripAvailability(tomorrow, `${tomorrow}T13:00:00+07:00`, new Date(), 0);

  assert('no seats → Hết vé', !soldOut.bookable && soldOut.availabilityLabel === 'Hết vé');

  const wrongDay = getTripAvailability(travelDate, prevNight);

  assert('wrong departure day → not bookable', !wrongDay.bookable);



  let graphqlOk = true;

  try {

    for (const route of ROUTES) {

      for (const { phrase, expected } of DATE_PHRASES) {

        const date = expected();

        const trips = await searchTrips(route.origin, route.destination, date);

        const allOnDate = trips.every((t) => departureDateVN(t.departureTime) === date);

        assert(

          `${route.origin}→${route.destination} ${phrase} (${date}): ${trips.length} trips, all depart on date`,

          allOnDate

        );

      }

    }

  } catch (err) {

    graphqlOk = false;

    console.log(`⚠ GraphQL tests skipped: ${err instanceof Error ? err.message : err}`);

    console.log('  (Start api-gateway + trip-service for full integration tests)');

  }



  console.log(`\n--- ${passed} passed, ${failed} failed ---\n`);

  if (failed > 0) process.exit(1);

  if (!graphqlOk && process.env.CI === 'true') process.exit(1);

}



main();


