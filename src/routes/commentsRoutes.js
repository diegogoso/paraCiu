const { Router } = require("express");
const controller = require("../controllers/commentsController");
const { createComment, updateComment, listCommentsQuery } = require("../schemas");
const { validate, validateQuery, validateParamId } = require("../middlewares/validate");

const router = Router();
router.param("id", validateParamId);

router.get("/", validateQuery(listCommentsQuery), controller.getComments);

router.post("/", validate(createComment), controller.createComment);

router.get("/:id", controller.getComment);

router.put("/:id", validate(updateComment), controller.updateComment);

router.delete("/:id", controller.deleteComment);

module.exports = router;