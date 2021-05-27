const User = require('../models/User')
const Device = require('../models/Device')
const Article = require('../models/Article')
const Notification = require('../models/Notification')
const Info = require('../models/Info')
const fs = require('fs')
const path = require('path')

const axios = require('axios')
const jwt = require('jsonwebtoken')
const pass = require('../validation')
const bcrypt =  require('bcryptjs')
const { globalAgent } = require('http')


function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".");
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_ACCESS_TOKEN, {
    expiresIn: maxAge
  });
};

module.exports.signup_get = (req, res) => {
    // res.send('mdkmkmk')
    res.render('admin/signup', {title:"Daftar"});
}

module.exports.login_get = (req, res) => {
    res.render('admin/login', {title:"Login"});
}

module.exports.dashboard_get = async (req, res)=>{
    let covtCase = {}
    let statCase = {}
    await axios.get('https://ccc-19.depok.go.id//Data/getWidget', {
        headers : { Accept: "application/json" }
    }).then(res => statCase = res.data)
    covtCase = {
        positif:(parseInt(statCase.positiftotal)<1000)?statCase.positiftotal:numberWithCommas(statCase.positiftotal),
        meninggal:(parseInt(statCase.positifmeninggal)<1000)?statCase.positifmeninggal:numberWithCommas(statCase.positifmeninggal),
        sembuh:(parseInt(statCase.positifsembuh)<1000)?statCase.positifsembuh:numberWithCommas(statCase.positifsembuh),
        dirawat:(parseInt(statCase.positifaktif)<1000)?statCase.positifaktif:numberWithCommas(statCase.positifaktif)
    }
    res.render('admin/dashboard', {title:"Dashboard", covtCase:covtCase})
}

module.exports.users_get = async (req, res)=>{
    User.find({}, (err, user)=>{
        res.render('admin/users', {title:"Users",users:user})
    })
}

module.exports.maps_get = (req, res)=>{
    res.render('admin/maps', {title:"Peta"})
}

module.exports.log_get = (req, res)=>{
    res.render('admin/log', {title:"Riwayat"})
}

module.exports.edit_get = async(req, res)=>{
    const user = await User.findOne({_id:req.query.id})
    console.log(user)
    res.render('admin/edit', {title:"Edit User",current:user})
}

module.exports.edit_post = async(req, res)=>{
    const {id,name,birth,level} = req.body
    const user = await User.findOneAndUpdate({_id:id}, {name:name,birth:birth,level:level}, {new:true})
    // console.log(user)
    if(user){
        res.status(200).json({status:"success"})
    }else{
        res.status(400).json({status:"fail", errors:"Gagal memperbarui data"})
    }
}

module.exports.delete_get = async(req, res)=>{
    const user = await User.findOneAndDelete({_id:req.query.id})
    console.log(user.name)
    if(user){
        res.status(200).json({status:"success"})
    }else{
        res.status(400).json({status:"fail"})
    }
}

module.exports.articles_get = async(req, res)=>{
    const news = await Article.findOne({type:"news"})
    const tips = await Article.findOne({type:"tips"})
    const info = await Info.find({})
    // console.log(news.data)
    res.render('admin/articles',{title:"Articles", news:news.data.reverse(), tips:tips.data.reverse(), info:info.reverse()})
}

module.exports.articles_post = async (req,res)=>{
    console.log(req.body)
    // const {link, title, src, img, body, date} = req.body
    try{
        const update = await Article.createArticle(req.body)
        console.log(update)
        res.status(200).json(update)
    }catch(err){
        res.status(200).json(err.message)
    }
}

module.exports.info_post = async(req, res)=>{
    console.log(req.body)
    let img = req.file.path.toString()
    const createInfo = await Info.create({
        title:req.body.title,
        image:img.slice(6,img.lenght),
        date: Date.now()
    })
    if(createInfo){
        // res.status(200).json({status:"success"})
        res.redirect('back')
    }else{
        res.status(200).json({status:"fail", errors:"Gagal Menambahkan Info"})
    }
    
}

module.exports.addArticles_get = async(req, res)=>{
    res.render('admin/articles_add',{title:"Add Articles"})
}

module.exports.editArticles_get = async(req, res)=>{
    const editArticle = await Article.find({"data._id":req.query.id})
    let article = editArticle[0].data.find(({_id})=>{
        return _id == req.query.id
    })
    console.log(article)
    res.render('admin/articles_edit',{title:"Edit Articles", type:req.query.type, article:article})
}

module.exports.editArticles_post = async(req, res)=>{
    const {link, title, src, img, body, date} = req.body
    const update = await Article.updateOne({"data._id":req.body.id},{
        $set :{
            "data.$.src":src,
            "data.$.title":title,
            "data.$.link":link,
            "data.$.date":date,
            "data.$.body":body,
            "data.$.img":img,
        }
    })
    if(update){
        res.status(200).json({status:"success"})
    }else{
        res.status(400).json({status:"fail", errors:"Gagal memperbarui data"})
    }
    
}

