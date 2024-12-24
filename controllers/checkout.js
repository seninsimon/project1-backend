const jwt = require('jsonwebtoken')
const User = require('../models/userModel')





const checkout = async (req, res) => {
   
    const { token , checkoutData} = req.body;

    console.log("token", token);

    const decoded = jwt.verify(token, "secretkey");

    console.log("decoded", decoded);
    

    console.log("checkoutData", checkoutData);



    try {

        res.status(200).json({ success: true, message: "Checkout successful" });
        
    } catch (error) {

        console.log("Error in checkout", error);
        res.status(500).json({ success: false, message: "Internal server error" });
        
    }
}



module.exports = {checkout}