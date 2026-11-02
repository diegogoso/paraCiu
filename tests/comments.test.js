process.env.DB_STORAGE = ":memory:";

const request = require("supertest");
const app = require("../src/app");
const { sequelize } = require("../src/models");

let userId;
let postId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const userResponse = await request(app)
    .post("/api/users")
    .send({ nickName: "autor-comments" });
  userId = userResponse.body.id;

  const postResponse = await request(app)
    .post("/api/posts")
    .send({ description: "Post para comentar", userId });
  postId = postResponse.body.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe("rutas de comentarios", () => {
  test("valida el contenido y las relaciones requeridas", async () => {
    const invalid = await request(app)
      .post("/api/comments")
      .send({ message: " ", userId, postId });
    expect(invalid.statusCode).toBe(400);

    const missingPost = await request(app)
      .post("/api/comments")
      .send({ message: "Comentario", userId, postId: 99999 });
    expect(missingPost.statusCode).toBe(404);
    expect(missingPost.body.error).toBe("Publicación no encontrada");
  });

  test("rechaza un postId de consulta que no sea un entero positivo", async () => {
    const response = await request(app).get("/api/comments?postId=abc");

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Datos inválidos");
  });

  test("pasa el postId de consulta validado como entero al servicio", async () => {
    const service = require("../src/services/commentsService");
    const listComments = jest.spyOn(service, "listComments").mockResolvedValue([]);

    try {
      const response = await request(app).get(`/api/comments?postId=${postId}`);

      expect(response.statusCode).toBe(200);
      expect(listComments).toHaveBeenCalledWith(postId);
    } finally {
      listComments.mockRestore();
    }
  });

  test("permite crear, listar, consultar, actualizar y eliminar un comentario", async () => {
    const created = await request(app)
      .post("/api/comments")
      .send({ message: "Buen post", userId, postId });
    expect(created.statusCode).toBe(201);
    expect(created.body.message).toBe("Buen post");
    const commentId = created.body.id;

    const list = await request(app).get(`/api/posts/${postId}/comments`);
    expect(list.statusCode).toBe(200);
    expect(list.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: commentId })]),
    );

    const allComments = await request(app).get("/api/comments");
    expect(allComments.statusCode).toBe(200);
    expect(allComments.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: commentId })]),
    );

    const found = await request(app).get(`/api/comments/${commentId}`);
    expect(found.statusCode).toBe(200);
    expect(found.body.message).toBe("Buen post");

    const updated = await request(app)
      .put(`/api/comments/${commentId}`)
      .send({ message: "Comentario editado" });
    expect(updated.statusCode).toBe(200);
    expect(updated.body.message).toBe("Comentario editado");

    const deleted = await request(app).delete(`/api/comments/${commentId}`);
    expect(deleted.statusCode).toBe(204);
    expect((await request(app).get(`/api/comments/${commentId}`)).statusCode).toBe(404);
  });
});
