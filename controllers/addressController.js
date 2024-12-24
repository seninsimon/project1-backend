const Address = require('../models/addressModel')
const jwt = require('jsonwebtoken')







const fetchAddresses = async (req, res) => {
    console.log(req.body);
    
    const { token } = req.body
    console.log("token", token);
    try {

        const decoded = jwt.verify(token, "secretkey");
        console.log("decoded", decoded.id);

        const addresses = await Address.find({ userId: decoded.id })

        console.log("addresses", addresses);

        res.status(200).json({
            success: true, message: "Addresses fetched successfully",
            addresses: addresses
        })

    } catch (error) {

        console.log("Error in fetchAddresses", error);
        res.status(500).json({ success: false, message: "Internal server error" })

    }
}


const address = async (req, res) => {

    const { token, newAddress } = req.body
    console.log("token", token);
    console.log("newAddress", newAddress);
    try {

        const decoded = jwt.verify(token, "secretkey");
        console.log("decoded", decoded.id);

        const userAddress = await Address.find({ userId: decoded.id })

        if(userAddress.length > 2)
        {
           return res.status(400).json({
                success: false, message: "You can add only 3 addresses"})

            }

        console.log("userAddress  :::::", userAddress);
        

        const address = await Address.create({ ...newAddress, userId: decoded.id })

        console.log("address", address);

        res.status(200).json({
            success: true, message: "Address added successfully",
            address: address
        })

    } catch (error) {

        console.log("Error in address", error);
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}


module.exports = { address , fetchAddresses }