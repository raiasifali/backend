const coachModel = require('../../models/coach/coach');
const newsfeed = require('../../models/news feed/newsFeed');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { cloudinaryUpload } = require('../../utils/cloudinary');
const mailmodel = require('../../models/mail/mail');
const contactusmodel = require('../../models/contactus/contactus');
const authmodel = require('../../models/auth/auth');
const testimonialmodel = require('../../models/testimonial/testimonial');
const profileModel = require('../../models/profile/profile');
const universityModel = require('../../models/university/university');
const playerModel = require('../../models/player/player');
const videoModel = require('../../models/video/video');
const newsFeedModel = require('../../models/news feed/newsFeed');

module.exports.createCoach = async (req, res) => {
  let { name, coachProgram, phone, email } = req.body;
  try {
    await coachModel.create({
      name,
      coachProgram,
      phone,
      email,
    });
    return res.status(200).json({
      message: 'Coach created sucessfully',
    });
  } catch (e) {
    console.log(e.message);
    return res.status(400).json({
      error: 'Server error please retry',
    });
  }
};

module.exports.getNews = async (req, res) => {
  try {
    let news = await newsfeed.find({});
    return res.status(200).json({
      news,
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Server error please retry',
    });
  }
};

module.exports.createPlayer = async (req, res) => {
  let {
    about,
    phoneNumber,
    jerseyNumber,
    birthPlace,
    starRating,
    athleticaccomplishments,
    name,
    location,
    position,
    height,
    weight,
    previousCoachName,
    offers,
    coach,
    socialLinks,
    stats,
    academics,
    playerClass,
    universityName,
    id,
    email,
    article,
    video1,
    video2,
  } = req.body;
  console.log(starRating, 'Hello worldddd');
  let offerid = [];
  offers = JSON.parse(offers);
  offers?.map((val, i) => {
    if (val?.logoid !== undefined) {
      offerid.push(val?.logoid);
    }
  });

  coach = coach?.length > 0 ? JSON.parse(coach) : ``;

  const picture = req.files['picture'] || null;

  let pictureUrl = null;
  if (picture) {
    const photosDir = '/tmp/public/files/photos';
    const photofileName = `${Date.now()}-${picture[0].originalname}`;
    const photofile = path.join(photosDir, photofileName);

    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir, { recursive: true });
    }

    fs.writeFileSync(photofile, picture[0].buffer);
    const photoUpload = await cloudinaryUpload(photofile);
    pictureUrl = photoUpload.url;
    // fs.unlinkSync(photofile);
  }

  if (offerid && req?.files?.logo?.length > 0) {
    const logosPath = '/tmp/public/files/logos';
    const logoFiles = [...req.files.logo];

    let logosPaths = logoFiles.map((val) =>
      path.join(logosPath, val.originalname)
    );

    if (!fs.existsSync(logosPath)) {
      fs.mkdirSync(logosPath, { recursive: true });
    }

    logoFiles.forEach((val, i) => {
      fs.writeFileSync(logosPaths[i], val.buffer);
    });

    console.log('LOGO CHECKS');
    const logoUploadPromises = logoFiles.map((file) =>
      cloudinaryUpload(path.join(logosPath, file.originalname))
    );
    console.log(logoUploadPromises);
    const logoUploads = await Promise.all(logoUploadPromises);
    console.log(logoUploads);
    const logoUrls = logoUploads.map((upload) => upload.url);

    if (typeof offerid === 'string') {
      const offerIndex = parseInt(offerid);
      if (offers[offerIndex]) {
        offers[offerIndex].logo = logoUrls[0] || null; // Assuming only one logo is uploaded for a single offerid
      }
    } else if (Array.isArray(offerid)) {
      offerid.forEach((id, index) => {
        const offerIndex = parseInt(id);
        if (offers[offerIndex]) {
          offers[offerIndex].logo = logoUrls[index] || null;
        }
      });
    }
  }

  try {
    // Ensure academics, offers, socialLinks, and stats are objects

    academics = academics
      ? typeof academics === 'string'
        ? JSON.parse(academics)
        : academics
      : {};
    offers = offers
      ? typeof offers === 'string'
        ? JSON.parse(offers)
        : offers
      : [];
    socialLinks = socialLinks
      ? typeof socialLinks === 'string'
        ? JSON.parse(socialLinks)
        : socialLinks
      : [];

    stats =
      stats.length > 0 ? (stats !== undefined ? JSON.parse(stats) : stats) : {};

    if (!id || id === null) id = new mongoose.Types.ObjectId();

    // if(logoUrls[0])offers.logo=logoUrls[0]

    // offers = offers.map((offer, index) => ({
    //   ...offer,
    //   logo: logoUrls[index] || offer.logo || null
    // }));

    // Check if profile exists

    let profile = await profileModel.findOne({ auth: id }).populate('player');

    if (profile) {
      // Update existing university
      if (universityName) {
        await universityModel.updateOne(
          { _id: profile.player.institute },
          { $set: { universityName } }
        );
      }
      // Update existing player
      const playerUpdateFields = {};

      if (name) playerUpdateFields.name = name;
      if (previousCoachName)
        playerUpdateFields.previousCoachName = previousCoachName;
      if (location) playerUpdateFields.location = location;
      if (position) playerUpdateFields.position = position;
      if (height) playerUpdateFields.height = height;
      if (weight) playerUpdateFields.weight = weight;
      if (playerClass) playerUpdateFields.class = playerClass;
      if (jerseyNumber) playerUpdateFields.jerseyNumber = jerseyNumber;
      if (birthPlace) playerUpdateFields.birthPlace = birthPlace;
      if (pictureUrl) playerUpdateFields.picture = pictureUrl;
      if (article) playerUpdateFields.article = article;
      if (video1) playerUpdateFields.video1 = video1;
      if (video2) playerUpdateFields.video2 = video2;

      // Use the current player fields if the new fields are not provided
      const currentPlayer = await playerModel.findById(profile.player._id);
      Object.keys(playerUpdateFields).forEach((key) => {
        if (!playerUpdateFields[key]) {
          playerUpdateFields[key] = currentPlayer[key];
        }
      });

      await playerModel.updateOne(
        { _id: profile.player._id },
        { $set: playerUpdateFields }
      );

      // Update existing profile
      const profileUpdateFields = {};
      if (about) profileUpdateFields.about = about;
      if (phoneNumber) profileUpdateFields.phoneNumber = phoneNumber;
      if (starRating) profileUpdateFields.starRating = starRating;
      if (athleticaccomplishments)
        profileUpdateFields.athleticaccomplishments = JSON.parse(
          athleticaccomplishments
        );
      if (stats) profileUpdateFields.stats = stats;
      if (offers?.length > 0) profileUpdateFields.offers = offers;
      console.log(profileUpdateFields);

      if (academics[0].gpa.length > 0)
        profileUpdateFields.academics = academics;

      // Handle coach update

      if (coach) {
        const existingCoaches = await coachModel.find({ auth: id });
        let coachData = []; // Initialize coachData as an array

        let data = {};
        if (coach.name) data.name = coach.name;
        if (coach.phone) data.phone = coach.phone; // Corrected to use phoneNumber
        if (coach.email) data.email = coach.email;
        if (coach.role) data.coachProgram = coach.role;
        if (coach.type) data.type = coach.type;
        // for (let i = 0; i < coach.length; i++) {
        //   let data = {}; // Initialize data object for each coach

        //   if (coach[i].name) data.name = coach[i].name;
        //   if (coach[i].phoneNumber) data.phone = coach[i].phoneNumber; // Corrected to use phoneNumber
        //   if (coach[i].email) data.email = coach[i].email;
        //   if (coach[i].coachProgram) data.coachProgram = coach[i].coachProgram;

        //   coachData.push(data); // Push the populated data object into coachData array
        // }

        let findcoach = await coachModel.findOne({ auth: id });

        let updatedCoach = await coachModel.updateOne(
          { auth: id },
          { $set: data }
        );

        // Update each existing coach with respective data
        // for (let i = 0; i < existingCoaches.length; i++) {
        //   await coachModel.updateOne({ _id: existingCoaches[i]._id }, { $set: coachData[i] });
        // }
      }

      // Update socialLinks

      let number = socialLinks?.find((u) => u?.social_type == 'phoneNumber');
      socialLinks = socialLinks?.filter((u) => u?.social_type != 'phoneNumber');
      let authdata = {};
      if (number) authdata.phoneNumber = number.link;
      if (name) authdata.name = name;

      await authmodel.updateOne({ _id: id }, { $set: authdata });

      if (socialLinks && socialLinks.length > 0) {
        if (profile.socialLinks) {
          let newsocialLinks = [];
          let facebooklink;
          let socialfacebooklink = socialLinks?.find(
            (u) => u?.social_type == 'facebook'
          );
          if (socialfacebooklink && socialfacebooklink?.link) {
            facebooklink = {
              link: socialfacebooklink?.link,
              social_type: 'facebook',
            };
          }

          let instagramlink;
          let socialinstagramlink = socialLinks?.find(
            (u) => u?.social_type == 'instagram'
          );

          if (socialinstagramlink && socialinstagramlink?.link) {
            instagramlink = {
              link: socialinstagramlink?.link,
              social_type: 'instagram',
            };
          }

          let twitterlink;
          let socialtwitterlink = socialLinks?.find(
            (u) => u?.social_type == 'twitter'
          );
          if (socialtwitterlink && socialtwitterlink?.link) {
            twitterlink = {
              link: socialtwitterlink?.link,
              social_type: 'twitter',
            };
          }

          let tiktoklink;
          let socialtiktoklink = socialLinks?.find(
            (u) => u?.social_type == 'tiktok'
          );

          if (socialtiktoklink && socialtiktoklink?.link) {
            tiktoklink = {
              link: socialtiktoklink?.link,
              social_type: 'tiktok',
            };
          }

          newsocialLinks?.push(
            facebooklink,
            twitterlink,
            instagramlink,
            tiktoklink
          );
          profileUpdateFields.socialLinks = newsocialLinks;
        } else {
          const currentSocialLinks = profile.socialLinks || [];
          const updatedSocialLinks = currentSocialLinks.map((currentLink) => {
            const newLink = socialLinks.find(
              (link) => link.social_type === currentLink.social_type
            );
            return newLink
              ? { ...currentLink, link: newLink.link || currentLink.link }
              : currentLink;
          });

          socialLinks.forEach((newLink) => {
            if (
              !updatedSocialLinks.some(
                (link) => link.social_type === newLink.social_type
              )
            ) {
              updatedSocialLinks.push(newLink);
            }
          });
          profileUpdateFields.socialLinks = updatedSocialLinks;
        }
      } else {
        profileUpdateFields.socialLinks = [];
      }

      await profileModel.updateOne({ auth: id }, { $set: profileUpdateFields });

      return res.status(200).json({
        message: 'Profile updated successfully',
      });
    } else {
      // Assuming universityName is used to create a university first

      const university = await universityModel.create({ universityName });
      let authData = await authmodel.create({
        email: email,
        name: name,
        phoneNumber: phoneNumber,
        role: 'player',
        password: 'random',
      });
      try {
        // Create player using the created university's _id
        const player = await playerModel.create({
          auth: authData._id,
          picture: pictureUrl,
          name,
          location,
          position,
          height,
          weight,
          institute: university._id,
          class: playerClass,
          jerseyNumber,
          birthPlace,
          starRating,
          previousCoachName,
          article,
          video1,
          video2,
        });

        try {
          // let coachData=await coach.map(async (data, index) => {
          //     await coachModel.create({
          //       name: data.name,
          //       phone: data.phoneNumber,
          //       email: data.email,
          //       coachProgram: data.role,
          //       auth: req.user._id
          //     });
          //   });

          let coachfinal = await coachModel.create({
            coachProgram: coach.role,
            name: coach.name,
            phone: coach.phone,
            email: coach.email,
            auth: authData._id,
            type: coach?.type,
          });

          // Create profile linked to the created player
          profile = await profileModel.create({
            auth: authData._id,
            about,
            player: player._id,
            phoneNumber,
            starRating,
            athleticaccomplishments,
            socialLinks,
            stats,
            coach: coachfinal._id,
            offers,
            academics,
          });
          console.log('PROFILE created is');
          console.log(profile);

          // Create coaches

          return res.status(200).json({
            message: 'Profile created successfully',
          });
        } catch (profileError) {
          // Delete player and university if creating profile fails
          await playerModel.findByIdAndDelete(player._id);
          await universityModel.findByIdAndDelete(university._id);
          console.error(profileError.message);
          return res.status(500).json({
            error: 'Server error. Please retry.',
          });
        }
      } catch (playerError) {
        // Delete university if creating player fails
        await universityModel.findByIdAndDelete(university._id);
        console.error(playerError.message);
        return res.status(500).json({
          error: 'Server error. Please retry.',
        });
      }
    }
  } catch (universityError) {
    console.error(universityError.message);
    return res.status(500).json({
      error: 'Server error. Please retry.',
    });
  }
};

