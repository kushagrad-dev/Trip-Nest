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
  .get(async (req,res,next)=>{
    console.log(" Listings index controller");

    try{
      const { search, q, minPrice, maxPrice, sort , category } = req.query;
      const searchTerm = search || q;
      let query = {};
      let matchedIds = null;

      if (searchTerm && searchTerm.trim() !== "") {
        const term = searchTerm.trim();

        // safer regex search
        const regex = new RegExp(term, "i");

        query.$or = [
          { title: regex },
          { location: regex },
          { country: regex },
          { description: regex }
        ];

        console.log("Search regex:", regex);
      }

      if (category && category.trim() !== "") {
        query.category = { $regex: `^${category}$`, $options: "i" };
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      let page = parseInt(req.query.page) || 1;
      let limit = 9;
      let skip = (page - 1) * limit;

      let dbQuery = Listing.find(query);

      if (sort === "low") dbQuery = dbQuery.sort({ price: 1 });
      else if (sort === "high") dbQuery = dbQuery.sort({ price: -1 });
      else if (sort === "new") dbQuery = dbQuery.sort({ _id: -1 });

      const totalListings = await Listing.countDocuments(query);
      const totalPages = Math.ceil(totalListings / limit);

      const allListings = await dbQuery.skip(skip).limit(limit);

      // Apply relevance ranking order if search was used
      if (matchedIds && matchedIds.length > 0) {
        allListings.sort((a, b) => {
          const aIndex = matchedIds.findIndex(id => id.toString() === a._id.toString());
          const bIndex = matchedIds.findIndex(id => id.toString() === b._id.toString());
          return aIndex - bIndex;
        });
      }

      res.render("listings/index", {
        allListings,
        filters: req.query,
        currentPage: page,
        totalPages
      });

    } catch(err){
      next(err);
    }
  })
  .post(
    isLoggedIn,
    uploadMiddleware,
    validateListing,
    wrapAsync(listingController.createListing)
  );

// NEW
router.get("/new", isLoggedIn, (req,res,next)=>{console.log("➕ New listing form opened"); next();}, wrapAsync(listingController.renderNewForm));

// LIVE SEARCH SUGGESTIONS API
router.get("/suggest", async (req,res)=>{
  try{
    const { q } = req.query;

    if(!q || q.trim()===""){
      return res.json([]);
    }

    const listings = await Listing.find({})
      .select("title location country")
      .limit(50)
      .lean();

    const fuse = new Fuse(listings,{
      keys:["title","location","country"],
      threshold:0.4,
      ignoreLocation:true
    });

    const results = fuse.search(q.trim()).slice(0,5);

    const suggestions = results.map(r=>({
      id: r.item._id,
      title: r.item.title,
      location: r.item.location,
      country: r.item.country
    }));

    res.json(suggestions);

  }catch(err){
    console.error("Suggestion error:",err);
    res.json([]);
  }
});
// FUZZY SEARCH
router.get("/search", (req,res)=>{
  const { q } = req.query;

  if(!q || q.trim()===""){
    return res.redirect("/listings");
  }

  // Redirect to main listings route so search behaves like filters
  res.redirect(`/listings?search=${encodeURIComponent(q.trim())}`);
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
  console.error("\nLISTING ROUTE ERROR");
  console.error("Route:", req.originalUrl);
  console.error("Method:", req.method);
  console.error("Params:", req.params);
  console.error("Body:", req.body);
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  next(err);
});

module.exports = router;