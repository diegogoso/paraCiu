const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");

const dialect = (process.env.DB_DIALECT || "sqlite").toLowerCase();
const options = {
  dialect,
  logging: process.env.DB_LOGGING === "true" ? console.log : false,
};

if (dialect === "sqlite") {
  const configuredStorage = process.env.DB_STORAGE || "./data/anti-social.sqlite";
  const storage =
    configuredStorage === ":memory:"
      ? configuredStorage
      : path.resolve(__dirname, "../..", configuredStorage);

  if (storage !== ":memory:") {
    fs.mkdirSync(path.dirname(storage), { recursive: true });
  }

  options.storage = storage;
} else {
  options.host = process.env.DB_HOST || "localhost";
  options.port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
}

module.exports = new Sequelize(
  process.env.DB_NAME || "anti_social",
  process.env.DB_USER || undefined,
  process.env.DB_PASSWORD || undefined,
  options,
);
