const { Tag } = require("../models");
const ServiceError = require("./serviceError");

const findTagOrFail = async (id) => {
  const tag = await Tag.findByPk(id);
  if (!tag) throw new ServiceError("Etiqueta no encontrada", 404);
  return tag;
};

const listTags = () => Tag.findAll({ order: [["name", "ASC"]] });

const getTag = async (id) => {
  const tag = await Tag.findByPk(id, {
    include: [{ association: "posts", through: { attributes: [] } }],
  });
  if (!tag) throw new ServiceError("Etiqueta no encontrada", 404);
  return tag;
};

const createTag = (data) => Tag.create(data);

const updateTag = async (id, data) => {
  const tag = await findTagOrFail(id);
  return tag.update(data);
};

const deleteTag = async (id) => {
  const tag = await findTagOrFail(id);
  await tag.destroy();
};

module.exports = { listTags, getTag, createTag, updateTag, deleteTag };
