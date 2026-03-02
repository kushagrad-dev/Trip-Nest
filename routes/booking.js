const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { bookingSchema } = require("../schema");

// ---------------- AUTH CHECK ----------------
const isLoggedIn = (req,res,next)=>{
  if(!req.user){
    throw new ExpressError("You must be logged in to book",401);
  }
  next();
};

// ---------------- ADMIN CHECK ----------------
const isAdmin = (req,res,next)=>{
  if(!req.user){
    throw new ExpressError("Admin access required",403);
  }

  // allow Trip Analyst as admin even if role not set
  if(req.user.role === "admin" || req.user.username === "Trip Analyst"){
    return next();
  }

  throw new ExpressError("Admin access required",403);
};

router.patch("/:id/reject", isLoggedIn, isAdmin, async (req,res,next)=>{
  try{
    const booking = await Booking.findById(req.params.id);
    if(!booking) throw new ExpressError("Booking not found",404);

    booking.status = "cancelled";
    await booking.save();

    req.flash("success","Booking rejected");
    res.redirect("/bookings/admin/bookings");
  }catch(err){
    next(err);
  }
});

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
router.post("/", isLoggedIn, validateBooking, async (req, res, next) => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body.booking;

    // check listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) throw new ExpressError("Listing not found", 404);

    // normalize dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const today = new Date();
    today.setHours(0,0,0,0);
    checkInDate.setHours(0,0,0,0);

    if(checkInDate < today){
      throw new ExpressError("Cannot book past dates",400);
    }
    if(checkOutDate <= checkInDate){
      throw new ExpressError("Check-out must be after check-in",400);
    }

    // availability check using model method
    const available = await Booking.isAvailable(listingId, checkInDate, checkOutDate);
    if(!available){
      throw new ExpressError("Selected dates not available",400);
    }

    // calculate price securely on server
    const nights = Math.ceil((checkOutDate - checkInDate)/(1000*60*60*24));
    const totalPrice = nights * listing.price;

    const booking = new Booking({
      listingId,
      userId: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      status: "pending"
    });

    await booking.save();

    req.flash("success", "Booking confirmed!");
    res.redirect(`/bookings/${booking._id}/confirm`);

  } catch (err) {
    next(err);
  }
});

// ---------------- USER BOOKINGS ----------------
router.get("/my", isLoggedIn, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("listingId","title image price location");
    res.render("bookings/index", { bookings });
  } catch (err) {
    next(err);
  }
});

// ---------------- ADMIN APPROVE BOOKING ----------------
router.patch("/:id/approve", isLoggedIn, isAdmin, async (req,res,next)=>{
  try{
    const booking = await Booking.findById(req.params.id);
    if(!booking) throw new ExpressError("Booking not found",404);

    booking.status = "confirmed";
    await booking.save();

    req.flash("success","Booking approved");
    res.redirect("/admin/bookings");
  }catch(err){
    next(err);
  }
});

// ---------------- CANCEL BOOKING ----------------
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if(!booking) throw new ExpressError("Booking not found",404);

    if(booking.userId.toString() !== req.user._id.toString()){
      throw new ExpressError("Unauthorized action",403);
    }

    booking.status = "cancelled";
    await booking.save();
    req.flash("success", "Booking cancelled");
    res.redirect("/bookings/my");
  } catch (err) {
    next(err);
  }
});


// ---------------- ADMIN BOOKINGS PANEL ----------------
router.get("/admin/bookings", isLoggedIn, isAdmin, async (req,res,next)=>{
  try{
    const bookings = await Booking.find()
      .populate("listingId","title image price location")
      .populate("userId","username email")
      .sort({ createdAt:-1 });

    res.render("bookings/admin",{ bookings });
  }catch(err){
    next(err);
  }
});

module.exports = router;
