const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const connection = require("./connection/connection");
const authRoutes = require("./routes/auth/auth");
const profileRoutes = require("./routes/profile/profile");
const newsFeedRoutes = require("./routes/news feed/newsFeed");
const videoRoutes = require("./routes/video/video");
const subscriptionRoutes = require("./routes/subscriptions/subscriptions");
const coachRoutes = require("./routes/coach/coach");
const coachProfileRoutes = require("./routes/coach profile/coachProfile");
const avalabilityPlayers = require("./routes/avalability players/avalabilityPlayers");
const adminroutes = require("./routes/admin/admin");
const testimonialroutes = require("./routes/testimonial/testimonial");
const aboutusroutes = require("./routes/aboutus");
const notifications = require("./routes/notification/notification");
const favouriteplayer = require("./routes/favourite player/favouritePlayer");

// initialize app
const app = express();
const allowedOrigins = [
  "https://frontend-flax-pi-43.vercel.app",
  "https://undiscovered-wqvo.vercel.app",
];
// CORS configuration
const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
//undiscovered-wqvo.vercel.app/login
https: app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// body-parser configuration
app.use(
  bodyParser.json({
    verify: (req, res, buffer) => {
      req.rawBody = buffer;
    },
  })
);

app.use(express.urlencoded({ extended: true }));

// routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "SUCCESS" });
});

app.use(authRoutes);
app.use(profileRoutes);
app.use(newsFeedRoutes);
app.use(videoRoutes);
app.use(coachRoutes);
app.use(coachProfileRoutes);
app.use(subscriptionRoutes);
app.use(avalabilityPlayers);
app.use(adminroutes);
app.use(testimonialroutes);
app.use(aboutusroutes);
app.use(notifications);
app.use(favouriteplayer);

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// mongodb connection
connection;

// start server
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
