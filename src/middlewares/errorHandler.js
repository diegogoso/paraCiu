const { ForeignKeyConstraintError, UniqueConstraintError } = require("sequelize");

module.exports = (error, _req, res, _next) => {
  console.error(error);
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({ error: "Ya existe un recurso con esos datos" });
  }
  if (error instanceof ForeignKeyConstraintError) {
    return res.status(400).json({ error: "La relación indicada no es válida" });
  }
  res.status(error.status || 500).json({
    error: error.message || "Error interno del servidor",
  });
};
