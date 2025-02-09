const express = require('express')
const signUp = require('../controllers/signup')
const login = require('../controllers/login')
const verifyOtp = require('../controllers/verifyOtp')
const adminlogin = require('../adminControllers/adminLogin')
const googleAuth = require('../controllers/googleAuth')
const userManagement = require('../adminControllers/usermanagement')
const adminJwtVerify = require('../jwt/adminJwtVerify')
const { addCategory, fetchCategory, softDeleteCategory, categoryEdit, categoryOffer, fetchCategoryOffer, cateName, categoryofferDetails, categoryofferDelete,} = require('../adminControllers/CategoryManagement')
const { fetchProduct, addProduct, editProduct, fetchEditProduct, disableProduct } = require('../adminControllers/productManagement')
const { homePage } = require('../controllers/homePage')
const { productDetails } = require('../controllers/productDetails')
const { blockuser, getBlockUser } = require('../controllers/blockManagement')
const { addToCart, cartDetails, quantityEdit, productRemove } = require('../controllers/addToCart')
const userJwtVerify = require('../jwt/userJwtVerify')
const { checkout } = require('../controllers/checkout')
const { address, fetchAddresses, editAddress, addnewaddress, deleteAddress } = require('../controllers/addressController')
const { orderConfirm, retryOrderConfirm } = require('../controllers/orderConfirm') 
const { categoryDetails } = require('../controllers/CategoryDetails')
const { userprofile, editprofile } = require('../controllers/userProfile')
const { fetchOrders, cancelOrder , returnProductId } = require('../controllers/Orders')
const { fetchAllOrders, updateOrder } = require('../adminControllers/orderManagement')
const { passwordChange } = require('../controllers/passwordChange')
const { createRazorpayOrder, confirmRazorpayPayment } = require('../controllers/razorPayController');
const { wishlistProducts, fetchWishlist, deletewishlist } = require('../controllers/wishlistController')
const { fetchReturns, refundTransaction } = require('../adminControllers/returnOrders')
const { fetchWallet, fetchTransaction } = require('../controllers/walletController')
const { createCoupon, applyCoupon, coupondetails, deleteCoupons } = require('../adminControllers/couponManagement')
const { getSalesReport, getOverallStats, checkOrders, downloadSalesReportPDF, downloadSalesReportExcel } = require('../adminControllers/salesReport')
const { CouponFetch } = require('../controllers/couponController')
const { productOffer, fetchProductOffer, fetchProductOfferDetails, deleteProductOffer } = require('../adminControllers/productOffer')
const { topProducts, topCategories, topBrands } = require('../adminControllers/topanalyticspage')



const router = express.Router()

router.post('/signup', signUp)
router.post('/login', login)
router.post('/verifyotp', verifyOtp)
router.post('/googleauth', googleAuth)
router.get('/homepage', homePage)
router.get('/product/:id', productDetails)
router.post('/blockuser', blockuser)
router.post('/blockedId', getBlockUser)
router.post('/addtocart', userJwtVerify, addToCart)
router.post('/cart', userJwtVerify, cartDetails)
router.post('/cartdecrement', quantityEdit)
router.post('/cartincrement', quantityEdit)
router.post('/productremove', productRemove)
router.post('/checkout', checkout)
router.post('/addaddress', address)
router.post('/fetchaddresses', fetchAddresses)
router.post('/orderconfirm', orderConfirm)
router.get('/category/:categoryname', categoryDetails)
router.post('/userprofile', userprofile)
router.post('/editprofile', editprofile)
router.post('/editaddress', editAddress)
router.post('/addnewaddress', addnewaddress)
router.post('/deleteaddress', deleteAddress)
router.post('/fetchorders', fetchOrders)
router.post('/cancelorder', cancelOrder)
router.post('/fetchallorders', fetchAllOrders)
router.post('/updateorderstatus/:id', updateOrder)
router.post('/changepassword', passwordChange)
router.post('/wishlist', wishlistProducts)
router.post('/productwishlist', fetchWishlist)
router.post('/productwishlist/:id', deletewishlist)
router.post('/walletfetch', fetchWallet)
router.post('/transactionhistory', fetchTransaction)
router.post('/offerforcategory/:id', fetchCategoryOffer)
router.post('/returnproductid', returnProductId)
router.get('/fetchcoupons', CouponFetch)
router.post('/productoffer/:id', productOffer); 
router.get('/productoffer/:id', fetchProductOffer ); 







router.post('/create-razorpay-order', createRazorpayOrder);
router.post('/confirm-razorpay-payment', orderConfirm);
router.post('/confirm-razorpay-payment-update', retryOrderConfirm);







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
router.get('/fetchreturns', adminJwtVerify, fetchReturns)
router.post('/refundttransaction', adminJwtVerify, refundTransaction)
router.post('/categoryoffer', adminJwtVerify, categoryOffer)
router.post('/categoryname', adminJwtVerify, cateName)
router.get('/categoryofferdetails', adminJwtVerify, categoryofferDetails)
router.delete('/categoryoffer/:id', adminJwtVerify, categoryofferDelete)
router.post('/createcoupon', adminJwtVerify, createCoupon)
router.post('/couponapply',   applyCoupon)
router.get('/coupondetails', adminJwtVerify,  coupondetails)
router.delete('/deletecoupon/:id', adminJwtVerify,  deleteCoupons)



router.get('/fetchproductofferdetails',adminJwtVerify, fetchProductOfferDetails ); 
router.delete('/deleteproductoffer/:id', adminJwtVerify,deleteProductOffer ); 
router.get('/top10products',adminJwtVerify, topProducts ); 
router.get('/top10categories',adminJwtVerify, topCategories ); 
router.get('/top10brands',adminJwtVerify, topBrands ); 

// Sales Report Routes
router.get('/admin/check-orders', adminJwtVerify, checkOrders)
router.get('/admin/sales-report', adminJwtVerify, getSalesReport)
router.get('/admin/overall-stats', adminJwtVerify, getOverallStats)
router.get('/admin/download-sales-report-pdf', adminJwtVerify, downloadSalesReportPDF)
router.get('/admin/download-sales-report-excel', adminJwtVerify, downloadSalesReportExcel)



module.exports = router