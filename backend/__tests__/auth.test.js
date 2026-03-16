require("dotenv").config();
const { startBackend, stopBackend } = require("./testServer");

const PORT = process.env.PORT || 4000;
const BASE_URL = `http://localhost:${PORT}`;

const uniqueEmail = () => `test_${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.com`;

beforeAll(async () => {
  await startBackend();
});

afterAll(async () => {
  await stopBackend();
});

describe("Auth API (Postgres)", () => {
  test("POST /auth/signup creates user and returns token + user", async () => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Jest User",
        email: uniqueEmail(),
        password: "secret123",
      }),
    });

    expect(res.status).toBe(201);

    const body = await res.json();

    expect(body.message).toMatch(/User created/i);
    expect(typeof body.token).toBe("string");
    expect(body.user).toBeTruthy();
    expect(body.user.id).toBeTruthy();
    expect(body.user.email).toContain("@");
    expect(body.user.name).toBe("Jest User");

    // security: never return password/hash
    expect(body.user.password).toBeUndefined();
    expect(body.user.password_hash).toBeUndefined();
    expect(body.password_hash).toBeUndefined();
  });

  test("POST /auth/signup with duplicate email returns 409", async () => {
    const email = uniqueEmail();

    // first signup
    const res1 = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Dup", email, password: "secret123" }),
    });
    expect(res1.status).toBe(201);

    // duplicate signup
    const res2 = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Dup2", email, password: "secret123" }),
    });
    expect(res2.status).toBe(409);

    const body2 = await res2.json();
    expect(body2.error).toBeTruthy();
  });

  test("POST /auth/login returns token + user for valid credentials", async () => {
    const email = uniqueEmail();
    const password = "secret123";

    // signup first
    const signup = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Login User", email, password }),
    });
    expect(signup.status).toBe(201);

    // login
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.message).toMatch(/Login successful/i);
    expect(typeof body.token).toBe("string");
    expect(body.user.email).toBe(email);
    expect(body.user.name).toBe("Login User");
  });

  test("POST /auth/login returns 401 for wrong password", async () => {
    const email = uniqueEmail();

    // signup
    const signup = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "WrongPass", email, password: "secret123" }),
    });
    expect(signup.status).toBe(201);

    // login wrong pass
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "badpass" }),
    });

    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});
