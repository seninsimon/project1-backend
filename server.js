const express = require('express')
const app = express()
const routes = require('./routes/routes')
const cors = require('cors')
const Razorpay = require('razorpay')
// const userroute = require('./routes/userroute')
// const adminroute = require('./routes/adminroute')


const dbconnection = require('./database/databaseConnection')
dbconnection()



app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended : true}))

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});




app.use(routes)


app.listen(3000,()=>
{
    console.log("server is running in port 3000");
    
})