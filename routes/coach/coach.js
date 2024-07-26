const router = require('express').Router();
const { authenticate } = require('../../middleware/authentication');
const { multerStorage } = require('../../utils/multer');
const {
  createCoach,
  getNews,
  removePlayer,
  updateStatus,
  createPlayer,
  getPlayers,
} = require('../../controllers/coach/coach');
router.post('/create-coach', createCoach);
router.get('/getNews', getNews);
router.post(
  '/create-player',
  multerStorage.fields([{ name: 'picture', maxCount: 1 }, { name: 'logo' }]),
  createPlayer
);
router.get('/getPlayersAdmin', getPlayers);
router.get('/removePlayer/:id', removePlayer);
router.post('/updateStatus', updateStatus);

module.exports = router;
