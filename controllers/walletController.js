const Wallet = require('../models/walletSchema')
const Transaction = require('../models/transactionSchema')
const jwt = require('jsonwebtoken')



const fetchWallet = async (req, res) => {
    const { token } = req.body
    console.log("token ::::::", token);
    // token2 =  req.headers.authorization.split(" ")[1]

    try {


        console.log("haaaaa :", token   );


        const decoded = jwt.decode(token, "secretkey")

        console.log(decoded);

        const walletDetails = await Wallet.findOne({ userId: decoded.id })

        console.log("wallet Details ", walletDetails);




        res.status(200).json({ message: "wallet details fetched successfully", wallet: walletDetails })



    } catch (error) {

        console.log(error);
        res.status(500).json({ message: "internal server error" })


    }

}



const fetchTransaction = async (req, res) => {
    const { token, page = 1, limit = 5 } = req.body;
    console.log("transaction token: ", token);
 
    try {
        const decoded = jwt.decode(token, "secretkey");
        const skip = (page - 1) * limit; // Calculate documents to skip

        const transaction = await Transaction.find({ userId: decoded.id })
            .skip(skip)
            .limit(limit)
            .sort({ date: -1 })

        const total = await Transaction.countDocuments({ userId: decoded.id });


        res.status(200).json({
            message: "Transaction history fetched",
            transaction: transaction,
            total,
            page,
            limit,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};







module.exports = { fetchWallet, fetchTransaction }