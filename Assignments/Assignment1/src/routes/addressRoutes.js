const express = require("express");
const AddressModel = require("../models/AddressModel");

const addressRouter = express.Router();

addressRouter.use(express.json());

// Create Address
addressRouter.post("/createAddress", async (req, res) => {
  try {
    const {
      addressType,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      latitude,
      longitude,
    } = req.body;

    const address = await AddressModel.create({
      addressType,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get Nearby Locations
addressRouter.get("/getLocations", async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    const locations = await AddressModel.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius,
        },
      },
    });

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = addressRouter;
