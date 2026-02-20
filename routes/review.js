const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
const wrapAsync = require("../utils/wrapAsync.js");

// DEBUG LOGGER
router.use((req, res, next) => {
  console.log(`\n[REVIEW ROUTE] ${req.method} ${req.originalUrl}`);
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  next();
});

router.post(
  "/",
  isLoggedIn,
  (req, res, next) => {
    console.log("[CREATE REVIEW] handler reached");
    next();
  },
  wrapAsync(reviewController.createReview)
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  (req, res, next) => {
    console.log("[DELETE REVIEW] handler reached for review:", req.params.reviewId);
    next();
  },
  wrapAsync(reviewController.deleteReview)
);
module.exports = router;