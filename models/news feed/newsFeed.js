const mongoose = require('mongoose');

const newsFeedSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    featuredPlayers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'auth',
      },
    ],

    banner: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Top news', 'Highlights', 'Interviews'],
      default: 'Top news',
    },
  },
  { timestamps: true }
);

const newsfeed = mongoose.model('newsFeed', newsFeedSchema);
module.exports = newsfeed;
