/**
 * Kiểm tra luồng đăng ký → đăng nhập → đăng xuất → đăng nhập lại.
 * Chạy: npm run test:auth
 */
const GRAPHQL_URL = process.env.GRAPHQL_URL || process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

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
    return;
  }
  console.log(`❌ FAIL: ${name}`);
  process.exitCode = 1;
}

async function expectError(name: string, fn: () => Promise<unknown>, expected: RegExp) {
  try {
    await fn();
    console.log(`❌ FAIL: ${name} — expected error`);
    process.exitCode = 1;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (expected.test(msg)) {
      console.log(`✅ PASS: ${name} — ${msg}`);
    } else {
      console.log(`❌ FAIL: ${name} — got "${msg}"`);
      process.exitCode = 1;
    }
  }
}

async function main() {
  const stamp = Date.now();
  const email = `auth_test_${stamp}@test.local`;
  const password = 'TestPass123!';
  const fullName = 'Auth Test User';

  console.log('='.repeat(60));
  console.log('Auth Flow Test');
  console.log('GraphQL:', GRAPHQL_URL);
  console.log('Test email:', email);
  console.log('='.repeat(60));

  const registerData = await gql<{
    register: { token: string; userId: string; role: string };
  }>(
    `mutation($email:String!,$password:String!,$fullName:String!){
      register(email:$email,password:$password,fullName:$fullName){token userId role}
    }`,
    { email, password, fullName }
  );

  assert('Register returns token', !!registerData.register.token);
  assert('Register returns userId', !!registerData.register.userId);
  assert('Register role is customer', registerData.register.role === 'customer');

  const loginData = await gql<{
    login: { token: string; userId: string; role: string };
  }>(
    `mutation($email:String!,$password:String!){
      login(email:$email,password:$password){token userId role}
    }`,
    { email, password }
  );

  assert('Login returns token', !!loginData.login.token);
  assert('Login userId matches register', loginData.login.userId === registerData.register.userId);

  await expectError(
    'Duplicate email rejected',
    () =>
      gql(
        `mutation($email:String!,$password:String!,$fullName:String!){
          register(email:$email,password:$password,fullName:$fullName){token userId role}
        }`,
        { email, password, fullName: 'Other' }
      ),
    /email đã/i
  );

  await expectError(
    'Wrong password rejected',
    () =>
      gql(
        `mutation($email:String!,$password:String!){
          login(email:$email,password:$password){token userId role}
        }`,
        { email, password: 'WrongPass!' }
      ),
    /sai mật khẩu/i
  );

  await expectError(
    'Unknown account rejected',
    () =>
      gql(
        `mutation($email:String!,$password:String!){
          login(email:$email,password:$password){token userId role}
        }`,
        { email: `missing_${stamp}@test.local`, password: 'x' }
      ),
    /không tồn tại/i
  );

  const reloginData = await gql<{
    login: { token: string; userId: string; role: string };
  }>(
    `mutation($email:String!,$password:String!){
      login(email:$email,password:$password){token userId role}
    }`,
    { email, password }
  );

  assert('Re-login after simulated logout works', !!reloginData.login.token);

  const sessionData = await gql<{
    session: { valid: boolean; userId: string; role: string };
  }>(
    `query { session { valid userId role } }`,
    undefined,
    reloginData.login.token
  );
  assert('Session query valid with token', sessionData.session.valid);
  assert('Session userId matches', sessionData.session.userId === registerData.register.userId);

  const invalidSession = await gql<{
    session: { valid: boolean };
  }>(`query { session { valid } }`);
  assert('Session invalid without token', !invalidSession.session.valid);

  console.log('='.repeat(60));
  if (process.exitCode) {
    console.log('Kết quả: CÓ LỖI');
    process.exit(1);
  }
  console.log('Kết quả: TẤT CẢ TEST PASS');
}

main().catch((err) => {
  console.error('❌ Test suite error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
