const request = require("supertest");

describe("Backend smoke tests", () => {
  let server;

  beforeAll(() => {
    // Import the express app without binding to a real port
    const app = require("../server_app");
    server = app.listen(0); // random available port
  });

  afterAll((done) => {
    server.close(done);
  });

  test("GET /health returns ok", async () => {
    const res = await request(server).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
