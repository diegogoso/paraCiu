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

describe("rutas de usuarios", () => {
  test("rechaza un nickName demasiado corto", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ nickName: "a" });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Datos inválidos");
  });

  test("rechaza un id que no sea un entero positivo", async () => {
    const response = await request(app).get("/api/users/abc");

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toMatch(/entero positivo/);
  });

  test("valida el nickName de la ruta de búsqueda", async () => {
    const response = await request(app).get("/api/users/nickname/a");

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Datos inválidos");
  });

  test("propaga los errores del servicio de búsqueda al middleware común", async () => {
    const service = require("../src/services/usersService");
    const lookup = jest.spyOn(service, "buscarPorNickName").mockRejectedValue(
      new Error("Fallo de consulta"),
    );

    try {
      const response = await request(app).get("/api/users/nickname/usuario-valido");

      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBe("Fallo de consulta");
    } finally {
      lookup.mockRestore();
    }
  });

  test("permite crear, listar, consultar, actualizar y eliminar un usuario", async () => {
    const created = await request(app)
      .post("/api/users")
      .send({ nickName: "persistire" });

    expect(created.statusCode).toBe(201);
    expect(created.body.nickName).toBe("persistire");

    const userId = created.body.id;

    const list = await request(app).get("/api/users");
    expect(list.statusCode).toBe(200);
    expect(list.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: userId, nickName: "persistire" }),
      ]),
    );

    const found = await request(app).get(`/api/users/${userId}`);
    expect(found.statusCode).toBe(200);
    expect(found.body.nickName).toBe("persistire");

    const updated = await request(app)
      .put(`/api/users/${userId}`)
      .send({ nickName: "persistire2" });
    expect(updated.statusCode).toBe(200);
    expect(updated.body.nickName).toBe("persistire2");

    const deleted = await request(app).delete(`/api/users/${userId}`);
    expect(deleted.statusCode).toBe(204);

    const missing = await request(app).get(`/api/users/${userId}`);
    expect(missing.statusCode).toBe(404);
    expect(missing.body.error).toBe("Usuario no encontrado");
  });
});
