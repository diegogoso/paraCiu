const express = require("express");
const usersRoutes = require("./usersRoutes");
const postsRoutes = require("./postsRoutes");
const commentsRoutes = require("./commentsRoutes");
const tagsRoutes = require("./tagsRoutes");

const router = express.Router();

// Se ARMA por dominio para que cada recurso quede separado y sea más fácil
// ir agregando endpoints nuevos sin mezclar lógica. La API base queda en /api.
router.use("/users", usersRoutes);
router.use("/posts", postsRoutes);
router.use("/comments", commentsRoutes);
router.use("/tags", tagsRoutes);

module.exports = router;
