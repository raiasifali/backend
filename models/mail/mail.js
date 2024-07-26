const mongoose=require('mongoose')

const mailSchema=mongoose.Schema({
subscribedBy:[{
    type:String,
    required:true
}]
})

const mailmodel=mongoose.model('mail',mailSchema)

module.exports=mailmodel


