const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true,
    },
    products: [{

        productName: {
            type: String,
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        image:{
            type: String,
            required: true,
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
    },
    paymentMethod: {
         type: String,
          enum: ['cash_on_delivery'], 
          required: true },
    status: { 
        type: String,
         enum: ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'], 
         default: 'Pending' },
    orderDate: { 
        type: Date, 
        Fdefault: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
    