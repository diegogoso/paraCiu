const service = require("../services/postsService");

const getPosts = async (_req, res) => res.json(await service.listPosts());
const getPost = async (req, res) => res.json(await service.getPost(req.params.id));
const createPost = async (req, res) => res.status(201).json(await service.createPost(req.body));
const updatePost = async (req, res) => res.json(await service.updatePost(req.params.id, req.body));
const deletePost = async (req, res) => {
  await service.deletePost(req.params.id);
  res.status(204).end();
};
const listPostImages = async (req, res) => res.json(await service.listPostImages(req.params.postId));
const addPostImage = async (req, res) => {
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body?.url;

  if (!imageUrl) {
    return res.status(400).json({
      error: "Datos inválidos",
      details: ["Debe subir un archivo de imagen válido o enviar una URL"],
    });
  }

  const nuevaImagen = await service.addPostImage(req.params.postId, imageUrl);
  res.status(201).json(nuevaImagen);
};
const deletePostImage = async (req, res) => {
  await service.deletePostImage(req.params.postId, req.params.imageId);
  res.status(204).end();
};
const addPostTag = async (req, res) => {
  await service.addPostTag(req.params.postId, req.params.tagId);
  res.status(201).json({ message: "Etiqueta asignada correctamente" });
};
const removePostTag = async (req, res) => {
  await service.removePostTag(req.params.postId, req.params.tagId);
  res.status(204).end();
};

module.exports = {
  getPosts, getPost, createPost, updatePost, deletePost,
  listPostImages, addPostImage, deletePostImage, addPostTag, removePostTag,
};
