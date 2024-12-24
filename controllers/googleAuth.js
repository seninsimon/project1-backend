const { OAuth2Client } = require('google-auth-library')

const User = require('../models/userModel')

const jwt = require('jsonwebtoken')


const client = new OAuth2Client("599558492449-gb9c52k4vegip4ieaqsgsvh8bqao63ne.apps.googleusercontent.com")


const googleAuth = async (req, res) => {
    const { credentials } = req.body

    console.log("credentials", credentials);




    if (!credentials) return res.status(400).json({ success: false, message: "no credentials found" })

    try {



        const ticket = await client.verifyIdToken({
            idToken: credentials,
            audience: "599558492449-gb9c52k4vegip4ieaqsgsvh8bqao63ne.apps.googleusercontent.com"
        })

        const payload = ticket.getPayload()

        console.log("payload from the credentials : ", payload);

        const { email, name } = payload

        const user = await User.findOne({ email })

      



        if (!user) {
            const newuser = await User.create({
                username: name, email: email,
                password: "google auth", phonenumber: "google auth"
            })

            console.log("new user : ", newuser);

            const token = jwt.sign({ user: newuser.username , id : newuser._id}, "secretkey")

            return res.status(200).json({ success: true, message: " user created and login successfull ", newUserCreated: newuser, gusertoken: token })

        }

        if(user.isBlocked == true) return res.status(400).json({success : false , message : "user login denied" , blockedUser : user })



        const token = jwt.sign({ user: user.username , id : user._id }, "secretkey")

        res.status(200).json({ success: true, message: "login successfull ", gusertoken: token })


    } catch (error) {

        console.log("internal server error ", error);

        res.status(500).json({ success: false, message: "internal server error while google auth" })


    }
}

module.exports = googleAuth