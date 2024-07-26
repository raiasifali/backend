const profileModel = require('../../models/profile/profile');
const universityModel = require('../../models/university/university');
const playerModel = require('../../models/player/player');
const videoModel = require('../../models/video/video');
const newsFeedModel = require('../../models/news feed/newsFeed');
const { cloudinaryUpload } = require('../../utils/cloudinary');
const mailgun = require('mailgun.js');

const path = require('path');
const fs = require('fs');
const mailmodel = require('../../models/mail/mail');
const coachModel = require('../../models/coach/coach');
const contactusmodel = require('../../models/contactus/contactus');
const authmodel = require('../../models/auth/auth');
const testimonialmodel = require('../../models/testimonial/testimonial');

// module.exports.createProfile = async (req, res) => {
//     let { about, phoneNumber,jerseyNumber,birthPlace, starRating, athleticaccomplishments, name, location, position, height, weight, offers, coach, socialLinks, stats, academics, playerClass, universityName } = req.body;

//     const images = req.files['images'] || [];
//     const logos=req.files['logo']
//     let imagesUrls = [];
//     let logoUrls=[]
//     if (images.length > 0) {
//         const imagesPath = "/tmp/public/files/images"
//         let imagesFiles = images.map((val) => path.join(imagesPath, val.originalname));
//         let logoFiles=logos.map((val)=>path.join(imagesPath,val.originalname))
//         if (!fs.existsSync(imagesPath)) {
//             fs.mkdirSync(imagesPath);
//         }

//         logos.forEach((val,i)=>{
//           fs.writeFileSync(logoFiles[i],val.buffer)
//         })
//         images.forEach((val, i) => {
//             fs.writeFileSync(imagesFiles[i], val.buffer);
//         });

//         const imageUploadPromises = imagesFiles.map((file) => cloudinaryUpload(file));
//         const logoUploadPromises=logoFiles.map((file)=>cloudinaryUpload(file))

//         const imageUploads = await Promise.all(imageUploadPromises);
//         const logoUploads = await Promise.all(logoUploadPromises);
//         imagesUrls = imageUploads.map((upload) => upload.url);
//         logoUrls=logoUploads.map((upload)=>upload.url)
//         images.forEach((val, i) => {
//             fs.unlinkSync(imagesFiles[i], val.buffer);
//         });
//     }

//     const picture = req.files['picture'] || null;
//     let pictureUrl = null;
//     if (picture) {
//         const photosDir = "/tmp/public/files/photos"
//         const originalPhotoName = picture[0].originalname;
//         const photofileName = `${Date.now()}-${originalPhotoName}`;
//         const photofile = path.join(photosDir, photofileName);

//         if (!fs.existsSync(photosDir)) {
//             fs.mkdirSync(photosDir);
//         }

//         fs.writeFileSync(photofile, picture[0].buffer);

//         const photoUpload = await cloudinaryUpload(photofile);
//         pictureUrl = photoUpload.url;
//         fs.unlinkSync(photofile)
//     }

//     try {
//         // Convert academics string to JSON object
//         academics = JSON.parse(academics);

//         // Convert offers string to JSON array
//         offers = JSON.parse(offers);
//         offers = offers.map((offer, index) => ({
//           ...offer,
//           logo: logoUrls[index] || null
//       }));
//         // Assuming universityName is used to create a university first
//         const university = await universityModel.create({
//             universityName
//         });

//         try {
//             // Create player using the created university's _id
//             const player = await playerModel.create({
//                 auth: req.user._id,
//                 picture: pictureUrl,
//                 name,
//                 location,
//                 position,
//                 height,
//                 weight,
//                 institute: university._id, // use university._id because create() expects an array
//                 class: playerClass,
//                 jerseyNumber,
//                 birthPlace
//             });

