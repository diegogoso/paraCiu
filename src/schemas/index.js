const Joi = require("joi");
const positiveId = Joi.number().integer().positive();
const nickName = Joi.string().trim().min(2).max(40);

const createUser = Joi.object({
  nickName: nickName.required(),
}).unknown(false);

const updateUser = Joi.object({
  nickName,
})
  .min(1)
  .unknown(false);

const userNickNameParam = Joi.object({
  nickName: nickName.required(),
}).unknown(false);

const listCommentsQuery = Joi.object({
  postId: positiveId.optional(),
}).unknown(false);

const createPost = Joi.object({
  description: Joi.string().trim().min(1).required(),
  userId: positiveId.required(),
  images: Joi.array().items(Joi.string().uri()).unique().default([]),
  tagIds: Joi.array().items(positiveId).unique().default([]),
}).unknown(false);

const updatePost = Joi.object({
  description: Joi.string().trim().min(1).optional(),
  userId: positiveId.optional(),
  images: Joi.array().items(Joi.string().uri()).unique().optional(),
  tagIds: Joi.array().items(positiveId).unique().optional(),
})
  .min(1)
  .unknown(false);

const createImage = Joi.object({
  url: Joi.string().uri().required(),
}).unknown(false);

const createTag = Joi.object({
  name: Joi.string().trim().min(2).max(40).required(),
}).unknown(false);

const updateTag = Joi.object({
  name: Joi.string().trim().min(2).max(40),
})
  .min(1)
  .unknown(false);

const createComment = Joi.object({
  message: Joi.string().trim().min(1).required(),
  userId: positiveId.required(),
  postId: positiveId.required(),
}).unknown(false);

const createPostComment = Joi.object({
  message: Joi.string().trim().min(1).required(),
  userId: positiveId.required(),
}).unknown(false);

const updateComment = Joi.object({
  message: Joi.string().trim().min(1).optional(),
  userId: positiveId.optional(),
  postId: positiveId.optional(),
})
  .min(1)
  .unknown(false);

module.exports = {
  createUser,
  updateUser,
  userNickNameParam,
  listCommentsQuery,
  createPost,
  updatePost,
  createImage,
  createTag,
  updateTag,
  createComment,
  createPostComment,
  updateComment,
};

/*

LAS REGLAS DE VALIDACIÓN DE JOI:
Joi.object({...}): los datos deben ser un objeto con esas propiedades.
Joi.string(): debe ser texto.
.trim(): le saca los espacios del principio y del final.
.min(3).max(30): largo mínimo y máximo (en texto) o valor mínimo y máximo (en números).
.required(): es obligatorio, si falta da error.
.optional(): puede venir o no.
.email(): debe tener formato de email válido.
.uri(): debe ser una URL válida.
Joi.number().integer().positive(): debe ser un número entero mayor que 0.
Joi.array().items(...): una lista donde cada elemento debe cumplir cierta regla.
.default([]): si no viene, se usa una lista vacía.
.min(1) al final del objeto: el objeto debe tener al menos una propiedad.
*/