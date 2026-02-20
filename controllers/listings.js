const Listing = require("../models/listing");


// INDEX
module.exports.index = async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page = 1 } = req.query;

  let query = {};

  // SEARCH
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } }
    ];
  }

  // CATEGORY
  if (category) {
    query.category = category;
  }

  // PRICE
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // SORT
  let sortOption = {};
  if (sort === "low") sortOption.price = 1;
  else if (sort === "high") sortOption.price = -1;
  else if (sort === "new") sortOption._id = -1;

  // PAGINATION
  const limit = 9;
  const currentPage = Math.max(parseInt(page) || 1, 1);
  const skip = (currentPage - 1) * limit;

  const totalListings = await Listing.countDocuments(query);

  const allListings = await Listing.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalListings / limit);

  res.render("listings/index.ejs", {
    allListings,
    currentPage,
    totalPages,
    filters: { search, category, minPrice, maxPrice, sort }
  });
};


// NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};


// SHOW
module.exports.showListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate("reviews")
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};


// CREATE
module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect(`/listings/${newListing._id}`);
};


// EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const originalImageUrl = listing.image?.url || "";
  res.locals.originalImageUrl = originalImageUrl;

  res.render("listings/edit", {
    listing,
    originalImageUrl
  });
};


// UPDATE
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
    await listing.save();
  }

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};


// DELETE
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};