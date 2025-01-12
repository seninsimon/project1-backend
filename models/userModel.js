const mongoose = require('mongoose')



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phonenumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isBlocked : {
        type : Boolean , 
        default : false
    },
    usedCoupons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
      }],
})



const User = mongoose.model("User",userSchema)

module.exports = User