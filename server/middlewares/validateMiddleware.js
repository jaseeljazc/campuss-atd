function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;

      next();
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({
          error: 'Validation error',
          details: err.errors.map((e) => ({ path: e.path, message: e.message })),
        });
      }

      return res.status(400).json({ error: 'Invalid request' });
    }
  };
}

module.exports = {
  validate,
};

