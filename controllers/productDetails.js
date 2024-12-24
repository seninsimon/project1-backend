const Product = require('../models/productModel')

const Category = require('../models/categoryModel')


const productDetails = async (req,res)=>
{

    const {id} = req.params
    try {

        const productDetails = await Product.findById(id)
        console.log("productDetails : ", productDetails);

        const categoryName = await Category.findById(productDetails.categoryId)

        res.status(200).json({message : "product details fetched successfully " , productDetails : productDetails ,
             categoryName : categoryName.categoryName})
        
        
    } catch (error) {
        res.status(500).json({message : "internal server error in fetching products"})
    }
}


module.exports = {productDetails}