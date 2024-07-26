const router=require('express').Router();
const {createTestimonial,getTestimonials,deleteTestimonial,editTestimonial}=require('../../controllers/testmonial/testmonial')
const {multerStorage}=require('../../utils/multer')
router.post('/create-testimonial',multerStorage.single('image'),createTestimonial)
router.get('/get-testimonials',getTestimonials)
router.post('/edit-testimonial',multerStorage.single('image'),editTestimonial)
router.delete('/delete-testimonial/:id',deleteTestimonial)

module.exports=router;