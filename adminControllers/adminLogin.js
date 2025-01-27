const Admin = require('../models/adminModel')
const jwt = require('jsonwebtoken')



const adminlogin = async (req, res) => {

    const { username, password } = req.body
        
    console.log(username);
    

    try {

        const admin = await Admin.findOne({username})

        console.log(admin);
        
        
        if(admin.password !== password) return res.status(401).json({success : false , message : "invalid admin credentials"})
        
        const token = jwt.sign({admin : admin.username , id : admin._id },"secretkey")
            
        res.status(200).json({success : true , message : "admin logged in successfully" , adminToken : token })

    } catch (error) {

        res.status(500).json({ success : false ,  message : "internal server error"})
    }
}


module.exports = adminlogin