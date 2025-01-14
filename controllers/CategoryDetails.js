// const Category = require('../models/categoryModel')
// const Product = require('../models/productModel')






// const categoryDetails = async (req,res)=> {

//     const { categoryname } = req.params

//     console.log("category  :", categoryname);

//     try {

//         const categoryDetails = await Category.findOne({ categoryName: categoryname , isDeleted : false})

//         const productDetails = await Product.find({ categoryId : categoryDetails._id , isDeleted : false }).populate("categoryId")

        

//         res.status(200).json({ success: true, message: "Category details fetched successfully" , 
//             productDetails :  productDetails
//          });
        
//     } catch (error) {

//         console.log("Error in categoryDetails", error);
//         res.status(500).json({success : false , message : "Internal server error"})
        

//     }
// }

// module.exports = {categoryDetails}

    const Category = require('../models/categoryModel');
    const Product = require('../models/productModel');

    const categoryDetails = async (req, res) => {
    const { categoryname } = req.params;
    const { sort, search, page = 1, limit = 10 } = req.query; 

    console.log("category:", categoryname);

    try {
        const categoryDetails = await Category.findOne({
        categoryName: categoryname,
        isDeleted: false,
        });

        if (!categoryDetails) {
        return res.status(404).json({
            success: false,
            message: "Category not found",
        });
        }

        
        const query = { categoryId: categoryDetails._id, isDeleted: false };

        
        if (search) {
        query.productName = { $regex: search, $options: "i" }; // Case-insensitive search
        }

        // Sorting logic
        let sortOption = {};
        switch (sort) {
        case "priceLowHigh":
            sortOption = { price: 1 };
            break;
        case "priceHighLow":
            sortOption = { price: -1 };
            break;
        case "alphabeticalAZ":
            sortOption = { productName: 1 };
            break;
        case "alphabeticalZA":
            sortOption = { productName: -1 };
            break;
        default:
            break; 
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const productDetails = await Product.find(query)
        .populate("categoryId")
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));

        const totalProducts = await Product.countDocuments(query);

        res.status(200).json({
        success: true,
        message: "Category details fetched successfully",
        productDetails,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: parseInt(page),
        });
    } catch (error) {
        console.log("Error in categoryDetails", error);
        res.status(500).json({
        success: false,
        message: "Internal server error",
        });
    }
    };

    module.exports = { categoryDetails };
