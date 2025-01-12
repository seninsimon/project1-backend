const orders = require('../models/OrderModel');




const fetchAllOrders = async (req , res)=>
{
    try {

        const allOrders = await orders.find()
        .populate("userId")
        .populate("products.productId")
        .populate("address")
        .sort({ createdAt: -1 });
        console.log("allOrders  ::: ",allOrders);


        res.status(200).json({message : "all orders fetched",orders : allOrders})
        
        
    } catch (error) {

        res.status(500).json({message : "error in internal server "})
        
    }

}


const updateOrder = async (req, res)=>
{

    const {orderId, newStatus} = req.body

    console.log("orderId :::",orderId);
    console.log("status :::",newStatus);


    try {


        const orderstatus = await orders.findByIdAndUpdate(orderId,{status : newStatus},{new : true})   

        res.status(200).json({message : "order updated successfully"})





        
    } catch (error) {
        
        res.status(500).json({message : "error in internal server "})
        
    }

}


module.exports = {fetchAllOrders ,updateOrder }