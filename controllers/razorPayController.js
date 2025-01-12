const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const Order = require("../models/OrderModel");
const Product = require("../models/productModel");
const Cart = require("../models/CartModal");

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const orderConfirm = async (req, res) => {
    const { token, cartItems, totalPrice, addressId, paymentMethod, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    try {
        const decoded = jwt.decode(token, process.env.SECRET_KEY);

        if (paymentMethod === "online") {
            // Verify Razorpay signature
            const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
            hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
            const generatedSignature = hmac.digest("hex");

            if (generatedSignature !== razorpaySignature) {
                return res.status(400).json({ success: false, message: "Payment verification failed" });
            }
        }

        // Create the order
        const orderData = await Order.create({
            userId: decoded.id,
            items: cartItems,
            totalPrice: totalPrice,
            address: addressId,
            paymentMethod: paymentMethod,
            products: cartItems.map(item => ({
                productName: item.productId.productName,
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price,
                image: item.productId.imageUrls[0],
            })),
        });

        // Decrease the product quantities
        for (const item of cartItems) {
            await Product.findByIdAndUpdate(
                item.productId._id, // Match the product by its ID
                { $inc: { quantity: -item.quantity } }, // Decrement quantity
                { new: true } // Return the updated document
            );
        }

        // Clear the user's cart
        await Cart.findOneAndUpdate({ userId: decoded.id }, { items: [] });

        res.status(200).json({ success: true, message: "Order confirmed", orderId: orderData._id });
    } catch (error) {
        console.error("Error in order confirmation:", error);
        res.status(500).json({ message: "Internal server error in order confirmation" });
    }
};

// Create Razorpay Order
const createRazorpayOrder = async (req, res) => {

    console.log("razor pay amount ", req.body);
    
    const { amount } = req.body;

    try {
        const order = await razorpay.orders.create({
            amount: amount ,
            currency: "INR",
        });
        res.status(200).json({ orderId: order.id, key: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ error: "Failed to create Razorpay order" });
    }
};

module.exports = {
    createRazorpayOrder,
    orderConfirm,
};
