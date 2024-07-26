const AboutUsModal = require('../../models/aboutus');

module.exports.updateAboutUs = async (req, res) => {
  try {
    const isAlready = await AboutUsModal.findOne({});
    if (isAlready) {
      await AboutUsModal.findByIdAndUpdate(isAlready._id, { ...req.body });
      return res.status(200).json({ message: 'updated' });
    } else {
      await AboutUsModal.create({ ...req.body });
      return res.status(201).json({ message: 'created' });
    }
  } catch (e) {
    console.error('Error:', e.message);
    return res.status(500).json({ error: 'Server error. Please retry.' });
  }
};
module.exports.getAboutUs = async (req, res) => {
  try {
    const isAlready = await AboutUsModal.findOne({});

    return res.status(200).json({ message: 'success', data: isAlready });
  } catch (e) {
    console.error('Error:', e.message);
    return res.status(500).json({ error: 'Server error. Please retry.' });
  }
};
