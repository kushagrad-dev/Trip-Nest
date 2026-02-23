const mongoose = require("mongoose");
const Review = require("./reviews.js");

const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  image: {
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5"
    },
    filename: {
      type: String,
      default: "default-image"
    }
  },

  price: {
    type: Number,
    required: true
  },

  location: {
    type: String
  },

  place: {
    type: String
  },

  country: {
    type: String
  },

  // MAPBOX
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lng, lat]

      default: [0, 0]
    }
  },
  category: {
    type: String,
    enum: [
      "camping",
      "castles",
      "farms",
      "mountains",
      "pools",
      "arctic",
      "iconic cities"
    ],
    lowercase: true,
    trim: true
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

/* DEBUG MIDDLEWARE  */

// Before save
listingSchema.pre("save", function(next) {
  console.log("[Listing PRE SAVE]", {
    title: this.title,
    price: this.price,
    location: this.location
  });
  next();
});

// After save success
listingSchema.post("save", function(doc) {
  console.log("[Listing SAVED SUCCESS]", doc._id.toString());
});

// Save error handler
listingSchema.post("save", function(error, doc, next) {
  console.error("[Listing SAVE ERROR]", error);
  next(error);
});


// Middleware: delete associated reviews
listingSchema.post("findOneAndDelete", async (listing) => {
  try {
    if (listing) {
      console.log("[Listing DELETE]", listing._id.toString());

      await Review.deleteMany({
        _id: { $in: listing.reviews }
      });

      console.log("[Associated Reviews Deleted]");
    } else {
      console.log("[Delete Attempted But No Listing Found]");
    }
  } catch (err) {
    console.error("[DELETE CASCADE ERROR]", err);
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;