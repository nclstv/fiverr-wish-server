const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Service = require("../models/Service.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const fileUploader = require("../config/cloudinaray.config");
const Request = require("../models/Request.model");
const Rating = require("../models/Rating.model");

// POST /api/services
router.post("/services", isAuthenticated, async (req, res, next) => {
  try {
    // Get user and body
    const user = req.payload;
    const { title, description, type, estimatePricePerDay, image } = req.body;

    // Create a new service
    const createdService = await Service.create({
      title,
      description,
      image,
      type,
      estimatePricePerDay,
      owner: user._id,
    });

    // Push the created service in user services
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $push: { services: createdService._id } },
      { new: true }
    );

    // Response the created service
    res.status(201).json(createdService);
  } catch (error) {
    next(error);
  }
});

// POST /api/upload
router.post("/upload", fileUploader.single("image"), (req, res, next) => {
  if (!req.file) {
    next(new Error("No file uploaded!"));
    return;
  }
  res.json({ fileUrl: req.file.path });
});

// GET /api/services
router.get("/services", async (req, res, next) => {
  try {
    // Get all services with owner informations
    const services = await Service.find().populate({
      path: "owner",
      select: "username profilePicture",
    });

    // Response all services
    res.status(200).json(services);
  } catch (error) {
    next(error);
  }
});

router.get("/services/me", isAuthenticated, async (req, res, next) => {
  try {
    const user = req.payload;
    const servicies = await Service.find({ owner: user._id });

    if (!servicies) {
      return next({
        message: "No servicies.",
        type: "NOT_FOUND",
        status: 404,
      });
    }

    res.status(200).json(servicies);
  } catch (error) {
    next(error);
  }
});

// GET /api/services/:id
router.get("/services/:serviceId", isAuthenticated, async (req, res, next) => {
  try {
    // Retrieve service information
    const user = req.payload;
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId).populate({
      path: "ratings",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "user",
        select: "profilePicture username",
      },
    });

    // If no service found
    if (!service) {
      return next({
        message: "This service cannot be found.",
        type: "NOT_FOUND",
        status: 404,
      });
    }

    const foundRequest = await Request.findOne({
      $and: [{ service: service._id }, { requestUser: user._id }],
    });

    if (
      (foundRequest && foundRequest.status === "accepted") ||
      service.owner.equals(user._id)
    ) {
      await service.populate({
        path: "owner",
        select: "username profilePicture phoneNumber email",
      });
    } else {
      await service.populate({
        path: "owner",
        select: "username profilePicture",
      });
    }

    res.status(200).json({ service, request: foundRequest });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/services/:id
router.delete(
  "/services/:serviceId",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { serviceId } = req.params;
      const user = req.payload;

      const service = await Service.findById(serviceId);

      // If no service found
      if (!service) {
        return next({
          message: "This service cannot be found.",
          type: "NOT_FOUND",
          status: 404,
        });
      }

      // If not owner
      if (!service.owner.equals(user._id)) {
        return next({
          message: "Unable to delete. You are not the owner of this service.",
          type: "FORBIDDEN",
          status: 403,
        });
      }

      // Delete the service
      await Service.findByIdAndDelete(serviceId);

      await Request.deleteMany({ service: serviceId });

      await Rating.deleteMany({ service: serviceId });

      res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/services/:id
router.put("/services/:serviceId", isAuthenticated, async (req, res, next) => {
  try {
    // Retrieve user, serviceId and body
    const { serviceId } = req.params;
    const user = req.payload;
    const { title, description, image, estimatePricePerDay } = req.body;

    const service = await Service.findById(serviceId);

    console.log(service);

    // If no service found
    if (!service) {
      return next({
        message: "This service cannot be found.",
        type: "NOT_FOUND",
        status: 404,
      });
    }

    // If not owner
    if (!service.owner.equals(user._id)) {
      return next({
        message: "Unable to update. You are not the owner of this service.",
        type: "FORBIDDEN",
        status: 403,
      });
    }

    const updatedService = await Service.findOneAndUpdate(
      { _id: service._id },
      { title, description, image, estimatePricePerDay },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedService);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
