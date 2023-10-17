const { isAuthenticated } = require("../middleware/jwt.middleware");
const Rating = require("../models/Rating.model");
const Service = require("../models/Service.model");

const router = require("express").Router();

// POST /rating/:id
router.post("/ratings/:serviceId", isAuthenticated, async (req, res, next) => {
  try {
    // Retrieve service, rating, user information
    const { serviceId } = req.params;
    const { rating, comment } = req.body;
    const user = req.payload;

    const service = await Service.findById(serviceId);

    // If no service found
    if (!service) {
      next({
        message: "This service cannot be found.",
        type: "NOT_FOUND",
        status: 404,
      });
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
    next(error);
  }
});

// PUT /services/:serviceId/ratings/:ratingId (Edit Rating)
router.put(
  "/services/:serviceId/ratings/:ratingId",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { serviceId, ratingId } = req.params;
      const { rating, comment } = req.body;
      const user = req.payload;

      const service = await Service.findById(serviceId);

      if (!service) {
        return res.status(404).json({
          message: "This service cannot be found.",
          type: "NOT_FOUND",
        });
      }

      const existingRating = await Rating.findById(ratingId);

      if (!existingRating) {
        return res.status(404).json({
          message: "Rating not found.",
          type: "NOT_FOUND",
        });
      }

      if (existingRating.user.toString() !== user._id.toString()) {
        return res.status(403).json({
          message: "You are not authorized to edit this rating.",
          type: "FORBIDDEN",
        });
      }

      existingRating.rating = rating;
      existingRating.comment = comment;

      const updatedRating = await existingRating.save();

      res.status(200).json({
        message: "Rating updated successfully",
        rating: updatedRating,
      });
    } catch (error) {
      console.error("Error editing rating:", error);
      res
        .status(500)
        .json({ error: "An error occurred while editing the rating" });
    }
  }
);

// DELETE /services/:serviceId/ratings/:ratingId (Delete Rating)
router.delete(
  "/services/:serviceId/ratings/:ratingId",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { serviceId, ratingId } = req.params;
      const user = req.payload;

      const service = await Service.findById(serviceId);

      if (!service) {
        return res.status(404).json({
          message: "This service cannot be found.",
          type: "NOT_FOUND",
        });
      }

      const existingRating = await Rating.findById(ratingId);

      if (!existingRating) {
        return res.status(404).json({
          message: "Rating not found.",
          type: "NOT_FOUND",
        });
      }

      if (existingRating.user.toString() !== user._id.toString()) {
        return res.status(403).json({
          message: "You are not authorized to delete this rating.",
          type: "FORBIDDEN",
        });
      }

      await existingRating.remove();

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting rating:", error);
      res
        .status(500)
        .json({ error: "An error occurred while deleting the rating" });
    }
  }
);

module.exports = router;
