const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Service = require("../models/Service.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// POST /api/services
router.post("/services", isAuthenticated, async (req, res, next) => {
  try {
    // Get user and body
    const user = req.payload;
    const { title, description, image, type, estimatePricePerDay } = req.body;

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

// GET /api/services/:id
router.get("/services/:serviceId", isAuthenticated, async (req, res, next) => {
  try {
    // Retrieve service information
    const user = req.payload;
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);

    // If no service found
    if (!service) {
      return next({
        message: "This service cannot be found.",
        type: "NOT_FOUND",
        status: 404,
      });
    }

    // TODO Check if user is accepted or owner
    if (true) {
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

    res.status(200).json(service);
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
      { new: true }
    );

    res.status(200).json(updatedService);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
