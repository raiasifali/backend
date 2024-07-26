const mongoose = require('mongoose');

const coachProfileSchema = new mongoose.Schema({
  personalInformation: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    schoolCollege: { type: String, required: true },
    position: { type: String, required: true },
    teamName: { type: String, required: true },
    conference: { type: String, required: true },
  },
  contactDetail: {
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return /\d{10}/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
      required: true,
    },
    email: { type: String, required: true },
    twitterLink: { type: String },
    instagramLink: { type: String },
    linkedinLink: { type: String },
  },
  coachingExperience: {
    yearsOfExperience: { type: Number, required: true },
    previousTeams: [
      {
        teamName: { type: String },
        coachPosition: { type: String },
        yearsCoached: { type: Number },
      },
    ],
  },
  recruitmentPreference: {
    positionsRecruitingFor: [String],
    playerCharacteristics: [String],
    academicRequirements: [String],
  },
  teamAccomplishments: [String],
  philosophyPlayingStyle: [String],
  additionalInformation: {
    recruitmentCalendar: { type: String },
    tryouts: { type: String },
    officialVisits: { type: String },
    signingDay: { type: String },
    programHighlights: { type: String },
    contactPreferences: { type: String },
  },
  auth: {
    type: mongoose.Schema.ObjectId,
    ref: 'auth',
  },
  type: {
    type: String,
  },
});

const CoachProfile = mongoose.model('CoachProfile', coachProfileSchema);
module.exports = CoachProfile;
