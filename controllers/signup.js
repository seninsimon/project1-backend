const User = require('../models/userModel')

const bcrypt = require('bcryptjs')

const signUp = async (req, res) => {

    const { username, password, email, phonenumber } = req.body

    try {


        const user = await User.findOne({ $or: [{ email }, { username }] })

        if (user) return res.status(409).json({ success: false, message: "user already exists" })

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({

            username, email, password: hashedPassword, phonenumber
        })

        res.status(201).json({ success : true , message: "new user created successfully" , newUser : newUser  })

    } catch (error) {

        console.log("internal server error :",error);
        
        res.status(500).json({ success: false , message: `can't create new user : ${error.message}` })
    }
}


module.exports = signUp