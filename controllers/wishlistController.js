const Product = require('../models/productModel')
const jwt = require('jsonwebtoken');
const Wishlist = require('../models/wishlistModel');


const wishlistProducts = async (req, res) => {
    console.log("req.body:", req.body);

    const { token, productId } = req.body;



    try {
        // Verify the token
        const decoded = jwt.decode(token, "secretkey");

        // Check if the product already exists in the wishlist
        const wishlist = await Wishlist.findOne({
            userId: decoded.id,
            "products.productId": productId,
        });

        if (wishlist) {
            return res.status(400).json({
                success: false,
                message: "Product is already in the wishlist.",
            });
        }

        // Add product to the wishlist or create a new wishlist
        const updatedWishlist = await Wishlist.findOneAndUpdate(
            { userId: decoded.id }, // Query: Find the user's wishlist
            {
                $push: { products: { productId } } // Update: Add product to the products array
            },
            {
                new: true, // Return the updated document
                upsert: true // Create a new wishlist if one doesn't exist
            }
        );

        return res.status(200).json({
            success: true,
            message: "Product added to the wishlist.",
            wishlist: updatedWishlist,
        });
    } catch (error) {
        console.error("Error in wishlistProducts:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

module.exports = { wishlistProducts };




const fetchWishlist = async (req, res) => {
    console.log(req.body);

    const { token } = req.body;
    console.log("token", token);
    try {

        const user = jwt.decode(token, "secretkey");

        console.log(user);



        const wishlist = await Wishlist.find({ userId: user.id }).populate("products.productId");

        console.log("wishlists : :::", wishlist);

        res.status(200).json({ message: "Wishlist fetched successfully", wishlist: wishlist })

    } catch (error) {
        console.log("Error in fetchWishlist", error);
        res.status(500).json({ success: false, message: "Internal server error" });

    }
}



const deletewishlist = async (req, res)=>
{
    const id = req.params.id
    
    const {token} = req.body
    console.log(token)
    console.log("id",id);
    
    try {

        const decoded = jwt.decode(token,"secretkey")
        console.log(decoded);

        const deleteWish = await Wishlist.findOneAndUpdate({userId :decoded.id} , 
            {
                $pull : {
                    products: { productId : id } 
                }
            }
        )

        console.log(deleteWish);

        res.status(200).json({message : "the wish has been deleted" , success : true})
        
        

    } catch (error) {

        
        res.status(500).json({message : "internal server error"})

        
    }
}



module.exports = { wishlistProducts, fetchWishlist  , deletewishlist}