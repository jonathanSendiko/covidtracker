const mongoose = require('mongoose')


const logSchema = new mongoose.Schema({
    devid:{
        type: String,
        require: true,
        min: 5
    },
    lat:{
        type: String,
        require: true,
        min: 1
    },
    long:{
        type: String,
        require: true,
        min: 1
    },
    timestamp:{
        type: Number,
        require: true
    }   
})

logSchema.statics.logPos = async function({devid, lat, long}){

    const logPosition = await this.create({devid, lat, long, timestamp:Date.now()})
    if(logPosition){
        return logPosition
    }
    throw Error("Device not found")
}

const Logger = mongoose.model('log', logSchema, 'log')

module.exports = Logger