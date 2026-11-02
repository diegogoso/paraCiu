const service = require("../services/tagsService");

const getTags = async (_req, res) => res.json(await service.listTags());
const getTag = async (req, res) => res.json(await service.getTag(req.params.id));
const createTag = async (req, res) => res.status(201).json(await service.createTag(req.body));
const updateTag = async (req, res) => res.json(await service.updateTag(req.params.id, req.body));
const deleteTag = async (req, res) => {
  await service.deleteTag(req.params.id);
  res.status(204).end();
};

module.exports = { getTags, getTag, createTag, updateTag, deleteTag };
