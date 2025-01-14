const Coupon = require("../models/couponModel")
const jwt = require("jsonwebtoken")
require("dotenv").config();


const CouponFetch = async (req, res) => {
    const token = req.headers?.authorization.split(" ")[1];

    try {
        // Decode the token to extract user ID
        const decoded = jwt.decode(token, process.env.SECRET_KEY);
        const userId = decoded.id;

        // Fetch coupons that do not include the user's ID in the 'usedBy' array
        const coupons = await Coupon.find({
            usedBy: { $ne: userId },
        });

        console.log("Filtered coupons:", coupons);

        res.status(200).json({ message: "Coupons fetched successfully", coupons });
    } catch (error) {
        console.error("Error fetching coupons:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = {CouponFetch}