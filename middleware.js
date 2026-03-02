const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/reviews");

// ---------------- SUPER ADMIN CHECK ----------------
function isSuperAdmin(user){
  return user && (user.role === "admin" || user.username === "Trip Analyst");
}

module.exports.isAdmin = (req,res,next)=>{
  if(!req.user || req.user.username !== "Trip Analyst"){
    req.flash("error","Admin access only");
    return res.redirect("/listings");
  }
  next();
};

// ---------------- AUTH CHECK ----------------
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in first!");
    return res.redirect("/login");
  }
  next();
};

// ---------------- REDIRECT SAVE ----------------
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl;
  }
  next();
};

// ---------------- OWNER CHECK ----------------
module.exports.isOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    if (!isSuperAdmin(req.user) && (!req.user || !listing.owner.equals(req.user._id))) {
      req.flash("error", "You are not authorized to do that!");
      return res.redirect(`/listings/${id}`);
    }

    next();
  } catch (err) {
    next(err);
  }
};

// ---------------- REVIEW AUTHOR CHECK ----------------
module.exports.isReviewAuthor = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      req.flash("error", "Review not found!");
      return res.redirect(`/listings/${id}`);
    }

    if (!isSuperAdmin(req.user) && (!req.user || !review.author.equals(req.user._id))) {
      req.flash("error", "You are not authorized to delete this review!");
      return res.redirect(`/listings/${id}`);
    }

    next();
  } catch (err) {
    next(err);
  }
};

// ---------------- LISTING VALIDATION ----------------
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    return next(new ExpressError(400, errMsg));
  }

  next();
};

// ---------------- REVIEW VALIDATION ----------------
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    return next(new ExpressError(400, errMsg));
  }

  next();
};