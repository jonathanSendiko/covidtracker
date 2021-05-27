const jwt = require('jsonwebtoken')
const User = require('../models/User')

const checkUser = (req, res, next) =>{
    const token = req.cookies.jwt
    if(token){
        jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, async(err, decodeToken)=>{
            if(err){
                res.locals.user = null
                next()
            }else{
                let user = await User.findById(decodeToken.id)
                res.locals.user = user
                req.user = user
                next()
            }
        })
    }else{
        res.locals.user = null
        next()
    }
}

const checkAuth = (req, res, next)=>{
    const token = req.header('auth-token')
    const cookieToken = req.cookies.jwt
    if(token){
        jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, async(err, decodeToken)=>{
            if(err){
                // console.log(err)
                res.status(401).json({status: "not_authorized"})
            }else{
                let user = await User.findById(decodeToken.id)
                req.user = user
                next()
            }
        })
    }else if(cookieToken){
        jwt.verify(cookieToken, process.env.SECRET_ACCESS_TOKEN, async(err, decodeToken)=>{
            if(err){
                res.redirect('/')
                next()
            }else{
                let user = await User.findById(decodeToken.id)
                req.user = user
                next()
            }
        })
    }else{
        // next()
        // res.redirect('/')
        res.status(401).json({status: "not_authorized"})
    }
}

module.exports = {checkUser, checkAuth}