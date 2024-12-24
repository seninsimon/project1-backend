const Product = require('../models/productModel')
const Category = require('../models/categoryModel')




const homePage = async (req , res)=>
{
    console.log('fdsakjflas')
    try {

        


        const products = await Product.find({isDeleted : false  }).populate({
            path:'categoryId',
            match : {isDeleted : false},
            select : "categoryName  isDeleted categoryId"
        })

        const filteredProducts = products.filter((product) => product.categoryId !== null);
        

        console.log("products that are not blocked : ", products);

       

        res.status(200).json({success : true , message : "products fetched succussfully " , allProducts : filteredProducts})
        
   
    } catch (error) {

        res.status(500).json({message : "internal server error in fetching products"})
        
    }
}


module.exports = {homePage}