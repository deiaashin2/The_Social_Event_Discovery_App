require("dotenv").config();
const request = require("supertest");
const app = require("../server_app");
const pool = require("../config/db");

async function timedRequest(req) {
  const startTime = Date.now();
  const res = await req;
  const responseTime = Date.now() - startTime;

  return { res, responseTime };
}

describe("Sprint 3 - Performance and Load Testing", () => {
  test("TC-PERF-001 /events should respond under 2 seconds", async () => {
    const startTime = Date.now();

    const res = await request(app).get("/events");

    const responseTime = Date.now() - startTime;

    expect(res.status).toBe(200);
    expect(responseTime).toBeLessThan(2000);
  });

  test("TC-PERF-002 /events should handle multiple requests at the same time", async () => {
    const requests = [];

    for (let i = 0; i < 10; i++) {
      requests.push(request(app).get("/events"));
    }

    const startTime = Date.now();

    const responses = await Promise.all(requests);

    const totalTime = Date.now() - startTime;

    responses.forEach((res) => {
      expect(res.status).toBe(200);
    });

    expect(totalTime).toBeLessThan(5000);
  });

  test("TC-PERF-003 /ticketmaster-events search should respond under 5 seconds", async () => {
    const startTime = Date.now();

    const res = await request(app).get("/ticketmaster-events?keyword=music");

    const responseTime = Date.now() - startTime;

    expect(res.status).toBe(200);
    expect(responseTime).toBeLessThan(5000);
  });

  test("TC-PERF-004 /ticketmaster-events should handle multiple search requests", async () => {
    const requests = [];

    for (let i = 0; i < 5; i++) {
      requests.push(request(app).get("/ticketmaster-events?keyword=music"));
    }

    const startTime = Date.now();

    const responses = await Promise.all(requests);

    const totalTime = Date.now() - startTime;

    responses.forEach((res) => {
      expect(res.status).toBe(200);
    });

    expect(totalTime).toBeLessThan(10000);
  });
});

test("TC-PERF-005 /health should respond under 1 second", async () => {
    const { res, responseTime } = await timedRequest(
      request(app).get("/health")
    );

    expect(res.status).toBe(200);
    expect(responseTime).toBeLessThan(1000);
  });

  test("TC-PERF-006 /db-test should respond under 2 seconds", async () => {
    const { res, responseTime } = await timedRequest(
      request(app).get("/db-test")
    );

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(responseTime).toBeLessThan(2000);
  });

  test("TC-PERF-007 /events should handle 25 concurrent requests", async () => {
    const concurrentRequests = 25;

    const startTime = Date.now();

    const responses = await Promise.all(
      Array.from({ length: concurrentRequests }, () =>
        request(app).get("/events")
      )
    );

    const totalTime = Date.now() - startTime;

    responses.forEach((res) => {
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    expect(totalTime).toBeLessThan(8000);
  });

  test("TC-PERF-008 /events should return consistent successful responses during repeated calls", async () => {
    for (let i = 0; i < 5; i++) {
      const { res, responseTime } = await timedRequest(
        request(app).get("/events")
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(responseTime).toBeLessThan(2000);
    }
  });

  test("TC-PERF-009 /events/:id should respond under 2 seconds for a valid event", async () => {
    const eventsRes = await request(app).get("/events");

    expect(eventsRes.status).toBe(200);
    expect(eventsRes.body.length).toBeGreaterThan(0);

    const eventId = eventsRes.body[0].event_id;

    const { res, responseTime } = await timedRequest(
      request(app).get(`/events/${eventId}`)
    );

    expect(res.status).toBe(200);
    expect(res.body.event_id).toBe(eventId);
    expect(responseTime).toBeLessThan(2000);
  });

  test("TC-PERF-010 invalid event request should fail quickly", async () => {
    const { res, responseTime } = await timedRequest(
      request(app).get("/events/invalid-id")
    );

    expect([400, 404]).toContain(res.status);
    expect(responseTime).toBeLessThan(1000);
  });

afterAll(async () => {
  await pool.end();
});