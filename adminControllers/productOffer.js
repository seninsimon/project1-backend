const Product = require("../models/productModel");

const productOffer = async (req, res) => {
    const { id } = req.params; // Extract product ID from the request parameters
    const { productOffer } = req.body; // Extract productOffer from the request body

    console.log("product offer :", productOffer);


    if (!productOffer || !productOffer.type || !productOffer.value) {
        return res.status(400).json({ message: "Invalid product offer data." });
    }

    try {
        // Validate product existence
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Update the product offer
        product.productOffer = {
            type: productOffer.type,
            value: productOffer.value,
        };

        await product.save(); // Save the updated product

        res.status(200).json({
            message: "Product offer updated successfully.",
            productOffer: product.productOffer,
        });
    } catch (error) {
        console.error("Error updating product offer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};




const fetchProductOffer = async (req, res) => {
    const { id } = req.params; // Extract product ID from request parameters

    try {
        // Find the product by its ID
        const product = await Product.findById(id);

        // Check if the product exists
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        // Send the product offer response
        res.status(200).json({
            message: "Offer response retrieved successfully.",
            productOffer: product.productOffer, // Return the offer details
            productName: product.productName
        });
    } catch (error) {
        console.error("Error fetching product offer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const fetchProductOfferDetails = async (req, res) => {
    try {
        const productOffers = await Product.find()
        res.status(200).json({ message: "product offers fetched", offers: productOffers })
    } catch (error) {
        console.error("Error fetching product offer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteProductOffer = async (req,res)=>
{
    console.log("the id ",req.params);
    const {id} = req.params
    
    try {

        const offerdelete = await Product.findByIdAndUpdate(id , {productOffer : null})

        res.status(200).json({message : "response"})
        
    } catch (error) {
        console.error("Error fetching product offer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}





module.exports = { productOffer, fetchProductOffer , fetchProductOfferDetails ,deleteProductOffer };
