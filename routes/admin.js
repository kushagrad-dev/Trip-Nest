const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/reviews");
const ExpressError = require("../utils/ExpressError");

const express = require("express");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");
const { isAdmin } = require("../middleware/admin");

// SUPER ADMIN CHECK
function isSuperAdmin(req,res,next){
  if(!req.user || (req.user.username!=="Trip Analyst" && req.user.role!=="admin")){
    throw new ExpressError("Super admin access required",403);
  }
  next();
}

// DASHBOARD PAGE
router.get("/", isSuperAdmin, async (req,res)=>{
  const users = await User.find();
  const listings = await Listing.find().populate("owner","username");
  const reviews = await Review.find().populate("author","username");

  res.render("admin/dashboard",{ users, listings, reviews });
});

// DELETE USER
router.delete("/user/:id", isSuperAdmin, async (req,res)=>{
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

// MAKE ADMIN
router.patch("/user/:id/admin", isSuperAdmin, async (req,res)=>{
  await User.findByIdAndUpdate(req.params.id,{ role:"admin" });
  res.redirect("/admin");
});

// DELETE LISTING
router.delete("/listing/:id", isSuperAdmin, async (req,res)=>{
  await Listing.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

// DELETE REVIEW
router.delete("/review/:id", isSuperAdmin, async (req,res)=>{
  await Review.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

//admin routes for approving/rejecting listings
// APPROVE LISTING
router.patch("/listings/:id/approve", isLoggedIn, isAdmin, async(req,res)=>{
  await Listing.findByIdAndUpdate(req.params.id,{status:"approved"});
  req.flash("success","Listing approved");
  res.redirect("back");
});


// REJECT LISTING
router.patch("/listings/:id/reject", isLoggedIn, isAdmin, async(req,res)=>{
  await Listing.findByIdAndUpdate(req.params.id,{status:"rejected"});
  req.flash("error","Listing rejected");
  res.redirect("back");
});

module.exports = router;