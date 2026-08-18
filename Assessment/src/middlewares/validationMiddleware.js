const validationMiddleware = (schema, source = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source]);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    req[source] = value;

    next();
  };
};

module.exports = validationMiddleware;
