const mongoose=require('mongoose')


const adminSchema=mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})


const adminmodel=mongoose.model('admin',adminSchema)

module.exports=adminmodel