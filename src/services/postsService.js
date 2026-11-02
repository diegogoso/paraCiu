const { Op } = require("sequelize");
const { Post, PostImage, Comment, Tag, User } = require("../models");
const ServiceError = require("./serviceError");

const postIncludes = [
  { model: User, as: "author", attributes: ["id", "nickName"] },
  { model: PostImage, as: "images" },
  { model: Tag, as: "tags", through: { attributes: [] } },
];

const findPostOrFail = async (id) => {
  const post = await Post.findByPk(id);
  if (!post) throw new ServiceError("Publicación no encontrada", 404);
  return post;
};

const findTags = async (tagIds) => {
  const tags = tagIds.length
    ? await Tag.findAll({ where: { id: { [Op.in]: tagIds } } })
    : [];
  if (tags.length !== tagIds.length) {
    throw new ServiceError("Una o más etiquetas no existen", 404);
  }
  return tags;
};

const listPosts = () => Post.findAll({
  include: postIncludes,
  order: [["createdAt", "DESC"]],
});

const getPost = async (id) => {
  const post = await Post.findByPk(id, {
    include: [
      ...postIncludes,
      { model: Comment, as: "comments", include: [{ model: User, as: "author", attributes: ["id", "nickName"] }] },
    ],
  });
  if (!post) throw new ServiceError("Publicación no encontrada", 404);
  const result = post.toJSON();
  result.comments = result.comments.filter((comment) => comment.isVisible);
  return result;
};

const createPost = async ({ description, userId, images = [], tagIds = [] }) => {
  const author = await User.findByPk(userId);
  if (!author) throw new ServiceError("Usuario no encontrado", 404);
  const tags = await findTags(tagIds);
  const post = await Post.sequelize.transaction(async (transaction) => {
    const created = await Post.create({ description, userId }, { transaction });
    if (images.length) {
      await PostImage.bulkCreate(images.map((url) => ({ url, postId: created.id })), { transaction });
    }
    if (tags.length) await created.setTags(tags, { transaction });
    return created;
  });
  return Post.findByPk(post.id, { include: postIncludes });
};

const updatePost = async (id, { description, userId, images, tagIds }) => {
  const post = await findPostOrFail(id);
  if (userId && !(await User.findByPk(userId))) {
    throw new ServiceError("Usuario no encontrado", 404);
  }
  const tags = tagIds ? await findTags(tagIds) : undefined;
  await Post.sequelize.transaction(async (transaction) => {
    await post.update({ description, userId }, { transaction });
    if (tags) await post.setTags(tags, { transaction });
    if (images) {
      await PostImage.destroy({ where: { postId: post.id }, transaction });
      if (images.length) {
        await PostImage.bulkCreate(images.map((url) => ({ url, postId: post.id })), { transaction });
      }
    }
  });
  return Post.findByPk(post.id, { include: postIncludes });
};

const deletePost = async (id) => {
  const post = await findPostOrFail(id);
  await post.destroy();
};

const listPostImages = async (postId) => {
  const post = await Post.findByPk(postId, { include: [{ model: PostImage, as: "images" }] });
  if (!post) throw new ServiceError("Publicación no encontrada", 404);
  return post.images;
};

const addPostImage = async (postId, url) => {
  await findPostOrFail(postId);
  return PostImage.create({ url, postId });
};

const deletePostImage = async (postId, imageId) => {
  const image = await PostImage.findOne({ where: { id: imageId, postId } });
  if (!image) throw new ServiceError("Imagen no encontrada", 404);
  await image.destroy();
};

const addPostTag = async (postId, tagId) => {
  const post = await findPostOrFail(postId);
  const tag = await Tag.findByPk(tagId);
  if (!tag) throw new ServiceError("Etiqueta no encontrada", 404);
  if (await post.hasTag(tag)) throw new ServiceError("La etiqueta ya está asignada", 409);
  await post.addTag(tag);
};

const removePostTag = async (postId, tagId) => {
  const post = await findPostOrFail(postId);
  const tag = await Tag.findByPk(tagId);
  if (!tag) throw new ServiceError("Etiqueta no encontrada", 404);
  if (!(await post.hasTag(tag))) throw new ServiceError("La etiqueta no está asignada", 404);
  await post.removeTag(tag);
};

module.exports = {
  listPosts, getPost, createPost, updatePost, deletePost,
  listPostImages, addPostImage, deletePostImage, addPostTag, removePostTag,
};
