const jwt = require("jsonwebtoken");
const Order = require('../models/OrderModel');
const Product = require("../models/productModel");
const Cart = require('../models/CartModal');
const Wallet = require("../models/walletSchema")
const Transaction = require("../models/transactionSchema")




const orderConfirm = async (req, res) => {


    const { token, cartItems, totalPrice, addressId,
        paymentMethod, status
    } = req.body;

    try {



        const decoded = jwt.decode(token, "secretkey");

        if (paymentMethod === "wallet") {
            try {
                // Fetch the user's wallet to get the current balance
                const userWallet = await Wallet.findOne({ userId: decoded.id });

                if (!userWallet) {
                    console.error("Wallet not found for user:", decoded.id);
                    return; // Handle this case as per your application logic
                }

                // Check if the wallet has sufficient balance
                if (userWallet.balance < totalPrice) {
                    console.error("Insufficient wallet balance!");
                    res.status(500).json({ success: true, message: "insuficient balance" });
                    return; // Handle insufficient balance (e.g., return an error response)
                }

                // Update the wallet balance
                const updatedWallet = await Wallet.findOneAndUpdate(
                    { userId: decoded.id },
                    { $inc: { balance: -totalPrice } }, // Decrease the balance
                    { new: true } // Return the updated document
                );

                console.log("Updated wallet:", updatedWallet);

                const newTransaction = new Transaction({
                    userId: decoded.id,
                    type: 'debit',
                    amount: totalPrice + 50,
                    description: 'Purchase using wallet', // Add a relevant description
                });

                await newTransaction.save();
                console.log("Transaction created:", newTransaction);



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
                        image: item.productId.imageUrls[0]
                    })),
                    status: status
    
                })
    
    
    
    
    
    
                for (const item of cartItems) {
                    await Product.findByIdAndUpdate(
                        item.productId._id, // Match the product by its ID
                        { $inc: { quantity: -item.quantity } }, // Decrement quantity
                        { new: true } // Return the updated document
                    );
                }
    
    
                const cart = await Cart.findOneAndUpdate({ userId: decoded.id }, {
                    items: []
                });
    
    
                return res.status(200).json({ success: true, message: "Order confirmed" });
            } catch (error) {
                console.error("Error updating wallet balance:", error);
                res.status(500).json({ success: true, message: "insuficient balance" });
            }
        }

        else {
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
                    image: item.productId.imageUrls[0]
                })),
                status: status

            })






            for (const item of cartItems) {
                await Product.findByIdAndUpdate(
                    item.productId._id, // Match the product by its ID
                    { $inc: { quantity: -item.quantity } }, // Decrement quantity
                    { new: true } // Return the updated document
                );
            }


            const cart = await Cart.findOneAndUpdate({ userId: decoded.id }, {
                items: []
            });









            res.status(200).json({ success: true, message: "Order confirmed" });
        }












    } catch (error) {
        console.error("Error in order confirmation:", error);
        res.status(500).json({ message: "Internal server error in order confirmation" });

    }
}

const retryOrderConfirm = async (req, res) => {
    const { token, orderID } = req.body;



    try {

        const decoded = jwt.decode(token, "secretkey");


        const order = await Order.findById(orderID);

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }


        if (order.userId.toString() !== decoded.id) {
            return res.status(403).json({ message: "Unauthorized access to order." });
        }

        // Update only the status to "Pending"
        order.status = "Pending";

        await order.save();

        console.log("Order status updated to 'Pending':", order);

        res.status(200).json({ success: true, message: "Order status updated to 'Pending'.", order });
    } catch (error) {
        console.error("Error in retrying order confirmation:", error);
        res.status(500).json({ message: "Internal server error in retrying order confirmation." });
    }
};







module.exports = { orderConfirm, retryOrderConfirm }