const mongoose = require('mongoose');
const Coach = require('../../models/coach Profile/coachProfile'); // Update with the correct path to your Coach model
const Player = require('../../models/player/player'); // Update with the correct path to your Player model
module.exports.FavouritePlayer = async (req, res) => {
  try {
    const { coachId, playerId } = req.body;

    // Validate the IDs
    if (
      !mongoose.Types.ObjectId.isValid(coachId) ||
      !mongoose.Types.ObjectId.isValid(playerId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Coach ID or Player ID' });
    }

    // Find the coach
    const coach = await Coach.findOne({ auth: coachId });
    if (!coach) {
      return res
        .status(404)
        .json({ success: false, message: 'Coach not found' });
    }

    // Find the player
    const player = await Player.findById(playerId);
    if (!player) {
      return res
        .status(404)
        .json({ success: false, message: 'Player not found' });
    }

    const isAlreadyFavourite = player.favouriteBy.includes(coach.auth);

    if (!isAlreadyFavourite) {
      // Add coach's auth ID to the player's favouriteBy array
      await Player.findByIdAndUpdate(
        playerId,
        { $addToSet: { favouriteBy: coach.auth } },
        { new: true }
      );

      return res.status(201).json({
        success: true,
        message: 'Player added to favourites',
      });
    } else {
      // Remove coach's auth ID from the player's favouriteBy array
      await Player.findByIdAndUpdate(
        playerId,
        { $pull: { favouriteBy: coach.auth } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Player removed from favourites',
      });
    }
  } catch (error) {
    console.error('Error toggling favourite player:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Server error, please try again' });
  }
};
module.exports.getFavouritePlayers = async (req, res) => {
  try {
    const { coachId } = req.params;

    // Validate the coach ID
    if (!mongoose.Types.ObjectId.isValid(coachId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Coach ID' });
    }

    // Find the coach
    const coach = await Coach.findOne({ auth: coachId });
    if (!coach) {
      return res
        .status(404)
        .json({ success: false, message: 'Coach not found' });
    }

    // Find players favourited by the coach
    const favouritePlayers = await Player.find({
      favouriteBy: coach.auth,
    }).populate('auth');

    return res.status(200).json({
      success: true,
      data: favouritePlayers,
    });
  } catch (error) {
    console.error('Error fetching favourite players:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Server error, please try again' });
  }
};

module.exports.getFavouritePlayersByGroup = async (req, res) => {
  try {
    const { coachId } = req.params;

    // Validate the coach ID
    if (!mongoose.Types.ObjectId.isValid(coachId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Coach ID' });
    }

    // Find the coach
    const coach = await Coach.findOne({ auth: coachId });
    if (!coach) {
      return res
        .status(404)
        .json({ success: false, message: 'Coach not found' });
    }

    // Find players favourited by the coach
    const favouritePlayers = await Player.find({
      favouriteBy: coach.auth,
    }).populate('auth');

    // Group players by class
    const groupedByClass = favouritePlayers.reduce((acc, player) => {
      const playerClass = player.class;
      if (!acc[playerClass]) {
        acc[playerClass] = [];
      }
      acc[playerClass].push(player);
      return acc;
    }, {});

    // Convert grouped object to array and process each class to make groups of 3 players
    const result = Object.keys(groupedByClass).map((playerClass) => ({
      class: playerClass,
      players: chunkArray(groupedByClass[playerClass], 3),
    }));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching favourite players:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Server error, please try again' });
  }
};

// Helper function to chunk an array into smaller arrays of a specified size
function chunkArray(array, chunkSize) {
  const results = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
}
