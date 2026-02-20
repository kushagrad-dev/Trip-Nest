const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");

router.use((req, res, next) => {
  console.log("\n[USER ROUTE HIT]");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Body:", req.body);
  console.log("Params:", req.params);
  next();
});
const passport = require("passport");
const userController = require("../controllers/users.js");
const { saveRedirectUrl } = require("../middleware");

router.get("/signup",
  (req,res,next)=>{ console.log("Signup form route"); next(); },
  userController.renderSignupForm
);

router.post(
  "/signup",
  (req,res,next)=>{ console.log("Signup POST route"); next(); },
  wrapAsync(userController.signup)
);

router.get("/login",
  (req,res,next)=>{ console.log("Login form route"); next(); },
  userController.renderLoginForm
);

router.post(
  "/login",
  (req,res,next)=>{ console.log("Login POST route"); next(); },
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login
);

router.get("/logout",
  (req,res,next)=>{ console.log("Logout route"); next(); },
  userController.logout
);

module.exports = router;
