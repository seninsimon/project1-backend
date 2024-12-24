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



module.exports = { addCategory, fetchCategory, softDeleteCategory, categoryEdit }