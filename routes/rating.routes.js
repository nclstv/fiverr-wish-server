// POST /services/:id (rating)
router.post("/services/:serviceId", isAuthenticated, async (req, res) => {
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
    console.error("Error adding rating:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the rating" });
  }
});
