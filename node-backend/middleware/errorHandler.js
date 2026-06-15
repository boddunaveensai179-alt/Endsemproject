const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id format' });
  }

  return res.status(500).json({
    message: 'Internal Node.js service error',
  });
};

module.exports = errorHandler;