module.exports.getPlayers = async (req, res) => {
  try {
    // Fetch all players and populate the auth and institute fields
    let players = await playerModel
      .find({})
      .populate('auth')
      .populate('institute');

    // Fetch all profiles and map them by player ID
    let profiles = await profileModel.find({}).populate('coach');
    let profilesMap = profiles.reduce((map, profile) => {
      map[profile.player.toString()] = profile;
      return map;
    }, {});

    // Add the profile information to each player
    let playersWithProfiles = players.map((player) => {
      let playerObj = player.toObject(); // Convert Mongoose document to plain JavaScript object
      playerObj.profile = profilesMap[player._id.toString()] || null;
      return playerObj;
    });

    return res.status(200).json({
      players: playersWithProfiles,
    });
  } catch (e) {
    return res.status(500).json({
      error: 'Server error. Please retry.',
    });
  }
};

module.exports.updateStatus = async (req, res) => {
  let { id, status } = req.body;
  try {
    await playerModel.updateOne({ _id: id }, { $set: { status } });
    return res.status(200).json({
      message: 'SUCESS',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error. Please retry.',
    });
  }
};

module.exports.removePlayer = async (req, res) => {
  let { id } = req.params;
  try {
    await playerModel.deleteOne({ _id: id });
    return res.status(200).json({
      message: 'SUCESS',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server error. Please retry.',
    });
  }
};
