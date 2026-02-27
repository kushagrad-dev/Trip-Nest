const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { bookingSchema } = require("../schema");

// ---------------- VALIDATE BOOKING ----------------
const validateBooking = (req, res, next) => {
  const { error } = bookingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  }
  next();
};



// ---------------- CREATE BOOKING ----------------
router.post("/", validateBooking, async (req, res, next) => {
  try {
    const { listingId, checkIn, checkOut, guests, totalPrice } = req.body.booking;

    // check listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) throw new ExpressError("Listing not found", 404);

    // check date conflict
    const conflict = await Booking.findOne({
      listingId,
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn }
    });

    if (conflict) {
      throw new ExpressError("Selected dates not available", 400);
    }

    // create booking
    const booking = new Booking({
      listingId,
      userId: req.user?._id,
      checkIn,
      checkOut,
      guests,
      totalPrice
    });

    await booking.save();

    req.flash("success", "Booking confirmed!");
    res.redirect(`/listings/${listingId}`);

  } catch (err) {
    next(err);
  }
});

// ---------------- USER BOOKINGS ----------------
router.get("/my", async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).populate("listingId");
    res.render("bookings/index", { bookings });
  } catch (err) {
    next(err);
  }
});

// ---------------- CANCEL BOOKING ----------------
router.delete("/:id", async (req, res, next) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    req.flash("success", "Booking cancelled");
    res.redirect("/bookings/my");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
