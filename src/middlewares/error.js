import { errorResponse } from '../utils/response.js';

export const notFound = (req, res, next) => {
  errorResponse(res, `Route not found: ${req.originalUrl}`, 404);
};

// Mongo/Mongoose failures arrive as opaque driver errors; translate the ones a
// client can act on into 4xx responses instead of a blanket 500.
const translate = (err) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return {
      status: 409,
      message: `A record with that ${field} already exists`,
      errors: [{ field, message: 'must be unique' }]
    };
  }

  if (err.name === 'ValidationError') {
    return {
      status: 422,
      message: 'Validation failed',
      errors: Object.values(err.errors || {}).map((item) => ({
        field: item.path,
        message: item.message
      }))
    };
  }

  if (err.name === 'CastError') {
    return {
      status: 400,
      message: `Invalid ${err.path}: ${err.value}`,
      errors: null
    };
  }

  if (err.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File exceeds the allowed size limit'
      : err.message;
    return { status: 400, message, errors: null };
  }

  return {
    status: err.statusCode || 500,
    message: err.message || 'Server error',
    errors: err.errors || null
  };
};

export const errorHandler = (err, req, res, next) => {
  const { status, message, errors } = translate(err);

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  const safeMessage = status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : message;
  errorResponse(res, safeMessage, status, errors);
};
