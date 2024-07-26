const router=require('express').Router();
const {dashboard}=require('../../controllers/admin/admin')
router.get('/dashboard',dashboard )



module.exports=router;