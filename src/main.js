require("dotenv").config();

const app = require("./app");
const { sequelize } = require("./models");

const port = Number(process.env.PORT || 3000);

if (require.main === module) {
  sequelize.sync()
    .then(() => {
      app.listen(port, () => {
        console.log(`UnaHur - Anti-Social Net escuchando en http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error("No se pudo inicializar la base de datos:", error);
      process.exitCode = 1;
    });
}

module.exports = app;
