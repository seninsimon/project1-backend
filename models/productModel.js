// const mongoose = require("mongoose")



// const productSchema = new mongoose.Schema({

//     productName: {
//         type: String,
//         required: true
//     },
//     imageUrls    : {
//         type : [String],
//         required : true
//     },
//     sku : {
//         type : String,
//         required : true
//     },
//     modelName: {
//         type: String,
//         required: true
//     },
//     price: {
//         type: Number,
//         required: true
//     },
//     quantity: {
//         type: Number,
//         required: true
//     },
//     inStock: {
//         type: Boolean,
//         default: false
//     },
//     varient: [
//         {
//             varientName: {
//                 type: String,
//                 required: true
//             },
//             additionalPrice: {
//                 type: Number,
//                 required: true
//             }
//         }
//     ],
//     description: {
//         type: String,
//         required: true
//     },
//     isDeleted: {
//         type: Boolean,
//         default: false
//     },
//     categoryBlock : {
//         type : Boolean,
//         default : false
//     },


//     categoryId : 
//     {
//         type : mongoose.Schema.Types.ObjectId ,
//         ref : 'Category',
//         required : true 
//     },

//     productOffer : 
//     {
        
//     }

    

//     brand : {
//         type : String , 
//         required : true
//     }

// })


// const Product = mongoose.model("Product", productSchema)

// module.exports = Product


const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  imageUrls: {
    type: [String],
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  modelName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  inStock: {
    type: Boolean,
    default: false,
  },
  varient: [
    {
      varientName: {
        type: String,
        required: true,
      },
      additionalPrice: {
        type: Number,
        required: true,
      },
    },
  ],
  description: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  categoryBlock: {
    type: Boolean,
    default: false,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  productOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer", // Reference to the Offer schema
    default: null, // Optional: set null if no offer is applied
  },
  brand: {
    type: String,
    required: true,
  },
});

// Create and export the Product model
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
