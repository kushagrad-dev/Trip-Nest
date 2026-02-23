const Listing = require("../models/listing");
const Review = require("../models/reviews");
const ExpressError = require("../utils/ExpressError");

module.exports.createReview = async (req, res, next) => {
  try {
    console.log("\nCREATE REVIEW STARTED");
    console.log("Listing ID:", req.params.id);
    console.log("User:", req.user?._id);
    console.log("Body:", req.body);

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      console.error("Listing not found for review");
      throw new ExpressError(404, "Listing not found");
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    console.log("Saving review...");
    await newReview.save();

    listing.reviews.push(newReview);
    await listing.save();

    console.log("Review saved successfully");

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);

  } catch (err) {
    console.error("\nERROR IN CREATE REVIEW");
    console.error("Message:", err.message);
    if (err.stack) console.error(err.stack);
    next(err);
  }
};

module.exports.deleteReview = async (req, res, next) => {
  try {
    console.log("\n🗑 DELETE REVIEW STARTED");
    console.log("Listing ID:", req.params.id);
    console.log("Review ID:", req.params.reviewId);

    const { id, reviewId } = req.params;

    console.log("Removing review reference from listing...");
    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });

    console.log("Deleting review document...");
    const deleted = await Review.findByIdAndDelete(reviewId);

    if (!deleted) {
      console.error("Review not found in DB");
      throw new ExpressError(404, "Review not found");
    }

    console.log("Review deleted successfully");

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);

  } catch (err) {
    console.error("\n ERROR IN DELETE REVIEW");
    console.error("Message:", err.message);
    if (err.stack) console.error(err.stack);
    next(err);
  }
};