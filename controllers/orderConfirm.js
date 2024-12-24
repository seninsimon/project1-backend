const jwt = require("jsonwebtoken");
const Order = require('../models/OrderModel');
const Product = require("../models/productModel");
const Cart = require('../models/CartModal')


const orderConfirm = async (req, res) => {

    console.log(req.body);
    const { token, cartItems , totalPrice , addressId ,
        paymentMethod
     } = req.body;

    try {

        const decoded = jwt.decode(token, "secretkey");
        console.log("decoded", decoded);

        console.log("cartItems", cartItems);
        console.log("totalprice", totalPrice);
        console.log("AddressId", addressId);
        console.log("paymentMethod", paymentMethod);

         const orderData = await Order.create({
            userId: decoded.id,
            items: cartItems,
            totalPrice: totalPrice,
            address: addressId,
            paymentMethod: paymentMethod,
            products: cartItems.map(item => ({
                productName: item.productId.productName,
                productId: item.productId._id,
                quantity: item.productId.quantity,
                price: item.productId.price,
                image : item.productId.imageUrls[0]
            }))
            

         })

         console.log("orderData", orderData);

          // Decrease the product quantities
          for (const item of cartItems) {
            await Product.findByIdAndUpdate(
                item.productId._id, // Match the product by its ID
                { $inc: { quantity: -item.quantity } }, // Decrement quantity
                { new: true } // Return the updated document
            );
        }
          
        
        const cart = await Cart.findOneAndUpdate({userId : decoded.id}, { 
            items: []
         });

         console.log("cart", cart);
         

         
         

         console.log("orderData", orderData);
         
        res.status(200).json({ success: true, message: "Order confirmed" });


        
    } catch (error) {
        console.error("Error in order confirmation:", error);
        res.status(500).json({ message: "Internal server error in order confirmation" });
        
    }
}


module.exports = {orderConfirm}