const mongoose = require('mongoose');

const playerSchema = mongoose.Schema(
  {
    auth: {
      type: mongoose.Schema.ObjectId,
      ref: 'auth',
    },
    starRating: {
      type: Number,
    },

    isRequested: {
      type: Boolean,
      default: false,
    },
    picture: {
      type: String,
      default:
        'https://images.stockcake.com/public/d/7/8/d78cebaa-ab71-4582-a26f-5481a0cd71a4_large/intense-basketball-play-stockcake.jpg',
    },

    institute: {
      type: mongoose.Schema.ObjectId,
      ref: 'university',
    },
    location: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    height: {
      type: String,
      required: true,
    },
    weight: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    jerseyNumber: {
      type: Number,
      required: true,
    },
    birthPlace: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
    },
    favouriteBy: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'auth',
      },
    ],
    status: {
      type: String,
      default: 'pending',
    },
    previousCoachName: {
      type: String,
    },
    followedBy: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'auth',
      },
    ],
    article: {
      type: String,
    },
    video1: {
      type: String,
      validate: {
        validator: function (v) {
          // Simple URL validation regex
          return /^(https?:\/\/[^\s]+)/.test(v);
        },
        message: 'Invalid URL format for video1.',
      },
    },
    video2: {
      type: String,
      validate: {
        validator: function (v) {
          // Simple URL validation regex
          return /^(https?:\/\/[^\s]+)/.test(v);
        },
        message: 'Invalid URL format for video2.',
      },
    },
  },
  { timestamps: true }
);

const playerModel = mongoose.model('player', playerSchema);
module.exports = playerModel;
