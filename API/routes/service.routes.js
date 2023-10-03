const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Service = require("../models/Service.model");
const Rating = require("../models/Rating.model");

router.post("/services", async (req, res) => {
  try {
    const { title, description, image, estimatepriceperday, ownerId } =
      req.body;

    const service = new Service({
      title,
      description,
      image,
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
    res.status(200).json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching services" });
  }
});
module.exports = router;
