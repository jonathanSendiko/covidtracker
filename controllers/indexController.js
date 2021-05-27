const axios = require('axios')
const Position = require('../models/Position')
const Article = require('../models/Article')
const Info = require('../models/Info')

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".");
}

module.exports.home_get = async (req, res)=>{
    let covtCase = {}
    let statCase = {}
    const news = await Article.findOne({type:"news"})
    const tips = await Article.findOne({type:"tips"})
    const info = await Info.find({})
    await axios.get('https://ccc-19.depok.go.id//Data/getWidget', {
        headers : { Accept: "application/json" }
    }).then(res => statCase = res.data)
    covtCase = {
        positif:(parseInt(statCase.positiftotal)<1000)?statCase.positiftotal:numberWithCommas(statCase.positiftotal),
        meninggal:(parseInt(statCase.positifmeninggal)<1000)?statCase.positifmeninggal:numberWithCommas(statCase.positifmeninggal),
        sembuh:(parseInt(statCase.positifsembuh)<1000)?statCase.positifsembuh:numberWithCommas(statCase.positifsembuh),
        dirawat:(parseInt(statCase.positifaktif)<1000)?statCase.positifaktif:numberWithCommas(statCase.positifaktif)
    }
    res.render('home', {
        title:"COVT",covtCase:covtCase,
        news:news.data.slice(0).slice(-4).reverse(),
        tips:tips.data.slice(0).slice(-4).reverse(),
        info:info.slice(0).slice(-4).reverse()
    })
}

module.exports.maps_get = async (req, res)=>{
    let covtCase = {}
    let statCase = {}
    let position = await Position.find({})
    await axios.get('https://ccc-19.depok.go.id//Data/getWidget', {
        headers : { Accept: "application/json" }
    }).then(res => statCase = res.data)
    covtCase = {
        positif:(parseInt(statCase.positiftotal)<1000)?statCase.positiftotal:numberWithCommas(statCase.positiftotal),
        meninggal:(parseInt(statCase.positifmeninggal)<1000)?statCase.positifmeninggal:numberWithCommas(statCase.positifmeninggal),
        sembuh:(parseInt(statCase.positifsembuh)<1000)?statCase.positifsembuh:numberWithCommas(statCase.positifsembuh),
        dirawat:(parseInt(statCase.positifaktif)<1000)?statCase.positifaktif:numberWithCommas(statCase.positifaktif)
    }
    res.render('sebaran', {title:"Sebaran", covtCase:covtCase,position:position})
}

module.exports.info_get = async (req, res)=>{
    const info = await Info.find({})
    res.render('info', {title:"Info", info:info.reverse()})
}

module.exports.news_get = async (req, res)=>{
    const news = await Article.findOne({type:"news"})
    const tips = await Article.findOne({type:"tips"})
    res.render('news', {title:"Artikel", news:news.data.reverse(), tips:tips.data.reverse()})
}

module.exports.download_get = (req, res)=>{
    res.render('download', {title:"Download"})
}
