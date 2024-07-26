const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      default: 'active',
      enum: ['active', 'canceled'],
    },
    subtype: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

let subscriptionmodel = mongoose.model('subscriptions', subscriptionSchema);

module.exports = subscriptionmodel;
