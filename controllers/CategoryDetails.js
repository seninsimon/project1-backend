const Category = require('../models/categoryModel')
const Product = require('../models/productModel')






const categoryDetails = async (req,res)=> {

    const { categoryname } = req.params

    console.log("category  :", categoryname);

    try {

        const categoryDetails = await Category.findOne({ categoryName: categoryname , isDeleted : false})

        const productDetails = await Product.find({ categoryId : categoryDetails._id , isDeleted : false }).populate("categoryId")

        

        res.status(200).json({ success: true, message: "Category details fetched successfully" , 
            productDetails :  productDetails
         });
        
    } catch (error) {

        console.log("Error in categoryDetails", error);
        res.status(500).json({success : false , message : "Internal server error"})
        

    }
}

module.exports = {categoryDetails}