const express = require("express");
const authMiddleware = require("../middlewares/authValidation");
const validationMiddleware = require("../middlewares/validationMiddleware");
const apiError = require("../utils/apiError");

const AddressModel = require("../model/addressModel");
const {
  addressValidationSchema,
  nearMeValidationSchema,
  searchAddressValidationSchema,
} = require("../validationSchema/addressValidationSchema");

const addressRouter = express.Router();

// ============================================================================
// CREATE ADDRESS  ->  POST /address/createAddress
// ============================================================================
addressRouter.post(
  "/createAddress",
  authMiddleware,
  validationMiddleware(addressValidationSchema),
  async (req, res, next) => {
    try {
      const {
        type,
        street,
        city,
        state,
        country,
        pincode,
        latitude,
        longitude,
        location,
      } = req.body;

      // Normalize type ("home" -> "Home") to match Mongoose schema enum
      let normalizedType = "Home";
      if (type) {
        normalizedType =
          type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      }

      // Safely extract longitude and latitude numbers
      let lng = longitude !== undefined ? Number(longitude) : undefined;
      let lat = latitude !== undefined ? Number(latitude) : undefined;

      if (
        (lng === undefined || lat === undefined) &&
        location &&
        Array.isArray(location.coordinates) &&
        location.coordinates.length === 2
      ) {
        lng = Number(location.coordinates[0]);
        lat = Number(location.coordinates[1]);
      }

      if (lng === undefined || lat === undefined || isNaN(lng) || isNaN(lat)) {
        return next(
          apiError.badRequest("Latitude and longitude coordinates are required numbers")
        );
      }

      const address = await AddressModel.create({
        user: req.user._id,
        type: normalizedType,
        street,
        city,
        state,
        country,
        pincode: Number(pincode),
        location: {
          type: "Point",
          coordinates: [lng, lat],
        },
      });

      return res.status(201).json({
        success: true,
        message: "Address successfully created",
        address,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// ============================================================================
// GET USER'S OWN ADDRESSES  ->  GET /address/my-addresses
// ============================================================================
addressRouter.get("/my-addresses", authMiddleware, async (req, res, next) => {
  try {
    const addresses = await AddressModel.find({ user: req.user._id });
    return res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (err) {
    return next(err);
  }
});

// ============================================================================
// GET ADDRESSES NEAR ME  ->  GET /address/adressesNearMe (and /addressesNearMe)
// ============================================================================
const getNearMeHandler = async (req, res, next) => {
  try {
    const longitude = Number(req.query.longitude);
    const latitude = Number(req.query.latitude);
    const radius = req.query.radius ? Number(req.query.radius) : 5000;

    const addressesdata = await AddressModel.find({
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

    return res.status(200).json({
      success: true,
      count: addressesdata.length,
      addresses: addressesdata,
    });
  } catch (err) {
    return next(err);
  }
};

addressRouter.get(
  "/adressesNearMe",
  authMiddleware,
  validationMiddleware(nearMeValidationSchema, "query"),
  getNearMeHandler
);

// Alias for corrected spelling
addressRouter.get(
  "/addressesNearMe",
  authMiddleware,
  validationMiddleware(nearMeValidationSchema, "query"),
  getNearMeHandler
);

// ============================================================================
// SEARCH ADDRESS BY STREET  ->  GET /address/searchAddress
// ============================================================================
addressRouter.get(
  "/searchAddress",
  authMiddleware,
  validationMiddleware(searchAddressValidationSchema, "query"),
  async (req, res, next) => {
    try {
      const { street } = req.query;

      const addresses = await AddressModel.find({
        street: {
          $regex: street,
          $options: "i",
        },
      });

      return res.status(200).json({
        success: true,
        count: addresses.length,
        message: addresses.length > 0 ? "Addresses found" : "No addresses found",
        addresses,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// ============================================================================
// GET ADDRESS BY ID  ->  GET /address/getAddress/:id
// ============================================================================
addressRouter.get("/getAddress/:id", authMiddleware, async (req, res, next) => {
  try {
    const addressData = await AddressModel.findById(req.params.id).populate(
      "user",
      "name email role"
    );

    if (!addressData) {
      return next(apiError.notFound("Address"));
    }

    return res.status(200).json({
      success: true,
      address: addressData,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = addressRouter;