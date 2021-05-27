const Joi = require('joi')

const signupVal = data =>{
    const schema = Joi.object({
        name : Joi.string().min(1).required(),
        level : Joi.string().valid('petugas','admin'),
        birth : Joi.string().min(10).required(),
        email : Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    })
    return schema.validate(data)
}

const loginVal = data => {
    const schema = Joi.object({
        email : Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
        level : Joi.string().valid('petugas','admin')
    })
    return schema.validate(data)
}

// const registerDeviceVal = data => {
//     const schema = Joi.object({
//         devid: Joi.string().min(6).required(),
//         name: Joi.string().min(1).required(),
//         birth : Joi.string().min(10).required(),
//         gender : Joi.string().valid('laki-laki','perempuan'),
//         address: Joi.string().min(1).required(),
//         suspectDate: Joi.string().min(1).required()
//     })
//     return schema.validate(data)
// }


module.exports.signupVal = signupVal
module.exports.loginVal = loginVal
// module.exports.registerDeviceVal = registerDeviceVal