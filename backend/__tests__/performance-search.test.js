require("dotenv").config();
const request = require("supertest");
const app = require("../server_app");
const pool = require("../config/db");

// Mock axios so Ticketmaster tests never hit the real API in CI
jest.mock("axios");
const axios = require("axios");

describe("Sprint 3 - Performance and Load Testing", () => {

  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        _embedded: {
          events: [
            {
              id: "tm-test-1",
              name: "Mock Concert",
              info: "Mock description",
              dates: { start: { dateTime: "2026-05-01T18:00:00Z" } },
              _embedded: { venues: [{ name: "Mock Venue" }] },
              images: [{ url: "https://example.com/img.jpg" }],
              url: "https://ticketmaster.com/event",
              classifications: [{ segment: { name: "Music" } }],
              promoter: { name: "Mock Promoter" },
            },
          ],
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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

afterAll(async () => {
  await pool.end();
});