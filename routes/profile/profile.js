const router = require('express').Router();
const {
  createProfile,
  getProfile,
  addRemoveFollow,
  flagProfile,
  deleteProfile,
  updateStatus,
  subscribeMail,
  contactUs,
  getLeads,
  getPlayer,
  getHomeData,
  ratingRequest,
} = require('../../controllers/profile/profile');
const { authenticate } = require('../../middleware/authentication');
const { multerStorage } = require('../../utils/multer');
router.post(
  '/create-profile',
  authenticate,
  multerStorage.fields([
    { name: 'images', maxCount: 10 },
    { name: 'picture', maxCount: 1 },
    { name: 'videos', maxCount: 4 },
  ]),
  createProfile
);
router.get('/get-profile/:id', getProfile);
router.delete('/delete-profile/:id', deleteProfile);
router.get('/getPlayer', getPlayer);
router.post('/rating-request', ratingRequest);
router.get('/getHomeData', getHomeData);
router.post('/contactUs', contactUs);
router.get('/leads', getLeads);
router.post('/subscribeMail', subscribeMail);
router.get('/flagProfile/:id', authenticate, flagProfile);
router.post('/updateStatus', updateStatus);
router.get('/addRemoveFollow/:id', authenticate, addRemoveFollow);
module.exports = router;
