
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')




//fetching .....
const fetchProduct = async (req, res) => {
    try {

        const Products = await Product.find().populate('categoryId', 'categoryName isDeleted' )
        console.log(Products);
        res.status(201).json({ success: true, message: "products fetched", ProductDetails: Products })

    } catch (error) {

        console.log("internal server error in fetching products : ", error);
        res.status(500).json({ message: "internal server error in fetching products" })

    }
}



//addproduct

const addProduct = async (req, res) => {
    console.log(req.body);

    const { categoryName } = req.body

    try {

        const categoryid = await Category.findOne({ categoryName: categoryName })

        console.log(categoryid);



        const newProduct = await Product.create({ ...req.body, categoryId: categoryid._id })

        console.log(newProduct)

        res.status(200).json({ success: true, message: "new product added", newProduct: newProduct })


    } catch (error) {

        console.log("internal server error in adding products : ", error);

        res.status(500).json({ message: "internal server error in adding products" })
    }
}



//fetchediting the product  

const fetchEditProduct = async (req, res) => {

    const { id } = req.params
    console.log(id);


    try {

        const product = await Product.findById(id).populate(
            {
                path : 'categoryId',
                
            }
        )
        console.log("edit  productsssssss"  ,product);
        res.status(200).json({ success: true, message: "fetched edit products ", editProducts: product })



    } catch (error) {

        console.log("internal server error in fetcingediting products : ", error);

        res.status(500).json({ message: "internal server error in fetcingediting products" })

    }
}


const editProduct = async (req, res) => {
    const { fetchedData, id, uploadedImageUrls } = req.body

    console.log(fetchedData, id, uploadedImageUrls );

    console.log(fetchedData.categoryName);
    
    

    try {

        const categoryProduct = await Category.find({categoryName : fetchedData.categoryName})

        console.log("  edited .........  category product : ",categoryProduct);

        console.log("edited .........id :",categoryProduct._id);
        
        

        const editedProduct = await Product.findByIdAndUpdate(id, { ...fetchedData, imageUrls: uploadedImageUrls ,
            categoryId : categoryProduct[0]._id
         })

        console.log("edited .........id",editedProduct);

        res.status(200).json({ success: true, message: "product edited successfully ", productDetails: editedProduct })


    } catch (error) {

        console.log("internal server error in editing products : ", error);

        res.status(500).json({ message: "internal server error in editing products" })
    }
}



const disableProduct = async (req , res)=>
{

    const {id} = req.body

    try {

        const product = await Product.findById(id)

        console.log(product);

        const disbledProduct = await Product.findByIdAndUpdate(id , {isDeleted : !product.isDeleted})

        console.log("disabled product : ", disbledProduct);
        
        

        res.status(200).json({ success : true , message : "product disbaled" , disableProduct : disbledProduct.isDeleted    } )
        
    } catch (error) {

         console.log("internal server error in disabling products : ", error);

        res.status(500).json({ message: "internal server error in disabling products" })
        
    }
}



module.exports = { fetchProduct, addProduct, fetchEditProduct , editProduct  , disableProduct}