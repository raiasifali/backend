const mongoose=require('mongoose')


const contactUsSchema=mongoose.Schema({
name:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true
},
message:{
    type:String,
    required:true
},
status:{
    type:String,
    default:'Unanswered'
}
})
const contactusmodel=mongoose.model('contactus',contactUsSchema)

module.exports=contactusmodel