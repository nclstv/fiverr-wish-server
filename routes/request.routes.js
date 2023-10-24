const { request } = require("express");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const Request = require("../models/Request.model");
const Service = require("../models/Service.model");

const router = require("express").Router();

router.get(
  "/requests/service/:serviceId",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const user = req.payload;
      const { serviceId } = req.params;

      const service = await Service.findOne({ _id: serviceId });

      // If no service
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
          message: "You are not the owner of this service.",
          type: "FORBIDDEN",
          status: 403,
        });
      }

      const requests = await Request.find({ service: service._id }).populate({
        path: "requestUser",
        select: "username profilePicture",
      });

      res.status(200).json(requests);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/requests/user/", isAuthenticated, async (req, res, next) => {
  try {
    const user = req.payload;

    const requests = await Request.find({ requestUser: user._id }).populate({
      path: "service",
      select: "-__v",
      populate: { path: "owner", select: "username profilePicture" },
    });

    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
});

router.post("/requests/:serviceId", isAuthenticated, async (req, res, next) => {
  try {
    const user = req.payload;
    const { serviceId } = req.params;

    // Create a request
    const createdRequest = await Request.create({
      requestUser: user._id,
      service: serviceId,
    });

    res.status(201).json(createdRequest);
  } catch (error) {
    next(error);
  }
});

router.get("/requests/:requestId", isAuthenticated, async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const user = req.payload;

    const request = await Request.findOne({ _id: requestId })
      .populate({ path: "requestUser", select: "username profilePicture" })
      .populate({
        path: "service",
        select: "-__v",
        populate: { path: "owner", select: "username profilePicture" },
      });

    if (
      !request.requestUser._id.equals(user._id) ||
      !request.service.owner.equals(user._id)
    ) {
      return next({
        message: "You are not allow to see this request.",
        type: "FORBIDDEN",
        status: 403,
      });
    }

    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/requests/:requestId",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const user = req.payload;
      const { requestId } = req.params;

      const foundRequest = await Request.findOne({ _id: requestId });

      // If no service found
      if (!foundRequest) {
        return next({
          message: "This service cannot be found.",
          type: "NOT_FOUND",
          status: 404,
        });
      }

      // If not owner
      if (!foundRequest.requestUser.equals(user._id)) {
        return next({
          message: "Unable to delete. You are not the owner of this request.",
          type: "FORBIDDEN",
          status: 403,
        });
      }

      const deletedRequest = await Request.findOneAndDelete({
        _id: foundRequest._id,
      });

      res.status(200).json(deletedRequest);
    } catch (error) {
      next(error);
    }
  }
);

router.put("/requests/:requestId", isAuthenticated, async (req, res, next) => {
  try {
    const user = req.payload;
    const { requestId } = req.params;
    const { status } = req.body;

    console.log("requestId");

    if (!status) {
      return next({
        message: "Status is missing.",
        type: "INVALID_REQUEST",
        status: 400,
      });
    }

    const foundRequest = await Request.findOne({ _id: requestId }).populate(
      "service"
    );

    // If no service found
    if (!foundRequest) {
      return next({
        message: "This service cannot be found.",
        type: "NOT_FOUND",
        status: 404,
      });
    }

    // If not owner
    if (!foundRequest.service.owner.equals(user._id)) {
      return next({
        message: "Unable to update. You are not the owner of this request.",
        type: "FORBIDDEN",
        status: 403,
      });
    }

    const updatedRequest = await Request.findOneAndUpdate(
      { _id: foundRequest._id },
      { status },
      { new: true }
    );

    res.status(200).json(updatedRequest);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
