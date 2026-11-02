const request = require("supertest");
const app = require("../src/app");

describe("GET /health", () => {
  test("responde que el servidor está disponible", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
