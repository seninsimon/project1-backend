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
    const { orderId, quantity, totalprice, paymentmethod, cancelReason } = req.body;

    const token = req.headers?.authorization.split(" ")[1];

    try {
        const decoded = jwt.decode(token, process.env.SECRET_KEY);

        // Fetch the order details
        const orderc = await Order.findById(orderId);
        if (!orderc) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Refund logic (only if the payment method is eligible and status is NOT "payment_pending")
        if ((paymentmethod === "online_payment" || paymentmethod === "wallet") && orderc.status !== "payment_pending") {
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
        }

        // Update order status to 'Cancelled' with the cancel reason
        const order = await Order.findByIdAndUpdate(orderId, { status: 'Cancelled', cancelReason }, { new: true });

        // Increment the product quantities in the inventory
        for (const item of order.products) {
            await Product.findByIdAndUpdate(
                item.productId, // Match the product by its ID
                { $inc: { quantity: item.quantity } }, // Increment quantity
                { new: true } // Return the updated document
            );
        }

        res.status(200).json({
            success: true,
            message: orderc.status === "payment_pending" 
                ? "Order cancelled successfully (No refund as payment is pending)"
                : "Order cancelled successfully and refund processed (if applicable)",
            order,
        });
    } catch (error) {
        console.error("Error in cancelOrder:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};




//returning the product dont look the const name
const returnProductId = async (req, res) => {
    const { productid, orderid, reason } = req.body;



    try {

        const returnproduct = await Order.findOneAndUpdate(
            { _id: orderid, "products.productId": productid },
            {
                $set: {
                    "products.$.isProductReturned": true,
                    "products.$.returnReason": reason
                }
            },
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