//             try {
//                 // Create profile linked to the created player
//                 const profile = await profileModel.create({
//                     auth: req.user._id,
//                     about,
//                     player: player._id,
//                     phoneNumber,
//                     starRating,
//                     athleticaccomplishments,
//                     socialLinks,
//                     stats,
//                     coach,
//                     offers,
//                     academics,
//                     photos: imagesUrls,
//                 });

//                 return res.status(200).json({
//                     message: 'Profile created successfully',
//                 });
//             } catch (profileError) {
//                 // Delete player and university if creating profile fails
//                 await playerModel.findByIdAndDelete(player._id);
//                 await universityModel.findByIdAndDelete(university._id);
//                 console.error(profileError.message);
//                 return res.status(500).json({
//                     error: 'Server error. Please retry.'
//                 });
//             }
//         } catch (playerError) {
//             // Delete university if creating player fails
//             await universityModel.findByIdAndDelete(university._id);
//             console.error(playerError.message);
//             return res.status(500).json({
//                 error: 'Server error. Please retry.'
//             });
//         }
//     } catch (universityError) {
//         console.error(universityError.message);
//         return res.status(500).json({
//             error: 'Server error. Please retry.'
//         });
//     }
// };

module.exports.updateStatus = async (req, res) => {
  let { status, id } = req.body;
  try {
    await playerModel.updateOne({ _id: id }, { $set: { status } });
    return res.status(200).json({
      messages: 'SUCESS',
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Server error please try again',
    });
  }
};
const uploadVideos = async (videos, featuredPlayer, links) => {
  const videoDir = '/tmp/public/files/images';
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const results = [];
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];

    try {
      let filename = `${Date.now()}-${video.originalname}`;
      let finalname = path.join(videoDir, filename);

      fs.writeFileSync(finalname, video.buffer);

      let videoUrl = await cloudinaryUpload(finalname);

      fs.unlinkSync(finalname);

      let videoEntry = await videoModel.create({
        title: 'Video added by Player',
        description: 'Video added by Player',
        featuredPlayer,
        video: videoUrl.url,
      });

      results.push(videoEntry);
    } catch (error) {
      console.error(`Failed to upload video ${video.originalname}`, error);
      // Optionally, you can handle errors here, e.g., by adding to a results array
      results.push({ error: `Failed to upload video ${video.originalname}` });
    }
  }

  for (let i = 0; i < links.length; i++) {
    const video = links[i];

    await videoModel.create({
      title: 'Video added by Player',
      description: 'Video added by Player',
      featuredPlayer,
      video: video,
    });
  }
  return results;
};

