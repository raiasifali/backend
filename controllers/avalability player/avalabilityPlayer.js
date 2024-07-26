
const profileModel = require('../../models/profile/profile');
const universityModel = require('../../models/university/university');
const playerModel = require('../../models/player/player');
const videoModel=require('../../models/video/video')
const newsFeedModel=require('../../models/news feed/newsFeed')


module.exports.getPlayers=async(req,res)=>{
    try {
     
        let players = await playerModel.find({}).populate('institute').populate('auth');
     
        let profiles = await profileModel.find({});
        let videos=await videoModel.find({})
        let news=await newsFeedModel.find({})    
      
        let profileMap = new Map();
        profiles.forEach(profile => {
          profileMap.set(profile.auth.toString(), profile);
        });
    
       
        players = players.map(player => {
          const playerAuthId = player.auth._id.toString();
          if (profileMap.has(playerAuthId)) {
            player = player.toObject(); 
            player.offers = profileMap.get(playerAuthId).offers || [];
          } else {
            player.offers = [];
          }
          return player;
        });

        return res.status(200).json({
          players,
          videos,
          news
        });
      } catch (e) {
        console.log(e.message);
        return res.status(500).json({
          error: 'Server error. Please retry.'
        });
      }
}