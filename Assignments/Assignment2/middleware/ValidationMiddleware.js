const ValidationMiddleware = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Invalid input data",
        details: error.message,
      });
    }
    next();
  };
};

module.exports = ValidationMiddleware;
