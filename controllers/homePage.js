const Product = require('../models/productModel')
const Category = require('../models/categoryModel')




// const homePage = async (req , res)=>
// {
    
//     try {

        


//         const products = await Product.find({isDeleted : false  }).populate({
//             path:'categoryId',
//             match : {isDeleted : false},
//             select : "categoryName  isDeleted categoryId"
//         })

//         const filteredProducts = products.filter((product) => product.categoryId !== null);
        

        

       

//         res.status(200).json({success : true , message : "products fetched succussfully " , allProducts : filteredProducts})
        
   
//     } catch (error) {

//         res.status(500).json({message : "internal server error in fetching products"})
        
//     }
// }


// module.exports = {homePage}
const homePage = async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page

    try {
        const skip = (page - 1) * limit;

        // Fetch products with pagination
        const products = await Product.find({ isDeleted: false })
            .populate({
                path: 'categoryId',
                match: { isDeleted: false },
                select: "categoryName isDeleted categoryId"
            })
            .skip(skip) // Skip items for the current page
            .limit(Number(limit)); // Limit the number of items per page

        const filteredProducts = products.filter((product) => product.categoryId !== null);

        // Count total documents for pagination metadata
        const totalProducts = await Product.countDocuments({ isDeleted: false });

        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            allProducts: filteredProducts,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: Number(page)
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error in fetching products" });
    }
};

module.exports = { homePage };
