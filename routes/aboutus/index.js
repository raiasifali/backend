const router = require('express').Router();
const { updateAboutUs, getAboutUs } = require('../../controllers/aboutus');

router.post('/about-us', updateAboutUs);
router.get('/about-us', getAboutUs);

module.exports = router;
