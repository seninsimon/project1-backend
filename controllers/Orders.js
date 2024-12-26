const Address = require('../models/addressModel');
const User = require('../models/userModel');
const Order = require('../models/OrderModel');
const jwt = require('jsonwebtoken');




const fetchOrders = async (req, res) => {
    console.log(req.body);

    const { token } = req.body;
    console.log("token", token);
    try {
        
        const decoded = jwt.verify(token, "secretkey");
        console.log("decoded", decoded.id);

        
        const orders = await Order.find({ userId: decoded.id }).populate({
            path: 'products.productId', 
              model: 'Product', 
        });

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
    const { token, orderId } = req.body;
    console.log("token", token);
    console.log("orderId", orderId);

    try {
    
        const decoded = jwt.verify(token, "secretkey");
        console.log("decoded", decoded.id);

       
        const order = await Order.findByIdAndUpdate(orderId, { status: 'cancelled' }, { new: true });

        console.log("order", order);

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



module.exports = { fetchOrders ,cancelOrder }