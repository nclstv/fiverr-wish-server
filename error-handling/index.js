const { default: mongoose } = require("mongoose");

module.exports = (app) => {
  app.use((req, res, next) => {
    // this middleware runs whenever requested page is not available
    res.status(404).json({ message: "This route does not exist" });
  });

  app.use((err, req, res, next) => {
    let { status, type, message } = err;

    // console.log(err);

    // Handle internal server error
    status = status || 500;
    type = type || "INTERNAL_ERROR";
    message = message || "Internal server error.";

    // Handle invalid or expire token
    if (err.code === "credentials_required") {
      type = "UNAUTHORIZED";
      message = "Invalid or expired token";
    }

    if (err instanceof mongoose.Error.ValidationError) {
      status = 400;
      type = "MONGOOSE_VALIDATION";
      message = "Mongoose validation failed";

      const errors = Object.keys(err.errors).map(
        (key) => err.errors[key].message
      );

      return res.status(status).json({
        type,
        message,
        status,
        instance: req.path,
        errors,
      });
    }

    console.error("ERROR", req.method, req.path, err);

    res.status(status).json({ type, message, status, instance: req.path });
  });
};