module.exports.deleteArticles_get = async(req, res)=>{
    const article = await Article.updateOne({type:req.query.type}, {$pull:{data:{_id:req.query.id}}})
    console.log(article)
    if(article){
        res.status(200).json({status:"success"})
    }else{
        res.status(400).json({status:"fail"})
    }
}

module.exports.deleteInfo_get = async(req, res)=>{
    await Info.findOneAndRemove({_id:req.query.id}, (err, info)=>{
        if(err) { 
            return res.send({status: "200", response: "fail"});
        }
        console.log(info)
        let fileName = info.image.slice(9,info.image.lenght)
        fs.unlink(`${path.join(__dirname,'../public/uploads/')}${fileName}`, (err)=>{
            if(err) console.log(err)
            res.status(200).json({status:"success"}) 
        })
    })
    // if(deleteInfo){
    //     res.status(200).json({status:"success"}) 
    // }else{
    //     res.status(400).json({status:"fail"})
    // }
}

module.exports.device_get = async (req, res)=>{
    const device = await Device.find({status:"unregistered"})
    res.render('admin/device', {title:"Device",devices:device})
}

module.exports.profile_get = (req, res)=>{
    res.render('admin/profile',{title:"Profile"})
}

module.exports.signup_post = async (req, res) =>{
    const { name, level, birth, email, password } = req.body
    const {error} = pass.signupVal(req.body)
    if(error) return res.status(400).json({status:"fail",errors:error.details[0].message})

    try{
        const cekUser = await User.findOne({email})
        if(!cekUser){
            const user = await User.create({name, level, birth, email, password})
            res.status(200).json({status:"success", user:user._id})
        }else{
            res.status(400).json({status:"fail",errors:"email already exist"})
        }
    }catch(err){
        res.status(400).json({status:"fail",errors:err.message})
    }
}

module.exports.login_post = async(req, res)=>{
    console.log(req.body)
    const {email, password} = req.body
    const {error} = pass.loginVal(req.body)
    if(error){
        return res.status(400).json({path:error.details[0].path[0],errors:error.details[0].message})
    } else{
        try{
            const user = await User.login(email, password)
            const token = createToken(user._id)
            if(user.level=='admin'){
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
                res.status(200).json({user:user,token:token})
            }else{
                return res.status(200).json({status: "login_succes",user:user,token:token})
            }
        }catch(err){
            console.log(err.message)
            return res.status(400).json({status:"login_fail",errors:err.message})
        }
    }
}

module.exports.password_post = async (req, res)=>{
    const user = await User.findOne({_id: req.body.userid})
    if(!user) return res.status(200).json({status:"not_found"})
    console.log(req.body)
    const validPass = await bcrypt.compare(req.body.old_password, user.password)
    if(!validPass) return res.status(400).json({status:"fail",errors:"password not match"})

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.new_password, salt)

    const updatePass = await User.findOneAndUpdate({_id:req.body.userid}, {password:hashedPassword})
    if(updatePass) return res.status(200).json({status:"changed"})
}

module.exports.news_get = async (req,res)=>{
    const news = await Article.find({type:"news"})
    if(news) return res.status(200).json(news.data)
}

module.exports.news_post = async (req,res)=>{
    console.log(req.body)
    // const {link, title, src, img, body, date} = req.body
    try{
        const update = await Article.createNews(req.body)
        console.log(update)
        res.status(200).json(update)
    }catch(err){
        res.status(200).json(err.message)
    }
}

module.exports.notif_post = async (req, res)=>{
    console.log(req.body)
    const {topic, title, body} = req.body
    const createNotif = await Notification.create({topic, title, body, timestamp:Date.now()})
    if(createNotif){
        res.status(200).json({status:"create", data:createNotif})
    }else{
        res.status(400).json({status:"fail"})
    }
}

module.exports.notif_get = async(req,res)=>{
    let filter = {}
    const starttime = req.query.start
    if(starttime){
        filter = {timestamp:{$gte:starttime}}
    }else{
        filter = {}
    }
    const notif = await Notification.find(filter)

    if(notif){
        res.status(200).json({status:"success", data:notif})
    }else{
        res.status(400).json({status:"empty"})
    }
}

module.exports.notifnews_get = async(req,res)=>{  
    const notif = await Notification.find({topic:"article"})

    if(notif){
        res.status(200).json({status:"success", data:notif})
    }else{
        res.status(400).json({status:"empty"})
    }
}

module.exports.logout_get = (req, res)=>{
    res.cookie('jwt', '', {maxAge:1})
    res.redirect('/')
}