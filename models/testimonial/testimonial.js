const mongoose=require('mongoose')


const testimonialSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    testimonial:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    }
})

const testimonialmodel=mongoose.model('testimonial',testimonialSchema)
module.exports=testimonialmodel