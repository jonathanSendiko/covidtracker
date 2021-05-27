const mongoose = require('mongoose')

const infoSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    date: Number
})

const Info = mongoose.model('info', infoSchema, 'info')
module.exports = Info