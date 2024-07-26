const express = require('express');
const router = express.Router();
let {
  FavouritePlayer,
  getFavouritePlayers,
  getFavouritePlayersByGroup,
} = require('../../controllers/favourite player/favouriteplayer'); // Adjust path as necessary
const { authenticate } = require('../../middleware/authentication');

router.post('/favourites', FavouritePlayer);
router.get('/favourites/:coachId', getFavouritePlayers);
router.get('/favourites-group/:coachId', getFavouritePlayersByGroup);

module.exports = router;
