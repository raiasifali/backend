const testimonialmodel=require('../../models/testimonial/testimonial')
const fs=require('fs')
const path=require('path')
const {cloudinaryUpload}=require('../../utils/cloudinary')
module.exports.createTestimonial=async(req,res)=>{
let {name,testimonial}=req.body;
let image=req.file;
    try{
          const bannerDir = "/tmp/public/files/images"
          if (!fs.existsSync(bannerDir)) {
            fs.mkdirSync(bannerDir, { recursive: true });
          }
      
         
          let filename = `${Date.now()}-${image.originalname}`;
          let finalname = path.join(bannerDir, filename);
      
          fs.writeFileSync(finalname,image.buffer);
      
          
          let bannerUrl = await cloudinaryUpload(finalname);
      
         
          fs.unlinkSync(finalname);
        await testimonialmodel.create({
            name,
            testimonial,
            image:bannerUrl.url
        })
        return res.status(200).json({
            message:"SUCCESS"
        })
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Server error please try again"
        })
    }
}





module.exports.editTestimonial = async (req, res) => {
    const { id, name, testimonial } = req.body;
   
    let image = req.file;
  
    try {
    
      let updateData = {};
      if (name && name.length > 0) updateData.name = name;
      if (testimonial && testimonial.length > 0) updateData.testimonial = testimonial;
  
      if (image) {
       
        const imageDir = "/tmp/public/files/images";
        if (!fs.existsSync(imageDir)) {
          fs.mkdirSync(imageDir, { recursive: true });
        }
  
        let filename = `${Date.now()}-${image.originalname}`;
        let finalname = path.join(imageDir, filename);
  
        fs.writeFileSync(finalname, image.buffer);
  
        let imageUrl = await cloudinaryUpload(finalname);
  
        fs.unlinkSync(finalname);
  
        if (imageUrl && imageUrl.url) {
          updateData.image = imageUrl.url;
        }
      } else {
      
        delete updateData.image;
      }
  
     
      let updatedTestimonial;
    
        updatedTestimonial = await testimonialmodel.findByIdAndUpdate(id, updateData, { new: true });
     
  
      if (!updatedTestimonial) {
        return res.status(404).json({ error: 'Testimonial not found or could not be updated' });
      }
  
      return res.status(200).json({
        message: "Testimonial successfully updated/created",
        testimonial: updatedTestimonial
      });
  
    } catch (e) {
      console.error(e.message);
      return res.status(500).json({
        error: 'Server error, please try again'
      });
    }
  };



  module.exports.deleteTestimonial=async(req,res)=>{
  let {id}=req.params;
    try{
await testimonialmodel.deleteOne({_id:id})
return res.status(200).json({
    message:"Testimonial deleted"
})
    }catch(e){
        console.error(e.message);
        return res.status(500).json({
          error: 'Server error, please try again'
        });
    }
  }

  module.exports.getTestimonials=async(req,res)=>{
    try{
let testimonialData=await testimonialmodel.find({})
return res.status(200).json({
  testimonialData
})
    }catch(e){
      console.error(e.message);
      return res.status(500).json({
        error: 'Server error, please try again'
      });
    }
  }