const mongoose=require('mongoose')

const universitySchema=mongoose.Schema({
    universityName:{
        type:String,
        required:true
    },
    logo:{
        type:String,
    }
})

const universityModel=mongoose.model('university',universitySchema)
module.exports=universityModel