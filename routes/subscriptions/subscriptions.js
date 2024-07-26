const router = require('express').Router();
const { authenticate } = require('../../middleware/authentication');
const {
  createSession,
  webhooks,
  createSubscription,
  cancelSubscription,
} = require('../../controllers/subscriptions/subscriptions');
router.post('/create-session', authenticate, createSession);
router.post('/webhooks', webhooks);
router.post('/create-subscription', authenticate, createSubscription);
router.post('/cancel-subscription', authenticate, cancelSubscription);

module.exports = router;
