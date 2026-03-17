//calls db-test endpoint, verifies PostgreSQL connectivity and query execution
const { startBackend, stopBackend } = require("./testServer");

const BASE_URL = "http://localhost:4000"; //backend URL and port

beforeAll(async () => { // start bcakend before tests run, and wait until it's ready to accept requests
  await startBackend();
});

afterAll(async () => { //stop backend after tests complete
  await stopBackend();
});

test("GET /db-test returns ok=true and a time value", async () => {
  const res = await fetch(`${BASE_URL}/db-test`); // send HTTP GET request to the /db-test endpoint
  expect(res.status).toBe(200); // check HTTP status code is 200 OK

  const body = await res.json(); //Prase Json response body
  expect(body.ok).toBe(true); // verify database result 
  expect(body.time).toBeTruthy(); 
});
