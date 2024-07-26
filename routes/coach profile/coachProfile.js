const express = require('express');
const {
  createCoachProfile,
} = require('../../controllers/coach profile/coachProfile'); // Update with the correct path to your controller
const router = express.Router();

router.post('/coach-profile', createCoachProfile);

module.exports = router;
