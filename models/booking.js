const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  checkIn: {
    type: Date,
    required: true
  },

  checkOut: {
    type: Date,
    required: true
  },

  guests: {
    type: Number,
    required: true,
    min: 1
  },

  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});


// ---------------- CHECK AVAILABILITY STATIC METHOD ----------------
bookingSchema.statics.isAvailable = async function(listingId, checkIn, checkOut) {
  const conflict = await this.findOne({
    listingId,
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn }
  });

  return !conflict;
};


// ---------------- AUTO VALIDATE DATES BEFORE SAVE ----------------
bookingSchema.pre("save", function(next) {

  if (!this.checkIn || !this.checkOut) {
    return next(new Error("Check-in and Check-out dates required"));
  }

  if (this.checkOut <= this.checkIn) {
    return next(new Error("Check-out must be after check-in"));
  }

  if (this.checkIn < new Date()) {
    return next(new Error("Cannot book past dates"));
  }

  next();
});


// ---------------- CALCULATE NIGHTS VIRTUAL ----------------
bookingSchema.virtual("nights").get(function(){
  const diff = this.checkOut - this.checkIn;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

bookingSchema.set("toJSON", { virtuals: true });
bookingSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Booking", bookingSchema);