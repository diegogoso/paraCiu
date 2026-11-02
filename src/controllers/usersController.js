const service = require("../services/usersService");

const getUsers = async (_req, res) => res.json(await service.listUsers());
const getUser = async (req, res) => res.json(await service.getUser(req.params.id));
const createUser = async (req, res) => res.status(201).json(await service.createUser(req.body));
const updateUser = async (req, res) => res.json(await service.updateUser(req.params.id, req.body));
const deleteUser = async (req, res) => {
  await service.deleteUser(req.params.id);
  res.status(204).end();
};
const listFollowers = async (req, res) => res.json(await service.listFollowers(req.params.id));
const listFollowing = async (req, res) => res.json(await service.listFollowing(req.params.id));
const followUser = async (req, res) => {
  await service.followUser(req.params.id, req.params.followedId);
  res.status(201).json({ message: "Usuario seguido correctamente" });
};
const unfollowUser = async (req, res) => {
  await service.unfollowUser(req.params.id, req.params.followedId);
  res.status(204).end();
};

const obtenerUsuarioPorNickName = async (req, res) => {
    // Si la búsqueda falla, el throw del servicio viaja directo al errorHandler
    const usuario = await service.buscarPorNickName(req.params.nickName);
    res.status(200).json(usuario);
};

module.exports = {
  getUsers, getUser, createUser, updateUser, deleteUser,
  listFollowers, listFollowing, followUser, unfollowUser,
  obtenerUsuarioPorNickName,
};
