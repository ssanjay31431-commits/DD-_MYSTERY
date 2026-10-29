const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const isDatabaseUnavailable = [
    'MongoNetworkError',
    'MongoNetworkTimeoutError',
    'MongoServerSelectionError',
    'MongooseServerSelectionError',
    'MongoWaitQueueTimeoutError'
  ].includes(err.name) || err.code === 50;
  const statusCode = err.status || err.statusCode || (isDatabaseUnavailable ? 503 : res.statusCode === 200 ? 500 : res.statusCode);
  if (statusCode >= 500) {
    const routeGroup = req.path.split('/').filter(Boolean).slice(0, 2).join('/') || 'root';
    const route = req.route?.path ? `${req.baseUrl}${req.route.path}` : `/${routeGroup}`;
    console.error('[API Error]', {
      operation: `${req.method} ${route}`,
      statusCode,
      name: err.name || 'Error',
      code: typeof err.code === 'number' || /^[A-Z0-9_-]+$/i.test(String(err.code || ''))
        ? err.code
        : undefined
    });
  }

  res.status(statusCode).json({
    message: process.env.NODE_ENV === 'production' && statusCode >= 500
      ? 'The server could not complete the request'
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };
