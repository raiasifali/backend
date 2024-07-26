//imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./connection/connection');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth/auth');
const profileRoutes = require('./routes/profile/profile');
const newsFeedRoutes = require('./routes/news feed/newsFeed');
const videoRoutes = require('./routes/video/video');
const subscriptionRoutes = require('./routes/subscriptions/subscriptions');
const coachRoutes = require('./routes/coach/coach');
const coachProfileRoutes = require('./routes/coach profile/coachProfile');
const avalabilityPlayers = require('./routes/avalability players/avalabilityPlayers');
const adminroutes = require('./routes/admin/admin');
const testimonialroutes = require('./routes/testimonial/testimonial');
const aboutusroutes = require('./routes/aboutus');
const notifications = require('./routes/notification/notification');
const favouriteplayer = require('./routes/favourite player/favouritePlayer');

//middlewares
// app.use(cors())
app.use(cors());
app.options(
  '*',
  cors({
    origin: '*',
    credentials: true,
    methods: ['POST', 'GET', 'DELETE', 'UPDATE'],
    optionSuccessStatus: 200,
  })
);
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();
// });

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

  next();
});

// app.use(express.json({
//     verify: (req, res, buffer) => req['rawBody'] = buffer,
//   }));

app.use(
  bodyParser.json({
    verify: (req, res, buffer) => {
      req.rawBody = buffer;
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

//routes
app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'SUCCESS',
  });
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

//mongodb connection
connection;

//server
app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}`);
});