module.exports.createProfile = async (req, res) => {
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
    offers,
    coach,
    socialLinks,
    stats,
    academics,
    playerClass,
    universityName,
    uploadVideos: videos,
    videoLinks: links,
  } = req.body;

  let offerid = [];
  offers = JSON.parse(offers);
  console.log(offers);
  offers.forEach((val, i) => {
    if (val?.logoid !== undefined) {
      // Ensure 'logoid' is defined and not null
      offerid.push(val.logoid); // Push 'logoid' into 'offerid' array
    }
  });
  console.log('OFFERID');

  console.log(offerid);

  const images = req.files['images'] || [];

  let imagesUrls = [];

  coach = coach?.length > 0 ? JSON.parse(coach) : ``;
  if (images.length > 0) {
    const imagesPath = '/tmp/public/files/images';
    const files = [...images];
    let filesPaths = files.map((val) =>
      path.join(imagesPath, val.originalname)
    );

    if (!fs.existsSync(imagesPath)) {
      fs.mkdirSync(imagesPath, { recursive: true });
    }

    files.forEach((val, i) => {
      fs.writeFileSync(filesPaths[i], val.buffer);
    });

    const imageUploadPromises = images.map((file) =>
      cloudinaryUpload(path.join(imagesPath, file.originalname))
    );

    const imageUploads = await Promise.all(imageUploadPromises);

    imagesUrls = imageUploads.map((upload) => upload.url);

    files.forEach((val, i) => {
      // fs.unlinkSync(filesPaths[i], val.buffer);
    });
  }

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

  // if (offerid && req?.files?.logo?.length > 0) {
  //   const logosPath = "/tmp/public/files/logos";
  //   const logoFiles = [...req.files.logo];
  //   let logosPaths = logoFiles.map((val) => path.join(logosPath, val.originalname));

  //   if (!fs.existsSync(logosPath)) {
  //     fs.mkdirSync(logosPath, { recursive: true });
  //   }

  //   logoFiles.forEach((val, i) => {
  //     fs.writeFileSync(logosPaths[i], val.buffer);
  //   });

  //   const logoUploadPromises = logoFiles.map((file) => cloudinaryUpload(path.join(logosPath, file.originalname)));
  //   const logoUploads = await Promise.all(logoUploadPromises);
  //   const logoUrls = logoUploads.map((upload) => upload.url);

  //   if (typeof offerid === 'string') {
  //     const offerIndex = parseInt(offerid);
  //     if (offers[offerIndex]) {
  //       offers[offerIndex].logo = logoUrls[0] || null; // Assuming only one logo is uploaded for a single offerid
  //     }
  //   } else if (Array.isArray(offerid)) {
  //     offerid.forEach((id, index) => {
  //       const offerIndex = parseInt(id);
  //       if (offers[offerIndex]) {
  //         offers[offerIndex].logo = logoUrls[index] || null;
  //       }
  //     });
  //   }
  // }

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
    stats = stats
      ? typeof stats === 'string'
        ? JSON.parse(stats)
        : stats
      : {};

    // if(logoUrls[0])offers.logo=logoUrls[0]

    // offers = offers.map((offer, index) => ({
    //   ...offer,
    //   logo: logoUrls[index] || offer.logo || null
    // }));

    // Check if profile exists

    let profile = await profileModel
      .findOne({ auth: req.user._id })
      .populate('player');
    uploadVideos(videos, req.user._id, links);
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
      if (location) playerUpdateFields.location = location;
      if (position) playerUpdateFields.position = position;
      if (height) playerUpdateFields.height = height;
      if (weight) playerUpdateFields.weight = weight;
      if (playerClass) playerUpdateFields.class = playerClass;
      if (jerseyNumber) playerUpdateFields.jerseyNumber = jerseyNumber;
      if (birthPlace) playerUpdateFields.birthPlace = birthPlace;
      if (pictureUrl) playerUpdateFields.picture = pictureUrl;

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
        profileUpdateFields.athleticaccomplishments = athleticaccomplishments;
      if (stats) profileUpdateFields.stats = stats;
      if (offers) profileUpdateFields.offers = offers;
      if (academics.gpa.length > 0) profileUpdateFields.academics = academics;
      if (imagesUrls.length > 0) profileUpdateFields.photos = imagesUrls;
      // Handle coach update
      if (coach) {
        const existingCoaches = await coachModel.find({ auth: req.user._id });
        let coachData = []; // Initialize coachData as an array

        let data = {};
        if (coach.name) data.name = coach.name;
        if (coach.phoneNumber) data.phone = coach.phoneNumber; // Corrected to use phoneNumber
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

        console.log(profileUpdateFields);

        let findcoach = await coachModel.findOne({ auth: req.user._id });

        let updatedCoach = await coachModel.updateOne(
          { auth: req.user._id },
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
      console.log(authdata);
      await authmodel.updateOne({ _id: req.user._id }, { $set: authdata });

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

      await profileModel.updateOne(
        { auth: req.user._id },
        { $set: profileUpdateFields }
      );

      return res.status(200).json({
        message: 'Profile updated successfully',
      });
    } else {
      // Assuming universityName is used to create a university first

      const university = await universityModel.create({ universityName });

      try {
        // Create player using the created university's _id
        const player = await playerModel.create({
          auth: req.user._id,
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
            phone: coach.phoneNumber,
            email: coach.email,
            auth: req.user._id,
            type: coach?.type,
          });

          // Create profile linked to the created player
          profile = await profileModel.create({
            auth: req.user._id,
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
            photos: imagesUrls,
          });

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
module.exports.getProfile = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch profile with all necessary populated fields
    let profilePromise = profileModel
      .findOne({ auth: id })
      .populate({
        path: 'player',
        populate: {
          path: 'institute',
          model: 'university',
        },
      })
      .populate('auth')
      .populate('coach');

    // Fetch players associated with the profile's auth
    let playersPromise = playerModel
      .find({ auth: id })
      .populate('institute')
      .populate('auth');

    // Fetch other players excluding the current profile's auth
    let showPlayersPromise = playerModel
      .find({ auth: { $ne: id } })
      .populate('institute')
      .populate('auth');

    // Fetch videos featuring the current profile
    let videoDataPromise = videoModel.find({ featuredPlayer: id });

    // Fetch news feed data filtering by featured players including the current profile
    let newsFeedDataPromise = newsFeedModel.find({ featuredPlayers: id });

    // Wait for all promises to resolve
    let [profile, players, showPlayers, videoData, newsFeedData] =
      await Promise.all([
        profilePromise,
        playersPromise,
        showPlayersPromise,
        videoDataPromise,
        newsFeedDataPromise,
      ]);

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
      });
    }

    // Calculate career stats
    let careerStats = {
      stats: 'career',
      gp: profile.stats.length || 0,
      fg: 0,
      threep: 0,
      ft: 0,
      reb: 0,
      ast: 0,
      blk: 0,
      stl: 0,
      pf: 0,
      to: 0,
      pts: 0,
    };

    // Aggregate stats
    if (profile.stats.length === 0) {
      careerStats.stats.gp = 0;
      careerStats.stats.fg = 0;
      careerStats.stats.threep = 0;
      careerStats.stats.ft = 0;
      careerStats.stats.reb = 0;
      careerStats.stats.ast = 0;
      careerStats.stats.blk = 0;
      careerStats.stats.stl = 0;
      careerStats.stats.pf = 0;
      careerStats.stats.to = 0;
      careerStats.stats.pts = 0;
    } else {
      console.log(profile.stats);
      // Object.entries(profile.stats).forEach(([key, stat]) => {
      //   careerStats.gp++;
      //   careerStats.fg += profile.stats[key]?.fg || 0;
      //   careerStats.threep += profile.stats[key]?.threep || 0;
      //   careerStats.ft += profile.stats[key]?.ft || 0;
      //   careerStats.stats.reb += stat?.reb || 0;
      //   careerStats.stats.ast += stat?.ast || 0;
      //   careerStats.stats.blk += stat?.blk || 0;
      //   careerStats.stats.stl += stat?.stl || 0;
      //   careerStats.stats.pf += stat?.pf || 0;
      //   careerStats.stats.to += stat?.to || 0;
      //   careerStats.stats.pts += stat?.pts || 0;
      // });
      careerStats = {
        stats: 'career',
        gp: Number(profile.stats.gp) || 0,
        fg: Number(profile.stats.fg) || 0,
        threep: Number(profile.stats.threep),
        ft: Number(profile.stats.ft) || 0,
        reb: Number(profile.stats.reb) || 0,
        ast: Number(profile.stats.ast) || 0,
        blk: Number(profile.stats.blk) || 0,
        stl: Number(profile.stats.stl) || 0,
        pf: Number(profile.stats.pf) || 0,
        to: Number(profile.stats.to) || 0,
        pts: Number(profile.stats.pts) || 0,
      };

      // Object.values(profile.stats).forEach(stat => {
      //     careerStats?.stats?.gp++;
      //     careerStats?.stats?.fg += stat?.fg;
      //     careerStats?.stats?.threep += stat.threep;
      //     careerStats?.stats?.ft += stat.ft;
      //     careerStats?.stats?.reb += stat.reb;
      //     careerStats?.stats?.ast += stat.ast;
      //     careerStats?.stats?.blk += stat.blk;
      //     careerStats?.stats?.stl += stat.stl;
      //     careerStats?.stats?.pf += stat.pf;
      //     careerStats?.stats?.to += stat.to;
      //     careerStats?.stats?.pts += stat.pts;
      //   });
    }
    // Append career stats to profile
    let newProfile = {
      ...profile.toObject(),
      videoData,
      newsFeedData,
      stats: [careerStats],
    };
    console.log('PROFILE');
    console.log(newProfile);

    return res.status(200).json({
      profile: newProfile,
      players,
      showPlayers,
    });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({
      error: 'Server error. Please retry.',
    });
  }
};

