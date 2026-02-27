const Joi = require("joi");

// ---------------- LISTING SCHEMA ----------------
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    description: Joi.string().trim().min(10).max(1000).required(),
    category: Joi.string().trim().min(3).max(50).required(),
    price: Joi.number().min(0).max(10000000).required(),
    location: Joi.string().trim().min(2).max(150).required(),
    country: Joi.string().trim().min(2).max(100).required(),
    image: Joi.string().allow("", null),
    imageUrl: Joi.string().allow("", null),
  })
    .required()
    .unknown(false)
    .custom((value, helpers) => {
      console.log("[JOI LISTING VALIDATION PASSED DATA]", value);
      return value;
    }),
});

// ---------------- REVIEW SCHEMA ----------------
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().trim().min(3).max(500).required(),
  })
    .required()
    .unknown(false)
    .custom((value, helpers) => {
      console.log("[JOI REVIEW VALIDATION PASSED DATA]", value);
      return value;
    }),
});

// ---------------- BOOKING SCHEMA ----------------
module.exports.bookingSchema = Joi.object({
  booking: Joi.object({
    listingId: Joi.string().required(),
    checkIn: Joi.date().required(),
    checkOut: Joi.date().greater(Joi.ref("checkIn")).required(),
    guests: Joi.number().min(1).max(20).required(),
    totalPrice: Joi.number().min(0).required(),
  })
    .required()
    .unknown(false)
    .custom((value) => {
      console.log("[JOI BOOKING VALIDATION PASSED DATA]", value);
      return value;
    }),
});