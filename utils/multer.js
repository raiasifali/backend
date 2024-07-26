const multer=require('multer')
const memoryStorage=multer.memoryStorage();
const filefilter=(req,file,cb)=>{
    if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
     return cb(null,true)
    }else{
        return cb({
            message:'Please upload image',
        },false)
    }
}
const multerStorage=multer({
    storage:memoryStorage,
    fileFilter:filefilter
})

module.exports={multerStorage}