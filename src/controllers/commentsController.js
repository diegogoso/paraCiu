const service = require("../services/commentsService");

const getComments = async (req, res) => {
  res.json(await service.listComments(req.params.postId || req.validatedQuery?.postId));
};
const getComment = async (req, res) => res.json(await service.getComment(req.params.id));
const createComment = async (req, res) => res.status(201).json(await service.createComment(req.body));
const createCommentForPost = async (req, res) => {
  res.status(201).json(await service.createCommentForPost(req.params.postId, req.body));
};
const updateComment = async (req, res) => res.json(await service.updateComment(req.params.id, req.body));
const deleteComment = async (req, res) => {
  await service.deleteComment(req.params.id);
  res.status(204).end();
};

module.exports = {
  getComments, getComment, createComment, createCommentForPost,
  updateComment, deleteComment,
};
