const router=require('express').Router();
const {register,changePassword,adminLogin,addRemoveFavourites,adminRegister,forgetPassword,emailVerification,login}=require('../../controllers/auth/auth')
const {authenticate}=require('../../middleware/authentication')

router.post('/register',register)
router.get('/verify/:token',emailVerification)
router.post('/login',login)
router.post('/forgetPassword',forgetPassword)
router.post('/changePassword',changePassword)
router.post('/adminRegister',adminRegister)
router.post('/adminLogin',adminLogin)
router.get('/addRemoveFavourites/:id',authenticate,addRemoveFavourites)

module.exports=router;