module.exports.deleteProfile = async (req, res) => {
  const { id } = req.params;
  try {
    let profile = await profileModel.deleteONe({ auth: id });
    return res.status(200).json({
      profile,
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      error: 'Server error. Please retry.',
    });
  }
};

module.exports.getPlayer = async (req, res) => {
  try {
    // Fetch videos
    const videos = await videoModel.find({});

    // Create a map for quick lookup of videos by player ID
    const videoMap = new Map();
    if (videos && videos.length > 0) {
      videos.forEach((video) => {
        if (video.featuredPlayer) {
          const playerId = video.featuredPlayer.toString();
          if (!videoMap.has(playerId)) {
            videoMap.set(playerId, []);
          }
          videoMap.get(playerId).push(video);
        }
      });
    }

    // Fetch players and populate required fields
    const players = await playerModel
      .find({})
      .populate('institute')
      .populate('auth');

    // Fetch all profiles
    const profiles = await profileModel.find({});

    // Create a map for quick lookup of profiles by auth ID
    const profileMap = profiles.reduce((map, profile) => {
      map[profile.auth.toString()] = profile;
      return map;
    }, {});

    // Add offers, profile, and videos to each player
    const updatedPlayers = players.map((player) => {
      const playerAuthId = player?.auth?._id?.toString();
      const profile = profileMap[playerAuthId] || {};
      player = player.toObject(); // Convert to plain object to modify
      player.offers = profile.offers || [];
      player.profile = profile; // Add the entire profile object
      player.videos = videoMap.get(playerAuthId) || []; // Add videos
      return player;
    });

    return res.status(200).json({ players: updatedPlayers });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ error: 'Server error. Please retry.' });
  }
};
module.exports.getHomeData = async (req, res) => {
  try {
    let featuredVideosData = await videoModel
      .find({ isfeatured: true })
      .limit(9);
    let newsFeedData = await newsFeedModel.find({}).limit(3);
    let playersData = await playerModel.find({}).populate('auth');
    let classPlayers = await playerModel
      .find({ class: '2024' })
      .populate('auth');
    let testimonial = await testimonialmodel.find({});
    return res.status(200).json({
      featuredVideosData,
      newsFeedData,
      playersData,
      classPlayers,
      testimonial,
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      error: 'Server error. Please retry.',
    });
  }
};

