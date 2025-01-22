
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
require("dotenv").config();



const blockuser = async (req,res)=>
{
    const token = req.body
    try {
        
        const tokenKey = Object.keys(token)[0];
       
         const data   = jwt.decode(tokenKey , process.env.SECRET_KEY)
       
         
        res.status(200).json({token : tokenKey , idData : data})
        
        
    } catch (error) {
        res.status(500).json({message : "error in internal server "})
    }
}




const getBlockUser = async (req,res)=>
{
    const {id} = req.body
    console.log(id);
    
    try {

        const user = await User.findById(id)
        res.status(200).json({message : user})
        
        

        
    } catch (error) {
        res.status(500).json({message : "error in internal server "})
        
    }
}

module.exports = {blockuser , getBlockUser} 