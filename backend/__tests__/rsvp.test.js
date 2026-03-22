const request = require("supertest");
const express = require("express");

jest.mock("../db", () => ({
  connect: jest.fn(),
  query: jest.fn(),
}));

const pool = require("../db");

function buildAppWithAuthMock(authImpl) {
  jest.resetModules();

  jest.doMock("../db", () => pool);
  jest.doMock("../middleware/auth", () => authImpl);

  const expressFresh = require("express");
  const rsvpRoutes = require("../routes/rsvp.routes.js");

  const app = expressFresh();
  app.use(expressFresh.json());
  app.use("/rsvp", rsvpRoutes);

  return app;
}

describe("RSVP API - Correct 10 tests", () => {
  let client;
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    client = {
      query: jest.fn(),
      release: jest.fn(),
    };

    pool.connect.mockResolvedValue(client);

    app = buildAppWithAuthMock((req, res, next) => {
      req.user = { userId: 1 };
      next();
    });
  });

  test("TC-RSVP-001 RSVP Success (going)", async () => {
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ capacity: 10 }] }) // event exists
      .mockResolvedValueOnce({ rows: [] }) // current RSVP
      .mockResolvedValueOnce({ rows: [{ going_count: 0 }] }) // count
      .mockResolvedValueOnce({
        rows: [{ event_id: 1, user_id: 1, status: "going" }],
      }) // insert/update
      .mockResolvedValueOnce({}); // COMMIT

    const res = await request(app).post("/rsvp/1").send({ status: "going" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("RSVP saved");
  });

  test("TC-RSVP-002 RSVP Success (interested)", async () => {
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ capacity: 10 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ going_count: 0 }] })
      .mockResolvedValueOnce({
        rows: [{ event_id: 2, user_id: 1, status: "interested" }],
      })
      .mockResolvedValueOnce({});

    const res = await request(app).post("/rsvp/2").send({ status: "interested" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("RSVP saved");
  });

  test("TC-RSVP-003 RSVP Success (not going)", async () => {
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ capacity: 10 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ going_count: 0 }] })
      .mockResolvedValueOnce({
        rows: [{ event_id: 3, user_id: 1, status: "not_going" }],
      })
      .mockResolvedValueOnce({});

    const res = await request(app).post("/rsvp/3").send({ status: "not_going" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("RSVP saved");
  });

  test("TC-RSVP-004 RSVP Invalid Status", async () => {
    const res = await request(app).post("/rsvp/4").send({ status: "maybe" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid RSVP status");
  });

  test("TC-RSVP-005 RSVP Unauthorized Request", async () => {
    const unauthorizedApp = buildAppWithAuthMock((req, res, next) => {
      return res.status(401).json({ error: "Access denied" });
    });

    const res = await request(unauthorizedApp)
      .post("/rsvp/5")
      .send({ status: "going" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.stringMatching(/access denied/i),
      })
    );
  });

  test("TC-RSVP-006 RSVP Invalid Token", async () => {
    const invalidTokenApp = buildAppWithAuthMock((req, res, next) => {
      return res.status(401).json({ error: "Invalid token" });
    });

    const res = await request(invalidTokenApp)
      .post("/rsvp/6")
      .send({ status: "going" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: expect.stringMatching(/invalid token/i),
      })
    );
  });

  test("TC-RSVP-007 RSVP Capacity Limit Reached", async () => {
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ capacity: 1 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ going_count: 1 }] })
      .mockResolvedValueOnce({}); // ROLLBACK

    const res = await request(app).post("/rsvp/7").send({ status: "going" });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/full capacity|full/i);
  });

  test("TC-RSVP-008 RSVP Update Existing Status", async () => {
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ capacity: 10 }] })
      .mockResolvedValueOnce({ rows: [{ status: "interested" }] })
      .mockResolvedValueOnce({ rows: [{ going_count: 0 }] })
      .mockResolvedValueOnce({
        rows: [{ event_id: 8, user_id: 1, status: "going" }],
      })
      .mockResolvedValueOnce({});

    const res = await request(app).post("/rsvp/8").send({ status: "going" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("RSVP saved");
    expect(res.body.attendee_count).toBe(1);
  });

  test("TC-RSVP-009 RSVP Event Not Found", async () => {
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({}); // ROLLBACK

    const res = await request(app).post("/rsvp/999").send({ status: "going" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Event not found");
  });

  test("TC-RSVP-010 RSVP Count Validation", async () => {
    client.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ capacity: 10 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ going_count: 0 }] })
      .mockResolvedValueOnce({
        rows: [{ event_id: 10, user_id: 1, status: "going" }],
      })
      .mockResolvedValueOnce({});

    const res = await request(app).post("/rsvp/10").send({ status: "going" });

    expect(res.status).toBe(201);
    expect(res.body.attendee_count).toBe(1);
  });
});