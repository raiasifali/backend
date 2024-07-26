const Coach = require('../../models/coach/coach'); // Update with the correct path to your Coach model

module.exports.createCoachProfile = async (req, res) => {
  try {
    const coachData = req.body;
    const newCoach = new Coach(coachData);
    await newCoach.save();
    res.status(201).json({
      success: true,
      data: newCoach,
      message: 'Coach profile created successfully',
    });
  } catch (error) {
    console.error('Error creating coach profile:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Server error, please try again' });
  }
};
