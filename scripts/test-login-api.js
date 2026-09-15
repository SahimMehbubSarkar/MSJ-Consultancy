async function testLoginApi() {
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/login`;

  console.log("--- 1. Testing Login with Email ---");
  let res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@msj.edu', password: 'admin123' })
  });
  let data = await res.json();
  console.log("Email Login Response:", data);

  console.log("\n--- 2. Testing Login with Phone Number ---");
  res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '+8801700000000', password: 'admin123' })
  });
  data = await res.json();
  console.log("Phone Login Response:", data);

  console.log("\n--- 3. Testing Login with Wrong Password ---");
  res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@msj.edu', password: 'wrongpassword' })
  });
  data = await res.json();
  console.log("Wrong Password Response:", data);
}

testLoginApi();
