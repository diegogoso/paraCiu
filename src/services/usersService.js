const { User, Post } = require("../models");
const ServiceError = require("./serviceError");

const findUserOrFail = async (id, message = "Usuario no encontrado") => {
  const user = await User.findByPk(id);
  if (!user) throw new ServiceError(message, 404);
  return user;
};

const listUsers = () => User.findAll({
  attributes: ["id", "nickName", "createdAt"],
  order: [["id", "ASC"]],
});

const getUser = (id) => User.findByPk(id, {
  include: [
    { model: Post, as: "posts" },
    { model: User, as: "following", attributes: ["id", "nickName"] },
    { model: User, as: "followers", attributes: ["id", "nickName"] },
  ],
}).then((user) => {
  if (!user) throw new ServiceError("Usuario no encontrado", 404);
  return user;
});

const createUser = (data) => User.create(data);

const updateUser = async (id, data) => {
  const user = await findUserOrFail(id);
  return user.update(data);
};

const deleteUser = async (id) => {
  const user = await findUserOrFail(id);
  await user.destroy();
};

const listRelationship = async (id, relationship) => {
  const user = await User.findByPk(id, {
    include: [{ model: User, as: relationship, attributes: ["id", "nickName"] }],
  });
  if (!user) throw new ServiceError("Usuario no encontrado", 404);
  return user[relationship];
};

const followUser = async (followerId, followedId) => {
  const follower = await findUserOrFail(followerId);
  const followed = await findUserOrFail(followedId, "Usuario a seguir no encontrado");
  if (follower.id === followed.id) throw new ServiceError("No puede seguirse a sí mismo", 400);
  if (await follower.hasFollowing(followed)) throw new ServiceError("Ya sigue a esta cuenta", 409);
  await follower.addFollowing(followed);
};

const unfollowUser = async (followerId, followedId) => {
  const follower = await findUserOrFail(followerId);
  const followed = await findUserOrFail(followedId);
  if (!(await follower.hasFollowing(followed))) {
    throw new ServiceError("La relación no existe", 404);
  }
  await follower.removeFollowing(followed);
};

const buscarPorNickName = async (nickName) => {
  const usuario = await User.findOne({ where: { nickName } });
  if (!usuario) {
    throw new ServiceError("Usuario no encontrado", 404);
  }
  return usuario;
};

module.exports = {
  listUsers, getUser, createUser, updateUser, deleteUser,
  listFollowers: (id) => listRelationship(id, "followers"),
  listFollowing: (id) => listRelationship(id, "following"),
  followUser, unfollowUser, buscarPorNickName,
};
