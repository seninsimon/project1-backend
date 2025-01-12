const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
require("dotenv").config();





const userprofile = async (req,res)=>{

    const {token} = req.body
    console.log( "token :::" ,token)
    
    try {

        const decoded = jwt.decode(token,process.env.SECRET_KEY)

        console.log("decoded",decoded);

        const user = await User.findById(decoded.id)

        console.log("user",user);
        
        

        res.status(200).json({message : "user profile fetched" , user : user  })
        
    } catch (error) {

        res.status(500).json({message : "error in internal server "})
        
    }
}


const editprofile = async (req,res)=>
{

    console.log("req.body  :",req.body);
    const {token} =  req.body
    console.log("token",token);
    
    try {

        const user = jwt.decode(token,process.env.SECRET_KEY)
        console.log("user",user);

        

        const updateUser = await User.findByIdAndUpdate(user.id,{...req.body},{new : true})
        console.log("updateUser",updateUser);

        

        res.status(200).json({message : "user updated successfully",user : updateUser})
        


        
    } catch (error) {

        res.status(500).json({message : "error in internal server "})
        
    }
}



module.exports = {userprofile,editprofile}