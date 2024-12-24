const jwt = require('jsonwebtoken'); 
const Otp = require('../models/otpModel')
const User = require('../models/userModel')

const verifyOtp = async (req, res) => {
    const { otpData } = req.body;
    console.log(otpData);
    

    try {
        const otpRecord = await Otp.findOne({ otp : otpData }).sort({ createdAt: -1 });
        console.log(otpRecord);

        if (!otpRecord) {
            return res.status(404).json({ success: false, message: "OTP not found" });
        }

        if (otpRecord.expiresAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        if (otpRecord.otp !== otpData) {
            return res.status(401).json({ success: false, message: "Invalid OTP" });
        }

        const { userId } = otpRecord;

       // delete the OTP record after successful verification based on user ID
        await Otp.deleteMany({ userId });

      
        const token = jwt.sign({ id : userId }, "secretkey", );

        res.status(200).json({ 
            success: true, 
            message: "OTP verified successfully", 
            usertoken : token ,
    

        });
        
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


module.exports = verifyOtp
