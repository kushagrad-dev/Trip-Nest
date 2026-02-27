if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();

const bookingRoutes = require("./routes/booking");
app.use("/bookings", bookingRoutes);

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo").default || require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user.js");

const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

app.get("/privacy", (req,res)=>{
  res.render("includes/legal");
});

// -------------------- DB --------------------
async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => console.log("Connected to DB"))
  .catch(err => {
    console.error("\nDATABASE CONNECTION ERROR");
    console.error("Time:", new Date().toISOString());
    console.error("Message:", err.message);
    console.error("Stack:\n", err.stack);
  });

// -------------------- APP CONFIG --------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// -------------------- SESSION STORE --------------------

// mongoose connect session is used for session tracking it tracks and says to login after 24hrs again
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SESSION_SECRET },
  touchAfter: 24 * 3600
});

store.on("error", (err) =>{
  console.log("Error in Mongo session store", err);
})

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET || "fallbacksecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};



app.use(session(sessionOptions));

// -------------------- PASSPORT --------------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -------------------- FLASH --------------------
app.use(flash());

// -------------------- GLOBAL LOCALS --------------------
app.use((req, res, next) => {
  console.log("\nREQUEST:", req.method, req.originalUrl);
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  next();
});

// -------------------- ROUTES --------------------
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

// -------------------- 404 --------------------
app.use((req, res, next) => {
  console.error("\n404 ERROR — Route Not Found");
  console.error("URL:", req.originalUrl);
  console.error("Method:", req.method);
  next(new ExpressError(404, "Page Not Found"));
});

// -------------------- ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  console.error("\nGLOBAL ERROR HANDLER");
  console.error("Time:", new Date().toISOString());
  console.error("Route:", req.method, req.originalUrl);
  console.error("Status:", err.status || 500);
  console.error("Message:", err.message);

  if (err.stack) {
    console.error("Stack Trace:\n", err.stack);
  }

  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  res.status(status).render("error.ejs", { status, message });
});

// -------------------- SERVER --------------------
app.listen(8080, () => {
  console.log("\nSERVER STARTED");
  console.log("Port: 8080");
  console.log("Time:", new Date().toLocaleString());
});

// DEBUG TOKEN CHECK
console.log("MAP TOKEN:", process.env.MAP_TOKEN ? "Loaded" : "Missing");