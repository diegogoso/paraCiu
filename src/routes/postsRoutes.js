const { Router } = require("express");
const controller = require("../controllers/postsController");
const commentsController = require("../controllers/commentsController");
const { createPost, updatePost, createPostComment } = require("../schemas");
const { validate, validateParamId } = require("../middlewares/validate");
const upload = require("../middlewares/upload");

const router = Router();

for (const param of ["id", "postId", "imageId", "tagId"]) {
  router.param(param, validateParamId);
}

router.get("/", controller.getPosts);

router.post("/", validate(createPost), controller.createPost);

router.get("/:id", controller.getPost);

router.put("/:id", validate(updatePost), controller.updatePost);

router.delete("/:id", controller.deletePost);

router.get("/:postId/comments", commentsController.getComments);

router.post("/:postId/comments", validate(createPostComment), commentsController.createCommentForPost);

router.get("/:postId/images", controller.listPostImages);

router.post("/:postId/images", upload.single("image"), controller.addPostImage);

router.delete("/:postId/images/:imageId", controller.deletePostImage);

router.post("/:postId/tags/:tagId", controller.addPostTag);

router.delete("/:postId/tags/:tagId", controller.removePostTag);

module.exports = router;