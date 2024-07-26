const router = require('express').Router();
const {
  getNotification,
} = require('../../controllers/notification/notification');

router.get('/get-notifications', getNotification);

module.exports = router;
