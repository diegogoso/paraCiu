const validate = (schema, property = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    convert: true,
  });

  if (error) return sendValidationError(error, res);

  req[property] = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    convert: true,
  });

  if (error) return sendValidationError(error, res);
  req.validatedQuery = value;
  next();
};

const sendValidationError = (error, res) => res.status(400).json({
  error: "Datos inválidos",
  details: error.details.map((detail) => detail.message),
});

const validateParamId = (req, res, next, value, key) => {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
    return res.status(400).json({
      error: `El parámetro ${key} debe ser un entero positivo`,
    });
  }

  next();
};

module.exports = { validate, validateQuery, validateParamId };
