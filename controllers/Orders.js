const Address = require('../models/addressModel');
const User = require('../models/userModel');
const Order = require('../models/OrderModel');
const jwt = require('jsonwebtoken');
const Product = require('../models/productModel')
require("dotenv").config();
const Wallet = require("../models/walletSchema")
const Transaction = require("../models/transactionSchema")



const fetchOrders = async (req, res) => {
    

    const { token } = req.body;
   
    try {

        const decoded = jwt.verify(token, process.env.SECRET_KEY);



        const orders = await Order.find({ userId: decoded.id }).populate({
            path: 'products.productId',
            model: 'Product',
        }).populate(
            {
                path: 'address'
            }
        )
            .sort({ createdAt: -1 });

       

        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            orders: orders,
        });
    } catch (error) {
        console.log("Error in fetchOrders", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};




const cancelOrder = async (req, res) => {
    const { orderId, quantity, totalprice, paymentmethod } = req.body;

    

    const token = req.headers?.authorization.split(" ")[1];

    try {
        const decoded = jwt.decode(token, process.env.SECRET_KEY);

        // Update the order status to 'Cancelled'
        const order = await Order.findByIdAndUpdate(orderId, { status: 'Cancelled' }, { new: true });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Increment the product quantities in the inventory
        for (const item of order.products) {
            await Product.findByIdAndUpdate(
                item.productId, // Match the product by its ID
                { $inc: { quantity: item.quantity } }, // Increment quantity
                { new: true } // Return the updated document
            );
        }

        // Only process wallet transactions for online payments
        if (paymentmethod === "online_payment") {
            // Check if the user has an existing wallet
            let wallet = await Wallet.findOne({ userId: decoded.id });
            if (!wallet) {
                wallet = await Wallet.create({ userId: decoded.id, balance: 0 });
            }

            // Add the refunded amount to the wallet balance
            wallet.balance += totalprice;
            await wallet.save();

            // Log the transaction
            await Transaction.create({
                userId: decoded.id,
                type: "credit",
                amount: totalprice,
                description: `Refunded`,
            });

            return res.status(200).json({
                success: true,
                message: "Order cancelled and refund processed to wallet successfully",
                order,
                wallet,
            });
        }

        // For cash on delivery, no wallet transaction
        res.status(200).json({
            success: true,
            message: "Order cancelled successfully (No wallet transaction for cash on delivery)",
            order,
        });
    } catch (error) {
        console.error("Error in cancelOrder:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};






const returnProductId = async (req, res) => {
    const { productid, orderid } = req.body;



    try {

        const returnproduct = await Order.findOneAndUpdate(
            { _id: orderid, "products.productId": productid },
            { $set: { "products.$.isProductReturned": true } },
            { new: true }
        );

        if (!returnproduct) {
            return res.status(404).json({ success: false, message: "Order or product not found" });
        }

        res.status(200).json({ success: true, message: "Product marked as returned", order: returnproduct });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};




module.exports = { fetchOrders, cancelOrder, returnProductId }