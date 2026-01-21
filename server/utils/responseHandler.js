/**
 * Standardized API Response Handler
 */
class ResponseHandler {
  static success(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res,
    message = "Something went wrong",
    statusCode = 500,
    error = null,
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }

  static created(res, data, message = "Resource created successfully") {
    return this.success(res, data, message, 201);
  }
}

module.exports = ResponseHandler;
