process.env.DB_STORAGE = ":memory:";

const request = require("supertest");
const app = require("../src/app");
const { sequelize } = require("../src/models");

let userId;
let tagId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const userResponse = await request(app)
    .post("/api/users")
    .send({ nickName: "autor-posts" });
  userId = userResponse.body.id;

  const tagResponse = await request(app)
    .post("/api/tags")
    .send({ name: "Persistencia" });
  tagId = tagResponse.body.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe("rutas de publicaciones", () => {
  test("rechaza datos inválidos y relaciones inexistentes", async () => {
    const invalidBody = await request(app)
      .post("/api/posts")
      .send({ description: "   ", userId });
    expect(invalidBody.statusCode).toBe(400);

    const missingAuthor = await request(app)
      .post("/api/posts")
      .send({ description: "Publicación", userId: 99999 });
    expect(missingAuthor.statusCode).toBe(404);
    expect(missingAuthor.body.error).toBe("Usuario no encontrado");
  });

  test("permite crear, consultar, actualizar y eliminar una publicación con relaciones", async () => {
    const created = await request(app)
      .post("/api/posts")
      .send({
        description: "Primera publicación",
        userId,
        images: ["https://example.com/imagen.jpg"],
        tagIds: [tagId],
      });

    expect(created.statusCode).toBe(201);
    expect(created.body.description).toBe("Primera publicación");
    expect(created.body.author.id).toBe(userId);
    expect(created.body.images).toHaveLength(1);
    expect(created.body.tags.map((tag) => tag.id)).toContain(tagId);

    const postId = created.body.id;
    const list = await request(app).get("/api/posts");
    expect(list.statusCode).toBe(200);
    expect(list.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: postId })]),
    );

    const updated = await request(app)
      .put(`/api/posts/${postId}`)
      .send({
        description: "Publicación actualizada",
        images: [],
        tagIds: [],
      });
    expect(updated.statusCode).toBe(200);
    expect(updated.body.description).toBe("Publicación actualizada");
    expect(updated.body.images).toHaveLength(0);
    expect(updated.body.tags).toHaveLength(0);

    const found = await request(app).get(`/api/posts/${postId}`);
    expect(found.statusCode).toBe(200);

    const deleted = await request(app).delete(`/api/posts/${postId}`);
    expect(deleted.statusCode).toBe(204);

    const missing = await request(app).get(`/api/posts/${postId}`);
    expect(missing.statusCode).toBe(404);
  });
});
