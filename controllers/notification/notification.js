const PlayerModel = require('../../models/player/player');

module.exports.getNotification = async (req, res) => {
  try {
    const getPlayerNotifications = await PlayerModel.find({
      isRequested: true,
    }).populate('auth');
    return res.status(200).json({
      data: getPlayerNotifications,
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      error: 'Server error, please try again',
    });
  }
};
