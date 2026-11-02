const { Comment, Post, User } = require("../models");
const ServiceError = require("./serviceError");

const findPostOrFail = (id) => Post.findByPk(id).then((post) => {
  if (!post) throw new ServiceError("Publicación no encontrada", 404);
  return post;
});

const findUserOrFail = (id) => User.findByPk(id).then((user) => {
  if (!user) throw new ServiceError("Usuario no encontrado", 404);
  return user;
});

const visible = (comments) => comments.filter((comment) => comment.isVisible);

const listComments = async (postId) => {
  if (postId) await findPostOrFail(postId);
  const comments = await Comment.findAll({
    where: postId ? { postId } : undefined,
    include: [{ model: User, as: "author", attributes: ["id", "nickName"] }],
    order: [["createdAt", "DESC"]],
  });
  return visible(comments);
};

const getComment = async (id) => {
  const comment = await Comment.findByPk(id, {
    include: [{ model: User, as: "author", attributes: ["id", "nickName"] }],
  });
  if (!comment || !comment.isVisible) throw new ServiceError("Comentario no encontrado", 404);
  return comment;
};

const createComment = async (data) => {
  await Promise.all([findPostOrFail(data.postId), findUserOrFail(data.userId)]);
  return Comment.create(data);
};

const createCommentForPost = async (postId, data) => {
  await Promise.all([findPostOrFail(postId), findUserOrFail(data.userId)]);
  return Comment.create({ ...data, postId });
};

const updateComment = async (id, data) => {
  const comment = await getComment(id);
  if (data.postId) await findPostOrFail(data.postId);
  if (data.userId) await findUserOrFail(data.userId);
  return comment.update(data);
};

const deleteComment = async (id) => {
  const comment = await Comment.findByPk(id);
  if (!comment) throw new ServiceError("Comentario no encontrado", 404);
  await comment.destroy();
};

module.exports = {
  listComments, getComment, createComment, createCommentForPost,
  updateComment, deleteComment,
};