module.exports.contactUs = async (req, res) => {
  let { name, email, message } = req.body;
  console.log(name);
  try {
    const emailHtmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
  body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 20px;
  }
  .container {
    max-width: 600px;
    margin: auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
  .header {
    color: #333;
    text-align: center;
  }
  .review {
    background-color: #f9f9f9;
    border-left: 4px solid #007BFF;
    margin: 20px 0;
    padding: 20px;
    border-radius: 4px;
  }
  .rating {
    text-align: right;
    font-size: 18px;
    font-weight: bold;
    color: #ff9500;
  }
</style>
</head>
<body>

<div class="container">
  <div class="header">
    <h2>User message by ${name}</h2>
  </div>

  <div>
  <p>${message}</p>
  </div>
</div>

</body>
</html>
`;
    // const DOMAIN = "sandbox6a6c1146404048379fe04e593d00be67.mailgun.org";
    // const mg = mailgun({apiKey: "fb6c7a836dd23a28c5fc1dde55a1a060-408f32f3-f5c88aff", domain: DOMAIN});

    // const data = {
    // from: "shahg33285@gmail.com",
    // to: email,
    // subject: "Contact Us",
    // html:emailHtmlContent
    // };
    // mg.messages().send(data,async function (error, body) {
    //   console.log(body);
    //   console.log(error)
    //   if(!error){
    //     console.log("SUCESS")

    //   return res.status(200).json({
    //       message:'sucess'
    //   })
    //   }
    //   if(error){
    //     console.log(error)
    //   return res.status(400).json({
    //       message:error
    //   })
    //   }
    //   });

    await contactusmodel.create({
      name,
      email,
      message,
    });
    res.status(200).json({
      message: 'SUCESS',
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      error: 'Server error. Please retry.',
    });
  }
};

module.exports.subscribeMail = async (req, res) => {
  let { email } = req.body;

  try {
    let alreadyExists = await mailmodel.find({
      subscribedBy: { $all: [email] },
    });

    if (alreadyExists.length > 0) {
      return res.status(400).json({
        error: 'Already subscribed',
      });
    }
    let finddata = await mailmodel.find({});
    if (finddata.length > 0) {
      await mailmodel.updateOne({}, { $push: { subscribedBy: email } });
    } else {
      await mailmodel.create({
        subscribedBy: email,
      });
    }

    return res.status(200).json({
      message: 'Subscribed successfully',
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      error: 'Server error. Please retry.',
    });
  }
};

module.exports.getLeads = async (req, res) => {
  try {
    const leads = await contactusmodel.find();
    return res.status(200).json({
      data: leads,
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      error: 'Server error. Please retry.',
    });
  }
};

module.exports.flagProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const alreadyFlagged = await profileModel.findOne({
      auth: id,
      flaggedBy: req.user._id,
    });

    if (alreadyFlagged) {
      console.log('UNFLAG');
      await profileModel.updateOne(
        { auth: id },
        { $pull: { flaggedBy: req.user._id } }
      );
      return res.status(200).json({
        message: 'Profile unflagged successfully',
      });
    }

    console.log('FLAG');
    await profileModel.updateOne(
      { auth: id },
      { $push: { flaggedBy: req.user._id } }
    );
    return res.status(200).json({
      message: 'Profile flagged successfully',
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      error: 'Server error. Please retry.',
    });
  }
};

module.exports.addRemoveFollow = async (req, res) => {
  const { id } = req.params;

  try {
    const player = await playerModel.findOne({ auth: id });

    if (!player) {
      return res.status(404).json({
        error: 'Player not found',
      });
    }

    const userId = req.user._id;
    const isFollowed = player.followedBy.includes(userId);

    if (isFollowed) {
      player.followedBy.pull(userId);
    } else {
      player.followedBy.push(userId);
    }

    await player.save();

    return res.status(200).json({
      message: isFollowed
        ? 'User unfollowed successfully'
        : 'User followed successfully',
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

module.exports.ratingRequest = async (req, res) => {
  const { playerId } = req.body;

  try {
    const playerDetails = await playerModel.findOne({ _id: playerId });
    if (!playerDetails) {
      return res.status(404).json({
        error: 'Player not found',
      });
    }
    if (!playerDetails.starRating && playerDetails.starRating !== 0) {
      await playerModel.findByIdAndUpdate(playerId, {
        isRequested: true,
      });
      return res.status(200).json({
        message: 'Requested',
      });
    } else {
      return res.status(400).json({
        error: 'Player has already rating',
      });
    }
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};
