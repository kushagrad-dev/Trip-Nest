const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  console.log("\nRender Signup Form Route Hit");
  res.render("users/signup");
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // check existing user FIRST
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email already registered");
      return res.redirect("/signup");
    }

    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, err => {
      if (err) return next(err);

      req.flash("success", "Welcome to TripNest!");
      return res.redirect("/listings");
    });

  } catch (err) {
    console.error("Signup error:", err);
    req.flash("error", err.message);
    return res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  console.log("\nRender Login Form");
  res.render("users/login");
};

module.exports.login = (req, res) => {
  console.log("\nLOGIN SUCCESS");
  console.log("User:", req.user?._id);
  console.log("Redirecting to:", res.locals.redirectUrl || "/listings");

  req.flash("success", "Welcome back to TripNest!");
  res.redirect(res.locals.redirectUrl || "/listings");
};

module.exports.logout = (req, res, next) => {
  console.log("\nLOGOUT ATTEMPT");

  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return next(err);
    }

    console.log("Logout successful");
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};