const Cart = require('../models/CartModal')
const Product = require('../models/productModel')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
require("dotenv").config();



const addToCart = async (req, res) => {
    const { id, token } = req.body;

    try {
        // Decode the JWT token to verify the user's identity
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log("Decoded token:", decoded);

        // Find the user by the decoded ID
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("User:", user);

        // Find the product by its ID
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        console.log("Add to cart product:", product);

        // Check if a cart exists for the user
        const cart = await Cart.findOne({ userId: user._id });

        console.log("cart  :", cart);


        if (cart) {
            // Check if the product is already in the cart
            const existingItemIndex = cart.items.findIndex(
                (item) => item.productId.toString() === product._id.toString()
            );

            if (existingItemIndex !== -1) {
                return res.status(400).json({ message: "Product already in cart", success: "alreadythere" });
            }

            // Add the new product to the items array
            const updatedCart = await Cart.findByIdAndUpdate(
                cart._id,
                { $push: { items: { productId: product._id, quantity: 1 } } },
                { new: true } // Return the updated document
            );

            return res.status(200).json({ message: "Product added to cart successfully", cart: updatedCart });
        }

        // If no cart exists, create a new cart for the user
        const newCart = await Cart.create({
            userId: user._id,
            items: [{ productId: product._id, quantity: 1 }],
        });

        res.status(200).json({ message: "Cart created and product added successfully", cart: newCart });
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({ message: "Internal server error in adding product" });
    }


}



const cartDetails = async (req, res) => {
    const { token } = req.body
    console.log(token);

    try {

        const decode = jwt.decode(token, "sectretkey")
        console.log("decoded id", decode);


        const cartData = await Cart.find({ userId: decode.id })
            .populate("userId")
            .populate({
                path: "items.productId",
                populate: {
                    path: "categoryId"  // Specify the path to populate the categoryId
                }
            });


        console.log("cart data", cartData);



        res.status(200).json({ message: "fetched cart details", cartData: cartData })



    } catch (error) {

        res.status(500).json({ message: "internal server error in fetching cart details" })

    }
}





const quantityEdit = async (req, res) => {
    const { id, quantity, token } = req.body;
    console.log(id, quantity, token);
    try {

        if (quantity < 1) {
            quantity = 1;
        }
        const decode = jwt.decode(token, process.env.SECRET_KEY);
        console.log("decoded id", decode);

        const cart = await Cart.findOne({ userId: decode.id });
        console.log("cart", cart);

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === id);
        console.log("item index", itemIndex);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        cart.items[itemIndex].quantity = quantity;

        await cart.save();

        console.log("Updated cart", cart);
        res.status(200).json({ message: "Quantity updated successfully", cart });

    } catch (error) {
        console.error("Error updating quantity:", error);
        res.status(500).json({ message: "Internal server error in updating quantity" });
    }
}


const productRemove = async (req, res) => {
    const { id, token } = req.body;
    console.log(id, token);
    try {
        const decode = jwt.decode(token, process.env.SECRET_KEY);
        console.log("decoded id", decode);

        const cart = await Cart.findOne({ userId: decode.id });
        console.log("cart", cart);

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === id);
        console.log("item index", itemIndex);

        const updatedCart = await Cart.findOneAndUpdate({ userId: decode.id },
            { $pull: { items: { productId: id } } },
            { new: true }
        );

        res.status(200).json({ message: "Product removed successfully", cart: updatedCart });


    } catch (error) {

        res.status(500).json({ message: "Internal server error in removing product" });

    }
}





module.exports = { addToCart, cartDetails, quantityEdit, productRemove }