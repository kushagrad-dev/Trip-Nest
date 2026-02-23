const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  }
});

userSchema.plugin(require("passport-local-mongoose"));



// Before save
userSchema.pre("save", function() {
  console.log("[User PRE SAVE]", {
    email: this.email,
    id: this._id
  });
});

// After save
userSchema.post("save", function(doc) {
  console.log("[User SAVED]", doc._id.toString());
});

// Save error handler
userSchema.post("save", function(error, doc, next) {
  console.error("[User SAVE ERROR]", error);
  next(error);
});

// Delete hook
userSchema.post("findOneAndDelete", function(doc) {
  if (doc) {
    console.log("[User DELETED]", doc._id.toString());
  } else {
    console.log("[User DELETE ATTEMPT — NOT FOUND]");
  }
});



module.exports = mongoose.model("User", userSchema);