
const Order = require('../models/OrderModel'); 
const Product = require('../models/productModel'); 
const Category = require('../models/categoryModel'); 



// Top 10 Products
const topProducts =  async (req, res) => {
    try {
        const products = await Order.aggregate([
            { $unwind: '$products' }, // Flatten the products array
            {
                $group: {
                    _id: '$products.productId', // Group by productId
                    totalQuantity: { $sum: '$products.quantity' }, // Sum up quantities
                },
            },
            { $sort: { totalQuantity: -1 } }, // Sort by quantity sold in descending order
            { $limit: 10 }, // Limit to top 10
            {
                $lookup: {
                    from: 'products', // Collection name for Product
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails',
                },
            },
            { $unwind: '$productDetails' }, // Flatten product details
            {
                $project: {
                    _id: 0,
                    productId: '$_id',
                    productName: '$productDetails.productName',
                    totalQuantity: 1,
                },
            },
        ]);

        res.json(products);
    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Top 10 Brands
const topBrands =  async (req, res) => {
    try {
        const brands = await Order.aggregate([
            { $unwind: '$products' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails',
                },
            },
            { $unwind: '$productDetails' },
            {
                $group: {
                    _id: '$productDetails.brand', // Group by brand
                    totalQuantity: { $sum: '$products.quantity' },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 0,
                    brand: '$_id',
                    totalQuantity: 1,
                },
            },
        ]);

        res.json(brands);
    } catch (error) {
        console.error('Error fetching top brands:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Top 10 Categories
    const topCategories =  async (req, res) => {
    try {
        const categories = await Order.aggregate([
            { $unwind: '$products' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails',
                },
            },
            { $unwind: '$productDetails' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productDetails.categoryId',
                    foreignField: '_id',
                    as: 'categoryDetails',
                },
            },
            { $unwind: '$categoryDetails' },
            {
                $group: {
                    _id: '$categoryDetails.categoryName', // Group by category name
                    totalQuantity: { $sum: '$products.quantity' },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 0,
                    categoryName: '$_id',
                    totalQuantity: 1,
                },
            },
        ]);

        res.json(categories);
    } catch (error) {
        console.error('Error fetching top categories:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {topBrands , topCategories , topProducts}
