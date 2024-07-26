const jwt=require('jsonwebtoken')
const authmodel=require('../models/auth/auth')
module.exports.authenticate=async(req,res,next)=>{

let {authorization}=req.headers;
if(!authorization){
    return res.status(400).json({
        error:"Please provide token"
    })
}
try{
if(authorization.startsWith('Bearer')){
    let token=authorization.split(' ')[1]
let user=jwt.verify(token,process.env.JWT_TOKEN)
let userfound=await authmodel.findOne({email:user.email})
if(userfound){
    req.user=user;
   
next();
}else{
    return res.status(400).json({
        error:"Invalid token"
    })
}
}else{
    return res.status(400).json({
        error:"Incorrect token"
    })
}
}catch(e){
    return res.status(400).json({
        error:"Server error please try again"
    })
}
}