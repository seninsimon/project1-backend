const jwt = require('jsonwebtoken')

const userJwtVerify = (req , res , next)=>
{
    try {

        const token = req.headers?.authorization.split(" ")[1]

        if(!token) return res.status(404).json({success : false , message : "token invalid"})

        const decode = jwt.verify(token , "secretkey")

        console.log("decoded payload :",decode);

        req.user = decode

        console.log("user data from the token : ", req.user);
        
        next()
        
    } catch (error) {

        console.log("token invalid :" , error);

        res.status(500).json({success : false , message : "internal server error"})
        
    }
}


module.exports = userJwtVerify