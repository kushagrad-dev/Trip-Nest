const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});




// Before save
reviewSchema.pre("save", function(next) {
  console.log("[Review PRE SAVE]", {
    rating: this.rating,
    comment: this.comment,
    author: this.author
  });
  next();
});

// After save
reviewSchema.post("save", function(doc) {
  console.log("[Review SAVED]", doc._id.toString());
});

// Save error handler
reviewSchema.post("save", function(error, doc, next) {
  console.error("[Review SAVE ERROR]", error);
  next(error);
});

// Delete hook
reviewSchema.post("findOneAndDelete", function(doc) {
  if (doc) {
    console.log("[Review DELETED]", doc._id.toString());
  } else {
    console.log("[Review DELETE ATTEMPT — NOT FOUND]");
  }
});



module.exports = mongoose.model("Review", reviewSchema);