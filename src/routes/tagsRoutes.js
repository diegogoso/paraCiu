const { Router } = require("express");
const controller = require("../controllers/tagsController");
const { createTag, updateTag } = require("../schemas");
const { validate, validateParamId } = require("../middlewares/validate");

const router = Router();
router.param("id", validateParamId);

router.get("/", controller.getTags);

router.post("/", validate(createTag), controller.createTag);

router.get("/:id", controller.getTag);

router.put("/:id", validate(updateTag), controller.updateTag);

router.delete("/:id", controller.deleteTag);

module.exports = router;
