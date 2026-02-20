const express = require("express");
const router = express.Router();

// Route debug logger
router.use((req, res, next) => {
  console.log("\n📍 LISTING ROUTE HIT");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Params:", req.params);
  console.log("Query:", req.query);
  next();
});

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const Listing = require("../models/listing.js");
const Fuse = require("fuse.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js"); // cloudinary storage configuration

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      console.error(" File rejected by multer. Invalid mimetype:", file.mimetype);
      cb(new Error("Only image files are allowed"), false);
    }
  }
});

// Safe multer wrapper to prevent crashes
const uploadMiddleware = (req, res, next) => {
  console.log("\nUpload middleware triggered");

  upload.single("listing[image]")(req, res, function (err) {
    if (err) {
      console.error("Multer Upload Error:", err);
      console.error("Stack:", err.stack);
      return res.status(400).send(err.message || "File upload failed");
    }

    console.log(" Upload passed");
    next();
  });
};

// -------------------- ROUTES --------------------

// EXPLORE (alias of listings index)
router.get("/explore", (req,res,next)=>{
  console.log("Explore route accessed");
  next();
}, wrapAsync(listingController.index));

// INDEX + CREATE
router.route("/")
  .get((req,res,next)=>{console.log(" Listings index controller"); next();}, wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    uploadMiddleware,
    validateListing,
    wrapAsync(listingController.createListing)
  );

// NEW
router.get("/new", isLoggedIn, (req,res,next)=>{console.log("➕ New listing form opened"); next();}, wrapAsync(listingController.renderNewForm));

// FUZZY SEARCH
router.get("/search", async (req,res)=>{
  const { q } = req.query;

  if(!q || q.trim()===""){
    return res.redirect("/listings");
  }

  const listings = await Listing.find({});

  const fuse = new Fuse(listings,{
    keys:["title","location","country","description"],
    threshold:0.4
  });

  const results = fuse.search(q);
  const matchedListings = results.map(r=>r.item);

  res.render("listings/index",{ allListings: matchedListings });
});

// EDIT
router.get("/:id/edit", isLoggedIn, isOwner, (req,res,next)=>{console.log("📝 Edit form for", req.params.id); next();}, wrapAsync(listingController.renderEditForm));

// SHOW + UPDATE + DELETE
router.route("/:id")
  .get((req,res,next)=>{console.log(" Show listing", req.params.id); next();}, wrapAsync(listingController.showListing))
  .put(isLoggedIn, isOwner, uploadMiddleware, validateListing, (req,res,next)=>{console.log("✏️ Update listing", req.params.id); next();}, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, (req,res,next)=>{console.log("🗑 Delete listing", req.params.id); next();}, wrapAsync(listingController.deleteListing));

// ---------------- ERROR LOGGER ----------------
router.use((err, req, res, next) => {
  console.error("\n🚨 LISTING ROUTE ERROR");
  console.error("Route:", req.originalUrl);
  console.error("Method:", req.method);
  console.error("Params:", req.params);
  console.error("Body:", req.body);
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  next(err);
});

module.exports = router;