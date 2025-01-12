const Address = require('../models/addressModel');
const User = require('../models/userModel');
const Order = require('../models/OrderModel');
const jwt = require('jsonwebtoken');
const Product = require('../models/productModel')
require("dotenv").config();




const fetchOrders = async (req, res) => {
    console.log(req.body);

    const { token } = req.body;
    console.log("token", token);
    try {

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log("decoded", decoded.id);


        const orders = await Order.find({ userId: decoded.id }).populate({
            path: 'products.productId',
            model: 'Product',
        }).populate(
            {
                path: 'address'
            }
        )
            .sort({ createdAt: -1 });

        console.log("orders with populated products", orders);

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
    const { token, orderId, quantity } = req.body;
    console.log("token", token);
    console.log("orderId", orderId);

    console.log("quantity:", quantity)

    try {

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log("decoded", decoded.id);


        const order = await Order.findByIdAndUpdate(orderId, { status: 'Cancelled' }, { new: true });

        console.log("order", order);

        for (const item of order.products) {
            await Product.findByIdAndUpdate(
                item.productId, // Match the product by its ID
                { $inc: { quantity: + quantity } }, // Decrement quantity
                { new: true } // Return the updated document
            );

            console.log("item :::", item);

        }



        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order: order,
        });
    } catch (error) {
        console.log("Error in cancelOrder", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}


const returnProduct = async (req, res) => {

    const { orderid , token} = req.body
    console.log(orderid , token);

    try {

        const decoded = jwt.decode(token , process.env.SECRET_KEY)
        console.log(decoded);

        const orderReturns = await Order.findByIdAndUpdate(orderid,{isReturned : true})


        
        res.status(200).json({message : "order returned successfully"  , orderReturns : orderReturns})

    } catch (error) {
        console.log("Error :", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}



module.exports = { fetchOrders, cancelOrder , returnProduct }