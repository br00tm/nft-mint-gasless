import logger from "../utils/logger.js";

// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  logger.error(message, err.stack);

  res.status(status).json({
    message,
    ...(err.details ? { details: err.details } : {})
  });
}
