

const express = require('express');
const { signUp, login, verifyOtp, googleAuth, homePage, productDetails, blockuser,
    getBlockUser, addToCart, cartDetails, quantityEdit, productRemove, checkout,
    address, fetchAddresses, editAddress, addnewaddress, deleteAddress, orderConfirm, categoryDetails, userprofile,
    editprofile, fetchOrders, cancelOrder, returnProduct, passwordChange,
    fetchWallet, fetchTransaction, wishlistProducts, fetchWishlist, deletewishlist } = require('../controllers');
const userJwtVerify = require('../jwt/userJwtVerify');
const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/verifyotp', verifyOtp);
router.post('/googleauth', googleAuth);
router.get('/homepage', homePage);
router.get('/product/:id', productDetails);
router.post('/blockuser', blockuser);
router.post('/blockedId', getBlockUser);
router.post('/addtocart', userJwtVerify, addToCart);
router.post('/cart', userJwtVerify, cartDetails);
router.post('/cartdecrement', quantityEdit);
router.post('/cartincrement', quantityEdit);
router.post('/productremove', productRemove);
router.post('/checkout', checkout);
router.post('/addaddress', address);
router.post('/fetchaddresses', fetchAddresses);
router.post('/orderconfirm', orderConfirm);
router.get('/category/:categoryname', categoryDetails);
router.post('/userprofile', userprofile);
router.post('/editprofile', editprofile);
router.post('/editaddress', editAddress);
router.post('/addnewaddress', addnewaddress);
router.post('/deleteaddress', deleteAddress);
router.post('/fetchorders', fetchOrders);
router.post('/cancelorder', cancelOrder);
router.post('/wishlist', wishlistProducts);
router.post('/productwishlist', fetchWishlist);
router.post('/productwishlist/:id', deletewishlist);
router.post('/productreturn', returnProduct);
router.post('/walletfetch', fetchWallet);
router.post('/transactionhistory', fetchTransaction);
router.post('/changepassword', passwordChange);

module.exports = router;
