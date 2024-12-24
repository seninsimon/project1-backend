const express = require('express')
const app = express()
const routes = require('./routes/routes')
const cors = require('cors')

const dbconnection = require('./database/databaseConnection')
dbconnection()

// app.use(cors({
//     origin: 'http://localhost:5173',
//     origin: 'http://localhost:5174',
//     credentials: true
//   }));

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended : true}))


app.use(routes)


app.listen(3000,()=>
{
    console.log("server is running in port 3000");
    
})