process.env.DB_STORAGE = ":memory:";

const request = require("supertest");
const app = require("../src/app");
const { sequelize } = require("../src/models");

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("rutas de etiquetas", () => {
  test("valida los datos y permite el CRUD de etiquetas", async () => {
    const invalid = await request(app)
      .post("/api/tags")
      .send({ name: "x" });
    expect(invalid.statusCode).toBe(400);

    const created = await request(app)
      .post("/api/tags")
      .send({ name: "Persistencia" });
    expect(created.statusCode).toBe(201);
    expect(created.body.name).toBe("Persistencia");

    const tagId = created.body.id;

    const list = await request(app).get("/api/tags");
    expect(list.statusCode).toBe(200);
    expect(list.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: tagId })]),
    );

    const found = await request(app).get(`/api/tags/${tagId}`);
    expect(found.statusCode).toBe(200);
    expect(found.body.name).toBe("Persistencia");

    const updated = await request(app)
      .put(`/api/tags/${tagId}`)
      .send({ name: "Bases de datos" });
    expect(updated.statusCode).toBe(200);
    expect(updated.body.name).toBe("Bases de datos");

    const deleted = await request(app).delete(`/api/tags/${tagId}`);
    expect(deleted.statusCode).toBe(204);
    expect((await request(app).get(`/api/tags/${tagId}`)).statusCode).toBe(404);
  });
});
