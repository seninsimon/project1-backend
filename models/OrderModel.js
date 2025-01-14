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

    isReturned:
    {
        type: Boolean,
        default: false
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
        isProductReturned: {

            type: Boolean,
            default: false

        },
        refunded:
        {
            type: Boolean,
            default: false
        },


        quantity: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        image: {
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
        enum: ['cash_on_delivery', 'online_payment'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
