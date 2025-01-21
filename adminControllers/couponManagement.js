require("dotenv").config();
const Coupon = require('../models/couponModel')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')




const createCoupon = async (req, res) => {

    

    const { code, discount, expiryDate } = req.body

    try {


        const coupon = await Coupon.create({
            code, discount, expiryDate
        })

        


        res.status(200).json({ message: "coupon created successfully" })

    } catch (error) {
        res.status(500).json({ message: "internal server error" })
    }
}




const applyCoupon = async (req, res) => {
    const { couponCode, totalPrice } = req.body;

    const token = req.headers?.authorization.split(" ")[1];

    const decoded = jwt.decode(token, process.env.SECRET_KEY);

    try {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found or inactive.' });
        }

        // Check if the coupon is expired
        if (!coupon.checkExpiry()) {

            await coupon.save(); // Save updated isActive status

            return res.status(400).json({ success: false, message: 'Coupon has expired.' });
        }

        // Check if the user has already used this coupon
        const user = await User.findById(decoded.id);

        if (user.usedCoupons.includes(coupon._id)) {

            return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
        }

        // Apply flat discount
        const discountAmount = coupon.discount; // Flat discount, no percentage calculation

        if (totalPrice < discountAmount) {
            // Ensure the discount doesn't exceed the total price
            discountAmount = totalPrice;
        }

        const discountedPrice = totalPrice - discountAmount;

        // Update user and coupon records
        user.usedCoupons.push(coupon._id);

        await user.save();

        coupon.usedBy.push(decoded.id);

        await coupon.save();

        return res.json({ success: true, discount: discountAmount, discountedPrice });

    } catch (error) {

        console.error('Error applying coupon:', error);

        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};



const coupondetails = async (req, res) => {
    try {


        const coupondetails = await Coupon.find()
        

        res.status(200).json({message : "coupon details fetched successfully " , coupondetails})
        

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
}

const deleteCoupons = async (req,res)=>
{

    const {id} = req.params
    try {

        const deletecoupon = await Coupon.findByIdAndDelete(id)

        console.log(deletecoupon);

        res.status(200).json({message : " coupon deleted successfully"})
        

        
        
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
}







module.exports = { createCoupon, applyCoupon  , coupondetails , deleteCoupons}