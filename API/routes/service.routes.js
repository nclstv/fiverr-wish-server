const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Service = require("../models/Service.model");
const Rating = require("../models/Rating.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.post("/services", async (req, res) => {
  try {
    const user = req.payload;
    const { title, description, image, type, estimatepriceperday, ownerId } =
      req.body;

    const service = new Service({
      title,
      description,
      image,
      type,
      estimatepriceperday,
      owner: ownerId,
    });

    await service.save();

    res.status(201).json({ message: "Service created successfully", service });
  } catch (error) {
    console.error("Error creating service:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the service" });
  }
});

router.get("/services", async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching services" });
  }
});

router.get("/services/:id", async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.status(200).json({ service });
  } catch (error) {
    console.error("Error fetching the service:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the service" });
  }
});

router.post("/services/:id", isAuthenticated, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { rating, comment } = req.body;
    const user = req.payload;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const newRating = new Rating({
      rating,
      comment,
      user: user._id,
      service: service._id,
    });

    const newRatingSaved = await newRating.save();
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        $push: { ratings: newRatingSaved._id },
      },
      { new: true }
    );
    res.status(201).json({
      message: "Rating added successfully",
      rating: newRating,
      updatedService,
    });
  } catch (error) {
    console.error("Error adding rating:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the rating" });
  }
});

router.get("/services/pending", async (req, res) => {
  try {
    const servicesPending = await Service.find({
      userpending: { $exists: true },
    });

    res.status(200).json(servicesPending);
  } catch (error) {
    console.error("Error fetching pending services:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching pending services" });
  }
});
router.delete("/services/:id", async (req, res) => {
  try {
    const serviceId = req.params.id;
    const existingService = await Service.findById(serviceId);

    if (!existingService) {
      return res.status(404).json({ error: "Service not found" });
    }
    if (existingService.owner.toString() !== req.payload._id) {
      return res
        .status(403)
        .json({ error: "You do not have permission to delete this service" });
    }
    await Service.findByIdAndDelete(serviceId);

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the service" });
  }
});

router.put("/services/:id", async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { title, description, image, estimatepriceperday } = req.body;
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        title,
        description,
        image,
        estimatepriceperday,
      },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ error: "Service not found" });
    }

    if (updatedService.owner.toString() !== req.payload._id) {
      return res
        .status(403)
        .json({ error: "You do not have permission to edit this service" });
    }

    res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the service" });
  }
});

module.exports = router;
