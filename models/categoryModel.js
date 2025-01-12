const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    discount: {
        type: {
            type: String, 
            enum: ['flat', 'percentage'],
            required: false, 
        },
        value: {
            type: Number, 
            required: function () {
                return !!this.discount?.type; 
            },
        },
        expiryDate: {
            type: Date, 
            required: false, 
        },
    },
});

// Pre-save hook to check if the expiry date has passed
categorySchema.pre('save', function(next) {
    if (this.discount && this.discount.expiryDate) {
        const currentDate = new Date();
        if (this.discount.expiryDate < currentDate) {
            this.discount.value = 0; // Set value to 0 if expiry date is passed
        }
    }
    next(); // Continue with the save process
});


const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
