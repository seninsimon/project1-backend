const mongoose = require('mongoose')



const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fullName: {
        type: String,
        required: true, // Name of the recipient
    },
    phoneNumber: {
        type: String,
        required: true, // Contact number
    },
    address: {
        type: String,
        required: true, // Street address
    },
    city: {
        type: String,
        required: true, // City
    },
    state: {
        type: String,
        required: true, // State/Province
    },
    pincode: {
        type: String,
        required: true, // ZIP/Postal Code
    },
    isDefault: {
        type: Boolean,
        default: false, // Whether this is the default address
    },
    createdAt: {
        type: Date,
        default: Date.now, // Timestamp for when the address was added
    },
});



module.exports = mongoose.model("Address", addressSchema);
