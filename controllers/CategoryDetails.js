const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

const categoryDetails = async (req, res) => {
  const { categoryname } = req.params;
  const { sort, search, page = 1, limit = 10 } = req.query;

  console.log("category:", categoryname);

  try {
    let query = { isDeleted: false }; // Default query to exclude deleted products

    if (categoryname !== "allproducts") {
      // Fetch the specific category if not "allproducts"
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

      // Add category filter to the query
      query.categoryId = categoryDetails._id;
    }

    // Add search term to the query if provided
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
        break; // Default sorting (no sorting applied)
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch products based on the query, sorting, and pagination
    const productDetails = await Product.find(query)
      .populate("categoryId") 
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Count total products for pagination
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
