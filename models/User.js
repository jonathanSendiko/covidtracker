const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        min: 1,
        max: 255
    },
    level:{
        type: String,
        enum: ['petugas','admin'],
        default: 'petugas'
    },
    birth:{
        type: String,
        min: 8,
    },
    email:{
        type: String,
        min: 6,
        max: 255
    },
    password:{
        type: String,
        min: 6,
        max: 1024
    },
})

userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
}); 

userSchema.statics.login = async function(email, password){
    const user = await this.findOne({email})
    if(user){
        const auth = await bcrypt.compare(password, user.password)
        if(auth){
            return user
        }
        throw Error('incorrect password')
    }
    throw Error('Email not found')
}

const User = mongoose.model('user', userSchema, 'user');

module.exports = User;