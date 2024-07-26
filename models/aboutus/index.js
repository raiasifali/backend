const mongoose = require('mongoose');

const aboutUsSchema = mongoose.Schema({
  heading: { type: String, required: true },
  subHeading1: { type: String, required: true },
  description1: { type: String, required: true },
  subHeading2: { type: String, required: true },
  description2: { type: String, required: true },
  subHeading3: { type: String, required: true },
  description3: { type: String, required: true },
});

const aboutusmodel = mongoose.model('aboutUs', aboutUsSchema);

module.exports = aboutusmodel;
