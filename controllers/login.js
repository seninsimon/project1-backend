const User = require('../models/userModel')
const Otp = require('../models/otpModel')
const nodemailer = require('nodemailer')

const bcrypt = require('bcryptjs')

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "seninsimon002@gmail.com",
        pass: "dpatjdfsixgucvct"
    }
});

const login = async (req, res) => {

    const { identifier, password } = req.body
    try {

        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] })


        if (!user) return res.status(404).json({ success: "!userexist", message: "user do not exist" })




        const verifyPassword = await bcrypt.compare(password, user.password)

        if (!verifyPassword) return res.status(401).json({ success: "passwordInvalid", message: "wrong password" })

        if (user.isBlocked) return res.status(404).json({ success:false, message: "user access denied by admin" })


        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        const userotp = await Otp.create({ userId: user._id, otp, expiresAt });

        console.log(userotp);

        // Send OTP via email
        await transporter.sendMail({
            from: "seninsimon002@gmail.com",
            to: user.email,
            subject: 'Your OTP for Verification',
            text: `Your OTP is ${otp}. It is valid for 10 minutes.`
        });


        res.status(200).json({ success: true, message: "otp sent successfully", userLoginOtp: otp })

    } catch (error) {

        console.log("internal server error :", error);

        res.status(500).json({ status: false, message: "internal server error" })
    }
}

module.exports = login