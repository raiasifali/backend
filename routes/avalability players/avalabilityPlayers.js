const router=require('express').Router();
const {getPlayers}=require('../../controllers/avalability player/avalabilityPlayer')
router.get('/getAvalabilityPlayers',getPlayers)


module.exports=router;