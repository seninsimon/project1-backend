const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
require("dotenv").config();




const passwordChange = async (req, res) => {


    const token = req.body.token
    const { newPassword } = req.body
    const { oldPassword } = req.body

    console.log("token :::", token);
    console.log("newPassword :::", newPassword);
    console.log("oldPassword :::", oldPassword);


    try {

        const decoded = jwt.decode(token , process.env.SECRET_KEY)

        console.log("decoded", decoded);

        const user = await User.findById(decoded.id)

        console.log("user", user);

        if(user.password == "google auth")
        {
            return res.status(400).json({message : "you are using google auth so you can't change password" , password : "google"})
        }

        const hashedpassword = await bcrypt.compare(oldPassword , user.password)

        if(!hashedpassword)
        {
            return res.status(400).json({message : "old password is wrong"  , password : false })
        }

        
        const hashe = await  bcrypt.hash(newPassword , 10) 

        const updateUser = await User.findByIdAndUpdate(decoded.id,{password : hashe},{new : true})
        
        
        



        res.status(200).json({ message: "password changed successfully" })

    } catch (error) {

        res.status(500).json({ message: "error in internal server " })

    }
}



module.exports = { passwordChange }