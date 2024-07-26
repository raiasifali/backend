const videoModel = require('../../models/video/video');
const fs = require('fs');
const path = require('path');
const { cloudinaryUpload } = require('../../utils/cloudinary');

module.exports.createVideo = async (req, res) => {
  let { title, description, featuredPlayer, isfeatured } = req.body;
  let video = req.file;

  try {
    if (description.length == 0) {
      return res.status(400).json({
        error: 'Please write description',
      });
    } else if (title.length == 0) {
      return res.status(400).json({
        error: 'Please write title',
      });
    }
    // const videoDir = path.join(__dirname, '..', '..', 'videos');

    const videoDir = '/tmp/public/files/images';
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }

    let filename = `${Date.now()}-${video.originalname}`;
    let finalname = path.join(videoDir, filename);

    fs.writeFileSync(finalname, video.buffer);

    let videoUrl = await cloudinaryUpload(finalname);

    fs.unlinkSync(finalname);

    let videoget = await videoModel.create({
      title,
      description,
      featuredPlayer,
      isfeatured: isfeatured,
      video: videoUrl.url,
    });

    return res.status(200).json({
      videoget,
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      error: 'Server error, please try again',
    });
  }
};

module.exports.createVideoLink = async (req, res) => {
  let { title, description, featuredPlayer, link, type } = req.body;

  try {
    if (description.length == 0) {
      return res.status(400).json({
        error: 'Please write description',
      });
    } else if (title.length == 0) {
      return res.status(400).json({
        error: 'Please write title',
      });
    }

    let videoget = await videoModel.create({
      title,
      description,

      video: link,
      type: type,
    });

    return res.status(200).json({
      videoget,
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      error: 'Server error, please try again',
    });
  }
};
module.exports.updateViews = async (req, res) => {
  let { id } = req.params;
  let { userid } = req.params;
  console.log(userid);
  console.log(id);
  try {
    let alreadyviewed = await videoModel.findOne({ _id: id, viewedBy: userid });
    if (alreadyviewed) {
      return res.json({
        message: 'Already viewed',
      });
    }

    let oldview = await videoModel.findOne({ _id: id });
    let newviews = parseInt(oldview.views) + 1;
    await videoModel.updateOne(
      { _id: id },
      { $set: { views: newviews }, $push: { viewedBy: userid } }
    );
    return res.status(200).json({
      message: 'views updated sucessfully',
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      error: 'Server error, please try again',
    });
  }
};

module.exports.flagVideo = async (req, res) => {
  let { id } = req.params;
  try {
    let alreadyFlagged = await videoModel.findOne({
      _id: id,
      flaggedBy: { $all: [req.user._id] },
    });
    if (alreadyFlagged) {
      await videoModel.findByIdAndUpdate(id, {
        $pull: { flaggedBy: req.user._id },
      });
      return res.status(200).json({
        message: 'Unflagged sucessfully',
      });
    } else {
      await videoModel.findByIdAndUpdate(id, {
        $push: { flaggedBy: req.user._id },
      });
      return res.status(200).json({
        message: 'flagged sucessfully',
      });
    }
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      error: 'Server error, please try again',
    });
  }
};

module.exports.getVideos = async (req, res) => {
  try {
    let videos = await videoModel.find({});
    return res.status(200).json({
      videos,
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      error: 'Server error, please try again',
    });
  }
};

module.exports.deleteVideo = async (req, res) => {
  let { id } = req.params;
  console.log(id);
  try {
    await videoModel.deleteOne({ _id: id });
    return res.status(200).json({
      message: 'Successfully deleted',
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      error: 'Server error, please try again',
    });
  }
};
module.exports.editVideo = async (req, res) => {
  let { title, description, featuredPlayer, id, isfeatured } = req.body;
  let videodata = {};
  let video = req.file;

  try {
    if (title && title.length > 0) videodata.title = title;
    if (description && description.length > 0)
      videodata.description = description;
    if (isfeatured && isfeatured.length > 0) videodata.isfeatured = isfeatured;
    if (featuredPlayer && featuredPlayer.length > 0)
      videodata.featuredPlayer = featuredPlayer;

    if (video) {
      const videoDir = '/tmp/public/files/images';
      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
      }

      let filename = `${Date.now()}-${video.originalname}`;
      let finalname = path.join(videoDir, filename);

      fs.writeFileSync(finalname, video.buffer);

      let videoUrl = await cloudinaryUpload(finalname);

      fs.unlinkSync(finalname);

      if (videoUrl && videoUrl.url) {
        videodata.video = videoUrl.url;
      }
    }

    let videoget = await videoModel.updateOne({ _id: id }, { $set: videodata });

    return res.status(200).json({
      videodata,
    });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({
      error: 'Server error, please try again',
    });
  }
};
