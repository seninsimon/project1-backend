const Order = require("../models/OrderModel");
const Wallet = require("../models/walletSchema");
const Transaction = require("../models/transactionSchema");
const Orders = require('../models/OrderModel')




const fetchReturns = async (req, res) => {
    try {
        // Get the page and limit query parameters, defaulting to 1 for page and 10 for limit
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit; // Calculate the skip value

        // Fetch orders with pagination using skip and limit
        const allOrders = await Order.find({ isReturned: true })
            .populate("userId")
            .populate("products.productId")
            .populate("address")
            .skip(skip) // Skip the number of orders based on the current page
            .limit(limit) // Limit the number of orders returned
            .sort({ createdAt: -1 });

        // Get the total number of orders to calculate total pages
        const totalOrders = await Order.countDocuments({ isReturned: true });

        const totalPages = Math.ceil(totalOrders / limit); // Calculate total pages

        console.log("allOrders  ::: ", allOrders);

        res.status(200).json({
            message: "All returned orders fetched successfully",
            orders: allOrders,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalOrders: totalOrders,
            },
        });
    } catch (error) {
        console.error("Error fetching returned orders:", error);
        res.status(500).json({ message: "Server error", error });
    }
};



const refundTransaction = async (req, res) => {
    const { userId, price , orderid} = req.body;
  
    try {


        const orderrefunded = await Orders.findByIdAndUpdate(orderid , {refunded : true})
      
  
      // Check if wallet exists for the user
      let wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        wallet = await Wallet.create({ userId, balance: 0 });
      }
  
      // Update wallet balance
      wallet.balance += price;
      wallet.refunded = true;
      await wallet.save();
  
      // Log the transaction
      await Transaction.create({
        userId,
        type: "credit",
        amount: price,
        description: "Refund processed",
      });
  
      return res.status(200).json({ message: "Transaction to wallet successful", wallet });
    } catch (error) {
      console.error("Error processing refund:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  };

module.exports = { fetchReturns  , refundTransaction};
