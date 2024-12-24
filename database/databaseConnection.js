const mongoose = require('mongoose')

require('dotenv').config()

const dbconnection = () => {

    const dbUri = process.env.MONGO_URI

    mongoose.connect(dbUri).then(() => {

        console.log("mongodb is connected");

    }).catch((error) => {

        console.log('error in connecting mongodb : ', error);

    })
}

module.exports = dbconnection