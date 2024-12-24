const express = require('express')
const signUp = require('../controllers/signup')
const login = require('../controllers/login')
const verifyOtp = require('../controllers/verifyOtp')
const adminlogin = require('../adminControllers/adminLogin')
const googleAuth = require('../controllers/googleAuth')
const userManagement = require('../adminControllers/usermanagement')
const adminJwtVerify = require('../jwt/adminJwtVerify')
const { addCategory, fetchCategory, softDeleteCategory, categoryEdit } = require('../adminControllers/categoryManagement')
const { fetchProduct, addProduct, editProduct, fetchEditProduct, disableProduct } = require('../adminControllers/productManagement')
const { homePage } = require('../controllers/homePage')
const { productDetails } = require('../controllers/productDetails')
const {blockuser, getBlockUser} = require('../controllers/blockManagement')
const { addToCart, cartDetails, quantityEdit , productRemove } = require('../controllers/addToCart')
const userJwtVerify = require('../jwt/userJwtVerify')
const {checkout} = require('../controllers/checkout')
const { address, fetchAddresses } = require('../controllers/addressController')
const { orderConfirm } = require('../controllers/OrderConfirm')
const { categoryDetails } = require('../controllers/CategoryDetails')

const router = express.Router()

router.post('/signup', signUp)
router.post('/login', login)
router.post('/verifyotp', verifyOtp)
router.post('/googleauth', googleAuth)
router.get('/homepage', homePage)
router.get('/product/:id', productDetails)
router.post('/blockuser',blockuser)
router.post('/blockedId',getBlockUser)
router.post('/addtocart',userJwtVerify ,addToCart  )
router.post('/cart', userJwtVerify ,cartDetails)
router.post('/cartdecrement',quantityEdit)
router.post('/cartincrement',quantityEdit)
router.post('/productremove', productRemove)
router.post('/checkout', checkout)
router.post('/addaddress', address)
router.post('/fetchaddresses', fetchAddresses)
router.post('/orderconfirm', orderConfirm)
router.get('/category/:categoryname', categoryDetails)





//admin side

router.post('/adminlogin', adminlogin)
router.get('/usermanagement', adminJwtVerify, userManagement)
router.post('/usermanagement', adminJwtVerify, userManagement)
router.post('/addcategory', adminJwtVerify, addCategory)
router.get('/fetchcategory', adminJwtVerify, fetchCategory)
router.post('/disablecategory', adminJwtVerify, softDeleteCategory)
router.put('/categoryedit', adminJwtVerify, categoryEdit)
router.get('/fetchproduct', adminJwtVerify, fetchProduct)
router.post('/addproduct', adminJwtVerify, addProduct)
router.get('/editproduct/:id', adminJwtVerify, fetchEditProduct)
router.put('/editproduct/:id', adminJwtVerify, editProduct)
router.put('/disableproduct', adminJwtVerify, disableProduct)


module.exports = router