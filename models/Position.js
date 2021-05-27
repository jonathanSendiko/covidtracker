const mongoose = require('mongoose')

const positionSchema = new mongoose.Schema({
    devid:{
        type: String,
        require: true,
        min: 5
    },
    nik: String,
    area: Array,
    lat:{
        type: String,
        min: 1
    },
    long:{
        type: String,
        min: 1
    },
    is_ready: Boolean
})

positionSchema.statics.updatePos = async function({devid, lat, long}){
    const updatePosition = await this.findOneAndUpdate({devid},{lat, long}, {new:true})
    if(updatePosition){
        return updatePosition
    }
    throw Error("not_found")
}

positionSchema.statics.updateHome = async function({devid, nik, area}){
    const updatePosition = await this.findOneAndUpdate({devid},{nik,area}, {new:true})
    if(updatePosition){
        return updatePosition
    }
    throw Error("not_found")
}

positionSchema.statics.createPos = async function({devid, nik, area, lat, long, is_ready}){
    const isExist = await this.findOne({devid})
    if(!isExist){
        const createPosition = await this.create({devid, nik, area, lat, long, is_ready})
        if(createPosition){
            return createPosition
        }
    }    
    throw Error("Device Already Exist")
}

const Position = mongoose.model('position', positionSchema, 'position')

module.exports = Position