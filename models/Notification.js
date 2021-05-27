const mongoose = require('mongoose')

const notifSchema = new mongoose.Schema({
    topic: String,
    title: String,
    body: String,
    timestamp: Number
})

const Notification = mongoose.model('notification', notifSchema, 'notification')
module.exports = Notification
