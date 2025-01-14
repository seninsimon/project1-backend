
const Category = require("../models/categoryModel")
const Product = require("../models/productModel")

//for adding category !

const addCategory = async (req, res) => {

    const { categoryData } = req.body

    try {

        const categoryExist = await Category.findOne({ categoryName: categoryData })

        if (categoryExist) return res.status(400).json({ success: false, message: "category is already created" })

        const cate = await Category.create({
            categoryName: categoryData
        })

        console.log("new category added : ", cate);


        res.status(200).json({ success: true, message: "category added successfully", categoryAdded: categoryData })

    } catch (error) {

        console.log("error in adding category internal server error , ", error);

        return res.status(500).json({ message: "internal server error" })

    }

}

//for fetching category details !

const fetchCategory = async (req, res) => {

    try {

        const categoryDetails = await Category.find()

        console.log("all category details : ", categoryDetails);

        res.status(200).json({
            success: true, message: "category details successfully fetched",
            categoryDetails: categoryDetails
        })


    } catch (error) {

        console.log("internal server error in fetching category datas ", error);

        res.status(500).json({ message: "internal server error in fetching category data" })

    }
}

//soft delete category

const softDeleteCategory = async (req, res) => {

    const { id } = req.body

    try {
        const cate = await Category.findById(id)

        const disableCateogry = await Category.findByIdAndUpdate(id,
            {
                isDeleted: !cate.isDeleted,
                isActive: !cate.isActive
            })



        console.log("category that is diabled : ", disableCateogry);

        res.status(200).json({ success: true, message: "category disabled" })

    } catch (error) {

        console.log("internal server error in disabling category  ", error);

        res.status(500).json({ message: "internal server error in disabling category " })

    }
}


//edit category

const categoryEdit = async (req, res) => {
    const { editId, cateName } = req.body

    console.log(req.body);


    try {

        const cate = await Category.findById(editId)

        console.log("category to edit :", cate);

        const categoryName = await Category.findByIdAndUpdate(editId, { categoryName: cateName })

        console.log("new category : ", categoryName);

        res.status(200).json({ success: true, message: "category edited successfully ", newName: categoryName })



    } catch (error) {

        res.status(500).json({ message: "internal server error in editing category name " })
    }
}



const categoryOffer = async (req, res) => {
    const { id, offerType, offerValue, expiryDate } = req.body; // Extract fields from request body

    try {
        // Find the category by ID
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Update the discount field
        category.discount = {
            type: offerType,
            value: offerValue,
            expiryDate,
        };

        // Save the updated category
        await category.save();

        res.status(200).json({
            message: "Offer added successfully",
            category,
        });
    } catch (error) {
        console.error("Error updating category offer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const fetchCategoryOffer = async (req, res) => {


    const { id } = req.params
    

    try {

        const product = await Product.findById(id).populate(
            {
                path: "categoryId",
                select: "discount"
            }
        )

        console.log("categoryDetails :", product.categoryId.discount);


        res.status(200).json({
            message: "discount cat fetched successfully", categoryDiscount: product.categoryId.discount
        })

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });

    }
}



const cateName = async (req, res) => {

    console.log(req.body);

    const { id } = req.body

    try {


        const categoryname = await Category.findById(id)

        console.log("category name :", categoryname);


        res.status(200).json({ message: "cate name fetched", categoryDetails: categoryname })

    } catch (error) {
        res.status(500).json({ message: "internal server error" })
    }
}


//category offer details


const categoryofferDetails = async (req, res) => {
    try {


        const offerDetails = await Category.find()

        res.status(200).json({ message: "the offer fetched", offerDetails: offerDetails })

    } catch (error) {
        res.status(500).json({ message: "internal server error" })

    }
}

//to delete offer 

const categoryofferDelete = async (req, res) => {

    const { id } = req.params
    console.log("delete id", id);


    try {


        const offerDetails = await Category.findByIdAndUpdate(id, { "discount.value": 0 })

        res.status(200).json({ message: "the offer fetched", offerDetails: offerDetails })

    } catch (error) {
        res.status(500).json({ message: "internal server error" })

    }
}








module.exports = {
    addCategory, fetchCategory, softDeleteCategory,
    categoryEdit, categoryOffer, fetchCategoryOffer, cateName,
    categoryofferDetails, categoryofferDelete, 

}