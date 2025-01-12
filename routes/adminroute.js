

const express = require('express');
const { adminlogin, userManagement, addCategory, fetchCategory, softDeleteCategory, categoryEdit, categoryOffer, fetchCategoryOffer, cateName, categoryofferDetails, categoryofferDelete, fetchProduct, addProduct, fetchEditProduct, editProduct, disableProduct, fetchReturns, refundTransaction, createCoupon, applyCoupon, coupondetails, deleteCoupons } = require('../adminControllers');
const adminJwtVerify = require('../jwt/adminJwtVerify');
const router = express.Router();

router.post('/adminlogin', adminlogin);
router.get('/usermanagement', adminJwtVerify, userManagement);
router.post('/usermanagement', adminJwtVerify, userManagement);
router.post('/addcategory', adminJwtVerify, addCategory);
router.get('/fetchcategory', adminJwtVerify, fetchCategory);
router.post('/disablecategory', adminJwtVerify, softDeleteCategory);
router.put('/categoryedit', adminJwtVerify, categoryEdit);
router.get('/fetchproduct', adminJwtVerify, fetchProduct);
router.post('/addproduct', adminJwtVerify, addProduct);
router.get('/editproduct/:id', adminJwtVerify, fetchEditProduct);
router.put('/editproduct/:id', adminJwtVerify, editProduct);
router.put('/disableproduct', adminJwtVerify, disableProduct);
router.get('/fetchreturns', adminJwtVerify, fetchReturns);
router.post('/refundttransaction', adminJwtVerify, refundTransaction);
router.post('/categoryoffer', adminJwtVerify, categoryOffer);
router.post('/categoryname', adminJwtVerify, cateName);
router.get('/categoryofferdetails', adminJwtVerify, categoryofferDetails);
router.delete('/categoryoffer/:id', adminJwtVerify, categoryofferDelete);
router.post('/createcoupon', adminJwtVerify, createCoupon);
router.post('/couponapply', adminJwtVerify, applyCoupon);
router.get('/coupondetails', adminJwtVerify, coupondetails);
router.delete('/deletecoupon/:id', adminJwtVerify, deleteCoupons);

module.exports = router;
