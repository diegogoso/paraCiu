const { Router } = require("express");
const controller = require("../controllers/usersController");
const { createUser, updateUser, userNickNameParam } = require("../schemas");
const { validate, validateParamId } = require("../middlewares/validate");

const router = Router();

router.param("id", validateParamId);
router.param("followedId", validateParamId);

router.get("/", controller.getUsers);

router.post("/", validate(createUser), controller.createUser);

// Ruta GET para un usuario específico con nickName dinámico
router.get("/nickname/:nickName", validate(userNickNameParam, "params"), controller.obtenerUsuarioPorNickName);

router.get("/:id", controller.getUser);

router.put("/:id", validate(updateUser), controller.updateUser);

router.delete("/:id", controller.deleteUser);

router.get("/:id/followers", controller.listFollowers);

router.get("/:id/following", controller.listFollowing);

router.post("/:id/following/:followedId", controller.followUser);

router.delete("/:id/following/:followedId", controller.unfollowUser);

module.exports = router;